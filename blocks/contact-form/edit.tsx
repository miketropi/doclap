import { InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  TextControl,
  TextareaControl,
  ToggleControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import ServerSideRender from "@wordpress/server-side-render";
import Repeater, {
  type RepeaterItem,
} from "../../resources/ts/editor/repeater";
import type { ContactFormAttributes, ServiceOption } from "./types";

interface EditProps {
  attributes: ContactFormAttributes;
  setAttributes: (a: Partial<ContactFormAttributes>) => void;
}
const text = (
  label: string,
  key: keyof ContactFormAttributes,
  a: ContactFormAttributes,
  set: EditProps["setAttributes"],
) => (
  <TextControl
    label={label}
    value={String(a[key] ?? "")}
    onChange={(value) => set({ [key]: value })}
  />
);
export default function Edit({
  attributes: a,
  setAttributes,
}: EditProps): JSX.Element {
  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Hero", "doclap")}>
          {text(
            __("Home breadcrumb", "doclap"),
            "breadcrumbHomeLabel",
            a,
            setAttributes,
          )}
          {text(
            __("Page breadcrumb", "doclap"),
            "breadcrumbLabel",
            a,
            setAttributes,
          )}
          {text(__("Heading", "doclap"), "heading", a, setAttributes)}
          {text(
            __("Heading accent", "doclap"),
            "headingAccent",
            a,
            setAttributes,
          )}
          <TextareaControl
            label={__("Lead", "doclap")}
            value={a.lead}
            onChange={(lead) => setAttributes({ lead })}
          />
        </PanelBody>
        <PanelBody title={__("Aside", "doclap")} initialOpen={false}>
          {text(__("Meta", "doclap"), "asideMeta", a, setAttributes)}
          <TextareaControl
            label={__("Heading", "doclap")}
            value={a.asideHeading}
            onChange={(asideHeading) => setAttributes({ asideHeading })}
          />
          <TextareaControl
            label={__("Copy", "doclap")}
            value={a.asideCopy}
            onChange={(asideCopy) => setAttributes({ asideCopy })}
          />
          <Repeater
            label={__("Steps", "doclap")}
            items={(a.asideSteps ?? []).map((value) => ({ value }))}
            fields={[{ key: "value", label: __("Step", "doclap") }]}
            createItem={() => ({ value: "" })}
            onChange={(items) =>
              setAttributes({
                asideSteps: items.map((item) => String(item.value ?? "")),
              })
            }
          />
          {text(__("Link label", "doclap"), "asideLinkLabel", a, setAttributes)}
          {text(__("Link URL", "doclap"), "asideLinkUrl", a, setAttributes)}
        </PanelBody>
        <PanelBody title={__("Form", "doclap")} initialOpen={false}>
          {(
            [
              "nameLabel",
              "emailLabel",
              "companyLabel",
              "servicesLabel",
              "messageLabel",
              "messagePlaceholder",
              "consentLabel",
              "buttonLabel",
              "sendingLabel",
              "successMessage",
              "errorMessage",
              "formNote",
            ] as const
          ).map((key) => text(__(key, "doclap"), key, a, setAttributes))}
          <Repeater
            label={__("Services", "doclap")}
            items={(a.services ?? []) as unknown as RepeaterItem[]}
            fields={[
              { key: "value", label: __("Submitted value", "doclap") },
              { key: "label", label: __("Label", "doclap") },
            ]}
            createItem={() => ({ value: "", label: "" })}
            onChange={(services) =>
              setAttributes({
                services: services as unknown as ServiceOption[],
              })
            }
          />
        </PanelBody>
        <PanelBody title={__("Email delivery", "doclap")} initialOpen={false}>
          {text(__("Admin email", "doclap"), "adminEmail", a, setAttributes)}
          {text(
            __("Admin subject", "doclap"),
            "adminEmailSubject",
            a,
            setAttributes,
          )}
          {text(
            __("Visitor subject", "doclap"),
            "userEmailSubject",
            a,
            setAttributes,
          )}
        </PanelBody>
        <PanelBody title={__("reCAPTCHA", "doclap")} initialOpen={false}>
          <ToggleControl
            label={__("Enable reCAPTCHA v3", "doclap")}
            checked={a.enableRecaptcha}
            onChange={(enableRecaptcha) => setAttributes({ enableRecaptcha })}
          />
          {text(__("Site key", "doclap"), "recaptchaSiteKey", a, setAttributes)}
          {text(
            __("Secret key", "doclap"),
            "recaptchaSecretKey",
            a,
            setAttributes,
          )}
        </PanelBody>
      </InspectorControls>
      <ServerSideRender
        block="doclap/contact-form"
        attributes={a as unknown as Record<string, unknown>}
      />
    </>
  );
}
