/**
 * On-canvas rich-text overlay for Doclap blocks.
 *
 * A Doclap block previews its PHP output through `ServerSideRender` inside
 * `.doclap-block-preview__surface`, which the shared editor stylesheet makes
 * inert. This overlay puts a real `RichText` on top of the server-rendered text
 * for the attributes that map 1:1 to a stable element, so they are edited where
 * they appear instead of in the sidebar, and it hides the underlay with
 * `visibility: hidden` only — never `display: none` — so the block's layout and
 * page height stay identical while editing.
 *
 * Geometry: the root is a zero-sized absolutely-positioned div mounted after the
 * preview. It changes no layout and, being positioned itself, is the containing
 * block for the editor boxes inside it. Each box is placed straight from the
 * difference between its element's client rect and the root's client rect,
 * measured in one pass, so the offset is scroll-invariant and no scroll listener
 * is needed. The box copies the underlay's computed typography, so the text sits
 * exactly where it does on the front end at every breakpoint.
 *
 * The editor is re-measured (rAF-throttled) when the preview mutates, when the
 * wrapper resizes or when the window resizes, and every measure pass restores the
 * elements it hid, so a target that disappears simply stops being overlaid.
 *
 * Attachment and measurement are deliberately separate concerns. The observers are
 * attached to the structural block wrapper (and to the list holding it) as soon as
 * the overlay mounts and are never gated on the preview existing, because
 * `ServerSideRender` lands its preview a fraction of a second after selection and a
 * freshly inserted block has none at all: an attachment gate would leave nothing
 * watching for the arrival, so the first selection would render no editor until the
 * block was selected a second time. Attachment retries briefly if the wrapper is not
 * reachable in the commit that mounts the overlay, and a bounded set of delayed
 * measurements covers the one arrival no observer can promise to see — the preview
 * itself is a network round trip. The measuring pass is the strict half — it
 * resolves the surface *and* the targets on every run, so it simply renders nothing
 * until both are there.
 *
 * A target whose element is not in the current output is skipped on its own and
 * never disturbs the rest: several rich values only render in a state the preview
 * is not in (`doclap/search-results` prints its recovery link label only for an
 * empty result set), and a value with no element has nothing to measure, so the
 * overlay leaves the preview authoritative for it until that state appears.
 *
 * `data-doclap-rich` is emitted by `render.php`, so the marker is present in the
 * front-end HTML as well as in the editor canvas: both render the same PHP, and
 * the overlay needs the hook in that output to find and measure the element. It is
 * a mapping hook only — nothing is editable on the front end, and displays that
 * read it stay `visibility: visible` (hidden only while an editor box covers the
 * element). Do not gate it on REST_REQUEST or on `is_admin()`.
 *
 * All styling is inline: this module owns no stylesheet.
 */

import { RichText } from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';
import {
	createPortal,
	useCallback,
	useEffect,
	useRef,
	useState,
} from '@wordpress/element';
import type { CSSProperties } from 'react';

import { RICH_TEXT_FORMATS, normaliseRichValue } from './rich-text-control';

export interface RichTextTarget {
	/** Dot path, e.g. `aboutLead`, `heroPanels.0.lead`. */
	path: string;
	/** Translated, used for the control's accessible name. */
	label: string;
	multiline?: boolean;
	allowedFormats?: string[];
}

export interface RichTextOverlayProps {
	targets: RichTextTarget[];
	attributes: Record<string, unknown>;
	setAttributes: (attributes: Record<string, unknown>) => void;
	isSelected: boolean;
}

/** One placed editor box: geometry plus the typography copied from the underlay. */
interface OverlayBox {
	target: RichTextTarget;
	left: number;
	top: number;
	width: number;
	height: number;
	typography: CSSProperties;
	background: string;
}

/**
 * Read a dot-path attribute value.
 *
 * @param attributes Block attributes.
 * @param path       Dot path, e.g. `heroPanels.0.lead`.
 * @return The stored string, or `''` when the path holds something else.
 */
export function readRichAttribute(
	attributes: Record<string, unknown>,
	path: string,
): string {
	const value = path.split('.').reduce<unknown>((current, key) => {
		if (Array.isArray(current)) {
			return current[Number(key)];
		}

		if (current && 'object' === typeof current) {
			return (current as Record<string, unknown>)[key];
		}

		return undefined;
	}, attributes);

	return typeof value === 'string' ? value : '';
}

