/**
 * Home — Work view script.
 *
 * Owns the two Canvas 2D experiment studies: the card previews, the modal
 * dialogs, tempo, pause/resume, the focus trap and opener focus restoration.
 * This bundle must never import `three` — the sculpture belongs to
 * `blocks/home-hero/view.ts`.
 *
 * Lifecycle contract (booted through `resources/ts/runtime/blocks.ts`):
 *   * one boot per root, so a duplicated block never double-binds its listeners;
 *   * exactly one scheduled animation frame per canvas;
 *   * a canvas inside a closed dialog is inactive and consumes no frames;
 *   * visibility and reduced-motion changes stop and restart every loop;
 *   * removing the root disconnects its observers and listeners.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";
import { readString } from "../../resources/ts/runtime/strings";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

interface Loop {
  canvas: HTMLCanvasElement;
  kind: string;
  active: boolean;
  paused: boolean;
  tempo: number;
  frame: number;
  running: boolean;
}

interface LoopControl {
  loop: Loop;
  start: () => void;
  stop: () => void;
  setActive: (value: boolean) => void;
  destroy: () => void;
}

/**
 * Paint one frame of an experiment study.
 *
 * @param context 2D context of the target canvas.
 * @param loop    Loop state, for size, tempo and kind.
 * @param time    High resolution timestamp from requestAnimationFrame.
 */
