/**
 * doclap/contact-form front-end behaviour.
 *
 * Progressive enhancement only: the REST route validates every submission
 * server-side, and this bundle adds inline feedback, focus management and the
 * reCAPTCHA token. Every user-facing string is read from a renderer data
 * attribute, so the bundle carries no English literal.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";
import { formatTemplate, readString } from "../../resources/ts/runtime/strings";

declare global {
	interface Window {
		grecaptcha?: {
			ready(callback: () => void): void;
			execute(key: string, options: { action: string }): Promise<string>;
		};
	}
}

type FieldName = "name" | "email" | "message" | "consent";

interface Payload {
	message?: string;
	data?: { fields?: string[] };
}

const FIELD_NAMES: FieldName[] = ["name", "email", "message", "consent"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isFieldName(value: string): value is FieldName {
	return FIELD_NAMES.includes(value as FieldName);
}

function control(
	form: HTMLFormElement,
	name: FieldName,
): HTMLInputElement | HTMLTextAreaElement | null {
	return form.elements.namedItem(name) as
		| HTMLInputElement
		| HTMLTextAreaElement
		| null;
}

function errorNode(
	element: HTMLInputElement | HTMLTextAreaElement,
): HTMLElement | null {
	const id = element.getAttribute("aria-describedby");

	return id ? document.getElementById(id) : null;
}

function setFieldError(
	form: HTMLFormElement,
	name: FieldName,
	message: string,
): boolean {
	const element = control(form, name);

	if (!element) {
		return true;
	}

	if ("" === message) {
		element.removeAttribute("aria-invalid");
	} else {
		element.setAttribute("aria-invalid", "true");
	}

	const output = errorNode(element);

	if (output) {
		output.textContent = message;
	}

	return "" === message;
}

function fieldMessage(form: HTMLFormElement, name: FieldName): string {
	const element = control(form, name);

	if (!element) {
		return "";
	}

	if ("consent" === name) {
		return (element as HTMLInputElement).checked
			? ""
			: readString(form, "error-consent");
	}

	const value = element.value.trim();

	if ("" === value) {
		return readString(form, `error-required-${name}`);
	}

	if ("email" === name && !emailPattern.test(value)) {
		return readString(form, "error-invalid-email");
	}

	if ("message" === name && element.minLength > 0 && value.length < element.minLength) {
		return formatTemplate(
			readString(form, "error-short-message"),
			element.minLength,
		);
	}

	return "";
}

function validate(form: HTMLFormElement, name: FieldName): boolean {
	return setFieldError(form, name, fieldMessage(form, name));
}

function clearError(form: HTMLFormElement, name: FieldName): void {
	setFieldError(form, name, "");
}

/**
 * Show the server's field errors, keeping the server message for that field.
 *
 * @param form    Contact form.
 * @param payload Parsed error response.
 *
 * @return First rejected field, or `null` when the error names no field.
 */
function applyServerErrors(
	form: HTMLFormElement,
	payload: Payload,
): FieldName | null {
	const message = payload.message ?? "";
	const fields = (payload.data?.fields ?? []).filter(isFieldName);

	fields.forEach((field) => {
		const element = control(form, field);

		if (!element) {
			return;
		}

		element.setAttribute("aria-invalid", "true");

		const output = errorNode(element);

		if (output && "" !== message) {
			output.textContent = message;
		}
	});

	return fields[0] ?? null;
}

async function recaptcha(form: HTMLFormElement): Promise<string> {
	if ("1" !== form.dataset.recaptcha) {
		return "";
	}

	const key = form.dataset.recaptchaPublicKey ?? "";

	if ("" === key || !window.grecaptcha) {
		throw new Error(readString(form, "error-recaptcha"));
	}

	return new Promise<string>((resolve, reject) => {
		window.grecaptcha?.ready(() => {
			window.grecaptcha
				?.execute(key, { action: "contact_form" })
				.then(resolve)
				.catch(reject);
		});
	});
}

function initContactForm(form: HTMLFormElement): () => void {
	const listeners: Array<() => void> = [];
	const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
	const label = button?.querySelector("span");
	const status = form.querySelector<HTMLElement>('[role="status"]');

	FIELD_NAMES.forEach((name) => {
		const element = control(form, name);

		if (!element) {
			return;
		}

		const onBlur = (): void => {
			validate(form, name);
		};

		const onInput = (): void => {
			if ("true" === element.getAttribute("aria-invalid")) {
				validate(form, name);
			}
		};

		element.addEventListener("blur", onBlur);
		element.addEventListener("input", onInput);
		element.addEventListener("change", onInput);

		listeners.push(() => {
			element.removeEventListener("blur", onBlur);
			element.removeEventListener("input", onInput);
			element.removeEventListener("change", onInput);
		});
	});

	const onSubmit = async (event: SubmitEvent): Promise<void> => {
		event.preventDefault();

		if ("1" === form.dataset.submitting) {
			return;
		}

		const invalid = FIELD_NAMES.filter((name) => !validate(form, name));

		if (invalid.length > 0) {
			control(form, invalid[0])?.focus();

			return;
		}

		const original = label?.textContent ?? "";

		form.dataset.submitting = "1";

		if (button) {
			button.disabled = true;
		}

		if (label) {
			label.textContent = readString(form, "sending-label");
		}

		if (status) {
			status.textContent = "";
		}

		try {
			const data = new FormData(form);
			const body = {
				name: String(data.get("name") ?? ""),
				email: String(data.get("email") ?? ""),
				company: String(data.get("company") ?? ""),
				services: data.getAll("services[]").map(String),
				message: String(data.get("message") ?? ""),
				consent: null !== data.get("consent"),
				website: String(data.get("website") ?? ""),
				_wpnonce: form.dataset.nonce ?? String(data.get("_wpnonce") ?? ""),
				recaptcha_token: await recaptcha(form),
			};
			const response = await fetch(form.dataset.restUrl ?? "", {
				method: "POST",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/json",
					"X-WP-Nonce": form.dataset.restNonce ?? "",
				},
				body: JSON.stringify(body),
			});
			const payload = (await response.json()) as Payload;

			if (!response.ok) {
				const first = applyServerErrors(form, payload);

				control(form, first ?? "name")?.focus();

				throw new Error(payload.message ?? readString(form, "error-message"));
			}

			form.reset();
			FIELD_NAMES.forEach((name) => clearError(form, name));

			if (status) {
				status.textContent =
					payload.message ?? readString(form, "success-message");
			}
		} catch (reason) {
			if (status) {
				status.textContent =
					reason instanceof Error && "" !== reason.message
						? reason.message
						: readString(form, "error-message");
			}
		} finally {
			delete form.dataset.submitting;

			if (button) {
				button.disabled = false;
			}

			if (label) {
				label.textContent = original;
			}
		}
	};

	form.addEventListener("submit", onSubmit);
	listeners.push(() => form.removeEventListener("submit", onSubmit));

	return () => {
		listeners.forEach((remove) => remove());
	};
}

bootBlocks<HTMLFormElement>('form[data-doclap-contact-form="1"]', initContactForm);
