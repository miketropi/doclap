/**
 * Doclap shared carousel runtime.
 *
 * One native scroll-snap strip serves both the journal carousel and the
 * testimonial section: touch, the wheel, the arrow keys on the focused track and
 * the two step buttons all move the same scroll container, so nothing animates a
 * transform track and every snap point stays reachable without JavaScript.
 *
 * The bundle is loaded through `resources/ts/runtime/blocks.ts`, which boots one
 * instance per root and hands the returned teardown back when the root leaves the
 * document. Nothing here reads a document-wide singleton, so two carousels on one
 * page keep their own counter, their own disabled states and their own keyboard
 * handling.
 *
 * The counter format, the step distance and the edge tolerance are shared on
 * purpose: the two consumers have to behave identically, and this module replaced
 * the testimonial block's private copy of exactly this logic.
 *
 * Node vocabulary: the testimonial renderer marks its nodes with the long
 * `data-doclap-carousel-*` names it shipped with, the journal renderer with the
 * shorter `data-doclap-*` names, and the layout classes (`.carousel-viewport`,
 * `.carousel-card`, `.voice-slide`) come from the shared primitives in
 * `resources/css/modules/25-sections.css`. Both vocabularies are resolved below.
 */

/**
 * Root handed to {@link initCarousel}: the element the renderer marked as the
 * carousel, e.g. `[data-carousel]` or `[data-doclap-carousel]`.
 */
export interface CarouselInit {
	/** Element that owns the carousel; every node is resolved from here. */
	root: HTMLElement;
}

/** Scroll container, whichever vocabulary the renderer used. */
const VIEWPORT_SELECTOR = "[data-doclap-carousel-viewport], .carousel-viewport";

/** Snap cards, whichever vocabulary the renderer used. */
const CARD_SELECTOR = ".carousel-card, .voice-slide";

const PREVIOUS_SELECTOR = "[data-doclap-prev], [data-doclap-carousel-prev]";
const NEXT_SELECTOR = "[data-doclap-next], [data-doclap-carousel-next]";
const COUNTER_SELECTOR = "[data-doclap-count], [data-doclap-carousel-count]";

/**
 * Optional wrapper of the counter and the step buttons. A strip whose cards all
 * fit at once has nothing to page, so its controls are hidden rather than
 * sitting there permanently disabled.
 */
const BAR_SELECTOR = "[data-doclap-carousel-bar]";

/** Tolerance, in pixels, that counts a scroll position as an end of the strip. */
const EDGE = 3;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Initialise one carousel.
 *
 * @param root Element that owns the carousel.
 * @return Teardown that removes every listener and observer, or `undefined` when
 *         the root carries no scrollable strip.
 */
export function initCarousel(root: HTMLElement): (() => void) | void {
	return bootCarousel({ root });
}

/**
 * Bind one carousel.
 *
 * @param init Carousel root.
 * @return Teardown, or `undefined` when the root carries no scrollable strip.
 */
function bootCarousel({ root }: CarouselInit): (() => void) | void {
	const viewport = root.querySelector<HTMLElement>(VIEWPORT_SELECTOR);
	const cards = Array.from(root.querySelectorAll<HTMLElement>(CARD_SELECTOR));
	const previous = root.querySelector<HTMLButtonElement>(PREVIOUS_SELECTOR);
	const next = root.querySelector<HTMLButtonElement>(NEXT_SELECTOR);
	const counter = root.querySelector<HTMLElement>(COUNTER_SELECTOR);
	const bar = root.querySelector<HTMLElement>(BAR_SELECTOR);

	if (!viewport || 0 === cards.length) {
		return;
	}

	/*
	 * The motion preference is read on every call instead of cached, so a visitor
	 * who changes it mid-session gets the instant jump from then on: the visitor
	 * asked for no easing and a smooth scroll would ignore that.
	 */
	const reduced = window.matchMedia(REDUCED_MOTION);

	/**
	 * Index of the card closest to the strip's leading edge: the position the
	 * counter reports after a swipe, a snap or a step. Distances are measured from
	 * the first card so a scroll container with a positioned ancestor still
	 * resolves correctly.
	 */
	const leadingIndex = (): number => {
		const origin = cards[0].offsetLeft;
		const left = viewport.scrollLeft;
		let best = 0;

		cards.forEach((card, index) => {
			if (
				Math.abs(card.offsetLeft - origin - left) <
				Math.abs(cards[best].offsetLeft - origin - left)
			) {
				best = index;
			}
		});

		return best;
	};

	/**
	 * Re-read the geometry and mirror it into the counter and the step buttons.
	 */
	const sync = (): void => {
		const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

		if (bar) {
			bar.hidden = max <= 0;
		}

		if (previous) {
			previous.disabled = viewport.scrollLeft < EDGE;
		}

		if (next) {
			next.disabled = viewport.scrollLeft >= max - EDGE;
		}

		if (counter) {
			const position = String(leadingIndex() + 1).padStart(2, "0");
			const total = String(cards.length).padStart(2, "0");

			counter.textContent = `${position} / ${total}`;
		}
	};

	const page = (direction: 1 | -1): void => {
		/*
		 * One card's width plus the gap that follows it, so a press lands on the
		 * next snap point instead of an arbitrary offset. A strip with a single card
		 * has no second card to measure and falls back to the viewport itself.
		 */
		const step = cards[1]
			? cards[1].offsetLeft - cards[0].offsetLeft
			: viewport.clientWidth;

		viewport.scrollBy({
			left: direction * step,
			behavior: reduced.matches ? "instant" : "smooth",
		});
	};

	const onPrevious = (): void => page(-1);
	const onNext = (): void => page(1);

	const onKeydown = (event: KeyboardEvent): void => {
		/*
		 * Only the focused track pages: a key pressed while a card link has focus
		 * keeps the link's own behaviour, and the page must never scroll sideways.
		 */
		if (event.target !== viewport) {
			return;
		}

		if ("ArrowLeft" === event.key || "ArrowRight" === event.key) {
			event.preventDefault();
			page("ArrowRight" === event.key ? 1 : -1);

			return;
		}

		if ("Home" === event.key || "End" === event.key) {
			event.preventDefault();
			viewport.scrollTo({
				left: "Home" === event.key ? 0 : viewport.scrollWidth,
				behavior: reduced.matches ? "instant" : "smooth",
			});
		}
	};

	previous?.addEventListener("click", onPrevious);
	next?.addEventListener("click", onNext);
	viewport.addEventListener("scroll", sync, { passive: true });
	viewport.addEventListener("keydown", onKeydown);

	/*
	 * A breakpoint change alters how many cards fit, which moves both the end of
	 * the strip and the leading card. One observer on the viewport catches that
	 * without listening to the window.
	 */
	const observer =
		"undefined" === typeof ResizeObserver
			? null
			: new ResizeObserver((): void => sync());

	observer?.observe(viewport);
	sync();

	return () => {
		previous?.removeEventListener("click", onPrevious);
		next?.removeEventListener("click", onNext);
		viewport.removeEventListener("scroll", sync);
		viewport.removeEventListener("keydown", onKeydown);
		observer?.disconnect();
	};
}
