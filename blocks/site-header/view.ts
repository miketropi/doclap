/**
 * doclap/site-header front-end behaviour.
 *
 * Disclosure panels, the compact menu control, focus return, focus containment
 * while the compact panel is open, and body-scroll restoration. All controls are
 * real buttons, so the header stays operable when this script never runs.
 */

const MOBILE_QUERY = '(max-width: 920px)';

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableWithin(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
		(element) => element.offsetParent !== null || element === document.activeElement,
	);
}

function initHeader(root: HTMLElement): void {
	const disclosures = Array.from(root.querySelectorAll<HTMLButtonElement>('.nav-disclosure'));
	const menuToggle = root.querySelector<HTMLButtonElement>('[data-doclap-menu]');
	const nav = root.querySelector<HTMLElement>('#navigation-links');
	const mobileQuery = window.matchMedia(MOBILE_QUERY);

	if (disclosures.length === 0 && !menuToggle) {
		return;
	}

	const panelOf = (trigger: HTMLButtonElement): HTMLElement | null => {
		const id = trigger.getAttribute('aria-controls');
		return id ? root.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null;
	};

	const closePanel = (trigger: HTMLButtonElement): void => {
		const panel = panelOf(trigger);
		trigger.setAttribute('aria-expanded', 'false');
		if (panel) {
			panel.hidden = true;
		}
	};

	const closePanels = (except?: HTMLButtonElement): void => {
		disclosures.forEach((trigger) => {
			if (trigger !== except) {
				closePanel(trigger);
			}
		});
	};

	const openPanel = (trigger: HTMLButtonElement): void => {
		const panel = panelOf(trigger);
		closePanels(trigger);
		trigger.setAttribute('aria-expanded', 'true');
		if (panel) {
			panel.hidden = false;
		}
	};

	const isMenuOpen = (): boolean => menuToggle?.getAttribute('aria-expanded') === 'true';

	let restoreOverflow = '';

	const setMenu = (open: boolean): void => {
		if (!menuToggle || !nav) {
			return;
		}

		closePanels();
		menuToggle.setAttribute('aria-expanded', String(open));

		const label = menuToggle.querySelector<HTMLElement>('.menu-toggle-label');
		if (label) {
			label.textContent = (
				open ? menuToggle.dataset.closeLabel : menuToggle.dataset.openLabel
			) ?? label.textContent;
		}

		nav.classList.toggle('open', open);

		if (open) {
			restoreOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = restoreOverflow;
		}
	};

	disclosures.forEach((trigger) => {
		trigger.addEventListener('click', () => {
			if (trigger.getAttribute('aria-expanded') === 'true') {
				closePanel(trigger);
				return;
			}
			openPanel(trigger);
		});

		trigger.addEventListener('keydown', (event) => {
			if (event.key !== 'ArrowDown') {
				return;
			}
			event.preventDefault();
			openPanel(trigger);
			const panel = panelOf(trigger);
			const first = panel ? focusableWithin(panel)[0] : null;
			first?.focus();
		});

		const group = trigger.parentElement;
		group?.addEventListener('focusout', () => {
			window.setTimeout(() => {
				if (group.contains(document.activeElement)) {
					return;
				}
				closePanel(trigger);
			}, 0);
		});
	});

	root.querySelectorAll<HTMLButtonElement>('.mega-close').forEach((close) => {
		close.addEventListener('click', () => {
			const trigger = close.closest('.nav-group')?.querySelector<HTMLButtonElement>('.nav-disclosure');
			closePanels();
			trigger?.focus();
		});
	});

	menuToggle?.addEventListener('click', () => setMenu(!isMenuOpen()));

	nav?.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', () => setMenu(false));
	});

	document.addEventListener('click', (event) => {
		const target = event.target as Node;

		if (!root.contains(target)) {
			closePanels();
			setMenu(false);
			return;
		}

		if (!(target instanceof Element) || !target.closest('.nav-group')) {
			closePanels();
		}
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			const open = disclosures.find((trigger) => trigger.getAttribute('aria-expanded') === 'true');

			if (open) {
				event.preventDefault();
				closePanel(open);
				open.focus();
				return;
			}

			if (isMenuOpen()) {
				event.preventDefault();
				setMenu(false);
				menuToggle?.focus();
			}
			return;
		}

		// Keep focus inside the compact panel while it covers the page.
		if (event.key === 'Tab' && isMenuOpen() && nav && menuToggle) {
			const candidates = [menuToggle, ...focusableWithin(nav)];
			const first = candidates[0];
			const last = candidates[candidates.length - 1];
			const active = document.activeElement as HTMLElement | null;

			if (event.shiftKey && (active === first || !candidates.includes(active as HTMLElement))) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && active === last) {
				event.preventDefault();
				first.focus();
			}
		}
	});

	mobileQuery.addEventListener('change', () => setMenu(false));
}

function boot(): void {
	document.querySelectorAll<HTMLElement>('.doclap-site-header').forEach((wrapper) => {
		initHeader(wrapper);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
	boot();
}

export {};
