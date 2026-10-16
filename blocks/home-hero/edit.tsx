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
import type { HeroPanel, HomeHeroAttributes } from './types';

interface EditProps {
	attributes: HomeHeroAttributes;
	setAttributes: (attributes: Partial<HomeHeroAttributes>) => void;
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
	const panels = attributes.heroPanels ?? [];
	const selectPoster = (media: SelectedMedia): void => {
		setAttributes({
			posterId: media.id ?? 0,
			posterUrl: media.url ?? '',
			posterAlt: media.alt || attributes.posterAlt,
		});
	};

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
							},
							{ key: 'headingAccent', label: __('Heading accent', 'doclap') },
							{
								key: 'lead',
								label: __('Lead', 'doclap'),
								control: 'textarea',
							},
							{ key: 'linkLabel', label: __('Link label', 'doclap') },
							{
								key: 'linkUrl',
								label: __('Link URL', 'doclap'),
								help: LINK_HELP,
							},
						]}
						onChange={(items) =>
							setAttributes({ heroPanels: items as unknown as HeroPanel[] })
						}
						createItem={() => ({
							eyebrow: '',
							heading: '',
							headingAccent: '',
							lead: '',
							linkLabel: '',
							linkUrl: '',
						})}
						getItemLabel={(item, index) =>
							String(
								item.headingAccent ||
									item.heading ||
									sprintf(__('View %d', 'doclap'), index + 1),
							)
						}
						addLabel={__('Add view', 'doclap')}
						emptyLabel={__('No creative views yet.', 'doclap')}
					/>
				</PanelBody>

				<PanelBody title={__('Sculpture', 'doclap')} initialOpen={false}>
					{attributes.posterUrl ? (
						<MediaUploadCheck>
							<MediaUpload
								allowedTypes={['image']}
								value={attributes.posterId || undefined}
								onSelect={selectPoster}
								render={({ open }) => (
									<>
										<Button variant="secondary" onClick={open}>
											{__('Replace poster', 'doclap')}
										</Button>
										<Button
											variant="tertiary"
											isDestructive
											onClick={() => setAttributes({ posterId: 0, posterUrl: '' })}
										>
											{__('Remove poster', 'doclap')}
										</Button>
									</>
								)}
							/>
						</MediaUploadCheck>
					) : (
						<MediaPlaceholder
							allowedTypes={['image']}
							labels={{ title: __('Sculpture poster', 'doclap') }}
							onSelect={selectPoster}
						/>
					)}
					<TextControl
						label={__('Poster alternative text', 'doclap')}
						value={attributes.posterAlt ?? ''}
						onChange={(posterAlt) => setAttributes({ posterAlt })}
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
			</InspectorControls>
			<ServerSideRender
				block="doclap/home-hero"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
