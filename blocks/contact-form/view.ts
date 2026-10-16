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
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function control(
  form: HTMLFormElement,
  name: FieldName,
): HTMLInputElement | HTMLTextAreaElement | null {
  return form.elements.namedItem(name) as
    HTMLInputElement | HTMLTextAreaElement | null;
}
function errorNode(
  element: HTMLInputElement | HTMLTextAreaElement,
): HTMLElement | null {
  const id = element.getAttribute("aria-describedby");
  return id ? document.getElementById(id) : null;
}
function validate(form: HTMLFormElement, name: FieldName): boolean {
  const element = control(form, name);
  if (!element) {
    return true;
  }

  let message = "";
  if (name === "consent" && !(element as HTMLInputElement).checked) {
    message = "Please confirm your consent.";
  } else if (!element.value.trim()) {
    message = `Please enter your ${name}.`;
  } else if (name === "email" && !emailPattern.test(element.value.trim())) {
    message = "Please enter a valid email address.";
  } else if (name === "message" && element.value.trim().length < 20) {
    message = "Please enter at least 20 characters.";
  }

  const output = errorNode(element);
  if (message) {
    element.setAttribute("aria-invalid", "true");
  } else {
    element.removeAttribute("aria-invalid");
  }
  if (output) {
    output.textContent = message;
  }

  return message === "";
}
function clearError(form: HTMLFormElement, name: FieldName): void {
  const element = control(form, name);
  if (!element) return;
  element.removeAttribute("aria-invalid");
  const output = errorNode(element);
  if (output) output.textContent = "";
}
async function recaptcha(form: HTMLFormElement): Promise<string> {
  if (form.dataset.recaptcha !== "1") return "";
  const key = form.dataset.recaptchaSiteKey ?? "";
  if (!key || !window.grecaptcha)
    throw new Error("Security verification is unavailable.");
  return new Promise((resolve, reject) =>
    window.grecaptcha?.ready(() =>
      window.grecaptcha
        ?.execute(key, { action: "contact_form" })
        .then(resolve)
        .catch(reject),
    ),
  );
}
function init(form: HTMLFormElement): void {
  if (form.dataset.initialized === "1") {
    return;
  }
  form.dataset.initialized = "1";
  const names: FieldName[] = ["name", "email", "message", "consent"];
  for (const name of names) {
    const element = control(form, name);
    element?.addEventListener("blur", () => {
      validate(form, name);
    });
    element?.addEventListener("input", () => {
      if (element.getAttribute("aria-invalid") === "true") {
        validate(form, name);
      }
    });
    element?.addEventListener("change", () => {
      if (element.getAttribute("aria-invalid") === "true") {
        validate(form, name);
      }
    });
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.dataset.submitting === "1") {
      return;
    }
    const invalid: FieldName[] = [];
    for (const name of names) {
      if (!validate(form, name)) {
        invalid.push(name);
      }
    }
    if (invalid.length > 0) {
      control(form, invalid[0])?.focus();
      return;
    }
    const button = form.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );
    const label = button?.querySelector("span");
    const original = label?.textContent ?? "";
    const status = form.querySelector<HTMLElement>('[role="status"]');
    form.dataset.submitting = "1";
    if (button) button.disabled = true;
    if (label) label.textContent = form.dataset.sendingLabel ?? "Sending…";
    if (status) status.textContent = "";
    try {
      const data = new FormData(form);
      const services = data.getAll("services[]").map(String);
      const body = {
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        company: String(data.get("company") ?? ""),
        services,
        message: String(data.get("message") ?? ""),
        consent: data.get("consent") !== null,
        website: String(data.get("website") ?? ""),
        _wpnonce: form.dataset.nonce ?? String(data.get("_wpnonce") ?? ""),
        recaptcha_config: form.dataset.config ?? "",
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
        for (const field of payload.data?.fields ?? []) {
          if (names.includes(field as FieldName)) {
            validate(form, field as FieldName);
            const element = control(form, field as FieldName);
            if (
              element &&
              errorNode(element) &&
              !errorNode(element)?.textContent
            )
              errorNode(element)!.textContent = payload.message ?? "";
          }
        }
        const first = (payload.data?.fields ?? []).find((field) =>
          names.includes(field as FieldName),
        ) as FieldName | undefined;
        control(form, first ?? "name")?.focus();
        throw new Error(
          payload.message ??
            form.dataset.errorMessage ??
            "Something went wrong.",
        );
      }
      form.reset();
      names.forEach((name) => clearError(form, name));
      if (status)
        status.textContent =
          payload.message ??
          form.dataset.successMessage ??
          "Thank you. Your message has been sent.";
    } catch (reason) {
      if (status)
        status.textContent =
          reason instanceof Error
            ? reason.message
            : (form.dataset.errorMessage ?? "Something went wrong.");
    } finally {
      delete form.dataset.submitting;
      if (button) button.disabled = false;
      if (label) label.textContent = original;
    }
  });
}
function boot(): void {
  document
    .querySelectorAll<HTMLFormElement>('form[data-doclap-contact-form="1"]')
    .forEach(init);
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", boot);
else boot();
export {};
