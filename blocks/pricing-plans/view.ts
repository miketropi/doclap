/**
 * doclap/pricing-plans front-end behaviour: the engagement mode toggle.
 *
 * Both engagement modes are rendered by PHP, so this bundle only switches which
 * stored value is visible — it builds no copy of its own, and the section reads
 * completely with JavaScript off. Every node is resolved from the block root and
 * the click is delegated to that root, so two pricing sections on one page stay
 * independent, and `bootBlocks` keeps the wiring idempotent per root.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";

function initPricing(root: HTMLElement): () => void {
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-doclap-mode]"),
  );

  if (0 === buttons.length) {
    return () => {};
  }

  const cards = Array.from(root.querySelectorAll<HTMLElement>(".price-card"));

  /**
   * Mark the matching button pressed and show that mode's stored value.
   *
   * A card that carries no value for the requested mode keeps what it shows: the
   * renderer decides what a mode contains, never this bundle.
   */
  const applyMode = (mode: string): void => {
    buttons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.doclapMode === mode),
      );
    });

    cards.forEach((card) => {
      const price = card.querySelector<HTMLElement>("[data-doclap-price]");
      const caption = card.querySelector<HTMLElement>("[data-doclap-caption]");
      const priceText = price?.getAttribute(`data-doclap-price-${mode}`);
      const captionText = caption?.getAttribute(`data-doclap-caption-${mode}`);

      if (price && 'string' === typeof priceText) {
        price.textContent = priceText;
      }

      if (caption && 'string' === typeof captionText) {
        caption.textContent = captionText;
      }
    });
  };

  const onClick = (event: Event): void => {
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>("[data-doclap-mode]")
        : null;
    const mode = target?.dataset.doclapMode;

    if (!target || !root.contains(target) || !mode) {
      return;
    }

    applyMode(mode);
  };

  root.addEventListener("click", onClick);

  return () => {
    root.removeEventListener("click", onClick);
  };
}

bootBlocks<HTMLElement>(".doclap-pricing-plans", initPricing);
