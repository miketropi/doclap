/**
 * Home — Hero view script.
 *
 * Owns the two slideshow views and the Three.js sculpture. This is the only
 * Doclap view bundle allowed to import `three`; the experiments canvas studies
 * live in `blocks/home-work/view.ts`.
 *
 * Lifecycle contract:
 *   * one boot per root (`data-initialized`), so a duplicated block never
 *     double-binds its listeners;
 *   * exactly one scheduled animation frame for the sculpture;
 *   * the credited static poster stays visible when WebGL or the mesh fails, or
 *     when the visitor asks for reduced motion;
 *   * visibility, intersection and reduced-motion changes stop and restart the
 *     render loop without leaking it;
 *   * pointers always release their capture, including on `pointercancel`;
 *   * removing the root disposes the renderer, geometry, material and listeners.
 */

import * as THREE from "three";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const MESH_BYTES = 16248 * 3 * 4;

const teardown = new Map<HTMLElement, () => void>();
let removalObserver: MutationObserver | undefined;

/**
 * Watch for roots that leave the document and release what they hold.
 */
function watchRemoval(): void {
  if (removalObserver) {
    return;
  }

  removalObserver = new MutationObserver(() => {
    teardown.forEach((destroy, root) => {
      if (!root.isConnected) {
        destroy();
        teardown.delete(root);
      }
    });
  });
  removalObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

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
  let pointerX = 0;
  let pointerY = 0;
  let disposed = false;
  const controller = new AbortController();

  const allowed = (): boolean =>
    active && !paused && !document.hidden && !reduced.matches;

  const reset = (index = 0): void => {
    if (mesh) {
      mesh.rotation.set(index ? 0.12 : 0, index ? -0.72 : 1.1, 0);
    }
  };

  const render = (): void => {
    frame = 0;

    if (!running) {
      return;
    }

    if (!allowed() || !mesh) {
      running = false;
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const density = Math.min(devicePixelRatio, 2);
    renderer.setSize(rect.width, rect.height, false);
    renderer.setPixelRatio(density);
    camera.aspect = rect.width / Math.max(1, rect.height);
    camera.updateProjectionMatrix();
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
      scene.add(mesh);
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
    pointerX = event.clientX;
    pointerY = event.clientY;

    if (typeof canvas.setPointerCapture === "function") {
      canvas.setPointerCapture(event.pointerId);
    }
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!drag || !mesh) {
      return;
    }

    mesh.rotation.y += (event.clientX - pointerX) * 0.008;
    mesh.rotation.x = Math.max(
      -0.55,
      Math.min(0.55, mesh.rotation.x + (event.clientY - pointerY) * 0.006),
    );
    pointerX = event.clientX;
    pointerY = event.clientY;
  };

  const endDrag = (event: PointerEvent): void => {
    drag = false;

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!mesh) {
      return;
    }

    if (event.key === "Home") {
      reset();
    } else if (event.key === "ArrowLeft") {
      mesh.rotation.y -= 0.15;
    } else if (event.key === "ArrowRight") {
      mesh.rotation.y += 0.15;
    } else {
      return;
    }

    event.preventDefault();
  };

  const onMotionToggle = (event: Event): void => {
    paused = !paused;
    const button = event.currentTarget as HTMLButtonElement;
    button.setAttribute("aria-pressed", String(paused));
    button.setAttribute("aria-label", paused ? "Resume motion" : "Pause motion");

    if (paused) {
      stop();
    } else {
      start();
    }
  };

  const onView = (event: Event): void => {
    reset((event as CustomEvent<number>).detail);
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

    if (mesh) {
      scene.remove(mesh);
    }

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
 * @param root Hero block root.
 */
function init(root: HTMLElement): void {
  if ("1" === root.dataset.initialized) {
    return;
  }

  root.dataset.initialized = "1";

  const panels = [...root.querySelectorAll<HTMLElement>(".gallery-panel")];
  const tabs = [...root.querySelectorAll<HTMLButtonElement>(".slide-tab")];
  const status = root.querySelector<HTMLElement>(".hero-status");
  let current = 0;

  const show = (index: number): void => {
    if (!panels.length) {
      return;
    }

    current = (index + panels.length) % panels.length;
    panels.forEach((panel, position) => {
      panel.hidden = position !== current;
      (panel as HTMLElement & { inert: boolean }).inert = position !== current;
    });
    tabs.forEach((tab, position) => {
      tab.classList.toggle("is-active", position === current);
      tab.setAttribute("aria-pressed", String(position === current));
    });

    if (status) {
      status.textContent = `View ${current + 1} of ${panels.length}`;
    }

    root.dispatchEvent(new CustomEvent<number>("doclap:view", { detail: current }));
  };

  tabs.forEach((tab, index) => tab.addEventListener("click", () => show(index)));
  root
    .querySelector(".hero-prev")
    ?.addEventListener("click", () => show(current - 1));
  root
    .querySelector(".hero-next")
    ?.addEventListener("click", () => show(current + 1));

  const destroySculpture = initSculpture(root);

  teardown.set(root, () => {
    destroySculpture();
  });
  watchRemoval();
}

/**
 * Boot every hero root in the document.
 */
function boot(): void {
  document.querySelectorAll<HTMLElement>(".doclap-home-hero").forEach(init);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
