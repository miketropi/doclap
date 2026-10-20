/**
 * doclap/site-header front-end behaviour.
 *
 * Submenus open on hover and focus through CSS alone; this script only owns the
 * touch/keyboard path (`aria-expanded` on `.doclap-submenu-toggle`), the compact
 * menu shell, focus return, focus containment while that shell covers the page,
 * and the page-scroll lock. A pointer device therefore keeps working when this
 * script never runs.
 *
 * The shell and the one it hands over to — Visual Mega Navigation — share one
 * breakpoint: `data-beplus-vmn-compact-mode="accordion"` on the nav asks the
 * plugin to keep its mega panels inline inside this drawer below 1024px, so there
 * is exactly one compact surface at every width. Mega panel state
 * (`.has-mega-menu`, `.beplus-vmn-toggle`, `.beplus-vmn-mega-panel`, `.is-open`,
 * `.beplus-vmn--open`, panel ARIA) is never touched here: the only bridge is
 * closing an expanded plugin toggle when the compact menu closes, which is
 * delegated to the plugin by re-dispatching its own click.
 *
 * Page scroll is locked with a body class rather than an inline style: the plugin
 * assigns `document.body.style.overflow` when it opens its own off-canvas drawer,
 * so a class is the one lock neither script can clear for the other — and the
 * page's own inline overflow is left exactly as it was.
 *
 * All lookups are scoped to the root: the ids the renderer emits are prefixed per
 * instance, so no selector may depend on a document-wide id.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";

const MOBILE_QUERY = "(max-width: 1023px)";

/**
 * Body class that locks page scroll while a compact menu covers the page.
 *
 * The `max-width:1023px` rule that turns it into `overflow: hidden` lives in
 * `resources/css/modules/40-overrides.css`.
 */
const LOCK_CLASS = "doclap-nav-locked";

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const TOGGLE_SELECTOR = ".doclap-submenu-toggle";
const PLUGIN_TOGGLE_SELECTOR = ".beplus-vmn-toggle";

function focusableWithin(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
		(element) =>
			(element.offsetParent !== null || element === document.activeElement) &&
			"hidden" !== getComputedStyle(element).visibility,
	);
}

/** One disclosure control, the submenu it owns, and the list item they sit in. */
interface Submenu {
	button: HTMLButtonElement;
	list: HTMLElement;
	item: HTMLElement;
}

