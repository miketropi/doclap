/**
 * Home — Testimonials view script.
 *
 * The perspective strip is one native horizontal scroll container with mandatory
 * scroll snapping, so swiping, the wheel, the arrow keys on the focusable
 * viewport and the step buttons all move the same element. The behaviour itself
 * lives in `resources/ts/runtime/carousel.ts`, which the journal carousel runs as
 * well: one implementation of the counter, the disabled states, the step distance
 * and the keyboard handling keeps the two strips from drifting apart.
 *
 * Without this bundle the strip still scrolls by touch, wheel and keyboard; it
 * simply loses the disabled button states and the counter.
 *
 * Lifecycle contract (booted through `resources/ts/runtime/blocks.ts`):
 *   * one boot per root, so a duplicated block never double-binds its listeners;
 *   * a reduced-motion visitor gets an instant jump instead of a smooth one;
 *   * removing the root removes every listener and disconnects the observer.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";
import { initCarousel } from "../../resources/ts/runtime/carousel";

function init(root: HTMLElement): (() => void) | void {
	const carousel = root.querySelector<HTMLElement>("[data-doclap-carousel]");

	return carousel ? initCarousel(carousel) : undefined;
}

bootBlocks<HTMLElement>(".doclap-home-testimonials", init);
