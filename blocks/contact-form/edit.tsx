import { InspectorControls } from "@wordpress/block-editor";
import {
  Notice,
  PanelBody,
  TextControl,
  TextareaControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

import BlockPreview from "../../resources/ts/editor/block-preview";
import ColourControls from "../../resources/ts/editor/colour-controls";
import Repeater, {
  type RepeaterItem,
} from "../../resources/ts/editor/repeater";
import RichTextOverlay, {
  type RichTextTarget,
} from "../../resources/ts/editor/rich-text-overlay";
import { urlHelpWithStructuralNote } from "../../resources/ts/editor/url-help";
import type { ContactFormAttributes, ServiceOption } from "./types";

interface EditProps {
  attributes: ContactFormAttributes;
  setAttributes: (attributes: Partial<ContactFormAttributes>) => void;
  isSelected: boolean;
}

/**
 * Delivery hint localised by `doclap_contact_settings_editor_hint()`.
 *
 * Delivery is a site-level option rather than a block attribute, so the inspector
 * names it and links to it — that is the whole reason the settings screen is
 * separate from this block.
 */
declare global {
  interface Window {
    doclapContactSettings?: { url?: string; canManage?: boolean };
  }
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
  {
    path: "asideHeading",
    label: __("Aside heading", "doclap"),
    multiline: true,
  },
  { path: "asideCopy", label: __("Aside copy", "doclap"), multiline: true },
  { path: "asideLinkLabel", label: __("Link label", "doclap") },
];

export default function Edit({
  attributes,
  setAttributes,
  isSelected,
}: EditProps): JSX.Element {
  const services = attributes.services ?? [];
  const steps = (attributes.asideSteps ?? []).map((value) => ({ value }));
  const settingsHint =
    typeof window === "undefined" ? undefined : window.doclapContactSettings;

  return (
    <>
      <InspectorControls>
        {settingsHint?.url && settingsHint.canManage ? (
          <Notice status="info" isDismissible={false}>
            {__(
              "Delivery is configured once per site — recipient, subjects and reCAPTCHA — so it never travels with this block or a copy of this page.",
              "doclap",
            )}{" "}
            <a href={settingsHint.url}>
              {__("Open Doclap Contact settings", "doclap")}
            </a>
          </Notice>
        ) : null}
        <PanelBody title={__("Aside", "doclap")} initialOpen>
          <TextControl
            label={__("Meta", "doclap")}
            value={attributes.asideMeta ?? ""}
            onChange={(asideMeta) => setAttributes({ asideMeta })}
          />
          <Repeater
            label={__("Steps", "doclap")}
            items={steps as RepeaterItem[]}
            fields={[{ key: "value", label: __("Step", "doclap") }]}
            createItem={() => ({ value: "" })}
            onChange={(items) =>
              setAttributes({
                asideSteps: items.map((item) => String(item.value ?? "")),
              })
            }
            addLabel={__("Add step", "doclap")}
            emptyLabel={__("No steps yet.", "doclap")}
          />
          <TextControl
            label={__("Link URL", "doclap")}
            help={urlHelpWithStructuralNote}
            value={attributes.asideLinkUrl ?? ""}
            onChange={(asideLinkUrl) => setAttributes({ asideLinkUrl })}
          />
        </PanelBody>

        <PanelBody title={__("Form", "doclap")} initialOpen={false}>
          <TextControl
            label={__("Name field label", "doclap")}
            help={__(
              "Include the required marker expected on the front end.",
              "doclap",
            )}
            value={attributes.nameLabel ?? ""}
            onChange={(nameLabel) => setAttributes({ nameLabel })}
          />
          <TextControl
            label={__("Email field label", "doclap")}
            value={attributes.emailLabel ?? ""}
            onChange={(emailLabel) => setAttributes({ emailLabel })}
          />
          <TextControl
            label={__("Brand or organisation field label", "doclap")}
            value={attributes.companyLabel ?? ""}
            onChange={(companyLabel) => setAttributes({ companyLabel })}
          />
          <TextControl
            label={__("Services group label", "doclap")}
            value={attributes.servicesLabel ?? ""}
            onChange={(servicesLabel) => setAttributes({ servicesLabel })}
          />
          <TextControl
            label={__("Message field label", "doclap")}
            value={attributes.messageLabel ?? ""}
            onChange={(messageLabel) => setAttributes({ messageLabel })}
          />
          <TextControl
            label={__("Message placeholder", "doclap")}
            value={attributes.messagePlaceholder ?? ""}
            onChange={(messagePlaceholder) =>
              setAttributes({ messagePlaceholder })
            }
          />
          <TextareaControl
            label={__("Consent label", "doclap")}
            value={attributes.consentLabel ?? ""}
            onChange={(consentLabel) => setAttributes({ consentLabel })}
          />
          <TextControl
            label={__("Submit button label", "doclap")}
            value={attributes.buttonLabel ?? ""}
            onChange={(buttonLabel) => setAttributes({ buttonLabel })}
          />
          <TextControl
            label={__("Submitting label", "doclap")}
            value={attributes.sendingLabel ?? ""}
            onChange={(sendingLabel) => setAttributes({ sendingLabel })}
          />
          <TextareaControl
            label={__("Success message", "doclap")}
            value={attributes.successMessage ?? ""}
            onChange={(successMessage) => setAttributes({ successMessage })}
          />
          <TextareaControl
            label={__("Error message", "doclap")}
            value={attributes.errorMessage ?? ""}
            onChange={(errorMessage) => setAttributes({ errorMessage })}
          />
          <TextareaControl
            label={__("Required-fields note", "doclap")}
            value={attributes.formNote ?? ""}
            onChange={(formNote) => setAttributes({ formNote })}
          />
        </PanelBody>

        <PanelBody title={__("Services", "doclap")} initialOpen={false}>
          <Repeater
            label={__("Services", "doclap")}
            items={services as unknown as RepeaterItem[]}
            fields={[
              { key: "value", label: __("Submitted value", "doclap") },
              { key: "label", label: __("Label", "doclap") },
            ]}
            createItem={() => ({ value: "", label: "" })}
            onChange={(items) =>
              setAttributes({
                services: items as unknown as ServiceOption[],
              })
            }
            getItemLabel={(item, index) =>
              String(item.label || item.value || `#${index + 1}`)
            }
            addLabel={__("Add service", "doclap")}
            emptyLabel={__("No services yet.", "doclap")}
            minimumItems={1}
          />
        </PanelBody>
        <ColourControls
          attributes={attributes}
          setAttributes={setAttributes}
        />
      </InspectorControls>
      <BlockPreview block="doclap/contact-form" attributes={attributes} />
      <RichTextOverlay
        targets={overlayTargets}
        attributes={attributes}
        setAttributes={(next) =>
          setAttributes(next as Partial<ContactFormAttributes>)
        }
        isSelected={isSelected}
      />
    </>
  );
}
