/**
 * Home — Testimonials view script.
 *
 * The perspective strip is one native horizontal scroll container with mandatory
 * scroll snapping, so swiping, the wheel, the arrow keys on the focusable
 * viewport and the step buttons all move the same element. This script only pages
 * that element by one viewport width, keeps the two step buttons and the counter
 * in sync, and re-reads the geometry when the breakpoint changes the number of
 * visible slides.
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

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Two-digit position label, matching the theme's mono numbering. */
function ordinal(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function init(root: HTMLElement): (() => void) | void {
  const viewport = root.querySelector<HTMLElement>(
    "[data-doclap-carousel-viewport]",
  );
  const slides = Array.from(root.querySelectorAll<HTMLElement>(".voice-slide"));
  const previous = root.querySelector<HTMLButtonElement>(
    "[data-doclap-carousel-prev]",
  );
  const next = root.querySelector<HTMLButtonElement>(
    "[data-doclap-carousel-next]",
  );
  const counter = root.querySelector<HTMLElement>("[data-doclap-carousel-count]");
  const bar = root.querySelector<HTMLElement>("[data-doclap-carousel-bar]");

  if (!viewport || slides.length === 0) {
    return;
  }

  /** Index of the slide that currently leads the viewport. */
  const leadingIndex = (): number => {
    const origin = viewport.getBoundingClientRect().left;
    let index = 0;

    slides.forEach((slide, position) => {
      if (slide.getBoundingClientRect().left <= origin + 4) {
        index = position;
      }
    });

    return index;
  };

  const sync = (): void => {
    const left = viewport.scrollLeft;
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

    /*
     * A site with as many testimonials as fit on screen gets no controls at all:
     * a row of permanently disabled buttons and a fixed counter would advertise
     * paging that cannot happen.
     */
    if (bar) {
      bar.hidden = max <= 0;
    }

    if (previous) {
      previous.disabled = left <= 1;
    }

    if (next) {
      next.disabled = left >= max - 1;
    }

    if (counter) {
      counter.textContent = `${ordinal(leadingIndex())} / ${ordinal(slides.length - 1)}`;
    }
  };

  const page = (direction: 1 | -1): void => {
    viewport.scrollBy({
      left: direction * viewport.clientWidth,
      behavior: reduced.matches ? "auto" : "smooth",
    });
  };

  const onPrevious = (): void => page(-1);
  const onNext = (): void => page(1);

  previous?.addEventListener("click", onPrevious);
  next?.addEventListener("click", onNext);
  viewport.addEventListener("scroll", sync, { passive: true });

  /*
   * A breakpoint change alters how many slides fit, which moves both the end of
   * the strip and the leading slide. Observing the viewport catches that without
   * listening to the window.
   */
  const observer =
    "undefined" === typeof ResizeObserver
      ? null
      : new ResizeObserver(() => sync());

  observer?.observe(viewport);
  sync();

  return () => {
    previous?.removeEventListener("click", onPrevious);
    next?.removeEventListener("click", onNext);
    viewport.removeEventListener("scroll", sync);
    observer?.disconnect();
  };
}

bootBlocks<HTMLElement>(".doclap-home-testimonials", init);
