/**
 * Shared editor preview for every doclap/* block.
 *
 * All twenty-five Doclap blocks are dynamic: `block.json` points at a `render.php`
 * file and `save()` returns null, so PHP owns the only authoritative copy of the
 * front-end markup. The editor therefore previews that exact markup through
 * `ServerSideRender` instead of duplicating it in JSX — which is also why a
 * mismatch between the inspector and the front end is a render.php bug rather
 * than an editor bug.
 *
 * `useBlockProps()` is applied to the single editor-only wrapper element so block
 * support classes, the block's own `wp-block-doclap-*` class, selection, the block
 * toolbar and the list view all keep working. The inner
 * `.doclap-block-preview__surface` element is what makes preview output that only
 * looks interactive (filter bars, disclosures, canvas controls) inert: the shared
 * rule in resources/css/editor.css disables pointer events there, and deliberately
 * not on the wrapper, so clicking anywhere in the preview still selects the block.
 *
 * Bundled into each block's editor script by esbuild, so no extra WordPress script
 * handle is needed.
 */

import { useBlockProps } from '@wordpress/block-editor';
import { useEffect, useRef, useState } from '@wordpress/element';
import { Placeholder, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';


export interface BlockPreviewProps {
	/** Registered block name, e.g. `doclap/home-about`. */
	block: string;
	/** Current block attributes, forwarded verbatim to the PHP renderer. */
	attributes: Record<string, unknown>;
	/** Optional informational text, already translated by the caller. */
	notice?: string;
}

/**
 * Loading state: never a blank area.
 */
function LoadingPlaceholder(): JSX.Element {
	return (
		<Placeholder
			className="doclap-block-preview__placeholder"
			label={__('Loading preview…', 'doclap')}
		>
			<Spinner />
		</Placeholder>
	);
}

/**
 * Empty response state: the renderer returned nothing usable.
 */
function EmptyPlaceholder(): JSX.Element {
	return (
		<Placeholder
			className="doclap-block-preview__placeholder"
			label={__(
				'Nothing to preview yet. Add content in the sidebar.',
				'doclap',
			)}
		/>
	);
}

/**
 * Props handed to the error placeholder by `ServerSideRender`.
 *
 * The component calls `ErrorResponsePlaceholder` with `{ message, className }`
 * (see the package's `types.d.ts` and its built `server-side-render` module), so
 * the returned text is read from `message` rather than from `props.children`.
 */
interface ErrorPlaceholderProps {
	message?: string;
}

/**
 * Error state: a translated heading plus the message returned by the request.
 * The component never throws; the response is always rendered.
 */
function ErrorPlaceholder({ message }: ErrorPlaceholderProps): JSX.Element {
	return (
		<Placeholder
			className="doclap-block-preview__placeholder"
			label={__('The preview could not be loaded.', 'doclap')}
			instructions={message}
		/>
	);
}

export function BlockPreview({
	block,
	attributes,
	notice,
}: BlockPreviewProps): JSX.Element {
	const blockProps = useBlockProps({ className: 'doclap-block-preview' });
	const markerRef = useRef< HTMLSpanElement >( null );
	const [ previewAttributes, setPreviewAttributes ] =
		useState< Record< string, unknown > >( attributes );
	const [ refreshTick, setRefreshTick ] = useState( 0 );

	/**
	 * The block wrapper Gutenberg adopted for this preview.
	 *
	 * `useBlockProps()` turns this component's element into the `[data-block]`
	 * wrapper, but it takes no ref, so the wrapper is resolved from a marker node
	 * rendered inside it.
	 *
	 * @return Wrapper element, or null before mount.
	 */
	const ownWrapper = (): HTMLElement | null => {
		const marker = markerRef.current;
		const wrapper = marker && marker.closest( '[data-block]' );

		return wrapper && 1 === wrapper.nodeType ? ( wrapper as HTMLElement ) : null;
	};

	/**
	 * Whether one of this block's own rich fields holds the caret.
	 *
	 * The canvas keeps the caret in the field after the visitor moves to the
	 * sidebar, so the check also requires the canvas document to still hold
	 * focus: a colour picked from the block's own settings must repaint the
	 * preview at once, while typing in place stays frozen.
	 *
	 * @return True while the visitor is editing text in place.
	 */
	const editingHere = (): boolean => {
		const wrapper = ownWrapper();
		const doc = wrapper?.ownerDocument;
		const active = doc?.activeElement as Element | null;

		return Boolean(
			wrapper &&
				doc &&
				doc.hasFocus() &&
				active &&
				wrapper.contains( active ) &&
				'function' === typeof active.closest &&
				active.closest( '[data-doclap-path]' ),
		);
	};

	// `ServerSideRender` re-requests the PHP on every attributes change and swaps the
	// block for its loading placeholder while the request is in flight, so passing
	// each keystroke through flashed the whole block and pulled the previewed markup
	// out from under the caret. While a field of THIS block holds focus the preview
	// keeps the attributes it already rendered; one refresh happens on focus out.
	useEffect( () => {
		if ( editingHere() ) {
			return;
		}

		setPreviewAttributes( attributes );
	}, [ attributes, refreshTick ] );

	useEffect( () => {
		const wrapper = ownWrapper();

		if ( ! wrapper ) {
			return;
		}

		const onFocusOut = (): void => setRefreshTick( ( tick ) => tick + 1 );

		wrapper.addEventListener( 'focusout', onFocusOut );

		return () => wrapper.removeEventListener( 'focusout', onFocusOut );
	}, [ block ] );

	return (
		<div {...blockProps}>
			<span ref={markerRef} hidden />
			{notice ? <p className="doclap-block-preview__notice">{notice}</p> : null}
			<div className="doclap-block-preview__surface">
				<ServerSideRender
					block={block}
					attributes={previewAttributes}
					LoadingResponsePlaceholder={LoadingPlaceholder}
					EmptyResponsePlaceholder={EmptyPlaceholder}
					ErrorResponsePlaceholder={ErrorPlaceholder}
				/>
			</div>
		</div>
	);
}

export default BlockPreview;
