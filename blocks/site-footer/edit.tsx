import { InspectorControls } from "@wordpress/block-editor";
import {
  Button,
  PanelBody,
  SelectControl,
  TextControl,
} from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";

import BlockPreview from "../../resources/ts/editor/block-preview";
import ColourControls from "../../resources/ts/editor/colour-controls";
import MediaControl from "../../resources/ts/editor/media-control";
import Repeater, {
  type RepeaterField,
  type RepeaterItem,
} from "../../resources/ts/editor/repeater";
import RichTextOverlay, {
  type RichTextTarget,
} from "../../resources/ts/editor/rich-text-overlay";
import { urlHelp } from "../../resources/ts/editor/url-help";
import type { FooterNavGroup, SiteFooterAttributes } from "./types";

interface EditProps {
  attributes: SiteFooterAttributes;
  setAttributes: (attributes: Partial<SiteFooterAttributes>) => void;
  isSelected: boolean;
}

const linkFields: RepeaterField[] = [
  { key: "label", label: __("Label", "doclap") },
  { key: "url", label: __("URL", "doclap"), help: urlHelp },
];

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
  { path: "heading", label: __("Heading", "doclap"), multiline: true },
  { path: "intro", label: __("Introduction", "doclap"), multiline: true },
  { path: "ctaLabel", label: __("Call to action label", "doclap") },
];

