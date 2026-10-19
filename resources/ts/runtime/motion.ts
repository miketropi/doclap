/**
 * Doclap shared motion runtime.
 *
 * Reproduces the reference portfolio's motion language on the GSAP copy that is
 * bundled into `assets/js/main.js` — the only front-end bundle allowed to carry
 * GSAP and ScrollTrigger:
 *   * section entrances and the team-image clip reveal,
 *   * the disciplines stagger,
 *   * the hero choreography, its scrubbed parallax and the interruptible
 *     view change the hero view bundle delegates to,
 *   * soft-text replay on every control,
 *   * magnetic pointer offsets on the round calls to action.
 *
 * Contract kept by every path in this file:
 *   * markup is never hidden by CSS waiting for JavaScript, and content stays
 *     visible when GSAP is missing or reduced motion is on;
 *   * `prefers-reduced-motion: reduce` is a complete static mode: no character
 *     splitting, no timeline, no ScrollTrigger, no parallax, no magnetic move;
 *   * `destroy()` leaves no trigger, tween, listener or inline style behind and
 *     `init()` may be called again afterwards;
 *   * generated glyphs are `aria-hidden` and the original label lives in the
 *     wrapper's `aria-label`, so accessible names never change.
 */

import gsap from "gsap";

// Evaluated before `gsap/ScrollTrigger`, on purpose: it lends this bundle's core
// to ScrollTrigger's import-time latch so the plugin never binds to the parent
// theme's `window.gsap` core. See `runtime/pin-gsap.ts`.
import "./pin-gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin( ScrollTrigger );

/**
 * Hero view change handed over by the hero view bundle.
 */
export interface DoclapHeroChangeOptions {
	/**
	 * The `.gallery-hero` section owning the panels.
	 */
	root: HTMLElement;
	/**
	 * Outgoing `.gallery-panel`.
	 */
	from: HTMLElement;
	/**
	 * Incoming `.gallery-panel`.
	 */
	to: HTMLElement;
	/**
	 * Incoming panel index.
	 */
	index: number;
	/**
	 * Swap panels, tabs and status, then dispatch `doclap:view`; called once.
	 */
	apply: () => void;
	/**
	 * Release the caller's busy lock; called once, after `apply()`.
	 */
	finish: () => void;
}

/**
 * Public runtime surface, exposed as `window.doclapMotion`.
 */
export interface DoclapMotionApi {
	init: () => void;
	refresh: () => void;
	destroy: () => void;
	changeHero: ( options: DoclapHeroChangeOptions ) => boolean;
}

declare global {
	interface Window {
		doclapMotion?: DoclapMotionApi;
	}
}

/**
 * The only thing teardown needs from a GSAP tween or timeline: it can be killed.
 */
interface Killable {
	kill: () => void;
}

/**
 * One per-element binding created by the soft-text or magnetic sweep.
 */
interface ElementBinding {
	element: HTMLElement;
	dispose: () => void;
}

/**
 * An in-flight hero view change, cancellable when motion is disabled mid-way.
 */
interface HeroTransition {
	/**
	 * Hero element this transition owns.
	 */
	root: HTMLElement;
	/**
	 * Kill the tweens, restore the resting state, apply and finish once.
	 */
	cancel: () => void;
}

/* ── constants ───────────────────────────────────────────────────────────── */

/**
 * Roots that carry their own choreography: every block root in this theme is a
 * `.section`, the disciplines band is its own root, and the hero owns both.
 */
const ROOT_SELECTOR = ".section, .doclap-discipline, .gallery-hero";

/**
 * Elements that enter once, per section, in the reference's own order.
 */
const ENTRANCE_SELECTOR = [
	".section-head",
	".work-card",
	".about-grid > div",
	".team-intro",
	".team-image",
	".team-roles .feature",
	".journal-row",
	".process-row",
	".voice-card",
	".voice-editorial",
	".voices-note",
	".contact .container",
].join( ", " );

const ENTRANCE_START = "top 91%";
const ENTRANCE_START_RATIO = 0.91;
const ENTRANCE_FROM = { y: 30, opacity: 0, filter: "blur(5px)" };
const ENTRANCE_TO = {
	opacity: 1,
	y: 0,
	filter: "blur(0px)",
	duration: 1.15,
	ease: "power3.out",
};

const DISCIPLINE_START = "top 94%";
const DISCIPLINE_START_RATIO = 0.94;
const DISCIPLINE_FROM = { y: 14, opacity: 0 };

const TEAM_START = "top 85%";
const TEAM_START_RATIO = 0.85;
const TEAM_FROM = { clipPath: "inset(8% 4% 8% 4%)" };

/**
 * Controls eligible for soft text: every link and button inside a theme
 * surface. `.doclap-scope` is exactly the theme's own blocks, so parent-theme
 * and plugin chrome (the Nextora scheme switcher whose label is deliberately
 * `writing-mode: vertical-rl`, the admin bar) is never split: those elements
 * are authored elsewhere and their layout must stay untouched, and no rule
 * written for their authored spans can reach the generated glyph levels.
 */
