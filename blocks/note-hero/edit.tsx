import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import type { NoteHeroAttributes } from './types';

interface EditProps {
	attributes: NoteHeroAttributes;
	setAttributes: (attributes: Partial<NoteHeroAttributes>) => void;
	isSelected: boolean;
}

export default function Edit({
	attributes,
	setAttributes,
}: EditProps): JSX.Element {
	/*
	 * The title and the excerpt come from the queried post, which is
	 * authoritative, so the block declares no copy attribute and has nothing to
	 * edit in place: the inspector only owns the four breadcrumb strings and no
	 * `RichTextOverlay` is mounted.
	 */
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Breadcrumb', 'doclap')} initialOpen>
					<TextControl
						label={__('Home breadcrumb label', 'doclap')}
						value={attributes.breadcrumbHomeLabel ?? ''}
						onChange={(breadcrumbHomeLabel) => setAttributes({ breadcrumbHomeLabel })}
					/>
					<TextControl
						label={__('Archive breadcrumb label', 'doclap')}
						value={attributes.archiveLabel ?? ''}
						onChange={(archiveLabel) => setAttributes({ archiveLabel })}
					/>
					<TextControl
						label={__('Archive URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.archiveUrl ?? ''}
						onChange={(archiveUrl) => setAttributes({ archiveUrl })}
					/>
					<TextControl
						label={__('Article breadcrumb label', 'doclap')}
						value={attributes.articleLabel ?? ''}
						onChange={(articleLabel) => setAttributes({ articleLabel })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview
				block="doclap/note-hero"
				attributes={attributes}
				notice={__(
					'Previewing the currently queried post. On non-post editor screens, deterministic sample copy is shown.',
					'doclap',
				)}
			/>
		</>
	);
}
