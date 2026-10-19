/**
 * Home — Hero view script.
 *
 * Owns the two slideshow views and the Three.js sculpture. This is the only
 * Doclap view bundle allowed to import `three`; the experiments canvas studies
 * live in `blocks/home-work/view.ts`.
 *
 * The sculpture eases towards a target orientation instead of being written to
 * directly: dragging, the passive pointer follow, the idle float and a view
 * change all set targets, and the frame loop lerps the group towards them. The
 * mesh keeps its own slow Y spin, so the sculpture is never snapped into place.
 *
 * View changes are handed to the shared motion runtime
 * (`window.doclapMotion.changeHero`) so the panel swap can be interrupted and
 * survives a mid-transition switch to reduced motion. Only the API *type* is
 * imported from `resources/ts/runtime/motion`: the runtime itself is bundled
 * once, into `assets/js/main.js`, and a value import would ship a second copy of
 * GSAP inside this bundle.
 *
 * Lifecycle contract (booted through `resources/ts/runtime/blocks.ts`):
 *   * one boot per root, so a duplicated block never double-binds its listeners;
 *   * exactly one scheduled animation frame for the sculpture;
 *   * the credited static poster stays visible when WebGL or the mesh fails, or
 *     when the visitor asks for reduced motion;
 *   * visibility, intersection and reduced-motion changes stop and restart the
 *     render loop without leaking it;
 *   * one resize observer on the canvas drives the drawing buffer and the camera
 *     aspect, and the frame loop never measures layout;
 *   * pointers always release their capture, including on `pointercancel` and on
 *     teardown;
 *   * removing the root disposes the renderer, geometry, material and listeners.
 */

import * as THREE from "three";

import { bootBlocks } from "../../resources/ts/runtime/blocks";
import { formatTemplate, readString } from "../../resources/ts/runtime/strings";
import type { DoclapMotionApi } from "../../resources/ts/runtime/motion";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const MESH_BYTES = 16248 * 3 * 4;

/**
 * Build and drive the WebGL sculpture viewer inside one hero root.
 *
 * @param root Hero block root.
 *
 * @return Teardown callback.
 */
