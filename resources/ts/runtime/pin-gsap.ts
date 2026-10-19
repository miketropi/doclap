/**
 * Bind the ScrollTrigger we bundle to the GSAP core we bundle.
 *
 * `gsap/ScrollTrigger` decides which core it belongs to the moment its own
 * module body is evaluated: `_getGSAP()` returns its still-unset module-level
 * `gsap` variable and otherwise falls back to `window.gsap`, and
 * `ScrollTrigger.register()` latches `_coreInitted` on the first caller. The
 * Nextora parent theme evaluates first and publishes its own GSAP instance as
 * `window.gsap`, so importing `gsap/ScrollTrigger` directly would bind our copy
 * to the parent core. Three things would then be wrong: our ScrollTrigger class
 * would replace the parent's inside the parent plugin registry, so a parent
 * tween written with the `scrollTrigger:` property would be built by our class;
 * our plugin registration would be a no-op latch on a foreign core; and any
 * teardown sweep over `ScrollTrigger.getAll()` would kill the parent theme's
 * scroll animations, because they would be the only ones on that instance.
 *
 * Importing this module *before* `gsap/ScrollTrigger` fixes the binding: module
 * evaluation is depth-first in import order, so this body runs while
 * ScrollTrigger is still unevaluated, lends our core to `window.gsap`, and
 * `_getGSAP()` then picks it up. The previous value is handed back in a
 * `queueMicrotask`, which drains in the same task — before timers, events and
 * paint — so no other script can observe the borrowed global. When the parent
 * theme has not published anything yet, the property is deleted again instead
 * of being left behind as `undefined`.
 *
 * Nothing here reads `window.gsap` to reach a GSAP API: the bundle always
 * imports `gsap` from the package. This is only a handshake with ScrollTrigger's
 * import-time latch.
 */

import gsap from "gsap";

/**
 * `window` with the global the parent theme owns, typed locally so this module
 * never claims `Window.gsap` for the rest of the bundle.
 */
const host = window as unknown as { gsap?: unknown };

const previous = host.gsap;

host.gsap = gsap;

queueMicrotask( () => {
	if ( undefined === previous ) {
		delete host.gsap;

		return;
	}

	host.gsap = previous;
} );
