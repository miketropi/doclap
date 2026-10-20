import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import type { RelatedNotesAttributes } from './types';

interface EditProps {
	attributes: RelatedNotesAttributes;
	setAttributes: (attributes: Partial<RelatedNotesAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'heading', label: __('Heading', 'doclap'), multiline: true },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Related notes', 'doclap')} initialOpen>
					<RangeControl
						label={__('Number of related notes', 'doclap')}
						min={0}
						max={6}
						value={attributes.count ?? 2}
						onChange={(count) => setAttributes({ count: count ?? 2 })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			{/* The heading is rich text edited in place on the canvas. */}
			<BlockPreview
				block="doclap/related-notes"
				attributes={attributes}
				notice={__(
					'The list fills from the categories of the queried post first and then from the latest notes. Without a queried post the empty state is shown.',
					'doclap',
				)}
			/>
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<RelatedNotesAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
