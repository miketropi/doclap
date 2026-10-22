import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import MediaControl from '../../resources/ts/editor/media-control';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import {
	mergeAccent,
	needsAccentMerge,
	truncateLabel,
} from '../../resources/ts/editor/accent-migration';
import type { RoleCard, TeamRosterAttributes } from './types';

interface EditProps {
	attributes: TeamRosterAttributes;
	setAttributes: (attributes: Partial<TeamRosterAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'teamHeading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'teamDescription', label: __('Description', 'doclap'), multiline: true },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const cards = attributes.teamCards ?? [];

	// One-shot legacy fold. A block saved with the split accent still carries the
	// accent key; `needsAccentMerge()` is false as soon as it is empty, so this
	// runs once per block and never on a keystroke.
	useEffect(() => {
		const legacyAccent = String(attributes.teamHeadingAccent ?? '');

		if (needsAccentMerge(attributes.teamHeading ?? '', legacyAccent)) {
			setAttributes({
				teamHeading: mergeAccent(attributes.teamHeading ?? '', legacyAccent, '<br>'),
				teamHeadingAccent: '',
			});
		}
	}, [attributes.teamHeadingAccent, setAttributes]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.teamEyebrow ?? ''}
						onChange={(teamEyebrow) => setAttributes({ teamEyebrow })}
					/>
					<TextControl
						label={__('Metadata', 'doclap')}
						help={__(
							'Shown beside the heading. Leave empty to omit it.',
							'doclap',
						)}
						value={attributes.teamMeta ?? ''}
						onChange={(teamMeta) => setAttributes({ teamMeta })}
					/>
					<TextControl
						label={__('Note', 'doclap')}
						value={attributes.teamNote ?? ''}
						onChange={(teamNote) => setAttributes({ teamNote })}
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
							title: __('Studio image', 'doclap'),
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
						label={__('Role cards', 'doclap')}
						items={cards as unknown as RepeaterItem[]}
						fields={[
							{ key: 'meta', label: __('Number', 'doclap') },
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
						]}
						onChange={(items) =>
							setAttributes({ teamCards: items as unknown as RoleCard[] })
						}
						createItem={() => ({
							meta: '',
							title: __('New role', 'doclap'),
							copy: '',
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
			<BlockPreview block="doclap/team-roster" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<TeamRosterAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
