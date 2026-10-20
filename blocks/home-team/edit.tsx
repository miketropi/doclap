import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import MediaControl from '../../resources/ts/editor/media-control';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import { truncateLabel } from '../../resources/ts/editor/accent-migration';
import type { HomeTeamAttributes, TeamCard } from './types';

interface EditProps {
	attributes: HomeTeamAttributes;
	setAttributes: (attributes: Partial<HomeTeamAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'teamHeading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'teamIntro', label: __('Introduction', 'doclap'), multiline: true },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const cards = attributes.teamCards ?? [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Metadata', 'doclap')}
						value={attributes.teamMeta ?? ''}
						onChange={(teamMeta) => setAttributes({ teamMeta })}
					/>
				</PanelBody>

				<PanelBody title={__('Image', 'doclap')} initialOpen={false}>
					<MediaControl
						value={{
							id: attributes.teamImageId ?? 0,
							url: attributes.teamImageUrl ?? '',
							alt: attributes.teamImageAlt ?? '',
						}}
						labels={{
							title: __('Collaboration image', 'doclap'),
							select: __(
								'Select an image from the media library or upload a new one.',
								'doclap',
							),
							replace: __('Replace image', 'doclap'),
							remove: __('Remove image', 'doclap'),
							alt: __('Alternative text', 'doclap'),
							caption: __('Caption', 'doclap'),
						}}
						onSelect={(media) =>
							setAttributes({
								teamImageId: media.id,
								teamImageUrl: media.url,
								teamImageAlt: media.alt,
							})
						}
						onRemove={() => setAttributes({ teamImageId: 0, teamImageUrl: '' })}
						onChangeAlt={(teamImageAlt) => setAttributes({ teamImageAlt })}
						caption={attributes.teamImageCaption ?? ''}
						onChangeCaption={(teamImageCaption) =>
							setAttributes({ teamImageCaption })
						}
					/>
				</PanelBody>

				<PanelBody title={__('Cards', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Team cards', 'doclap')}
						items={cards as unknown as RepeaterItem[]}
						fields={[
							{ key: 'meta', label: __('Metadata', 'doclap') },
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
								key: 'ctaLabel',
								label: __('CTA label', 'doclap'),
								control: 'rich',
								tagName: 'span',
							},
							{
								key: 'ctaUrl',
								label: __('CTA URL', 'doclap'),
								help: urlHelpWithStructuralNote,
							},
						]}
						onChange={(items) =>
							setAttributes({ teamCards: items as unknown as TeamCard[] })
						}
						createItem={() => ({
							meta: '',
							title: __('New card', 'doclap'),
							copy: '',
							ctaLabel: '',
							ctaUrl: '',
						})}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.title ?? '')) ||
							sprintf(__('Card %d', 'doclap'), index + 1)
						}
						addLabel={__('Add card', 'doclap')}
						emptyLabel={__('No cards yet.', 'doclap')}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/home-team" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<HomeTeamAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
