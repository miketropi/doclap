/**
 * Doclap front-end entry.
 *
 * Shared, cross-surface behaviour only: the global motion runtime (section
 * entrances, soft text, the hero choreography and the magnetic controls, all
 * owned by `runtime/motion.ts`), the reading-progress bar and the smooth-scroll
 * controls. Everything surface-specific (navigation panels, canvas studies, the
 * sculpture viewer, filtering) lives in the owning block's view script.
 *
 * Accessibility contract: markup is never hidden by CSS waiting for JavaScript.
 * Entrances are additive and the motion runtime is a complete static mode under
 * reduced motion, so content stays visible when GSAP is missing, when the
 * visitor asks for reduced motion, or when this script fails to load.
 */

import { bootMotion } from './runtime/motion';

const prefersReducedMotion = (): boolean =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Animate the shared reading-progress bar.
 */
function initReadingProgress(): void {
	const bars = document.querySelectorAll<HTMLElement>('[data-doclap-progress]');

	if (bars.length === 0) {
		return;
	}

	let ticking = false;

	const paint = (): void => {
		const max = document.documentElement.scrollHeight - window.innerHeight;
		const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;

		bars.forEach((bar) => {
			bar.style.transform = `scaleX(${progress})`;
		});

		ticking = false;
	};

	window.addEventListener(
		'scroll',
		() => {
			if (ticking) {
				return;
			}
			ticking = true;
			window.requestAnimationFrame(paint);
		},
		{ passive: true },
	);

	window.addEventListener('resize', paint, { passive: true });
	paint();
}

/**
 * Wire buttons and links that scroll the page without relying on CSS
 * `scroll-behavior`, so reduced-motion preferences are honoured per interaction.
 */
function initScrollControls(): void {
	document.querySelectorAll<HTMLElement>('[data-doclap-back-to-top]').forEach((control) => {
		control.addEventListener('click', (event) => {
			event.preventDefault();
			window.scrollTo({
				top: 0,
				behavior: prefersReducedMotion() ? 'auto' : 'smooth',
			});
		});
	});

	document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
		const id = link.getAttribute('href');
		if (!id || id === '#') {
			return;
		}

		const target = document.querySelector(id);
		if (!target) {
			return;
		}

		link.addEventListener('click', (event) => {
			event.preventDefault();
			target.scrollIntoView({
				behavior: prefersReducedMotion() ? 'auto' : 'smooth',
				block: 'start',
			});
		});
	});
}

/**
 * Boot the shared front-end behaviour.
 */
function boot(): void {
	bootMotion();
	initReadingProgress();
	initScrollControls();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
	boot();
}

export {};
