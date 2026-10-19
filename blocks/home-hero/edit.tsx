import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import ImageControl from '../../resources/ts/editor/image-control';
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
import type { HeroPanel, HomeHeroAttributes } from './types';

interface EditProps {
	attributes: HomeHeroAttributes;
	setAttributes: (attributes: Partial<HomeHeroAttributes>) => void;
	isSelected: boolean;
}

/**
 * The two visible hero values that map to a stable on-canvas element.
 *
 * Both panels are declared: the renderer marks both, the overlay draws a box only
 * for the panel that is actually shown (the inactive one is `hidden inert`, i.e.
 * zero size, and is skipped), and the item editor keeps covering both. The heading
 * is a merged rich value, so it carries `<br><em>…</em>` and is edited as HTML.
 */
const overlayTargets: RichTextTarget[] = [
	{ path: 'heroPanels.0.heading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'heroPanels.0.lead', label: __('Lead', 'doclap'), multiline: true },
	{ path: 'heroPanels.0.linkLabel', label: __('Link label', 'doclap') },
	{
		path: 'heroPanels.1.heading',
		label: __('Heading (second view)', 'doclap'),
		multiline: true,
	},
	{
		path: 'heroPanels.1.lead',
		label: __('Lead (second view)', 'doclap'),
		multiline: true,
	},
	{
		path: 'heroPanels.1.linkLabel',
		label: __('Link label (second view)', 'doclap'),
	},
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const panels = attributes.heroPanels ?? [];

	// One-shot legacy fold. Every view saved before the merge keeps its accent in
	// a separate key; `needsAccentMerge()` is false as soon as that key is empty,
	// so this runs once per block and never on a keystroke.
	useEffect(() => {
		let folded = false;
		const next = panels.map((panel) => {
			const legacyAccent = String(panel.headingAccent ?? '');

			if (!needsAccentMerge(panel.heading ?? '', legacyAccent)) {
				return panel;
			}

			folded = true;
			const merged: HeroPanel = {
				...panel,
				heading: mergeAccent(panel.heading ?? '', legacyAccent, '<br><em>'),
			};
			delete merged.headingAccent;

			return merged;
		});

		if (folded) {
			setAttributes({ heroPanels: next });
		}
	}, [attributes.heroPanels, setAttributes]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Kicker', 'doclap')}
						value={attributes.heroKicker ?? ''}
						onChange={(heroKicker) => setAttributes({ heroKicker })}
					/>
					<TextControl
						label={__('Edition', 'doclap')}
						value={attributes.heroEdition ?? ''}
						onChange={(heroEdition) => setAttributes({ heroEdition })}
					/>
					<Repeater
						label={__('Views', 'doclap')}
						items={panels as unknown as RepeaterItem[]}
						fields={[
							{ key: 'eyebrow', label: __('Eyebrow', 'doclap') },
							{
								key: 'heading',
								label: __('Heading', 'doclap'),
								help: __('The first view supplies the page’s only H1.', 'doclap'),
								control: 'rich',
								tagName: 'h2',
								multiline: true,
							},
							{
								key: 'lead',
								label: __('Lead', 'doclap'),
								control: 'rich',
								tagName: 'p',
								multiline: true,
							},
							{
								key: 'linkLabel',
								label: __('Link label', 'doclap'),
								control: 'rich',
								tagName: 'span',
							},
							{
								key: 'linkUrl',
								label: __('Link URL', 'doclap'),
								help: urlHelpWithStructuralNote,
							},
						]}
						onChange={(items) =>
							setAttributes({ heroPanels: items as unknown as HeroPanel[] })
						}
						createItem={() => ({
							eyebrow: '',
							heading: '',
							lead: '',
							linkLabel: '',
							linkUrl: '',
						})}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.heading ?? '')) ||
							sprintf(__('View %d', 'doclap'), index + 1)
						}
						addLabel={__('Add view', 'doclap')}
						emptyLabel={__('No creative views yet.', 'doclap')}
						minimumItems={1}
					/>
				</PanelBody>

				<PanelBody title={__('Sculpture', 'doclap')} initialOpen={false}>
					<ImageControl
						value={{
							id: attributes.posterId ?? 0,
							url: attributes.posterUrl ?? '',
							alt: attributes.posterAlt ?? '',
						}}
						labels={{
							title: __('Sculpture poster', 'doclap'),
							select: __(
								'Select an image from the media library or upload a new one.',
								'doclap',
							),
							replace: __('Replace poster', 'doclap'),
							remove: __('Remove poster', 'doclap'),
							alt: __('Poster alternative text', 'doclap'),
						}}
						onSelect={(media) =>
							setAttributes({
								posterId: media.id,
								posterUrl: media.url,
								posterAlt: media.alt,
							})
						}
						onRemove={() => setAttributes({ posterId: 0, posterUrl: '' })}
						onChangeAlt={(posterAlt) => setAttributes({ posterAlt })}
					/>
					<TextareaControl
						label={__('Credit text', 'doclap')}
						value={attributes.creditText ?? ''}
						onChange={(creditText) => setAttributes({ creditText })}
					/>
					<TextControl
						label={__('Credit URL', 'doclap')}
						value={attributes.creditUrl ?? ''}
						onChange={(creditUrl) => setAttributes({ creditUrl })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/home-hero" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<HomeHeroAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
