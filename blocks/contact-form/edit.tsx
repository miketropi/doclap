import { InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  TextControl,
  TextareaControl,
} from "@wordpress/components";
import { useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

import BlockPreview from "../../resources/ts/editor/block-preview";
import Repeater, {
  type RepeaterItem,
} from "../../resources/ts/editor/repeater";
import RichTextOverlay, {
  type RichTextTarget,
} from "../../resources/ts/editor/rich-text-overlay";
import { urlHelpWithStructuralNote } from "../../resources/ts/editor/url-help";
import {
  mergeAccent,
  needsAccentMerge,
} from "../../resources/ts/editor/accent-migration";
import type { ContactFormAttributes, ServiceOption } from "./types";

interface EditProps {
  attributes: ContactFormAttributes;
  setAttributes: (attributes: Partial<ContactFormAttributes>) => void;
  isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
  { path: "heading", label: __("Heading", "doclap"), multiline: true },
  { path: "lead", label: __("Lead", "doclap"), multiline: true },
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

  // One-shot legacy fold: saved content can still carry `headingAccent`.
  // `needsAccentMerge()` is false as soon as the accent is empty, so this runs
  // once per block and never on a keystroke.
  useEffect(() => {
    const legacyAccent = String(attributes.headingAccent ?? "");

    if (needsAccentMerge(attributes.heading ?? "", legacyAccent)) {
      setAttributes({
        heading: mergeAccent(attributes.heading ?? "", legacyAccent, "<br><em>"),
        headingAccent: "",
      });
    }
  }, [attributes.headingAccent, setAttributes]);

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Hero", "doclap")} initialOpen>
          <TextControl
            label={__("Home breadcrumb", "doclap")}
            value={attributes.breadcrumbHomeLabel ?? ""}
            onChange={(breadcrumbHomeLabel) =>
              setAttributes({ breadcrumbHomeLabel })
            }
          />
          <TextControl
            label={__("Page breadcrumb", "doclap")}
            value={attributes.breadcrumbLabel ?? ""}
            onChange={(breadcrumbLabel) => setAttributes({ breadcrumbLabel })}
          />
        </PanelBody>

        <PanelBody title={__("Aside", "doclap")} initialOpen={false}>
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
