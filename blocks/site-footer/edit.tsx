import { InspectorControls } from "@wordpress/block-editor";
import {
  Button,
  PanelBody,
  TextControl,
  TextareaControl,
} from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import ServerSideRender from "@wordpress/server-side-render";

import Repeater, {
  type RepeaterItem,
} from "../../resources/ts/editor/repeater";
import type { FooterNavGroup, SiteFooterAttributes } from "./types";

interface EditProps {
  attributes: SiteFooterAttributes;
  setAttributes: (attributes: Partial<SiteFooterAttributes>) => void;
}

const linkFields = [
  { key: "label", label: __("Label", "doclap") },
  {
    key: "url",
    label: __("URL", "doclap"),
    help: __("Use #section, a site path, @notes, or @search.", "doclap"),
  },
];

export default function Edit({
  attributes,
  setAttributes,
}: EditProps): JSX.Element {
  const navGroups = attributes.navGroups ?? [];
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
          <TextareaControl
            label={__("Heading", "doclap")}
            help={__("Line breaks are preserved.", "doclap")}
            value={attributes.heading ?? ""}
            rows={2}
            onChange={(heading) => setAttributes({ heading })}
          />
          <TextareaControl
            label={__("Introduction", "doclap")}
            help={__("Line breaks are preserved.", "doclap")}
            value={attributes.intro ?? ""}
            rows={2}
            onChange={(intro) => setAttributes({ intro })}
          />
          <TextControl
            label={__("Call to action label", "doclap")}
            value={attributes.ctaLabel ?? ""}
            onChange={(ctaLabel) => setAttributes({ ctaLabel })}
          />
          <TextControl
            label={__("Call to action URL", "doclap")}
            value={attributes.ctaUrl ?? ""}
            onChange={(ctaUrl) => setAttributes({ ctaUrl })}
          />
        </PanelBody>

        <PanelBody
          title={__("Navigation groups", "doclap")}
          initialOpen={false}
        >
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
          <TextControl
            label={__("Brand text", "doclap")}
            value={attributes.brandText ?? ""}
            onChange={(brandText) => setAttributes({ brandText })}
          />
          <TextControl
            label={__("Brand mark", "doclap")}
            value={attributes.brandMark ?? ""}
            onChange={(brandMark) => setAttributes({ brandMark })}
          />
          <TextControl
            label={__("Brand URL", "doclap")}
            help={__("Leave empty for the site home.", "doclap")}
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
            help={__("The privacy link is omitted when empty.", "doclap")}
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
      </InspectorControls>
      <ServerSideRender
        block="doclap/site-footer"
        attributes={attributes as unknown as Record<string, unknown>}
      />
    </>
  );
}