function initHeader(root: HTMLElement): () => void {
	const menuToggle = root.querySelector<HTMLButtonElement>("[data-doclap-menu]");
	const nav = root.querySelector<HTMLElement>("[data-doclap-nav]");
	const mobileQuery = window.matchMedia(MOBILE_QUERY);

	const submenus: Submenu[] = Array.from(
		root.querySelectorAll<HTMLButtonElement>(TOGGLE_SELECTOR),
	).flatMap((button) => {
		const id = button.getAttribute("aria-controls");
		const list = id ? root.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null;
		const item = button.closest<HTMLElement>(".menu-item");

		return list && item ? [{ button, list, item }] : [];
	});

	if (submenus.length === 0 && !menuToggle) {
		return () => {};
	}

	const closeSubmenu = (submenu: Submenu): void => {
		submenu.button.setAttribute("aria-expanded", "false");
	};

	const openSubmenu = (submenu: Submenu): void => {
		submenus.forEach((other) => {
			// Keep the ancestors of this control open; close sibling branches only.
			if (other !== submenu && !other.list.contains(submenu.button)) {
				closeSubmenu(other);
			}
		});

		submenu.button.setAttribute("aria-expanded", "true");
	};

	const closeSubmenus = (): void => submenus.forEach(closeSubmenu);

	/**
	 * Let the plugin clear its own mega state instead of reaching into it.
	 *
	 * No-op on a site where Visual Mega Navigation is not installed, because the
	 * selector simply matches nothing.
	 */
	const closePluginPanels = (): void => {
		root.querySelectorAll<HTMLButtonElement>(
			`.has-mega-menu > ${PLUGIN_TOGGLE_SELECTOR}[aria-expanded="true"]`,
		).forEach((pluginToggle) => pluginToggle.click());
	};

	const isMenuOpen = (): boolean =>
		menuToggle?.getAttribute("aria-expanded") === "true";

	/*
	 * Whether this instance holds the scroll lock. Only the instance that took it
	 * may release it: every header on the page closes its own compact menu from the
	 * shared document click handler, so an instance that never opened would
	 * otherwise unlock the page behind a menu another instance is still showing.
	 */
	let lockOwned = false;

	const setMenu = (open: boolean): void => {
		if (!menuToggle || !nav) {
			return;
		}

		const wasOpen = isMenuOpen();

		closeSubmenus();

		if (wasOpen && !open) {
			closePluginPanels();
		}

		menuToggle.setAttribute("aria-expanded", String(open));

		const label = menuToggle.querySelector<HTMLElement>(".menu-toggle-label");

		if (label) {
			label.textContent = (
				open ? menuToggle.dataset.closeLabel : menuToggle.dataset.openLabel
			) ?? label.textContent;
		}

		nav.classList.toggle("open", open);

		if (open) {
			// A deep menu left scrolled from the previous visit must start at the top.
			nav.scrollTop = 0;

			document.body.classList.add(LOCK_CLASS);
			lockOwned = true;

			return;
		}

		if (lockOwned) {
			document.body.classList.remove(LOCK_CLASS);
			lockOwned = false;
		}
	};

	const onDocumentClick = (event: Event): void => {
		const target = event.target as Node;

		if (!root.contains(target)) {
			closeSubmenus();
			setMenu(false);

			return;
		}

		if (!(target instanceof Element) || !target.closest(".menu-item")) {
			closeSubmenus();
		}
	};

	/**
	 * One open item per level, whichever kind it is.
	 *
	 * The plugin suppresses the click on its own control
	 * (`stopPropagation()` in a capture-phase listener), so this menu cannot hear
	 * that click, and it cannot rely on focus leaving the item either — a tap does
	 * not move focus on every platform. What it can read is the plugin's own
	 * `aria-expanded` on the mega item's link, which the plugin sets whenever a
	 * panel opens, so watching that attribute closes the ordinary submenu at the
	 * moment a mega panel opens. The link is server-rendered, so this does not
	 * depend on when the plugin injects its control. Nothing plugin-owned is
	 * written here; the observer only reads.
	 */
	const pluginObserver = new MutationObserver((records) => {
		const opened = records.some(
			(record) =>
				"aria-expanded" === record.attributeName &&
				"true" === (record.target as Element).getAttribute("aria-expanded"),
		);

		if (opened) {
			closeSubmenus();
		}
	});

	root.querySelectorAll<HTMLElement>(".has-mega-menu > a").forEach((link) =>
		pluginObserver.observe(link, {
			attributes: true,
			attributeFilter: ["aria-expanded"],
		}),
	);

	const onDocumentKeyDown = (event: KeyboardEvent): void => {
		if (event.key === "Escape") {
			const open = submenus.find(
				(submenu) => submenu.button.getAttribute("aria-expanded") === "true",
			);

			if (open) {
				event.preventDefault();
				closeSubmenus();
				open.button.focus();

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
		if (event.key === "Tab" && isMenuOpen() && nav && menuToggle) {
			const candidates = [menuToggle, ...focusableWithin(nav)];
			const first = candidates[0];
			const last = candidates[candidates.length - 1];
			const active = document.activeElement as HTMLElement | null;

			if (
				event.shiftKey &&
				(active === first || !candidates.includes(active as HTMLElement))
			) {
				event.preventDefault();
				last.focus();

				return;
			}

			if (event.shiftKey) {
				return;
			}

			/*
			 * The menu control sits after the panel in document order, so a plain Tab
			 * from it would step straight past the panel into the page behind — the
			 * panel covers the page, so focus has to enter the panel instead. From the
			 * panel's last control, Tab wraps back to the menu control.
			 */
			if (active === first) {
				event.preventDefault();
				(last === first ? first : candidates[1]).focus();

				return;
			}

			if (active === last || !candidates.includes(active as HTMLElement)) {
				event.preventDefault();
				first.focus();
			}
		}
	};

	const onBreakpointChange = (): void => setMenu(false);

	const listeners: Array<() => void> = [];

	submenus.forEach((submenu) => {
		const onClick = (): void => {
			if (submenu.button.getAttribute("aria-expanded") === "true") {
				closeSubmenus();
				submenu.button.focus();

				return;
			}

			/*
			 * One open item per level, whichever kind it is: opening this ordinary
			 * submenu closes an expanded mega panel, so the two chevrons can never
			 * point up at the same time.
			 */
			closePluginPanels();
			openSubmenu(submenu);
		};

		const onButtonKeyDown = (event: KeyboardEvent): void => {
			if ("ArrowDown" !== event.key && "ArrowUp" !== event.key) {
				return;
			}

			event.preventDefault();
			closePluginPanels();
			openSubmenu(submenu);

			const focusable = focusableWithin(submenu.list);

			if (focusable.length > 0) {
				("ArrowUp" === event.key ? focusable[focusable.length - 1] : focusable[0]).focus();
			}
		};

		const onListKeyDown = (event: KeyboardEvent): void => {
			const links = Array.from(
				submenu.list.querySelectorAll<HTMLElement>(":scope > .menu-item > a"),
			);
			const current = links.indexOf(document.activeElement as HTMLElement);

			if (current === -1) {
				return;
			}

			const move = (index: number): void => {
				event.preventDefault();
				links[(index + links.length) % links.length].focus();
			};

			switch (event.key) {
				case "ArrowDown":
					move(current + 1);
					break;

				case "ArrowUp":
					move(current - 1);
					break;

				case "Home":
					move(0);
					break;

				case "End":
					move(links.length - 1);
					break;

				case "Escape":
					event.preventDefault();
					event.stopPropagation();
					closeSubmenus();
					submenu.button.focus();
					break;

				default:
					break;
			}
		};

		const onFocusOut = (): void => {
			window.setTimeout(() => {
				if (submenu.item.contains(document.activeElement)) {
					return;
				}

				closeSubmenu(submenu);
			}, 0);
		};

		submenu.button.addEventListener("click", onClick);
		submenu.button.addEventListener("keydown", onButtonKeyDown);
		submenu.list.addEventListener("keydown", onListKeyDown);
		submenu.item.addEventListener("focusout", onFocusOut);

		listeners.push(() => {
			submenu.button.removeEventListener("click", onClick);
			submenu.button.removeEventListener("keydown", onButtonKeyDown);
			submenu.list.removeEventListener("keydown", onListKeyDown);
			submenu.item.removeEventListener("focusout", onFocusOut);
		});
	});

	if (menuToggle) {
		const onToggle = (): void => setMenu(!isMenuOpen());

		menuToggle.addEventListener("click", onToggle);
		listeners.push(() => menuToggle.removeEventListener("click", onToggle));
	}

	if (nav) {
		nav.querySelectorAll("a").forEach((link) => {
			const onNavigate = (): void => setMenu(false);

			link.addEventListener("click", onNavigate);
			listeners.push(() => link.removeEventListener("click", onNavigate));
		});
	}

	document.addEventListener("click", onDocumentClick);
	document.addEventListener("keydown", onDocumentKeyDown);
	mobileQuery.addEventListener("change", onBreakpointChange);

	return () => {
		listeners.forEach((remove) => remove());
		document.removeEventListener("click", onDocumentClick);
		document.removeEventListener("keydown", onDocumentKeyDown);
		mobileQuery.removeEventListener("change", onBreakpointChange);
		pluginObserver.disconnect();

		if (lockOwned) {
			document.body.classList.remove(LOCK_CLASS);
			lockOwned = false;
		}
	};
}

bootBlocks<HTMLElement>(".doclap-site-header", initHeader);
