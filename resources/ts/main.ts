/**
 * Doclap front-end entry.
 *
 * Shared, cross-surface behaviour only: scroll reveals built on the GSAP instance
 * the parent theme already exposes, smooth scrolling, and the reading-progress
 * bar. Everything surface-specific (navigation panels, canvas studies, the
 * sculpture viewer, filtering) lives in the owning block's view script.
 *
 * Accessibility contract: markup is never hidden by CSS waiting for JavaScript.
 * Reveals are additive, so content stays visible when GSAP is missing, when the
 * visitor asks for reduced motion, or when this script fails to load.
 */

interface DoclapGsap {
	fromTo: (
		targets: Element[],
		from: Record<string, unknown>,
		to: Record<string, unknown>,
	) => { kill: () => void };
}

interface DoclapScrollTrigger {
	create: (vars: Record<string, unknown>) => { kill: () => void };
	refresh: () => void;
}

interface DoclapMotionApi {
	init: () => void;
	refresh: () => void;
	destroy: () => void;
}

declare global {
	interface Window {
		gsap?: DoclapGsap;
		ScrollTrigger?: DoclapScrollTrigger;
		doclapMotion?: DoclapMotionApi;
	}
}

const REVEAL_SELECTOR = '[data-doclap-reveal]';
const REVEALED_ATTR = 'data-doclap-revealed';

const prefersReducedMotion = (): boolean =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let triggers: { kill: () => void }[] = [];

/**
 * Run the reveal animation for a single element.
 */
function reveal(
	element: Element,
	gsap: DoclapGsap,
	scrollTrigger: DoclapScrollTrigger | undefined,
): { kill: () => void } | null {
	const motion = Number(element.getAttribute('data-doclap-reveal-distance') ?? 24);
	const duration = Number(element.getAttribute('data-doclap-reveal-duration') ?? 0.85);

	const from = { opacity: 0, y: motion, filter: 'blur(4px)' };
	const to = {
		opacity: 1,
		y: 0,
		filter: 'blur(0px)',
		duration,
		ease: 'power3.out',
		clearProps: 'filter,transform',
	};

	if (!scrollTrigger) {
		return gsap.fromTo([element], from, to) as { kill: () => void };
	}

	return scrollTrigger.create({
		trigger: element,
		start: 'top 88%',
		once: true,
		onEnter: () => {
			gsap.fromTo([element], from, to);
		},
	}) as { kill: () => void };
}

/**
 * Initialise every not-yet-revealed element inside `root`.
 */
function initReveals(root: ParentNode = document): void {
	const gsap = window.gsap;
	const scene = prefersReducedMotion();

	if (!gsap) {
		// Nothing to animate with — leave the content exactly as rendered.
		return;
	}

	const scrollTrigger = window.ScrollTrigger;
	if (scene) {
		// Content is already visible; just mark it so nothing re-runs later.
		root.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
			element.setAttribute(REVEALED_ATTR, 'true');
		});
		return;
	}

	root.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
		if (element.getAttribute(REVEALED_ATTR) === 'true') {
			return;
		}

		const controller = reveal(element, gsap, scrollTrigger);
		if (controller) {
			triggers.push(controller);
		}
		element.setAttribute(REVEALED_ATTR, 'true');
	});
}

/**
 * Tear down every ScrollTrigger this module created.
 */
function destroyReveals(): void {
	triggers.forEach((trigger) => trigger.kill());
	triggers = [];
}

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

	// A preference change mid-session must not leave queued animations running.
	window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
		destroyReveals();
		initReveals();
	});
}

function boot(): void {
	initReveals();
	initReadingProgress();
	initScrollControls();

	if (window.ScrollTrigger) {
		window.ScrollTrigger.refresh();
	}
}

window.doclapMotion = {
	init: (): void => {
		initReveals();
		if (window.ScrollTrigger) {
			window.ScrollTrigger.refresh();
		}
	},
	refresh: (): void => {
		if (window.ScrollTrigger) {
			window.ScrollTrigger.refresh();
		}
	},
	destroy: destroyReveals,
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
	boot();
}

export {};
