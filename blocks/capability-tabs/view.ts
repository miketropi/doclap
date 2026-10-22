/**
 * doclap/capability-tabs front-end behaviour.
 *
 * The renderer prints every panel and selects the first one, so the section is
 * complete without this bundle: the script only switches which pre-rendered panel
 * is shown, keeps `aria-selected`, `aria-orientation` and the roving `tabindex`
 * accurate, and replays the reference's panel reveal when motion is allowed.
 *
 * Lifecycle contract (booted through `resources/ts/runtime/blocks.ts`):
 *   * one boot per root, so a duplicated block never double-binds its listeners;
 *   * every lookup starts at the root — the ids the renderer emits are prefixed
 *     per instance, so two tab sets on one page stay independent;
 *   * a reduced-motion visitor gets the panel swap with no animation at all;
 *   * removing the root removes every listener and the media-query listener.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";

/**
 * The reflow boundary the block's own CSS uses: the tablist is vertical above it
 * and horizontal below it, and `aria-orientation` follows it.
 */
const REFLOW_QUERY = "(max-width: 920px)";

/** Reduced-motion query, read at call time so a mid-session change is honoured. */
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

/** The reference's panel reveal, replayed on every selection. */
const REVEAL_KEYFRAMES: Keyframe[] = [
	{ opacity: 0, transform: "translateY(10px)", filter: "blur(4px)" },
	{ opacity: 1, transform: "none", filter: "blur(0)" },
];

const REVEAL_OPTIONS: KeyframeAnimationOptions = {
	duration: 500,
	easing: "cubic-bezier(.22, 1, .36, 1)",
};

/** One tab, the panel it controls, and their position in the sequence. */
interface TabEntry {
	tab: HTMLButtonElement;
	panel: HTMLElement | null;
}

function initTabs(root: HTMLElement): (() => void) | void {
	const list = root.querySelector<HTMLElement>('[role="tablist"]');
	const tabs = Array.from(
		root.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
	);

	if (!list || tabs.length === 0) {
		return;
	}

	/*
	 * Panels are resolved through each tab's own `aria-controls`, scoped to the
	 * root: the pairing is the contract, and a second block's panels are never
	 * reachable from here.
	 */
	const entries: TabEntry[] = tabs.map((tab) => {
		const id = tab.getAttribute("aria-controls");

		return {
			tab,
			panel: id ? root.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null,
		};
	});

	/*
	 * Every panel is rendered open so the section is readable without this bundle.
	 * Only now that the tabs are live are the unselected panels taken out of the
	 * flow and out of the accessibility tree, which also keeps the no-JS reader from
	 * hearing three panels while seeing one.
	 */
	const initial = Math.max(
		0,
		entries.findIndex(
			(entry) => "true" === entry.tab.getAttribute("aria-selected"),
		),
	);

	entries.forEach((entry, index) => {
		if (entry.panel) {
			entry.panel.hidden = index !== initial;
		}
	});

	const select = (position: number, focus: boolean): void => {
		entries.forEach((entry, index) => {
			const active = index === position;

			entry.tab.setAttribute("aria-selected", String(active));
			entry.tab.tabIndex = active ? 0 : -1;

			if (entry.panel) {
				entry.panel.hidden = !active;
			}
		});

		const target = entries[position];

		if (focus) {
			target.tab.focus();
		}

		if (
			target.panel &&
			!reduced.matches &&
			"function" === typeof target.panel.animate
		) {
			target.panel.animate(REVEAL_KEYFRAMES, REVEAL_OPTIONS);
		}
	};

	/** The tab a delegated event started on, or `-1`. */
	const positionOf = (event: Event): number => {
		const target = event.target;
		const tab =
			target instanceof Element
				? target.closest<HTMLButtonElement>('[role="tab"]')
				: null;

		return tab && list.contains(tab) ? entries.findIndex((entry) => entry.tab === tab) : -1;
	};

	const onClick = (event: Event): void => {
		const position = positionOf(event);

		// A click selects without moving focus: the pointer is already the target.
		if (position >= 0) {
			select(position, false);
		}
	};

	/*
	 * Every arrow key follows the same sequence. The tablist reflows from vertical
	 * to horizontal below 920px and both axis pairs walk it in the same order, so
	 * accepting either pair is what keeps the keyboard identical at both
	 * breakpoints — while `aria-orientation`, kept in step below, tells assistive
	 * technology which axis is on screen. `preventDefault()` is unconditional for
	 * the keys that are handled, so an arrow key never scrolls the page.
	 */
	const onKeyDown = (event: KeyboardEvent): void => {
		const position = positionOf(event);

		if (position < 0) {
			return;
		}

		let next = position;

		switch (event.key) {
			case "ArrowRight":
			case "ArrowDown":
				next = (position + 1) % entries.length;
				break;

			case "ArrowLeft":
			case "ArrowUp":
				next = (position - 1 + entries.length) % entries.length;
				break;

			case "Home":
				next = 0;
				break;

			case "End":
				next = entries.length - 1;
				break;

			default:
				return;
		}

		event.preventDefault();
		select(next, true);
	};

	const reflow = window.matchMedia(REFLOW_QUERY);
	const syncOrientation = (): void => {
		list.setAttribute("aria-orientation", reflow.matches ? "horizontal" : "vertical");
	};

	list.addEventListener("click", onClick);
	list.addEventListener("keydown", onKeyDown);
	reflow.addEventListener("change", syncOrientation);
	syncOrientation();

	return () => {
		list.removeEventListener("click", onClick);
		list.removeEventListener("keydown", onKeyDown);
		reflow.removeEventListener("change", syncOrientation);
	};
}

bootBlocks<HTMLElement>(".doclap-capability-tabs", initTabs);