const SOFT_SELECTOR = ".doclap-scope a, .doclap-scope button";

/**
 * Panel headings, split once and replayed by the hero choreography.
 */
const SOFT_HEADING_SELECTOR =
	".doclap-scope .gallery-panel h1, .doclap-scope .gallery-panel h2";

/**
 * Containers that own a heading and a canvas: their `h3` is split on its own.
 */
const SOFT_TITLE_SELECTOR = ".doclap-scope .work-card, .doclap-scope .journal-row";

const SOFT_CHAR_SELECTOR = ".soft-char";
const SOFT_BLUR = 6;
const SOFT_BLUR_LARGE = 12;
const SOFT_SHIFT = 6;
const SOFT_SHIFT_LARGE = 16;
const SOFT_DURATION = 900;
const SOFT_DELAY = 15;
const SOFT_DELAY_LARGE = 25;
const SOFT_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const SOFT_WRAPPER_CLASS = "soft-text";

/**
 * Custom property the hero parallax publishes on the hero root.
 */
const HERO_PROGRESS_PROPERTY = "--doclap-hero-progress";

const MAGNETIC_SELECTOR = ".circle-cta, .project-open";
const MAGNETIC_STRENGTH = 0.18;

/**
 * Inline properties this runtime may write, cleared on every teardown path.
 *
 * `translate`, `rotate` and `scale` are in the list because GSAP flattens those
 * standalone properties into its matrix and writes them back as `none` on any
 * element it transforms (`CSSPlugin`, transform init), so a teardown has to
 * remove them explicitly.
 */
const OWNED_PROPERTIES = [
	"transform",
	"opacity",
	"filter",
	"translate",
	"rotate",
	"scale",
	"clip-path",
	HERO_PROGRESS_PROPERTY,
];

/* ── state ───────────────────────────────────────────────────────────────── */

let media: MediaQueryList | undefined;
let observer: MutationObserver | undefined;
let scanScheduled = false;
let running = false;

/**
 * Per-root teardowns, so a duplicated block can be registered independently.
 */
const rootTeardowns = new Map< HTMLElement, () => void >();

/**
 * Soft-text listener teardowns, keyed by the element they were bound to.
 */
const softTeardowns = new Map< HTMLElement, () => void >();

/**
 * Magnetic listener teardowns, keyed by the element they were bound to.
 */
const magneticTeardowns = new Map< HTMLElement, () => void >();

/**
 * Elements already split into soft text: never split twice.
 */
const splitElements = new WeakSet< Element >();

/**
 * Elements an in-flight hero transition animates. Per-root work tracks its own
 * elements; only the transition targets need a module-level sweep here.
 */
const transitionTargets = new Set< HTMLElement >();

/**
 * In-flight hero transitions, cancelled by `destroy()` and by reduced motion.
 */
const heroTransitions = new Set< HeroTransition >();

let segmenter: { segment: ( input: string ) => Iterable< { segment: string } > } | null | undefined;

/* ── reduced motion ──────────────────────────────────────────────────────── */

/**
 * Whether the visitor asked for reduced motion.
 *
 * @return True when motion must stay off.
 */
function prefersReducedMotion(): boolean {
	return media ? media.matches : window.matchMedia( "(prefers-reduced-motion: reduce)" ).matches;
}

/**
 * Remove every inline property this runtime owns from one element.
 *
 * The `style` attribute itself is dropped when nothing is left in it, so a
 * released element reads as `getAttribute('style') === null` and never as an
 * empty attribute. Foreign inline properties are left untouched: the attribute
 * only disappears when the sweep emptied it.
 *
 * @param element Element to restore.
 */
function clearInlineStyles( element: HTMLElement ): void {
	OWNED_PROPERTIES.forEach( ( property ) => element.style.removeProperty( property ) );

	if ( 0 === element.style.length ) {
		element.removeAttribute( "style" );
	}
}

/**
 * Hand elements back to CSS once a tween is finished with them.
 *
 * GSAP drops its own inline properties first, which also invalidates its
 * per-element transform cache, and the DOM-side sweep then removes what GSAP
 * leaves behind: the standalone `translate`/`rotate`/`scale` properties it
 * flattens into a matrix. The resting pose of an element therefore lives in the
 * stylesheet instead of a pinned inline transform.
 *
 * @param targets Elements to release.
 */
function releaseToCss( targets: HTMLElement[] ): void {
	if ( ! targets.length ) {
		return;
	}

	gsap.set( targets, { clearProps: "transform,opacity,filter" } );
	targets.forEach( clearInlineStyles );
}

/**
 * Whether an element's trigger start line is still below the viewport.
 *
 * Mirrors the `immediateRender` behaviour of the reference's `gsap.from()`
 * tweens: content below the fold is only put in its "from" state while it is
 * still out of view, so nothing that is visible on load is hidden.
 *
 * @param element Trigger element.
 * @param ratio   Start line, as a fraction of the viewport height.
 *
 * @return True when the start line has not been reached yet.
 */
