import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import type { NoteContentAttributes } from './types';

interface EditProps {
	attributes: NoteContentAttributes;
	setAttributes: (attributes: Partial<NoteContentAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'disclaimer', label: __('Disclaimer', 'doclap'), multiline: true },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Table of contents and links', 'doclap')} initialOpen>
					<TextControl
						label={__('Table of contents label', 'doclap')}
						value={attributes.tocLabel ?? ''}
						onChange={(tocLabel) => setAttributes({ tocLabel })}
					/>
					<SelectControl
						label={__('When there are no H2 headings', 'doclap')}
						value={attributes.tocEmptyBehaviour}
						options={[
							{ label: __('Hide table of contents', 'doclap'), value: 'hide' },
							{ label: __('Show an empty message', 'doclap'), value: 'message' },
						]}
						onChange={(tocEmptyBehaviour) =>
							setAttributes({
								tocEmptyBehaviour: 'message' === tocEmptyBehaviour ? 'message' : 'hide',
							})
						}
					/>
					<TextControl
						label={__('Back link label', 'doclap')}
						value={attributes.backToArchiveLabel ?? ''}
						onChange={(backToArchiveLabel) => setAttributes({ backToArchiveLabel })}
					/>
					<TextControl
						label={__('Archive URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.archiveUrl ?? ''}
						onChange={(archiveUrl) => setAttributes({ archiveUrl })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			{/* The disclaimer is rich text edited in place on the canvas. */}
			<BlockPreview
				block="doclap/note-content"
				attributes={attributes}
				notice={__(
					'Previewing the currently queried post. On non-post editor screens, deterministic sample copy is shown.',
					'doclap',
				)}
			/>
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<NoteContentAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
