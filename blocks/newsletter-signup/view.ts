/**
 * Newsletter signup — front-end behaviour.
 *
 * The preview saves the signup in the visitor's own browser and nothing else:
 * there is no request, no mailing service and no email address in any announced
 * message. Every user-facing string is read from a renderer `data-*` attribute,
 * so this bundle carries no English literal.
 *
 * The stored payload is untrusted input: it is re-validated on read and written
 * into the field with `.value`, never as markup. Otherwise this only switches
 * between values the renderer already printed and toggles the reset button.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";
import { readString } from "../../resources/ts/runtime/strings";

/** Storage key of the signup this block owns. */
const STORAGE_KEY = "doclap:v1:newsletter-signup";

/** Same shape the renderer's natively validated field accepts. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface StoredSignup {
	v: 1;
	email: string;
	consent: boolean;
	ts: number;
}

/**
 * Whether a parsed value carries the payload this block wrote.
 *
 * @param value Parsed JSON value.
 * @return True when every field is present and plausible.
 */
function isStoredSignup(value: unknown): value is StoredSignup {
	if (null === value || "object" !== typeof value) {
		return false;
	}

	const record = value as Record<string, unknown>;

	return (
		1 === record.v &&
		"string" === typeof record.email &&
		EMAIL_PATTERN.test(record.email) &&
		true === record.consent &&
		"number" === typeof record.ts
	);
}

function initNewsletter(form: HTMLFormElement): () => void {
	const email = form.querySelector<HTMLInputElement>('input[name="email"]');
	const consent = form.querySelector<HTMLInputElement>('input[name="consent"]');
	const status = form.querySelector<HTMLElement>('[role="status"]');
	const reset = form.querySelector<HTMLButtonElement>(".newsletter-reset");

	if (!email || !consent) {
		return () => {};
	}

	/**
	 * Announce one of the renderer's own messages.
	 *
	 * @param key Status attribute name without the `data-` prefix.
	 */
	const announce = (key: string): void => {
		if (status) {
			status.textContent = readString(form, key);
		}
	};

	let store: Storage | null = null;

	// A hardened or private context can refuse the property itself, not just the
	// individual calls, so the access is guarded too.
	try {
		store = window.localStorage ?? null;
	} catch {
		store = null;
	}

	if (!store) {
		announce("doclap-unavailable-status");
	} else {
		try {
			const raw = store.getItem(STORAGE_KEY);

			if (null !== raw) {
				let parsed: unknown = null;

				try {
					parsed = JSON.parse(raw) as unknown;
				} catch {
					parsed = null;
				}

				if (isStoredSignup(parsed)) {
					// Untrusted input: the value is assigned, never injected.
					email.value = parsed.email;
					consent.checked = true;

					if (reset) {
						reset.hidden = false;
					}

					announce("doclap-restored-status");
				} else {
					// A record this block cannot understand is discarded, so the
					// visitor is never told about something they cannot remove.
					try {
						store.removeItem(STORAGE_KEY);
					} catch {
						announce("doclap-unavailable-status");
					}
				}
			}
		} catch {
			announce("doclap-unavailable-status");
		}
	}

	const onSubmit = (event: SubmitEvent): void => {
		event.preventDefault();

		email.value = email.value.trim();

		// Native constraint validation owns the messages; this only stops the
		// handler when the browser says the form is not valid yet.
		if (!form.reportValidity() || !consent.checked) {
			return;
		}

		const payload: StoredSignup = {
			v: 1,
			email: email.value,
			consent: true,
			ts: Date.now(),
		};

		let saved = null !== store;

		if (store) {
			try {
				store.setItem(STORAGE_KEY, JSON.stringify(payload));
			} catch {
				saved = false;
			}
		}

		if (!saved) {
			announce("doclap-save-failed-status");

			return;
		}

		if (reset) {
			reset.hidden = false;
		}

		announce("doclap-saved-status");
	};

	const onReset = (): void => {
		let removed = null !== store;

		if (store) {
			try {
				store.removeItem(STORAGE_KEY);
			} catch {
				removed = false;
			}
		}

		if (!removed) {
			announce("doclap-remove-failed-status");

			return;
		}

		form.reset();

		if (reset) {
			reset.hidden = true;
		}

		email.focus();
		announce("doclap-removed-status");
	};

	form.addEventListener("submit", onSubmit);

	if (reset) {
		reset.addEventListener("click", onReset);
	}

	return () => {
		form.removeEventListener("submit", onSubmit);

		if (reset) {
			reset.removeEventListener("click", onReset);
		}
	};
}

bootBlocks<HTMLFormElement>('form[data-doclap-newsletter="1"]', initNewsletter);
