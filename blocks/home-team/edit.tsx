import {
	InspectorControls,
	MediaPlaceholder,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type { HomeTeamAttributes, TeamCard } from './types';

interface EditProps {
	attributes: HomeTeamAttributes;
	setAttributes: (attributes: Partial<HomeTeamAttributes>) => void;
}

interface SelectedMedia {
	id?: number;
	url?: string;
	alt?: string;
}

const LINK_HELP = __(
	'Accepts #section, /path/, @notes or @search. Changing a structural anchor needs matching header and footer links.',
	'doclap',
);

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const cards = attributes.teamCards ?? [];
	const selectImage = (media: SelectedMedia): void => {
		setAttributes({
			teamImageId: media.id ?? 0,
			teamImageUrl: media.url ?? '',
			teamImageAlt: media.alt || attributes.teamImageAlt,
		});
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Heading', 'doclap')}
						value={attributes.teamHeading ?? ''}
						onChange={(teamHeading) => setAttributes({ teamHeading })}
					/>
					<TextControl
						label={__('Metadata', 'doclap')}
						value={attributes.teamMeta ?? ''}
						onChange={(teamMeta) => setAttributes({ teamMeta })}
					/>
					<TextareaControl
						label={__('Introduction', 'doclap')}
						value={attributes.teamIntro ?? ''}
						onChange={(teamIntro) => setAttributes({ teamIntro })}
					/>
				</PanelBody>

				<PanelBody title={__('Image', 'doclap')} initialOpen={false}>
					{attributes.teamImageUrl ? (
						<MediaUploadCheck>
							<MediaUpload
								allowedTypes={['image']}
								value={attributes.teamImageId || undefined}
								onSelect={selectImage}
								render={({ open }) => (
									<>
										<Button variant="secondary" onClick={open}>
											{__('Replace image', 'doclap')}
										</Button>
										<Button
											variant="tertiary"
											isDestructive
											onClick={() =>
												setAttributes({ teamImageId: 0, teamImageUrl: '' })
											}
										>
											{__('Remove image', 'doclap')}
										</Button>
									</>
								)}
							/>
						</MediaUploadCheck>
					) : (
						<MediaPlaceholder
							allowedTypes={['image']}
							labels={{ title: __('Collaboration image', 'doclap') }}
							onSelect={selectImage}
						/>
					)}
					<TextControl
						label={__('Alternative text', 'doclap')}
						value={attributes.teamImageAlt ?? ''}
						onChange={(teamImageAlt) => setAttributes({ teamImageAlt })}
					/>
					<TextareaControl
						label={__('Caption', 'doclap')}
						value={attributes.teamImageCaption ?? ''}
						onChange={(teamImageCaption) => setAttributes({ teamImageCaption })}
					/>
				</PanelBody>

				<PanelBody title={__('Cards', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Team cards', 'doclap')}
						items={cards as unknown as RepeaterItem[]}
						fields={[
							{ key: 'meta', label: __('Metadata', 'doclap') },
							{ key: 'title', label: __('Title', 'doclap') },
							{
								key: 'copy',
								label: __('Copy', 'doclap'),
								control: 'textarea',
							},
							{ key: 'ctaLabel', label: __('CTA label', 'doclap') },
							{
								key: 'ctaUrl',
								label: __('CTA URL', 'doclap'),
								help: LINK_HELP,
							},
						]}
						onChange={(items) =>
							setAttributes({ teamCards: items as unknown as TeamCard[] })
						}
						createItem={() => ({
							meta: '',
							title: 'New card',
							copy: '',
							ctaLabel: '',
							ctaUrl: '',
						})}
						getItemLabel={(item, index) =>
							String(item.title || sprintf(__('Card %d', 'doclap'), index + 1))
						}
						addLabel={__('Add card', 'doclap')}
						emptyLabel={__('No cards yet.', 'doclap')}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/home-team"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
