import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import type { NoteCoverAttributes } from './types';

interface EditProps {
	attributes: NoteCoverAttributes;
	setAttributes: (attributes: Partial<NoteCoverAttributes>) => void;
	isSelected: boolean;
}

export default function Edit({
	attributes,
	setAttributes,
}: EditProps): JSX.Element {
	/*
	 * The category, the reading time and the artwork come from the queried post,
	 * so the only editable value is the metadata prefix, which the renderer
	 * prints as plain text: there is nothing to edit in place and no
	 * `RichTextOverlay` is mounted.
	 */
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Article metadata', 'doclap')} initialOpen>
					<TextControl
						label={__('Metadata prefix', 'doclap')}
						value={attributes.articleMetaPrefix ?? ''}
						onChange={(articleMetaPrefix) => setAttributes({ articleMetaPrefix })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview
				block="doclap/note-cover"
				attributes={attributes}
				notice={__(
					'Previewing the currently queried post. On non-post editor screens, deterministic sample copy is shown.',
					'doclap',
				)}
			/>
		</>
	);
}