function initSculpture(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>(".doclap-sculpture");
  const poster = root.querySelector<HTMLElement>(".doclap-sculpture-poster");
  // The block root *is* the `.gallery-hero` section: the former single landing
  // block nested it inside a wrapper, so resolve self-or-descendant.
  const hero = root.classList.contains("gallery-hero")
    ? root
    : root.querySelector<HTMLElement>(".gallery-hero");

  // Reduced motion keeps the credited poster: no renderer is ever built.
  if (!canvas || !hero || reduced.matches) {
    return () => {};
  }

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  // The group carries the eased rotations and the idle float; the mesh keeps its
  // own slow Y spin, so the two never fight over one transform.
  let group: THREE.Group;

  try {
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
    });

    if (!context) {
      return () => {};
    }

    renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: true,
    });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0, 0);

    scene = new THREE.Scene();
    group = new THREE.Group();
    scene.add(group);
    camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.05, 9.5);
    camera.lookAt(0, 0, 0);
    scene.add(
      new THREE.HemisphereLight(0xffffff, new THREE.Color(0.24, 0.26, 0.3), 2.2),
    );

    const lights: [[number, number, number], number, [number, number, number]][] = [
      [[1, 0.96, 0.9], 3.4, [-4, 6, 5]],
      [[0.8, 0.88, 1], 1.15, [4, 2, 1]],
      [[1, 0.43, 0.18], 2.5, [3, 2, -3]],
    ];

    lights.forEach(([color, intensity, position]) => {
      const light = new THREE.DirectionalLight(new THREE.Color(...color), intensity);
      light.position.set(...position);
      scene.add(light);
    });
  } catch {
    return () => {};
  }

  let mesh: THREE.Mesh | undefined;
  let geometry: THREE.BufferGeometry | undefined;
  let material: THREE.MeshStandardMaterial | undefined;
  let active = true;
  let paused = false;
  let running = false;
  let frame = 0;
  let drag = false;
  let disposed = false;
  // The pointer only ever writes targets; the frame loop eases towards them.
  let targetX = 0;
  let targetY = 0.22;
  let targetZ = 0;
  let activePointer: number | null = null;
  let observedWidth = 0;
  let observedHeight = 0;
  const controller = new AbortController();

  const allowed = (): boolean =>
    active && !paused && !document.hidden && !reduced.matches;

  const render = (time: number): void => {
    frame = 0;

    if (!running) {
      return;
    }

    if (!allowed() || !mesh) {
      running = false;
      return;
    }

    group.rotation.x += (targetX - group.rotation.x) * 0.045;
    group.rotation.y += (targetY - group.rotation.y) * 0.045;
    group.rotation.z += (targetZ - group.rotation.z) * 0.045;

    if (!paused && !drag && !reduced.matches) {
      // Idle float: the group breathes while the mesh keeps its own slow spin.
      group.position.y = Math.sin(time * 0.00065) * 0.045;
      mesh.rotation.y = 1.1 + Math.sin(time * 0.00022) * 0.09;
    } else {
      group.position.y = 0;
    }

    renderer.render(scene, camera);

    if (running) {
      frame = requestAnimationFrame(render);
    }
  };

  const start = (): void => {
    if (running || frame || !mesh || !allowed()) {
      return;
    }

    running = true;
    frame = requestAnimationFrame(render);
  };

  const stop = (): void => {
    running = false;

    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  // One resize observer owns the drawing buffer and the camera aspect, so the
  // frame loop never measures layout. Nothing is written while the box is
  // unchanged, which keeps observer echoes from looping.
  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    if (rect.width === observedWidth && rect.height === observedHeight) {
      return;
    }

    observedWidth = rect.width;
    observedHeight = rect.height;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  fetch(hero.dataset.doclapMesh || "", { signal: controller.signal })
    .then((response) => {
      if (!response.ok) {
        throw new Error("mesh request failed");
      }

      return response.arrayBuffer();
    })
    .then((buffer) => {
      if (buffer.byteLength !== MESH_BYTES) {
        throw new Error("unexpected mesh size");
      }

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(buffer), 3),
      );
      geometry.center();
      geometry.computeVertexNormals();
      const size = new THREE.Box3()
        .setFromBufferAttribute(
          geometry.getAttribute("position") as THREE.BufferAttribute,
        )
        .getSize(new THREE.Vector3());
      geometry.scale(4.5 / size.y, 4.5 / size.y, 4.5 / size.y);
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.84, 0.85, 0.86),
        metalness: 0.06,
        roughness: 0.73,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.y = 1.1;
      group.add(mesh);
      poster?.setAttribute("hidden", "");
      start();
    })
    .catch(() => {
      // The credited poster stays visible; release the unused context.
      if (!disposed) {
        renderer.dispose();
        disposed = true;
      }
    });

  const observer = new IntersectionObserver(
    ([entry]) => {
      active = entry.isIntersecting;

      if (active) {
        start();
      } else {
        stop();
      }
    },
    { threshold: 0.01 },
  );
  observer.observe(hero);

  const onPointerDown = (event: PointerEvent): void => {
    drag = true;
    activePointer = event.pointerId;

    if (typeof canvas.setPointerCapture === "function") {
      canvas.setPointerCapture(event.pointerId);
    }
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (drag) {
      targetY += event.movementX * 0.008;
      targetX += event.movementY * 0.008;

      return;
    }

    // Passive follow: the sculpture leans towards the pointer.
    if (reduced.matches || paused) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    targetY = ((event.clientX - rect.left) / rect.width) * 0.32 + 0.06;
    targetX = ((event.clientY - rect.top) / rect.height) * 0.12 - 0.06;
  };

  const endDrag = (event: PointerEvent): void => {
    drag = false;
    activePointer = null;

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    // Keys only move the target: the sculpture is never snapped by hand.
    if (event.key === "Home") {
      targetX = 0;
      targetY = 0.22;
    } else if (event.key === "ArrowLeft") {
      targetY -= 0.18;
    } else if (event.key === "ArrowRight") {
      targetY += 0.18;
    } else if (event.key === "ArrowUp") {
      targetX -= 0.18;
    } else if (event.key === "ArrowDown") {
      targetX += 0.18;
    } else {
      return;
    }

    event.preventDefault();
  };

  const onMotionToggle = (event: Event): void => {
    paused = !paused;
    const button = event.currentTarget as HTMLButtonElement;
    button.setAttribute("aria-pressed", String(paused));
    const label = readString(button, paused ? "resume-label" : "pause-label");

    if (label) {
      button.setAttribute("aria-label", label);
    }

    if (paused) {
      stop();
    } else {
      start();
    }
  };

  const onView = (event: Event): void => {
    const index = (event as CustomEvent<number>).detail ? 1 : 0;

    // A view change re-aims the sculpture; the easing does the rest.
    targetY = index ? -0.55 : 0.22;
    targetX = index ? 0.05 : 0;
    targetZ = index ? -0.08 : 0;
  };

  const onVisibility = (): void => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  };

  const onReducedMotion = (): void => {
    if (reduced.matches) {
      stop();
    } else {
      start();
    }
  };

  const motionToggle = root.querySelector<HTMLButtonElement>(".motion-toggle");

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("keydown", onKeyDown);
  motionToggle?.addEventListener("click", onMotionToggle);
  root.addEventListener("doclap:view", onView);
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", onReducedMotion);

  return () => {
    stop();
    observer.disconnect();
    resizeObserver.disconnect();
    controller.abort();
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", endDrag);
    canvas.removeEventListener("pointercancel", endDrag);
    canvas.removeEventListener("keydown", onKeyDown);
    motionToggle?.removeEventListener("click", onMotionToggle);
    root.removeEventListener("doclap:view", onView);
    document.removeEventListener("visibilitychange", onVisibility);
    reduced.removeEventListener("change", onReducedMotion);

    if (activePointer !== null && canvas.hasPointerCapture(activePointer)) {
      canvas.releasePointerCapture(activePointer);
    }

    if (mesh) {
      group.remove(mesh);
    }

    scene.remove(group);
    geometry?.dispose();
    material?.dispose();

    if (!disposed) {
      renderer.dispose();
      disposed = true;
    }
  };
}

