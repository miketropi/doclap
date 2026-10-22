import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
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
import type { PricingPlan, PricingPlansAttributes } from './types';

interface EditProps {
	attributes: PricingPlansAttributes;
	setAttributes: (attributes: Partial<PricingPlansAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'pricingHeading', label: __('Heading', 'doclap'), multiline: true },
];

/**
 * The feature list, edited inside the plan's item editor.
 *
 * `features` is a plain list of strings, so it is edited as one-per-line text
 * instead of as a nested repeater: the nested repeater shape is an array of
 * records and would change the persisted attribute shape of a shipped block.
 */
function planFeatures(
	draft: RepeaterItem,
	update: (patch: Partial<RepeaterItem>) => void,
): JSX.Element {
	const features = Array.isArray(draft.features)
		? draft.features.map((feature) => String(feature ?? ''))
		: [];

	return (
		<TextareaControl
			label={__('Features', 'doclap')}
			help={__('One feature per line.', 'doclap')}
			value={features.join('\n')}
			onChange={(value) =>
				update({
					features: value
						.split('\n')
						.map((line) => line.trim())
						.filter((line) => '' !== line),
				})
			}
			rows={4}
		/>
	);
}

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const plans = attributes.plans ?? [];

	// One-shot legacy fold: saved content can still carry `pricingHeadingAccent`.
	// `needsAccentMerge()` is false as soon as the accent is empty, so this runs
	// once per block and never on a keystroke.
	useEffect(() => {
		const legacyAccent = String(attributes.pricingHeadingAccent ?? '');

		if (needsAccentMerge(attributes.pricingHeading ?? '', legacyAccent)) {
			setAttributes({
				pricingHeading: mergeAccent(
					attributes.pricingHeading ?? '',
					legacyAccent,
					'<br><em>',
				),
				pricingHeadingAccent: '',
			});
		}
	}, [attributes.pricingHeadingAccent, setAttributes]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.pricingEyebrow ?? ''}
						onChange={(pricingEyebrow) => setAttributes({ pricingEyebrow })}
					/>
					<TextControl
						label={__('Description', 'doclap')}
						help={__(
							'Printed under the heading. Left empty it is not rendered at all.',
							'doclap',
						)}
						value={attributes.pricingText ?? ''}
						onChange={(pricingText) => setAttributes({ pricingText })}
					/>
					<TextControl
						label={__('Small print', 'doclap')}
						value={attributes.note ?? ''}
						onChange={(note) => setAttributes({ note })}
					/>
				</PanelBody>

				<PanelBody title={__('Mode toggle', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Accessible group label', 'doclap')}
						value={attributes.modeGroupLabel ?? ''}
						onChange={(modeGroupLabel) => setAttributes({ modeGroupLabel })}
					/>
					<TextControl
						label={__('Project mode label', 'doclap')}
						value={attributes.modeProjectLabel ?? ''}
						onChange={(modeProjectLabel) =>
							setAttributes({ modeProjectLabel })
						}
					/>
					<TextControl
						label={__('Ongoing mode label', 'doclap')}
						value={attributes.modeOngoingLabel ?? ''}
						onChange={(modeOngoingLabel) =>
							setAttributes({ modeOngoingLabel })
						}
					/>
					<SelectControl
						label={__('Default mode', 'doclap')}
						help={__(
							'The mode the server renders, and therefore the one that shows without JavaScript. Both modes are always printed into the cards.',
							'doclap',
						)}
						options={[
							{ label: __('Project-based', 'doclap'), value: 'project' },
							{ label: __('Ongoing', 'doclap'), value: 'ongoing' },
						]}
						value={'ongoing' === attributes.modeDefault ? 'ongoing' : 'project'}
						onChange={(value) =>
							setAttributes({
								modeDefault: 'ongoing' === value ? 'ongoing' : 'project',
							})
						}
					/>
				</PanelBody>

				<PanelBody title={__('Plans', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Plans', 'doclap')}
						items={plans as unknown as RepeaterItem[]}
						fields={[
							{ key: 'meta', label: __('Metadata', 'doclap') },
							{ key: 'metaExtra', label: __('Metadata extra', 'doclap') },
							{
								key: 'title',
								label: __('Title', 'doclap'),
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
								key: 'featured',
								label: __('Featured card', 'doclap'),
								control: 'toggle',
								help: __(
									'Adds the accent rule and the surface background.',
									'doclap',
								),
							},
							{ key: 'priceProject', label: __('Project price', 'doclap') },
							{ key: 'priceOngoing', label: __('Ongoing price', 'doclap') },
							{
								key: 'captionProject',
								label: __('Project caption', 'doclap'),
							},
							{
								key: 'captionOngoing',
								label: __('Ongoing caption', 'doclap'),
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
							setAttributes({ plans: items as unknown as PricingPlan[] })
						}
						createItem={() => ({
							meta: '',
							metaExtra: '',
							title: __('New plan', 'doclap'),
							copy: '',
							featured: false,
							priceProject: '',
							priceOngoing: '',
							captionProject: '',
							captionOngoing: '',
							features: [],
							ctaLabel: '',
							ctaUrl: '',
						})}
						renderItemExtras={planFeatures}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.title ?? '')) ||
							sprintf(__('Plan %d', 'doclap'), index + 1)
						}
						addLabel={__('Add plan', 'doclap')}
						emptyLabel={__('No plans yet.', 'doclap')}
					/>
					{0 === plans.length ? (
						<p className="doclap-repeater__empty">
							{__(
								'Without plans the section prints its heading and small print only.',
								'doclap',
							)}
						</p>
					) : null}
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/pricing-plans" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<PricingPlansAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