/**
 * Write a dot-path attribute value immutably.
 *
 * Returns the partial attributes object `setAttributes()` expects: only the
 * branch of the tree that changed is rebuilt, and array items are copied rather
 * than mutated, so React sees new identities for exactly what changed.
 *
 * @param attributes Block attributes.
 * @param path       Dot path, e.g. `heroPanels.0.lead`.
 * @param value      New HTML fragment.
 * @return Partial attributes to hand to `setAttributes()`.
 */
export function writeRichAttribute(
	attributes: Record<string, unknown>,
	path: string,
	value: string,
): Record<string, unknown> {
	const [key, ...rest] = path.split('.');

	if (0 === rest.length) {
		return { [key]: value };
	}

	const items = attributes[key];

	if (Array.isArray(items)) {
		const index = Number(rest[0]);

		return {
			[key]: items.map((item, position) =>
				position === index
					? {
							...((item ?? {}) as Record<string, unknown>),
							...writeRichAttribute(
								(item ?? {}) as Record<string, unknown>,
								rest.slice(1).join('.'),
								value,
							),
						}
					: item,
			),
		};
	}

	return {};
}

/**
 * A dot path as the value of a `data-doclap-rich` attribute selector.
 *
 * Paths only ever hold letters, digits and dots, but quotes and backslashes are
 * escaped anyway so a future path can never break out of the selector string.
 *
 * @param path Attribute path, e.g. `heroPanels.0.heading`.
 * @return Selector-safe attribute value.
 */