function isBelowStart( element: HTMLElement, ratio: number ): boolean {
	return element.getBoundingClientRect().top > window.innerHeight * ratio;
}

/**
 * Collect `root` itself plus its descendants matching a selector.
 *
 * @param root     Element to search from.
 * @param selector CSS selector.
 *
 * @return Matching elements, in document order, without duplicates.
 */
function collect( root: HTMLElement, selector: string ): HTMLElement[] {
	const found = Array.from( root.querySelectorAll< HTMLElement >( selector ) );

	if ( root.matches( selector ) ) {
		found.unshift( root );
	}

	return found;
}

/* ── soft text ───────────────────────────────────────────────────────────── */

/**
 * Split one word into graphemes, Vietnamese-aware when the browser can.
 *
 * @param word Word to split.
 *
 * @return Graphemes in order.
 */
function splitGraphemes( word: string ): string[] {
	if ( undefined === segmenter ) {
		const intl = Intl as unknown as {
			Segmenter?: new (
				locale: string,
				options: { granularity: string },
			) => { segment: ( input: string ) => Iterable< { segment: string } > };
		};

		segmenter = intl.Segmenter
			? new intl.Segmenter( "vi", { granularity: "grapheme" } )
			: null;
	}

	if ( segmenter ) {
		return Array.from( segmenter.segment( word ), ( part ) => part.segment );
	}

	return Array.from( word );
}

/**
 * Split every eligible text node in `root` into animated glyph spans.
 *
 * Whitespace between words is re-appended verbatim as plain text nodes. The
 * original text moves to the wrapper's `aria-label` and every generated word is
 * `aria-hidden`, so the accessible name never changes.
 *
 * @param root Element or document to split.
 */
export function splitSoftText( root: ParentNode ): void {
	const walker = document.createTreeWalker( root as Node, NodeFilter.SHOW_TEXT, {
		acceptNode: ( node: Node ): number => {
			const parent = ( node as Text ).parentElement;

			if ( parent && parent.closest( "svg, .soft-text, .sr-only" ) ) {
				return NodeFilter.FILTER_REJECT;
			}

			return ( node.textContent ?? "" ).trim()
				? NodeFilter.FILTER_ACCEPT
				: NodeFilter.FILTER_REJECT;
		},
	} );
	const nodes: Text[] = [];

	while ( walker.nextNode() ) {
		nodes.push( walker.currentNode as Text );
	}

	nodes.forEach( ( node ) => {
		const text = node.textContent ?? "";
		const wrapper = document.createElement( "span" );

		wrapper.className = SOFT_WRAPPER_CLASS;
		wrapper.setAttribute( "aria-label", text );

		text.split( /(\s+)/ ).forEach( ( part ) => {
			if ( ! part.trim() ) {
				wrapper.append( document.createTextNode( part ) );

				return;
			}

			const word = document.createElement( "span" );
			word.className = "soft-word";
			word.setAttribute( "aria-hidden", "true" );

			splitGraphemes( part ).forEach( ( grapheme ) => {
				const character = document.createElement( "span" );
				character.className = "soft-char";
				character.textContent = grapheme;
				word.append( character );
			} );

			wrapper.append( word );
		} );

		node.replaceWith( wrapper );
	} );
}

/**
 * Split one target once, whatever called us first.
 *
 * @param target Element whose text should be split.
 */
function splitOnce( target: HTMLElement ): void {
	if ( splitElements.has( target ) ) {
		return;
	}

	splitElements.add( target );
	splitSoftText( target );
}

/**
 * Replay the soft-text entrance for every glyph inside `root`.
 *
 * @param root  Element holding split text.
 * @param large Use the display-size blur and offsets.
 */