function paint(context: CanvasRenderingContext2D, loop: Loop, time: number): void {
  const rect = loop.canvas.getBoundingClientRect();
  const density = Math.min(devicePixelRatio, 2);
  const width = Math.max(1, Math.round(rect.width * density));
  const height = Math.max(1, Math.round(rect.height * density));

  if (loop.canvas.width !== width || loop.canvas.height !== height) {
    loop.canvas.width = width;
    loop.canvas.height = height;
  }

  context.clearRect(0, 0, width, height);

  const seconds = time * 0.001 * loop.tempo;

  if ("orbit" === loop.kind) {
    context.fillStyle = "#17191d";
    context.fillRect(0, 0, width, height);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${Math.max(18, width / 15)}px serif`;

    for (let index = 0; index < 8; index++) {
      const angle = seconds * (0.18 + index * 0.025) + (index * Math.PI) / 4;
      const radius = Math.min(width, height) * (0.16 + index * 0.025);
      context.save();
      context.translate(
        width / 2 + Math.cos(angle) * radius,
        height / 2 + Math.sin(angle) * radius,
      );
      context.rotate(angle + Math.PI / 2);
      context.fillStyle = `rgba(242,238,227,${0.25 + index * 0.08})`;
      context.fillText("TYPE · ORBIT", 0, 0);
      context.restore();
    }

    return;
  }

  context.fillStyle = "#ecebe6";
  context.fillRect(0, 0, width, height);
  context.lineWidth = Math.max(1, density);

  for (let row = 0; row < 22; row++) {
    context.beginPath();

    for (let x = 0; x <= width; x += 8 * density) {
      const y =
        (height * (row + 1)) / 23 +
        Math.sin((x / width) * 10 + seconds * 1.4 + row * 0.42) * height * 0.025 +
        Math.cos((x / width) * 4 - seconds + row) * height * 0.012;

      if (0 === x) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.strokeStyle = `rgba(20,22,25,${0.25 + row * 0.025})`;
    context.stroke();
  }
}

/**
 * Build the animation loop for one experiment canvas.
 *
 * @param canvas Target canvas.
 * @param kind   Study kind, `flow` or `orbit`.
 *
 * @return Loop controller.
 */
function createLoop(canvas: HTMLCanvasElement, kind: string): LoopControl {
  const context = canvas.getContext("2d");
  const loop: Loop = {
    canvas,
    kind,
    active: false,
    paused: false,
    tempo: 1,
    frame: 0,
    running: false,
  };

  const allowed = (): boolean =>
    loop.active && !loop.paused && !document.hidden && !reduced.matches;

  const draw = (time: number): void => {
    loop.frame = 0;

    if (!loop.running) {
      return;
    }

    if (!context || !allowed()) {
      loop.running = false;
      return;
    }

    paint(context, loop, time);

    if (loop.running) {
      loop.frame = requestAnimationFrame(draw);
    }
  };

  const start = (): void => {
    if (loop.running || loop.frame || !allowed()) {
      return;
    }

    loop.running = true;
    loop.frame = requestAnimationFrame(draw);
  };

  const stop = (): void => {
    loop.running = false;

    if (loop.frame) {
      cancelAnimationFrame(loop.frame);
      loop.frame = 0;
    }
  };

  const setActive = (value: boolean): void => {
    loop.active = value;

    if (value) {
      start();
    } else {
      stop();
    }
  };

  const observer = new IntersectionObserver(
    ([entry]) => setActive(entry.isIntersecting),
    { threshold: 0.01 },
  );
  observer.observe(canvas);

  return {
    loop,
    start,
    stop,
    setActive,
    destroy: () => {
      stop();
      observer.disconnect();
    },
  };
}

/**
 * Wire the cards, dialogs and canvas studies of one work root.
 *
 * @param root Work block root.
 */
function init(root: HTMLElement): () => void {
  const loops = new Map<HTMLCanvasElement, LoopControl>();

  root.querySelectorAll<HTMLCanvasElement>("[data-canvas]").forEach((canvas) => {
    loops.set(canvas, createLoop(canvas, canvas.dataset.canvas || "flow"));
  });

  const onVisibility = (): void => {
    loops.forEach((control) => {
      if (document.hidden) {
        control.stop();
      } else {
        control.start();
      }
    });
  };

  const onReducedMotion = (): void => {
    loops.forEach((control) => {
      if (reduced.matches) {
        control.stop();
      } else {
        control.start();
      }
    });
  };

  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", onReducedMotion);

  const openers: Array<() => void> = [];

  root.querySelectorAll<HTMLButtonElement>(".work-card").forEach((card) => {
    const open = (): void => {
      const dialog = root.querySelector<HTMLDialogElement>(`#${card.dataset.dialog}`);

      if (!dialog) {
        return;
      }

      dialog.showModal();
      const canvas = dialog.querySelector<HTMLCanvasElement>("[data-canvas]");
      canvas && loops.get(canvas)?.setActive(true);
      dialog.querySelector<HTMLButtonElement>(".close")?.focus();
    };

    card.addEventListener("click", open);
    openers.push(() => card.removeEventListener("click", open));
  });

  const dialogs: Array<() => void> = [];

  root.querySelectorAll<HTMLDialogElement>(".experiment-dialog").forEach((dialog) => {
    const canvas = dialog.querySelector<HTMLCanvasElement>("[data-canvas]");
    const control = canvas ? loops.get(canvas) : undefined;
    const tempo = dialog.querySelector<HTMLInputElement>(".tempo");
    const output = dialog.querySelector<HTMLOutputElement>(".tempo-value");
    const pause = dialog.querySelector<HTMLButtonElement>(".experiment-pause");

    const close = (): void => {
      const opener = root.querySelector<HTMLButtonElement>(
        `[data-dialog="${dialog.id}"]`,
      );
      dialog.close();
      opener?.focus();
    };

    const onClose = (): void => close();
    const onCancel = (event: Event): void => {
      event.preventDefault();
      close();
    };
    const onDialogClose = (): void => control?.setActive(false);

    const onTempo = (): void => {
      if (!tempo) {
        return;
      }

      if (control) {
        control.loop.tempo = Number(tempo.value);
      }

      if (output) {
        output.value = `${Number(tempo.value).toFixed(1)}×`;
      }
    };

    const onPause = (): void => {
      if (!control) {
        return;
      }

      control.loop.paused = !control.loop.paused;

      if (pause) {
        pause.setAttribute("aria-pressed", String(control.loop.paused));
        const label = readString(
          pause,
          control.loop.paused ? "resume-label" : "pause-label",
        );

        if (label) {
          pause.textContent = label;
        }
      }

      if (control.loop.paused) {
        control.stop();
      } else {
        control.start();
      }
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if ("Tab" !== event.key) {
        return;
      }

      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>("button,input,[href]"),
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

    dialog.querySelector(".close")?.addEventListener("click", onClose);
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onDialogClose);
    tempo?.addEventListener("input", onTempo);
    pause?.addEventListener("click", onPause);
    dialog.addEventListener("keydown", onKeyDown);

    dialogs.push(() => {
      dialog.querySelector(".close")?.removeEventListener("click", onClose);
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onDialogClose);
      tempo?.removeEventListener("input", onTempo);
      pause?.removeEventListener("click", onPause);
      dialog.removeEventListener("keydown", onKeyDown);
    });
  });

  return () => {
    loops.forEach((control) => control.destroy());
    loops.clear();
    openers.forEach((off) => off());
    dialogs.forEach((off) => off());
    document.removeEventListener("visibilitychange", onVisibility);
    reduced.removeEventListener("change", onReducedMotion);
  };
}

bootBlocks<HTMLElement>(".doclap-home-work", init);
