import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import {
	mergeAccent,
	needsAccentMerge,
	truncateLabel,
} from '../../resources/ts/editor/accent-migration';
import type { CapabilityTab, CapabilityTabsAttributes } from './types';

interface EditProps {
	attributes: CapabilityTabsAttributes;
	setAttributes: (attributes: Partial<CapabilityTabsAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'tabsHeading', label: __('Heading', 'doclap'), multiline: true },
];

/**
 * Deliverable chips for one tab, rendered inside the tab's own item editor.
 *
 * The stored attribute is a list of plain strings, so the nested repeater edits
 * `{ value }` records and maps them straight back — the same shape the repeaters
 * of `split-narrative` and `contact-form` use for their string lists.
 */
function tabDeliverables(
	draft: RepeaterItem,
	update: (patch: Partial<RepeaterItem>) => void,
): JSX.Element {
	const values = Array.isArray(draft.deliverables)
		? (draft.deliverables as unknown[]).map((value) => ({
				value: String(value ?? ''),
			}))
		: [];

	return (
		<Repeater
			label={__('Deliverables', 'doclap')}
			items={values as RepeaterItem[]}
			fields={[{ key: 'value', label: __('Deliverable', 'doclap') }]}
			onChange={(items) =>
				update({
					deliverables: items.map((item) => String(item.value ?? '')),
				})
			}
			createItem={() => ({ value: '' })}
			getItemLabel={(item, index) =>
				String(item.value ?? '').trim() ||
				sprintf(__('Deliverable %d', 'doclap'), index + 1)
			}
			addLabel={__('Add deliverable', 'doclap')}
			emptyLabel={__('No deliverables yet.', 'doclap')}
		/>
	);
}

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const tabs = attributes.tabs ?? [];

	// One-shot legacy fold. A block saved with the split accent still carries the
	// accent key; `needsAccentMerge()` is false as soon as it is empty, so this
	// runs once per block and never on a keystroke.
	useEffect(() => {
		const legacyAccent = String(attributes.tabsHeadingAccent ?? '');

		if (needsAccentMerge(attributes.tabsHeading ?? '', legacyAccent)) {
			setAttributes({
				tabsHeading: mergeAccent(attributes.tabsHeading ?? '', legacyAccent, '<br>'),
				tabsHeadingAccent: '',
			});
		}
	}, [attributes.tabsHeadingAccent, setAttributes]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.tabsEyebrow ?? ''}
						onChange={(tabsEyebrow) => setAttributes({ tabsEyebrow })}
					/>
					<TextControl
						label={__('Tab list label', 'doclap')}
						help={__(
							'Names the tab list for assistive technology.',
							'doclap',
						)}
						value={attributes.tabsLabel ?? ''}
						onChange={(tabsLabel) => setAttributes({ tabsLabel })}
					/>
				</PanelBody>

				<PanelBody title={__('Tabs', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Tabs', 'doclap')}
						items={tabs as unknown as RepeaterItem[]}
						fields={[
							{ key: 'index', label: __('Number', 'doclap') },
							{ key: 'label', label: __('Label', 'doclap') },
							{
								key: 'heading',
								label: __('Heading', 'doclap'),
								control: 'rich',
								tagName: 'h3',
							},
							{
								key: 'copy',
								label: __('Copy', 'doclap'),
								control: 'rich',
								tagName: 'p',
								multiline: true,
							},
							{
								key: 'ctaLabel',
								label: __('Link label', 'doclap'),
								control: 'rich',
								tagName: 'span',
							},
							{
								key: 'ctaUrl',
								label: __('Link URL', 'doclap'),
								help: urlHelpWithStructuralNote,
							},
						]}
						onChange={(items) =>
							setAttributes({ tabs: items as unknown as CapabilityTab[] })
						}
						createItem={() => ({
							index: '',
							label: __('New tab', 'doclap'),
							heading: '',
							copy: '',
							deliverables: [],
							ctaLabel: '',
							ctaUrl: '',
						})}
						renderItemExtras={tabDeliverables}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.label ?? '')) ||
							sprintf(__('Tab %d', 'doclap'), index + 1)
						}
						addLabel={__('Add tab', 'doclap')}
						emptyLabel={__('No tabs yet.', 'doclap')}
						minimumItems={1}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/capability-tabs" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<CapabilityTabsAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
