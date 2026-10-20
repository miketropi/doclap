/**
 * Home — Work view script.
 *
 * Ambient playback for the project videos, plus the media dialog: openers, close
 * and cancel handling, the focus trap, focus restoration, and keeping the card
 * and the dialog on the same frame so a piece never plays twice at once.
 *
 * Autoplay is script-owned on purpose. A `<video autoplay>` tag cannot be skipped
 * for `prefers-reduced-motion`, and when this bundle never runs the card keeps its
 * poster and its native controls stay usable instead of a card that blanks out.
 *
 * Lifecycle contract (booted through `resources/ts/runtime/blocks.ts`):
 *   * one boot per root, so a duplicated block never double-binds its listeners;
 *   * reduced motion stops every player and leaves the poster in place;
 *   * a hidden tab, and an open dialog, pause the ambient card videos;
 *   * removing the root pauses every player and removes every listener.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

/**
 * Wire the cards and their media dialogs.
 *
 * @param root Work block root.
 */
function init(root: HTMLElement): () => void {
  const cards = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-dialog]"),
  );
  const dialogs = Array.from(
    root.querySelectorAll<HTMLDialogElement>("dialog[id]"),
  );

  const videoIn = (element: Element | null): HTMLVideoElement | null =>
    element instanceof HTMLElement
      ? element.querySelector<HTMLVideoElement>("video")
      : null;

  const play = (video: HTMLVideoElement): void => {
    void video.play().catch(() => {
      // Refused (data saver, power saving): the poster stays up.
    });
  };

  /*
   * The ambient cards play only while nothing else is showing: an open dialog or
   * a hidden tab pauses them, and `prefers-reduced-motion` leaves the poster.
   */
  let openDialogs = 0;

  const canPlayAmbient = (): boolean =>
    0 === openDialogs && !reduced.matches && !document.hidden;

  const syncAmbient = (): void => {
    cards.forEach((card) => {
      const video = videoIn(card);

      if (!video) {
        return;
      }

      if (canPlayAmbient()) {
        play(video);
      } else {
        video.pause();
      }
    });
  };

  const onVisibility = (): void => syncAmbient();
  const onReducedMotion = (): void => syncAmbient();

  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", onReducedMotion);

  const listeners: Array<() => void> = [];

  dialogs.forEach((dialog) => {
    const opener = root.querySelector<HTMLButtonElement>(
      `[data-dialog="${CSS.escape(dialog.id)}"]`,
    );
    const player = videoIn(dialog);

    const close = (): void => {
      dialog.close();
      opener?.focus();
    };

    const onCloseButton = (): void => close();
    const onCancel = (event: Event): void => {
      event.preventDefault();
      close();
    };
    const onDialogClose = (): void => {
      openDialogs = Math.max(0, openDialogs - 1);
      player?.pause();
      syncAmbient();
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if ("Tab" !== event.key) {
        return;
      }

      // `video` is included because a `<video controls>` is a focus stop of its own.
      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>("button,input,[href],video"),
      ].filter((element) => !element.hasAttribute("disabled"));

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.querySelector(".close")?.addEventListener("click", onCloseButton);
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onDialogClose);
    dialog.addEventListener("keydown", onKeyDown);

    listeners.push(() => {
      dialog.querySelector(".close")?.removeEventListener("click", onCloseButton);
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onDialogClose);
      dialog.removeEventListener("keydown", onKeyDown);
    });
  });

  cards.forEach((card) => {
    const onOpen = (): void => {
      const id = card.dataset.dialog ?? "";
      const dialog = id ? root.querySelector<HTMLDialogElement>(`#${CSS.escape(id)}`) : null;

      if (!dialog) {
        return;
      }

      const cardVideo = videoIn(card);
      const dialogVideo = videoIn(dialog);

      openDialogs += 1;
      syncAmbient();

      if (cardVideo && dialogVideo) {
        // Continue from where the card was, so the dialog is not a restart.
        try {
          if (cardVideo.readyState >= 1) {
            dialogVideo.currentTime = cardVideo.currentTime;
          }
        } catch {
          // Not seekable yet; the dialog simply starts at the beginning.
        }
      }

      dialog.showModal();
      dialog.querySelector<HTMLButtonElement>(".close")?.focus();

      if (dialogVideo) {
        play(dialogVideo);
      }
    };

    card.addEventListener("click", onOpen);
    listeners.push(() => card.removeEventListener("click", onOpen));
  });

  syncAmbient();

  return () => {
    listeners.forEach((off) => off());
    document.removeEventListener("visibilitychange", onVisibility);
    reduced.removeEventListener("change", onReducedMotion);

    cards.forEach((card) => videoIn(card)?.pause());
    dialogs.forEach((dialog) => videoIn(dialog)?.pause());
  };
}

bootBlocks<HTMLElement>(".doclap-home-work", init);
