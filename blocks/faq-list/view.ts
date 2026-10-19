/**
 * doclap/faq-list front-end behaviour.
 *
 * Filter buttons narrow the question list, keep `aria-pressed` accurate, close
 * any question a filter hides, and announce the visible total through the
 * renderer's live region. The count wording comes from the renderer, so this
 * bundle carries no user-facing literal.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";
import { formatTemplate, readString } from "../../resources/ts/runtime/strings";

function initFaq(root: HTMLElement): () => void {
	const buttons = Array.from(
		root.querySelectorAll<HTMLButtonElement>(".filter-bar [data-filter]"),
	);
	const questions = Array.from(
		root.querySelectorAll<HTMLDetailsElement>(".faq-list details[data-category]"),
	);
	const count = root.querySelector<HTMLElement>("[data-faq-count]");
	const empty = root.querySelector<HTMLElement>("[data-faq-empty]");

	if (buttons.length === 0 || questions.length === 0) {
		return () => {};
	}

	const countTemplate = readString(count, "count-template");
	const listeners: Array<() => void> = [];

	buttons.forEach((button) => {
		const onFilter = (): void => {
			const selected = button.dataset.filter ?? "all";
			let visible = 0;

			buttons.forEach((candidate) => {
				candidate.setAttribute("aria-pressed", String(candidate === button));
			});

			questions.forEach((question) => {
				const matches =
					"all" === selected || question.dataset.category === selected;

				if (!matches && question.open) {
					question.open = false;
				}

				question.hidden = !matches;

				if (matches) {
					visible += 1;
				}
			});

			if (count && countTemplate) {
				count.textContent = formatTemplate(countTemplate, visible);
			}

			if (empty) {
				empty.hidden = 0 !== visible;
			}
		};

		button.addEventListener("click", onFilter);
		listeners.push(() => button.removeEventListener("click", onFilter));
	});

	return () => {
		listeners.forEach((remove) => remove());
	};
}

bootBlocks<HTMLElement>(".doclap-faq-list", initFaq);
