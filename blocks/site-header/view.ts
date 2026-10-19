/**
 * doclap/site-header front-end behaviour.
 *
 * Submenus open on hover and focus through CSS alone; this script only owns the
 * touch/keyboard path (`aria-expanded` on `.doclap-submenu-toggle`), the compact
 * menu shell, focus return, focus containment while that shell covers the page,
 * and body-scroll restoration. A pointer device therefore keeps working when this
 * script never runs.
 *
 * Mega panels are owned by Visual Mega Navigation: its `.has-mega-menu`,
 * `.beplus-vmn-toggle` and `.beplus-vmn-mega-panel` state is never touched here.
 * The only bridge is closing an expanded plugin toggle when the compact menu
 * closes, which is delegated to the plugin by re-dispatching its own click.
 *
 * All lookups are scoped to the root: the ids the renderer emits are prefixed per
 * instance, so no selector may depend on a document-wide id.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";

const MOBILE_QUERY = "(max-width: 920px)";

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
			`${PLUGIN_TOGGLE_SELECTOR}[aria-expanded="true"]`,
		).forEach((pluginToggle) => pluginToggle.click());
	};

	const isMenuOpen = (): boolean =>
		menuToggle?.getAttribute("aria-expanded") === "true";

	let restoreOverflow = "";
	let overflowStored = false;

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

			if (!overflowStored) {
				restoreOverflow = document.body.style.overflow;
				overflowStored = true;
			}

			document.body.style.overflow = "hidden";

			return;
		}

		/*
		 * Only the instance that locked the body may unlock it. Every header on the
		 * page closes its own compact menu from the shared document click handler,
		 * so an instance that never opened would otherwise reset the lock another
		 * instance is still holding and unlock scrolling behind an open menu.
		 */
		if (overflowStored) {
			document.body.style.overflow = restoreOverflow;
			overflowStored = false;
		}
	};

	/**
	 * Re-assert this instance's page-scroll lock.
	 *
	 * Visual Mega Navigation clears `document.body.style.overflow` whenever it
	 * closes its own panels — on every Escape and on every click outside a mega
	 * item — so a compact menu that is still open has to reclaim a lock it
	 * already owns. A closed menu owns no lock, so this is a no-op then.
	 */
	const assertBodyLock = (): void => {
		if (overflowStored && "hidden" !== document.body.style.overflow) {
			document.body.style.overflow = "hidden";
		}
	};

	const onDocumentClick = (event: Event): void => {
		assertBodyLock();

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

	const onDocumentKeyDown = (event: KeyboardEvent): void => {
		assertBodyLock();

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

			openSubmenu(submenu);
		};

		const onButtonKeyDown = (event: KeyboardEvent): void => {
			if ("ArrowDown" !== event.key && "ArrowUp" !== event.key) {
				return;
			}

			event.preventDefault();
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

		if (overflowStored) {
			document.body.style.overflow = restoreOverflow;
			overflowStored = false;
		}
	};
}

bootBlocks<HTMLElement>(".doclap-site-header", initHeader);
