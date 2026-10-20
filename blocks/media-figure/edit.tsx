import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import MediaControl from '../../resources/ts/editor/media-control';
import type { MediaFigureAttributes } from './types';

interface EditProps {
	attributes: MediaFigureAttributes;
	setAttributes: (attributes: Partial<MediaFigureAttributes>) => void;
	isSelected: boolean;
}

export default function Edit({
	attributes,
	setAttributes,
}: EditProps): JSX.Element {
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Media', 'doclap')} initialOpen>
					<MediaControl
						value={{
							id: attributes.imageId ?? 0,
							url: attributes.imageUrl ?? '',
							alt: attributes.imageAlt ?? '',
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
								imageId: media.id,
								imageUrl: media.url,
								imageAlt: media.alt,
							})
						}
						onRemove={() => setAttributes({ imageId: 0, imageUrl: '' })}
						onChangeAlt={(imageAlt) => setAttributes({ imageAlt })}
						caption={attributes.caption ?? ''}
						onChangeCaption={(caption) => setAttributes({ caption })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/media-figure" attributes={attributes} />
		</>
	);
}
