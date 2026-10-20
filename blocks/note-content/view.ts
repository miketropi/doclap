/**
 * doclap/note-content front-end behaviour.
 *
 * The save toggle and the copy-link action report through the renderer's live
 * region. Both status strings come from renderer data attributes, and the
 * temporary clipboard fallback field is always removed.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";
import { readString } from "../../resources/ts/runtime/strings";

function initNote(root: HTMLElement): () => void {
	const save = root.querySelector<HTMLButtonElement>("[data-doclap-save]");
	const copy = root.querySelector<HTMLButtonElement>("[data-doclap-copy]");
	const status = root.querySelector<HTMLElement>("[data-doclap-article-status]");
	const permalink = copy?.dataset.permalink ?? window.location.href;
	const storageKey = `doclap-saved:${permalink}`;
	const statusSaved = readString(save, "status-saved");
	const statusRemoved = readString(save, "status-removed");
	const statusCopied = readString(copy, "status-copied");
	const statusFailed = readString(copy, "status-failed");
	const listeners: Array<() => void> = [];

	const report = (message: string): void => {
		if (status && message) {
			status.textContent = message;
		}
	};

	if (save) {
		let saved = false;

		try {
			saved = "1" === window.localStorage.getItem(storageKey);
		} catch {
			saved = false;
		}

		save.setAttribute("aria-pressed", String(saved));

		const onSave = (): void => {
			saved = "true" !== save.getAttribute("aria-pressed");

			save.setAttribute("aria-pressed", String(saved));

			try {
				if (saved) {
					window.localStorage.setItem(storageKey, "1");
				} else {
					window.localStorage.removeItem(storageKey);
				}
			} catch {
				// The toggle stays usable when storage is unavailable.
			}

			report(saved ? statusSaved : statusRemoved);
		};

		save.addEventListener("click", onSave);
		listeners.push(() => save.removeEventListener("click", onSave));
	}

	if (copy) {
		const onCopy = async (): Promise<void> => {
			try {
				await navigator.clipboard.writeText(permalink);
				report(statusCopied);
			} catch {
				const field = document.createElement("textarea");

				field.value = permalink;
				field.style.position = "fixed";
				field.style.opacity = "0";
				document.body.appendChild(field);

				try {
					field.select();
					report(document.execCommand("copy") ? statusCopied : statusFailed);
				} finally {
					field.remove();
				}
			}
		};

		copy.addEventListener("click", onCopy);
		listeners.push(() => copy.removeEventListener("click", onCopy));
	}

	return () => {
		listeners.forEach((remove) => remove());
	};
}

bootBlocks<HTMLElement>(".doclap-note-content", initNote);