function escapedPath(path: string): string {
	return path.replace(/["\\]/g, '\\$&');
}

/**
 * Put the caret in one target's editor.
 *
 * @param scope Element the fields live in: the portalled block wrapper, or the
 *              zero-size anchor when the portal host is not resolvable yet.
 * @param doc   Document that owns the scope (the canvas iframe).
 * @param path  Target path of the box to focus.
 * @param point Optional viewport point to place the caret at (the click that
 *              selected the block).
 */
function focusBox(
	scope: HTMLElement,
	doc: Document,
	path: string,
	point: { x: number; y: number } | null,
): void {
	const editable = scope.querySelector<HTMLElement>(
		`[data-doclap-path="${escapedPath(path)}"] [contenteditable="true"]`,
	);

	if (!editable) {
		return;
	}

	editable.focus();

	if (!point || 'function' !== typeof doc.caretRangeFromPoint) {
		return;
	}

	const range = doc.caretRangeFromPoint(point.x, point.y);
	const selection = doc.getSelection();

	if (!range || !selection) {
		return;
	}

	selection.removeAllRanges();
	selection.addRange(range);
}

/**
 * Whether the caret sits inside this overlay's own boxes.
 *
 * The component runs in the editor realm while its boxes are rendered into the
 * canvas document, so `document.activeElement` in this realm is the canvas iframe
 * element itself; the focused editable has to be read from the root's document.
 *
 * @param root Overlay root element.
 * @return Whether an overlay field currently holds focus.
 */
function caretIsInside(boundary: HTMLElement | null): boolean {
	if (!boundary) {
		return false;
	}

	const active: Element | null = boundary.ownerDocument.activeElement;

	return null !== active && boundary.contains(active);
}

/**
 * Last pointer position over a block preview, kept so the click that selects a
 * block can also place the caret in the field under it.
 *
 * A dynamic block previews PHP, so the click that selects the block lands on the
 * inert preview and the overlay only exists afterwards; without this the user has
 * to click a heading twice before the caret arrives.
 */
let pendingPoint: {
	doc: Document;
	x: number;
	y: number;
	/** When the pointer went down, so a stale point can expire. */
	t: number;
} | null = null;

/** Canvas documents already wired for {@link pendingPoint}. */
const watchedDocuments = new WeakSet<Document>();

/**
 * Remember where the pointer went down inside a block preview of one canvas.
 *
 * Installed on the canvas document rather than on the overlay because the click
 * that selects a block happens before any overlay for that block exists.
 *
 * @param doc Canvas iframe document.
 */
function watchClicks(doc: Document): void {
	if (watchedDocuments.has(doc)) {
		return;
	}

	watchedDocuments.add(doc);

	doc.addEventListener(
		'mousedown',
		(event: Event): void => {
			const mouse = event as MouseEvent;
			const target = mouse.target as Node | null;

			// Structural test, never `instanceof`: this node belongs to the canvas realm.
			if (
				null === target ||
				1 !== target.nodeType ||
				'function' !==
					typeof (target as Element).closest ||
				null === (target as Element).closest('.doclap-block-preview')
			) {
				pendingPoint = null;

				return;
			}

			pendingPoint = {
				doc,
				x: mouse.clientX,
				y: mouse.clientY,
				t: Date.now(),
			};
		},
		true,
	);
}

/**
 * The preview surface of the block this overlay belongs to.
 *
 * `BlockPreview` applies `useBlockProps()`, so Gutenberg adopts its element *as*
 * the block wrapper instead of wrapping it: the `[data-block]` element and
 * `.doclap-block-preview` are the same node, and this overlay — rendered right
 * after it in the same block — is that node's **next sibling**, not a descendant.
 * The DOM therefore has to be walked to the sibling first; `closest()` alone would
 * find no ancestor and `parentElement` alone would search the whole block list.
 *
 * A candidate surface is only accepted when it actually owns one of this overlay's
 * targets, so a wrong anchor can never bind the editor to another block's text.
 *
 * Nothing here may rely on this realm's constructors: the component runs in the
 * admin document while the block DOM lives in the canvas iframe, so an
 * `instanceof HTMLElement` test on a canvas node is always false. Element identity
 * is therefore checked structurally (`nodeType` plus the methods used).
 *
 * @param root    Overlay root element.
 * @param targets Targets this overlay edits.
 * @return The matching surface, or null when the block renders no preview yet.
 */
function ownSurface(
	root: HTMLElement | null,
	targets: RichTextTarget[],
): HTMLElement | null {
	if (!root) {
		return null;
	}

	const sibling = root.previousElementSibling;
	const candidates: Array<Element | null> = [
		sibling?.matches('[data-block]') ? sibling : null,
		root.closest('[data-block]'),
		root.parentElement,
	];

	for (const candidate of candidates) {
		const surface: Element | null =
			candidate?.querySelector('.doclap-block-preview__surface') ?? null;

		if (
			surface !== null &&
			1 === surface.nodeType &&
			'function' === typeof surface.querySelector &&
			targets.some((target) =>
				surface.querySelector(
					`[data-doclap-rich="${escapedPath(target.path)}"]`,
				),
			)
		) {
			return surface as HTMLElement;
		}
	}

	return null;
}

/**
 * The wrapper that will hold this block's preview surface.
 *
 * Deliberately *structural* and permissive, and separate from `ownSurface()`: this
 * is only the observer attachment point, so it must resolve the moment the overlay
 * mounts. `useBlockProps()` makes the block wrapper this overlay's previous sibling;
 * the ancestor lookups cover a build where it is a real ancestor instead.
 *
 * The surface and the block's targets routinely do not exist yet at that moment —
 * `ServerSideRender` lands its preview a fraction of a second after selection, and a
 * freshly inserted block has no preview at all — so the observers have to watch the
 * wrapper rather than the surface. They are always attached, never gated on the
 * preview being there: were they, nothing would re-measure when it arrives.
 *
 * @param root Overlay root element.
 * @return The element to observe, or null while the overlay has no block wrapper.
 */
function structuralHost(root: HTMLElement | null): Element | null {
	if (!root) {
		return null;
	}

	const sibling = root.previousElementSibling;

	if (sibling?.matches('[data-block]')) {
		return sibling;
	}

	return root.closest('[data-block]') ?? root.parentElement;
}

/**
 * The first opaque background behind an element.
 *
 * The underlay is hidden, so the editor box must paint something opaque;
 * `var(--doclap-bg, #fff)` is the fallback, but dark panels (the process band,
 * the contact band) set their own background on an ancestor, and the text colour
 * copied from the underlay would be invisible on the page background there.
 *
 * @param element Element the box is placed over.
 * @return A CSS background colour.
 */
function opaqueBackground(element: HTMLElement): string {
	let current: HTMLElement | null = element;

	while (current) {
		const background = window.getComputedStyle(current).backgroundColor;

		if (
			'' !== background &&
			'transparent' !== background &&
			!background.endsWith(', 0)')
		) {
			return background;
		}

		current = current.parentElement;
	}

	return 'var(--doclap-bg, #fff)';
}

/** One placed editor: a positioned box that owns a single `RichText`. */
function OverlayField({
	box,
	value,
	onChange,
}: {
	box: OverlayBox;
	value: string;
	onChange: (value: string) => void;
}): JSX.Element {
	const identifier = useInstanceId(OverlayField, 'doclap-rich-overlay');
	const fieldRef = useRef<HTMLDivElement>(null);
	const [needed, setNeeded] = useState(0);
	const multiline = Boolean(box.target.multiline);
	const formats = (box.target.allowedFormats ?? RICH_TEXT_FORMATS).filter(
		(format) => RICH_TEXT_FORMATS.includes(format),
	);

	// The box is exactly the underlay's box, but the editor's own line breaking can
	// need one line more than the page at some widths (measured at 375: the underlay
	// renders four lines, WP's editable five, because its editable carries
	// `white-space: pre-wrap` and its own `<br data-rich-text-line-break>` nodes).
	// The box clips, so that extra line would be invisible while editing: grow the
	// box to the editable's own height instead, which only ever adds space below the
	// text (the underlay itself stays hidden and laid out exactly as before).
	useEffect(() => {
		const field = fieldRef.current?.querySelector<HTMLElement>(
			'[contenteditable="true"]',
		);
		const height = field?.scrollHeight ?? 0;

		setNeeded((current) => (Math.abs(height - current) > 1 ? height : current));
	});

	return (
		<div
			ref={fieldRef}
			data-doclap-path={box.target.path}
			style={{
				...box.typography,
				background: box.background,
				height: Math.max(box.height, needed),
				left: box.left,
				overflow: 'hidden',
				pointerEvents: 'auto',
				position: 'absolute',
				top: box.top,
				width: box.width,
			}}
		>
			<RichText
				identifier={identifier}
				tagName="div"
				value={normaliseRichValue(value, multiline)}
				onChange={(next) => onChange(normaliseRichValue(next, multiline))}
				allowedFormats={formats}
				disableLineBreaks={!multiline}
				inlineToolbar
				aria-label={box.target.label}
			/>
		</div>
	);
}

export function RichTextOverlay({
	targets,
	attributes,
	setAttributes,
	isSelected,
}: RichTextOverlayProps): JSX.Element | null {
	const rootRef = useRef<HTMLDivElement>(null);
	const hiddenRef = useRef<HTMLElement[]>([]);
	const signatureRef = useRef('');
	const latestRef = useRef({ targets, attributes, setAttributes });
	const [boxes, setBoxes] = useState<OverlayBox[]>([]);
	/**
	 * The block wrapper the boxes are rendered into.
	 *
	 * They must live INSIDE the block's own element: a Doclap block is usually
	 * nested in a Group, and a click on a sibling of that element is resolved by the
	 * block editor to the enclosing block, so the Group stole the selection every
	 * time a field was clicked.
	 */
	const [host, setHost] = useState<HTMLElement | null>(null);

	// Latest props/values for the measuring pass, which runs from observers and
	// therefore cannot close over them.
	useEffect(() => {
		latestRef.current = { targets, attributes, setAttributes };
	});

	const restore = useCallback((): void => {
		hiddenRef.current.forEach((element) => {
			element.style.visibility = '';
		});
		hiddenRef.current = [];
	}, []);

	const measure = useCallback((): void => {
		const root = rootRef.current;
		const surface = ownSurface(root, latestRef.current.targets);

		// A ServerSideRender refresh removes the target markers for a moment while the
		// new preview is requested (measured: markers 17 → 15 → 17 inside ~400ms after
		// the first keystroke). Clearing the boxes then unmounts the editable, and the
		// caret goes with it, so typing stopped after a single character. While the
		// caret is inside this overlay the boxes are therefore kept: their keys are the
		// target paths, so React reuses the same DOM nodes, and the wrapper observer
		// re-measures as soon as the preview is back.
		if (!root || !surface) {
			// The boxes are portalled into the block wrapper, so the wrapper — not the
			// zero-size anchor — is what contains a focused field.
			if (caretIsInside(host ?? root)) {
				return;
			}

			restore();

			if ('' !== signatureRef.current) {
				signatureRef.current = '';
				setBoxes([]);
			}

			return;
		}

		restore();

		const origin = host && root.contains(host) === false ? host : root;
		const rootRect = origin.getBoundingClientRect();
		const surfaceRect = surface.getBoundingClientRect();
		const next: OverlayBox[] = [];
		const hidden: HTMLElement[] = [];

		latestRef.current.targets.forEach((target) => {
			const element = surface.querySelector<HTMLElement>(
				`[data-doclap-rich="${escapedPath(target.path)}"]`,
			);

			if (!element) {
				return;
			}

			const rect = element.getBoundingClientRect();

			// No box at all: nothing to place an editor on, and nothing the
			// preview can be showing. An element that is a box but empty (a
			// heading or paragraph with no text) keeps a zero height: it gets
			// the computed line height so an emptied value stays editable
			// instead of becoming unreachable from both surfaces.
			if (rect.width < 1) {
				return;
			}

			const style = window.getComputedStyle(element);
			// Both edges are clamped in viewport space first, then expressed relative
			// to the positioning origin: mixing a relative `left` with an absolute
			// `right` added the origin's own offset to every width (30px when the
			// boxes moved into the block wrapper, which is inset from the canvas).
			const left =
				Math.max(rect.left, surfaceRect.left) - rootRect.left;
			const right =
				Math.min(rect.right, surfaceRect.right) - rootRect.left;
			const length = Math.max(right - left, 0);
			const lineHeight = Number.parseFloat(style.lineHeight);

			if (length < 1) {
				return;
			}

			element.style.visibility = 'hidden';
			hidden.push(element);
			next.push({
				background: opaqueBackground(element),
				height:
					rect.height < 1 && Number.isFinite(lineHeight)
						? lineHeight
						: rect.height,
				left,
				target,
				top: rect.top - rootRect.top,
				typography: {
					color: style.color,
					direction: style.direction as CSSProperties['direction'],
					fontFamily: style.fontFamily,
					fontSize: style.fontSize,
					fontStyle: style.fontStyle,
					fontWeight: style.fontWeight,
					letterSpacing: style.letterSpacing,
					lineHeight: style.lineHeight,
					textAlign: style.textAlign as CSSProperties['textAlign'],
					textTransform:
						style.textTransform as CSSProperties['textTransform'],
					// The theme balances headings (`text-wrap: balance`). Without it a
					// heading can need one more line in the editor than on the page,
					// and since the box clips (`overflow: hidden`) the extra line would
					// be invisible while editing.
					textWrap: style.getPropertyValue(
						'text-wrap',
					) as CSSProperties['textWrap'],
				},
				width: length,
			});
		});

		hiddenRef.current = hidden;

		const signature = next
			.map(
				(box) =>
					`${box.target.path}:${Math.round(box.left)}:${Math.round(
						box.top,
					)}:${Math.round(box.width)}:${Math.round(box.height)}`,
			)
			.join('|');

		if (signature !== signatureRef.current) {
			signatureRef.current = signature;
			setBoxes(next);
		}
	}, [restore, host]);

	const targetKey = targets
		.map((target) => `${target.path}:${Boolean(target.multiline)}`)
		.join('|');

	useEffect(() => {
		if (!isSelected) {
			restore();
			signatureRef.current = '';
			return;
		}

		let frame = 0;
		let attachTimer = 0;
		let attachAttempts = 0;
		let mutations: MutationObserver | null = null;
		let resize: ResizeObserver | null = null;

		const schedule = (): void => {
			if (frame) {
				return;
			}

			frame = window.requestAnimationFrame(() => {
				frame = 0;
				measure();
			});
		};

		/**
		 * Attach observers to the block wrapper, retrying briefly when the wrapper
		 * is not there yet.
		 *
		 * `rootRef.current` is normally set before this effect runs, but a block that
		 * is inserted and selected in the same transaction (the inserter flow) can
		 * reach the effect one commit earlier, with the ref still null. Returning
		 * early in that case is what made a freshly inserted block render no editor
		 * until it was selected a second time: no observer was ever attached, and
		 * nothing in the dependency list changes when the preview arrives.
		 */
		const attach = (): void => {
			const host = structuralHost(rootRef.current);

			if (!host) {
				attachAttempts += 1;

				if (attachAttempts < 20) {
					attachTimer = window.setTimeout(attach, 50);
				}

				return;
			}

			// Observe the wrapper *and* the list it sits in: the preview can arrive
			// as a replacement subtree of the wrapper, or as the wrapper's own
			// insertion into the list.
			const list = host.parentElement;

			mutations = new MutationObserver(schedule);
			mutations.observe(host, {
				characterData: true,
				childList: true,
				subtree: true,
			});

			if (list) {
				mutations.observe(list, {
					childList: true,
					subtree: true,
				});
			}

			resize = new ResizeObserver(schedule);
			resize.observe(host);
			window.addEventListener('resize', schedule);
			measure();
		};

		attach();

		// Belt and braces for the one arrival an observer cannot promise to see: a
		// preview that is a network round trip away. Bounded, cleared with the
		// effect, and each pass is a no-op until the surface and its targets exist.
		const arrivalTimers = [120, 400, 900, 1800].map((delay) =>
			window.setTimeout(measure, delay),
		);

		return () => {
			if (frame) {
				window.cancelAnimationFrame(frame);
			}

			if (attachTimer) {
				window.clearTimeout(attachTimer);
			}

			arrivalTimers.forEach((timer) => window.clearTimeout(timer));

			if (mutations) {
				mutations.disconnect();
			}

			if (resize) {
				resize.disconnect();
			}

			window.removeEventListener('resize', schedule);
			restore();
			signatureRef.current = '';
			setBoxes((current) => (0 === current.length ? current : []));
		};
	}, [isSelected, measure, restore, targetKey]);

	// Resolve the block wrapper the boxes are portalled into. The anchor is the
	// zero-size sibling rendered below; its previous sibling is the adopted block
	// wrapper (`useBlockProps()` makes it the `[data-block]` element).
	useEffect((): void => {
		const root = rootRef.current;
		const candidate = root ? root.previousElementSibling : null;
		const next =
			candidate && 1 === candidate.nodeType
				? (candidate as HTMLElement)
				: null;

		if (next !== host) {
			setHost(next);
		}
	});

	// Start recording pointer positions on the canvas document as early as this
	// component can see one; the recorded point is what lets a single click both
	// select the block and place the caret (see `pendingPoint`).
	useEffect((): void => {
		const root = rootRef.current;

		if (root) {
			watchClicks(root.ownerDocument);
		}
	});

	// Consume a recorded click once boxes exist for it: focus the field under the
	// pointer and drop the caret where the user clicked.
	//
	// `host` is required: until the portal resolves, the boxes were laid out against
	// the zero-size anchor rather than the wrapper, so the first pass after a click
	// can legitimately miss. The point is therefore dropped only once it has hit a
	// box (or expired) instead of on the first miss — dropping it there is what made
	// a single click select the block without ever placing the caret.
	useEffect((): void => {
		const root = rootRef.current;
		const point = pendingPoint;

		if (
			!root ||
			!host ||
			!point ||
			0 === boxes.length ||
			point.doc !== root.ownerDocument
		) {
			return;
		}

		if (Date.now() - point.t > 2000) {
			pendingPoint = null;

			return;
		}

		const rootRect = host.getBoundingClientRect();
		const x = point.x - rootRect.left;
		const y = point.y - rootRect.top;
		const hit = boxes.find(
			(box) =>
				x >= box.left &&
				x <= box.left + box.width &&
				y >= box.top &&
				y <= box.top + box.height,
		);

		if (hit) {
			pendingPoint = null;
			focusBox(host, root.ownerDocument, hit.target.path, point);

			// The same gesture also selects the block, and Gutenberg focuses the block
			// wrapper while doing so. Re-assert the caret once after that handler has
			// run (bounded: one frame and one short timeout), but never steal focus
			// from a field that already has it.
			const doc = root.ownerDocument;

			const reassert = (): void => {
				const active = doc.activeElement;
				const inField =
					null !== active &&
					'function' === typeof active.getAttribute &&
					'true' === active.getAttribute('contenteditable') &&
					host.contains(active);

				if (!inField) {
					focusBox(host, doc, hit.target.path, point);
				}
			};

			window.requestAnimationFrame(reassert);
			window.setTimeout(reassert, 60);
		}
	}, [boxes, host]);

	if (!isSelected) {
		return null;
	}

	return (
		<>
			<div
				ref={rootRef}
				style={{
					height: 0,
					left: 0,
					position: 'absolute',
					top: 0,
					width: 0,
					zIndex: 5,
				}}
			/>
			{host
				? createPortal(
						<>
							{boxes.map((box) => (
								<OverlayField
									key={box.target.path}
									box={box}
									value={readRichAttribute(attributes, box.target.path)}
									onChange={(next) =>
										setAttributes(
											writeRichAttribute(attributes, box.target.path, next),
										)
									}
								/>
							))}
						</>,
						host,
					)
				: null}
		</>
	);
}

export default RichTextOverlay;