/**
 * Wire the slideshow views and the sculpture viewer of one hero root.
 *
 * View changes are delegated to `window.doclapMotion.changeHero()` so the swap
 * animates and stays interruptible; the synchronous path remains the fallback
 * for reduced motion and for pages without the runtime.
 *
 * @param root Hero block root.
 */
function init(root: HTMLElement): () => void {
  const panels = [...root.querySelectorAll<HTMLElement>(".gallery-panel")];
  const tabs = [...root.querySelectorAll<HTMLButtonElement>(".slide-tab")];
  const status = root.querySelector<HTMLElement>(".hero-status");
  const viewTemplate = readString(status, "view-template");
  const prev = root.querySelector<HTMLButtonElement>(".hero-prev");
  const next = root.querySelector<HTMLButtonElement>(".hero-next");
  const listeners: Array<() => void> = [];
  const hero = root.classList.contains("gallery-hero")
    ? root
    : root.querySelector<HTMLElement>(".gallery-hero") ?? root;
  let current = Math.max(
    0,
    panels.findIndex((panel) => !panel.hidden),
  );
  let busy = false;

  // Boot state: the view marker is set once and the polite live region is never
  // empty on load, so it announces the rendered view instead of nothing.
  hero.dataset.current = String(current);

  if (panels.length && status && viewTemplate) {
    status.textContent = formatTemplate(viewTemplate, current + 1, panels.length);
  }

  const apply = (index: number): void => {
    current = index;
    // The stylesheet keys the hero's resting poses on this marker, so the CSS
    // owns them instead of a pinned inline transform.
    hero.dataset.current = String(index);
    panels.forEach((panel, position) => {
      panel.hidden = position !== index;
      (panel as HTMLElement & { inert: boolean }).inert = position !== index;
    });
    tabs.forEach((tab, position) => {
      tab.classList.toggle("is-active", position === index);
      tab.setAttribute("aria-pressed", String(position === index));
    });

    if (status && viewTemplate) {
      status.textContent = formatTemplate(viewTemplate, index + 1, panels.length);
    }

    root.dispatchEvent(new CustomEvent<number>("doclap:view", { detail: index }));
  };

  /**
   * Show another view.
   *
   * The shared motion runtime owns the swap and the busy lock while it animates;
   * when it declines (reduced motion, or a page without the runtime) the swap
   * happens here synchronously. A request arriving while busy is ignored, and
   * the runtime calls `apply()` and `finish()` exactly once either way.
   *
   * @param index Index of the view to show.
   */
  const show = (index: number): void => {
    if (!panels.length || busy) {
      return;
    }

    const target = (index + panels.length) % panels.length;

    if (target === current) {
      return;
    }

    const finish = (): void => {
      busy = false;
    };

    // Read at call time: the runtime boots with `assets/js/main.js`, which may
    // be enqueued after this block bundle.
    const api: DoclapMotionApi | undefined = window.doclapMotion;

    busy = true;

    const accepted = api?.changeHero({
      root: hero,
      from: panels[current],
      to: panels[target],
      index: target,
      apply: () => apply(target),
      finish,
    });

    if (!accepted) {
      apply(target);
      finish();
    }
  };

  tabs.forEach((tab, index) => {
    const onSelect = (): void => show(index);
    tab.addEventListener("click", onSelect);
    listeners.push(() => tab.removeEventListener("click", onSelect));
  });

  const onPrev = (): void => show(current - 1);
  const onNext = (): void => show(current + 1);

  prev?.addEventListener("click", onPrev);
  next?.addEventListener("click", onNext);

  /**
   * Arrow keys on the hero change the view, except while the sculpture canvas
   * or a link has focus: both own their own arrow keys.
   *
   * @param event Keydown event.
   */
  const onHeroKeyDown = (event: KeyboardEvent): void => {
    const target = event.target;

    if (
      target instanceof Element &&
      (target.classList.contains("doclap-sculpture") || target.closest("a"))
    ) {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      onNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      onPrev();
    }
  };

  hero.addEventListener("keydown", onHeroKeyDown);
  listeners.push(() => hero.removeEventListener("keydown", onHeroKeyDown));

  const destroySculpture = initSculpture(root);

  return () => {
    listeners.forEach((remove) => remove());
    prev?.removeEventListener("click", onPrev);
    next?.removeEventListener("click", onNext);
    destroySculpture();
  };
}

bootBlocks<HTMLElement>(".doclap-home-hero", init);