export function replaySoftText( root: ParentNode, large = false ): void {
	if ( prefersReducedMotion() ) {
		return;
	}

	root.querySelectorAll< HTMLElement >( SOFT_CHAR_SELECTOR ).forEach( ( character, index ) => {
		character.getAnimations().forEach( ( animation ) => animation.cancel() );
		character.animate(
			[
				{
					opacity: 0,
					filter: `blur(${ large ? SOFT_BLUR_LARGE : SOFT_BLUR }px)`,
					transform: `translateY(${ large ? SOFT_SHIFT_LARGE : SOFT_SHIFT }px)`,
				},
				{ opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
			],
			{
				duration: SOFT_DURATION,
				delay: index * ( large ? SOFT_DELAY_LARGE : SOFT_DELAY ),
				easing: SOFT_EASING,
				fill: "backwards",
			},
		);
	} );
}

/**
 * Cancel every soft-text replay inside `scope`.
 *
 * @param scope Element or document to cancel.
 */
function cancelSoftTextAnimations( scope: ParentNode ): void {
	scope.querySelectorAll< HTMLElement >( SOFT_CHAR_SELECTOR ).forEach( ( character ) => {
		character.getAnimations().forEach( ( animation ) => animation.cancel() );
	} );
}

/**
 * Whether a control must keep its text untouched.
 *
 * @param element Candidate control.
 *
 * @return True when the element must not be split.
 */
function skipsSoftText( element: HTMLElement ): boolean {
	if ( ( element as HTMLButtonElement ).disabled ) {
		return true;
	}

	if ( element.closest( ".doclap-block-preview" ) ) {
		return true;
	}

	if ( element.classList.contains( "motion-toggle" ) ) {
		return true;
	}

	if ( element.classList.contains( "menu-toggle" ) ) {
		return true;
	}

	// Work cards and journal rows own a heading and a canvas: their title is
	// split on its own, from the container's pointerenter/focus.
	if ( element.querySelector( "h3, canvas" ) ) {
		return true;
	}

	// Input-driven UI: labels and anything inside a form with real fields.
	if ( element.closest( "label" ) ) {
		return true;
	}

	if ( element.querySelector( "input, textarea, select" ) ) {
		return true;
	}

	const form = element.closest( "form" );

	return Boolean( form && form.querySelector( "input, textarea, select" ) );
}

/**
 * Split a control's text once and replay it on hover and focus.
 *
 * @param control  Element carrying the listeners.
 * @param textRoot Element whose text is split and replayed.
 *
 * @return Teardown for the listeners.
 */
function bindSoftControl( control: HTMLElement, textRoot: HTMLElement ): () => void {
	splitOnce( textRoot );

	const onPointerEnter = ( event: PointerEvent ): void => {
		if ( "touch" === event.pointerType ) {
			return;
		}

		replaySoftText( textRoot );
	};

	const onFocus = (): void => {
		replaySoftText( textRoot );
	};

	control.addEventListener( "pointerenter", onPointerEnter );
	control.addEventListener( "focus", onFocus );

	return () => {
		control.removeEventListener( "pointerenter", onPointerEnter );
		control.removeEventListener( "focus", onFocus );
	};
}

/**
 * Split and bind every eligible control inside `root`.
 *
 * @param root Element or document to sweep.
 *
 * @return Bindings for the caller to own.
 */
function bindSoftText( root: ParentNode ): ElementBinding[] {
	const bindings: ElementBinding[] = [];

	root.querySelectorAll< HTMLElement >( SOFT_SELECTOR ).forEach( ( element ) => {
		if ( softTeardowns.has( element ) || skipsSoftText( element ) ) {
			return;
		}

		const dispose = bindSoftControl( element, element );
		softTeardowns.set( element, dispose );
		bindings.push( { element, dispose } );
	} );

	// Panel headings are split once and replayed by the hero choreography.
	root.querySelectorAll< HTMLElement >( SOFT_HEADING_SELECTOR ).forEach( splitOnce );

	// Work cards and journal rows own their heading: the reference replays it
	// from the container's own pointerenter and focus.
	root.querySelectorAll< HTMLElement >( SOFT_TITLE_SELECTOR ).forEach( ( container ) => {
		if ( softTeardowns.has( container ) ) {
			return;
		}

		if ( container.closest( ".doclap-block-preview" ) ) {
			return;
		}

		const title = container.querySelector< HTMLElement >( "h3" );

		if ( ! title ) {
			return;
		}

		const dispose = bindSoftControl( container, title );
		softTeardowns.set( container, dispose );
		bindings.push( { element: container, dispose } );
	} );

	return bindings;
}

/* ── magnetic controls ───────────────────────────────────────────────────── */

/**
 * Follow the pointer with the control's own `translate`, and ease back on exit.
 *
 * The standalone `translate` property is used so the existing transform-based
 * hover rules keep working.
 *
 * @param root Element or document to sweep.
 *
 * @return Bindings for the caller to own.
 */
function bindMagnetic( root: ParentNode ): ElementBinding[] {
	const bindings: ElementBinding[] = [];

	if ( prefersReducedMotion() ) {
		return bindings;
	}

	root.querySelectorAll< HTMLElement >( MAGNETIC_SELECTOR ).forEach( ( element ) => {
		if ( magneticTeardowns.has( element ) ) {
			return;
		}

		const onPointerMove = ( event: PointerEvent ): void => {
			if ( "touch" === event.pointerType ) {
				return;
			}

			const rect = element.getBoundingClientRect();
			const x = ( event.clientX - rect.left - rect.width / 2 ) * MAGNETIC_STRENGTH;
			const y = ( event.clientY - rect.top - rect.height / 2 ) * MAGNETIC_STRENGTH;

			element.style.setProperty( "translate", `${ x }px ${ y }px` );
		};

		const onPointerLeave = (): void => {
			element.style.setProperty( "translate", "0px 0px" );
		};

		element.addEventListener( "pointermove", onPointerMove );
		element.addEventListener( "pointerleave", onPointerLeave );

		const dispose = (): void => {
			element.removeEventListener( "pointermove", onPointerMove );
			element.removeEventListener( "pointerleave", onPointerLeave );
			element.style.removeProperty( "translate" );
		};

		magneticTeardowns.set( element, dispose );
		bindings.push( { element, dispose } );
	} );

	return bindings;
}

/* ── per-root choreography ───────────────────────────────────────────────── */

/**
 * Hero choreography: the initial timeline and the scrubbed parallax.
 *
 * @param hero      `.gallery-hero` element.
 * @param touched   Elements this root animated, cleared on teardown.
 * @param disposers Teardown sinks for this root.
 */
function bindHero(
	hero: HTMLElement,
	touched: Set< HTMLElement >,
	disposers: Array< () => void >,
): void {
	const targets = ( selector: string ): HTMLElement[] =>
		Array.from( hero.querySelectorAll< HTMLElement >( selector ) );

	const top = targets( ".hero-top" );
	const orbit = targets( ".gallery-orbit" );
	const visual = targets( ".hero-visual" );
	const chrome = targets( ".gallery-caption, .gallery-footer, .gallery-interact" );
	const words = targets( ".gallery-word" );

	[ ...top, ...orbit, ...visual, ...chrome, ...words ].forEach( ( element ) =>
		touched.add( element ),
	);

	const timeline = gsap.timeline( {
		defaults: { ease: "power3.out" },
		onComplete: (): void => {
			// Releasing also drops the `translate: none` GSAP writes when it
			// folds the stylesheet's parallax offset into its own matrix, so
			// the offset applies again once the intro is done.
			releaseToCss( [ ...top, ...orbit, ...chrome, ...visual ] );
		},
	} );

	if ( top.length ) {
		timeline.from( top, { y: 10, opacity: 0, duration: 1 } );
	}

	if ( orbit.length ) {
		timeline.from( orbit, { scale: 0.86, opacity: 0, duration: 1.8 }, 0.1 );
	}

	if ( visual.length ) {
		timeline.from( visual, { opacity: 0, y: 22, duration: 2 }, 0.25 );
	}

	if ( chrome.length ) {
		timeline.from( chrome, { y: 12, opacity: 0, duration: 1.2, stagger: 0.12 }, 0.65 );
	}

	const active =
		hero.querySelector< HTMLElement >( ".gallery-panel:not([hidden])" ) ??
		hero.querySelector< HTMLElement >( ".gallery-panel" );
	const heading = active?.querySelector< HTMLElement >( "h1, h2" );

	if ( heading ) {
		// Split first: the replay needs the glyphs to exist.
		splitOnce( heading );
		replaySoftText( heading, true );
	}

	// The scrubbed offsets are published as one custom property on the hero root
	// and read by the stylesheet (`.gallery-hero .gallery-word`,
	// `.gallery-hero .hero-visual` in `40-overrides.css`). Keeping the leaf
	// elements free of scroll-driven inline transforms is what lets a finished
	// view change hand them back to CSS with no `style` attribute at all — the
	// reference composition carries the same values inline instead.
	//
	// The value is eased by the mandated interruptible tween: `quickTo` on a
	// plain object, 0.3s, `ease: none`, re-aimed on every scroll update.
	const offset = { progress: 0 };

	/**
	 * Write the eased progress onto the hero root.
	 */
	const writeOffset = (): void => {
		if ( offset.progress <= 0 ) {
			hero.style.removeProperty( HERO_PROGRESS_PROPERTY );

			return;
		}

		hero.style.setProperty( HERO_PROGRESS_PROPERTY, String( offset.progress ) );
	};

	const setOffset = gsap.quickTo( offset, "progress", {
		duration: 0.3,
		ease: "none",
		onUpdate: writeOffset,
	} );

	const parallax = ScrollTrigger.create( {
		trigger: hero,
		start: "top top",
		end: "bottom top",
		scrub: true,
		onUpdate: ( self ) => {
			// Re-aim the eased follower, then publish what it currently holds so
			// the root is in sync on the frame the scroll happened.
			setOffset( self.progress );
			writeOffset();
		},
	} );

	touched.add( hero );

	disposers.push( () => {
		parallax.kill();
		timeline.kill();
		setOffset.tween.kill();
		gsap.killTweensOf( [ ...words, ...visual ] );
	} );
}

/**
 * Section entrances, in the reference's order and timing.
 *
 * @param section   `.section` element that is not the hero.
 * @param touched   Elements this root animated, cleared on teardown.
 * @param disposers Teardown sinks for this root.
 */
function bindSectionEntrances(
	section: HTMLElement,
	touched: Set< HTMLElement >,
	disposers: Array< () => void >,
): void {
	const contact = section.classList.contains( "contact" );
	const elements = Array.from(
		new Set( section.querySelectorAll< HTMLElement >( ENTRANCE_SELECTOR ) ),
	);

	elements.forEach( ( element, index ) => {
		// The contact container is anchored to the untransformed section so the
		// trigger never measures a moving box.
		const trigger = contact ? section : element;

		if ( isBelowStart( trigger, ENTRANCE_START_RATIO ) ) {
			touched.add( element );
			gsap.set( element, { ...ENTRANCE_FROM } );
		}

		const scrollTrigger = ScrollTrigger.create( {
			trigger,
			start: ENTRANCE_START,
			once: true,
			onEnter: () => {
				touched.add( element );
				gsap.fromTo(
					element,
					{ ...ENTRANCE_FROM },
					{
						...ENTRANCE_TO,
						delay: Math.min( ( index % 3 ) * 0.07, 0.14 ),
						onComplete: () => {
							gsap.set( element, { clearProps: "filter,transform,opacity" } );
						},
					},
				);
			},
		} );

		disposers.push( () => scrollTrigger.kill() );
	} );
}

/**
 * Team image clip reveal.
 *
 * @param root      Element to search for team images.
 * @param touched   Elements this root animated, cleared on teardown.
 * @param disposers Teardown sinks for this root.
 */
function bindTeamImages(
	root: HTMLElement,
	touched: Set< HTMLElement >,
	disposers: Array< () => void >,
): void {
	collect( root, ".team-image img" ).forEach( ( image ) => {
		if ( isBelowStart( image, TEAM_START_RATIO ) ) {
			touched.add( image );
			gsap.set( image, { ...TEAM_FROM } );
		}

		const scrollTrigger = ScrollTrigger.create( {
			trigger: image,
			start: TEAM_START,
			once: true,
			onEnter: () => {
				touched.add( image );
				gsap.fromTo(
					image,
					{ ...TEAM_FROM },
					{
						clipPath: "inset(0% 0% 0% 0%)",
						duration: 1.6,
						ease: "power3.out",
						onComplete: () => {
							gsap.set( image, { clearProps: "clipPath" } );
						},
					},
				);
			},
		} );

		disposers.push( () => scrollTrigger.kill() );
	} );
}

/**
 * Disciplines stagger.
 *
 * @param band      `.doclap-discipline` element.
 * @param touched   Elements this root animated, cleared on teardown.
 * @param disposers Teardown sinks for this root.
 */
function bindDisciplines(
	band: HTMLElement,
	touched: Set< HTMLElement >,
	disposers: Array< () => void >,
): void {
	const items = Array.from( band.querySelectorAll< HTMLElement >( ".discipline-item" ) );

	if ( ! items.length ) {
		return;
	}

	items.forEach( ( item ) => touched.add( item ) );

	if ( isBelowStart( band, DISCIPLINE_START_RATIO ) ) {
		gsap.set( items, { ...DISCIPLINE_FROM } );
	}

	const scrollTrigger = ScrollTrigger.create( {
		trigger: band,
		start: DISCIPLINE_START,
		once: true,
		onEnter: () => {
			gsap.fromTo(
				items,
				{ ...DISCIPLINE_FROM },
				{
					y: 0,
					opacity: 1,
					duration: 0.85,
					stagger: 0.1,
					ease: "power3.out",
					onComplete: () => {
						gsap.set( items, { clearProps: "transform,opacity" } );
					},
				},
			);
		},
	} );

	disposers.push( () => scrollTrigger.kill() );
}

/* ── hero view change ────────────────────────────────────────────────────── */

/**
 * Copy the pressed tab's name onto the decorative hero word.
 *
 * `.gallery-word` is `aria-hidden`, so no accessible name depends on it, but it
 * is never left on the outgoing view's label or blanked: an empty tab name
 * leaves the current text alone.
 *
 * @param hero `.gallery-hero` element owning the tabs and the word.
 */
function syncWordLabel( hero: HTMLElement ): void {
	const word = hero.querySelector< HTMLElement >( ".gallery-word" );

	if ( ! word ) {
		return;
	}

	// Callers run this after `apply()`, so the pressed tab already carries the
	// incoming label.
	const label =
		hero.querySelector< HTMLElement >( ".slide-tab[aria-pressed='true'] .tab-name" )
			?.textContent?.trim() ?? "";

	if ( "" !== label ) {
		word.textContent = label;
	}
}

/**
 * Run the reference's interruptible hero view transition.
 *
 * @param options Hero change request from the hero view bundle.
 *
 * @return True when the runtime took ownership of the transition.
 */
function changeHero( options: DoclapHeroChangeOptions ): boolean {
	const { root, from, to, index, apply, finish } = options;
	const hero = root.classList.contains( "gallery-hero" )
		? root
		: root.querySelector< HTMLElement >( ".gallery-hero" );

	if ( ! hero || ! from || ! to || prefersReducedMotion() ) {
		return false;
	}

	let applied = false;
	let finished = false;

	const orbit = Array.from( hero.querySelectorAll< HTMLElement >( ".gallery-orbit" ) );
	const word = hero.querySelector< HTMLElement >( ".gallery-word" );
	const involved: HTMLElement[] = [ from, to, ...orbit ];

	if ( word ) {
		involved.push( word );
	}

	involved.forEach( ( element ) => transitionTargets.add( element ) );

	// A transition supersedes whatever ran before on the same boxes. The
	// `.gallery-word` parallax owns its own tween, so it is left alone here.
	[ from, to, ...orbit ].forEach( ( element ) => gsap.killTweensOf( element ) );

	const transition = {} as HeroTransition;

	const applyOnce = (): void => {
		if ( applied ) {
			return;
		}

		applied = true;
		apply();
	};

	const finishOnce = (): void => {
		if ( finished ) {
			return;
		}

		finished = true;
		heroTransitions.delete( transition );
		finish();
	};

	const timeline = gsap
		.timeline( {
			onComplete: (): void => {
				releaseToCss( [ to ] );
				finishOnce();
			},
		} )
		.to( from, {
			opacity: 0,
			y: -14,
			filter: "blur(8px)",
			duration: 0.42,
			ease: "power2.in",
		} )
		.call( (): void => {
			applyOnce();
			releaseToCss( [ from ] );
			const heading = to.querySelector< HTMLElement >( "h1, h2" );

			if ( heading ) {
				replaySoftText( heading, true );
			}
		} )
		.fromTo(
			to,
			{ opacity: 0, y: 20, filter: "blur(6px)" },
			{
				opacity: 1,
				y: 0,
				filter: "blur(0px)",
				duration: 1.05,
				ease: "power3.out",
			},
		);

	// The orbit hands the incoming view's resting pose back to the stylesheet
	// (`.gallery-hero[data-current="1"] .gallery-orbit`) when it settles.
	const orbitTween: Killable | undefined = orbit.length
		? gsap.to( orbit, {
				scaleX: index ? 0.76 : 1,
				scaleY: index ? 1.13 : 0.94,
				rotation: index ? 24 : -18,
				xPercent: index ? -8 : 0,
				duration: 1.8,
				ease: "power3.inOut",
				onComplete: () => {
					releaseToCss( orbit );
				},
		  } )
		: undefined;

	const wordTimeline: Killable | undefined = word
		? gsap
				.timeline()
				.to( word, { opacity: 0.2, y: index ? 30 : 0, duration: 0.6 } )
				.call( (): void => {
					// `apply()` has swapped the tabs by now, so the pressed tab
					// carries the incoming label.
					syncWordLabel( hero );
				} )
				.to( word, {
					opacity: 1,
					duration: 1,
					onComplete: () => {
						// The 30px offset and the opacity both belong to CSS
						// now; the stylesheet also owns the scroll-driven
						// offset through the hero's custom property.
						releaseToCss( [ word ] );
					},
				} )
		: undefined;

	transition.root = hero;
	transition.cancel = (): void => {
		timeline.kill();
		orbitTween?.kill();
		wordTimeline?.kill();
		applyOnce();

		// The panels and the status already show the incoming view, so the
		// decorative word is synced too instead of being left on the old label.
		syncWordLabel( hero );
		releaseToCss( involved );
		finishOnce();
		heroTransitions.delete( transition );
	};

	heroTransitions.add( transition );

	return true;
}

/**
 * Cancel every in-flight hero transition below `root`.
 *
 * @param root Root that is being torn down.
 */
function cancelHeroTransitions( root?: HTMLElement ): void {
	Array.from( heroTransitions ).forEach( ( transition ) => {
		if ( root && transition.root !== root && ! root.contains( transition.root ) ) {
			return;
		}

		transition.cancel();
	} );
}

/* ── root registration ───────────────────────────────────────────────────── */

/**
 * Run the per-root choreography and return its teardown.
 *
 * Idempotent: a root already registered keeps its single set of triggers,
 * timelines and listeners, which is what makes a duplicated block safe.
 *
 * @param root Block root to register.
 *
 * @return Teardown for everything this root gained: its triggers, tweens,
 *         listeners, running soft-text replays and the inline styles they set.
 */
export function registerMotionRoot( root: HTMLElement ): () => void {
	const known = rootTeardowns.get( root );

	if ( known ) {
		return known;
	}

	// Reduced motion is a static mode: no root work at all.
	if ( prefersReducedMotion() ) {
		return () => {};
	}

	const disposers: Array< () => void > = [];
	// Every element this root animates, so its teardown restores their resting
	// values even when it is called on its own (a detached root, an editor
	// preview) instead of through `destroy()`.
	const touched = new Set< HTMLElement >();

	// Text first: the hero and the magnetic controls replay the glyphs.
	const soft = bindSoftText( root );
	const magnetic = bindMagnetic( root );

	collect( root, ".gallery-hero" ).forEach( ( hero ) =>
		bindHero( hero, touched, disposers ),
	);

	collect( root, ".section:not(.hero)" ).forEach( ( section ) =>
		bindSectionEntrances( section, touched, disposers ),
	);

	collect( root, ".doclap-discipline" ).forEach( ( band ) =>
		bindDisciplines( band, touched, disposers ),
	);

	bindTeamImages( root, touched, disposers );

	const teardown = (): void => {
		cancelHeroTransitions( root );
		disposers.forEach( ( dispose ) => dispose() );
		cancelSoftTextAnimations( root );

		releaseToCss( Array.from( touched ) );
		touched.clear();

		soft.forEach( ( binding ) => {
			softTeardowns.delete( binding.element );
			binding.dispose();
		} );

		magnetic.forEach( ( binding ) => {
			magneticTeardowns.delete( binding.element );
			binding.dispose();
		} );

		rootTeardowns.delete( root );
	};

	rootTeardowns.set( root, teardown );

	return teardown;
}

/* ── scanning ────────────────────────────────────────────────────────────── */

/**
 * Release bindings whose element left the document.
 *
 * @param map Registry to prune.
 */
function releaseDetached( map: Map< HTMLElement, () => void > ): void {
	Array.from( map ).forEach( ( [ element, dispose ] ) => {
		if ( element.isConnected ) {
			return;
		}

		dispose();
		map.delete( element );
	} );
}

/**
 * Register every root in the document and sweep the surrounding chrome.
 */
function scan(): void {
	scanScheduled = false;

	if ( ! running ) {
		return;
	}

	releaseDetached( softTeardowns );
	releaseDetached( magneticTeardowns );

	Array.from( rootTeardowns.keys() ).forEach( ( root ) => {
		if ( ! root.isConnected ) {
			rootTeardowns.get( root )?.();
		}
	} );

	document.querySelectorAll< HTMLElement >( ROOT_SELECTOR ).forEach( ( root ) =>
		registerMotionRoot( root ),
	);

	// Header, footer and any standalone control outside a block root.
	bindSoftText( document ).forEach( ( binding ) =>
		softTeardowns.set( binding.element, binding.dispose ),
	);
	bindMagnetic( document ).forEach( ( binding ) =>
		magneticTeardowns.set( binding.element, binding.dispose ),
	);
}

/**
 * Coalesce DOM mutations into one scan per frame.
 */
function scheduleScan(): void {
	if ( scanScheduled ) {
		return;
	}

	scanScheduled = true;
	window.requestAnimationFrame( scan );
}

/**
 * Watch the document for block roots added later.
 */
function startObserver(): void {
	if ( observer || ! document.body ) {
		return;
	}

	observer = new MutationObserver( scheduleScan );
	observer.observe( document.body, { childList: true, subtree: true } );
}

/**
 * Stop watching for new roots.
 */
function stopObserver(): void {
	observer?.disconnect();
	observer = undefined;
}

/* ── lifecycle ───────────────────────────────────────────────────────────── */

/**
 * Start every runtime subsystem.
 */
function startMotion(): void {
	if ( running ) {
		return;
	}

	running = true;
	startObserver();
	scan();
	ScrollTrigger.refresh();

	if ( document.fonts ) {
		void document.fonts.ready.then( () => {
			ScrollTrigger.refresh();
		} );
	}
}

/**
 * Tear every runtime subsystem down and restore the resting markup.
 */
function stopMotion(): void {
	running = false;
	stopObserver();
	cancelHeroTransitions();

	Array.from( rootTeardowns.values() ).forEach( ( teardown ) => teardown() );
	rootTeardowns.clear();

	Array.from( softTeardowns.values() ).forEach( ( teardown ) => teardown() );
	softTeardowns.clear();

	Array.from( magneticTeardowns.values() ).forEach( ( teardown ) => teardown() );
	magneticTeardowns.clear();

	cancelSoftTextAnimations( document );

	ScrollTrigger.getAll().forEach( ( trigger ) => trigger.kill() );
	gsap.globalTimeline.clear();

	releaseToCss( Array.from( transitionTargets ) );
	transitionTargets.clear();
}

/**
 * React to a reduced-motion preference change mid-session.
 */
function onReducedMotionChange(): void {
	if ( prefersReducedMotion() ) {
		stopMotion();

		return;
	}

	startMotion();
}

/**
 * Start the runtime; safe to call again after {@link destroy}.
 */
function init(): void {
	if ( ! media ) {
		media = window.matchMedia( "(prefers-reduced-motion: reduce)" );
		media.addEventListener( "change", onReducedMotionChange );
	}

	if ( media.matches ) {
		// Complete static mode: the markup stays exactly as rendered.
		return;
	}

	startMotion();
}

/**
 * Recalculate every trigger position.
 */
function refresh(): void {
	if ( prefersReducedMotion() ) {
		return;
	}

	ScrollTrigger.refresh();
}

/**
 * Full teardown; safe to call when the runtime never started.
 */
function destroy(): void {
	stopMotion();

	if ( media ) {
		media.removeEventListener( "change", onReducedMotionChange );
		media = undefined;
	}
}

/**
 * Boot the motion runtime and publish it for the block view bundles.
 */
export function bootMotion(): void {
	window.doclapMotion = {
		init,
		refresh,
		destroy,
		changeHero,
	};

	init();
}