export default function Edit({
  attributes,
  setAttributes,
  isSelected,
}: EditProps): JSX.Element {
  const navGroups = attributes.navGroups ?? [];
  const brandMode = "image" === attributes.brandMode ? "image" : "text";
  const updateGroup = (index: number, patch: Partial<FooterNavGroup>): void => {
    setAttributes({
      navGroups: navGroups.map((group, position) =>
        position === index ? { ...group, ...patch } : group,
      ),
    });
  };

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Introduction", "doclap")} initialOpen>
          <TextControl
            label={__("Kicker", "doclap")}
            value={attributes.kicker ?? ""}
            onChange={(kicker) => setAttributes({ kicker })}
          />
          <TextControl
            label={__("Call to action URL", "doclap")}
            help={urlHelp}
            value={attributes.ctaUrl ?? ""}
            onChange={(ctaUrl) => setAttributes({ ctaUrl })}
          />
        </PanelBody>

        <PanelBody title={__("Navigation groups", "doclap")} initialOpen={false}>
          <Button
            variant="secondary"
            onClick={() =>
              setAttributes({
                navGroups: [
                  ...navGroups,
                  {
                    kicker: __("NEW GROUP", "doclap"),
                    ariaLabel: __("Footer navigation", "doclap"),
                    links: [],
                  },
                ],
              })
            }
          >
            {__("Add group", "doclap")}
          </Button>
          <p className="doclap-repeater__empty">
            {__("Each group below is edited in its own section.", "doclap")}
          </p>
        </PanelBody>

        {navGroups.map((group, index) => (
          <PanelBody
            key={index}
            title={sprintf(
              __("Navigation: %s", "doclap"),
              group.kicker || String(index + 1),
            )}
            initialOpen={false}
          >
            <TextControl
              label={__("Kicker", "doclap")}
              value={group.kicker ?? ""}
              onChange={(kicker) => updateGroup(index, { kicker })}
            />
            <TextControl
              label={__("Accessible navigation label", "doclap")}
              value={group.ariaLabel ?? ""}
              onChange={(ariaLabel) => updateGroup(index, { ariaLabel })}
            />
            <Repeater
              label={__("Links", "doclap")}
              items={(group.links ?? []) as unknown as RepeaterItem[]}
              fields={linkFields}
              onChange={(items) =>
                updateGroup(index, {
                  links: items as unknown as FooterNavGroup["links"],
                })
              }
              createItem={() => ({ label: __("New link", "doclap"), url: "" })}
              getItemLabel={(item) =>
                String(item.label || __("Link", "doclap"))
              }
              addLabel={__("Add link", "doclap")}
              emptyLabel={__("No links yet.", "doclap")}
              minimumItems={1}
            />
            <Button
              variant="tertiary"
              isDestructive
              onClick={() =>
                setAttributes({
                  navGroups: navGroups.filter(
                    (_, position) => position !== index,
                  ),
                })
              }
            >
              {__("Remove group", "doclap")}
            </Button>
          </PanelBody>
        ))}

        <PanelBody
          title={__("Brand and colophon", "doclap")}
          initialOpen={false}
        >
          <SelectControl
            label={__("Brand source", "doclap")}
            options={[
              { label: __("Text", "doclap"), value: "text" },
              { label: __("Image", "doclap"), value: "image" },
            ]}
            value={brandMode}
            onChange={(value) =>
              setAttributes({ brandMode: "image" === value ? "image" : "text" })
            }
            help={
              "image" === brandMode
                ? __(
                    "Until a logo is selected the brand text is used instead.",
                    "doclap",
                  )
                : undefined
            }
          />
          {"image" === brandMode ? (
            <MediaControl
              value={{
                id: attributes.brandMediaId ?? 0,
                url: attributes.brandMediaUrl ?? "",
                alt: attributes.brandMediaAlt ?? "",
              }}
              labels={{
                title: __("Brand logo", "doclap"),
                select: __(
                  "Select a logo from the media library or upload a new one.",
                  "doclap",
                ),
                replace: __("Replace logo", "doclap"),
                remove: __("Remove logo", "doclap"),
                alt: __("Logo alternative text", "doclap"),
                altHelp: __(
                  "Read out instead of the logo. The media library value, then the site name, are used while this is empty.",
                  "doclap",
                ),
              }}
              onSelect={(media) =>
                setAttributes({
                  brandMediaId: media.id,
                  brandMediaUrl: media.url,
                  brandMediaAlt: media.alt,
                })
              }
              onRemove={() =>
                setAttributes({
                  brandMediaId: 0,
                  brandMediaUrl: "",
                  brandMediaAlt: "",
                })
              }
              onChangeAlt={(brandMediaAlt) => setAttributes({ brandMediaAlt })}
            />
          ) : (
            <>
              <TextControl
                label={__("Brand text", "doclap")}
                value={attributes.brandText ?? ""}
                onChange={(brandText) => setAttributes({ brandText })}
              />
              <TextControl
                label={__("Brand mark", "doclap")}
                help={__("Rendered as a superscript, e.g. ®.", "doclap")}
                value={attributes.brandMark ?? ""}
                onChange={(brandMark) => setAttributes({ brandMark })}
              />
            </>
          )}
          <TextControl
            label={__("Brand URL", "doclap")}
            help={`${urlHelp} ${__("Leave empty to link to the site home.", "doclap")}`}
            value={attributes.brandUrl ?? ""}
            onChange={(brandUrl) => setAttributes({ brandUrl })}
          />
          <TextControl
            label={__("Copyright prefix", "doclap")}
            value={attributes.copyrightPrefix ?? ""}
            onChange={(copyrightPrefix) => setAttributes({ copyrightPrefix })}
          />
          <TextControl
            label={__("Copyright text", "doclap")}
            value={attributes.copyrightText ?? ""}
            onChange={(copyrightText) => setAttributes({ copyrightText })}
          />
          <TextControl
            label={__("Signature", "doclap")}
            value={attributes.signature ?? ""}
            onChange={(signature) => setAttributes({ signature })}
          />
          <TextControl
            label={__("Privacy label", "doclap")}
            value={attributes.privacyLabel ?? ""}
            onChange={(privacyLabel) => setAttributes({ privacyLabel })}
          />
          <TextControl
            label={__("Privacy URL", "doclap")}
            help={`${urlHelp} ${__("The privacy link is omitted when empty.", "doclap")}`}
            value={attributes.privacyUrl ?? ""}
            onChange={(privacyUrl) => setAttributes({ privacyUrl })}
          />
          <TextControl
            label={__("Back-to-top label", "doclap")}
            value={attributes.backToTopLabel ?? ""}
            onChange={(backToTopLabel) => setAttributes({ backToTopLabel })}
          />
          <TextControl
            label={__("Footer accessible label", "doclap")}
            value={attributes.footerAriaLabel ?? ""}
            onChange={(footerAriaLabel) => setAttributes({ footerAriaLabel })}
          />
        </PanelBody>
        <ColourControls
          attributes={attributes}
          setAttributes={setAttributes}
        />
      </InspectorControls>
      <BlockPreview block="doclap/site-footer" attributes={attributes} />
      <RichTextOverlay
        targets={overlayTargets}
        attributes={attributes}
        setAttributes={(next) =>
          setAttributes(next as Partial<SiteFooterAttributes>)
        }
        isSelected={isSelected}
      />
    </>
  );
}
