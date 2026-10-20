import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { truncateLabel } from '../../resources/ts/editor/accent-migration';
import type { Principle, PrinciplesGridAttributes } from './types';

interface EditProps {
	attributes: PrinciplesGridAttributes;
	setAttributes: (attributes: Partial<PrinciplesGridAttributes>) => void;
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
	const principles = attributes.principles ?? [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.eyebrow ?? ''}
						onChange={(eyebrow) => setAttributes({ eyebrow })}
					/>
				</PanelBody>

				<PanelBody title={__('Principles', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Principles', 'doclap')}
						items={principles as unknown as RepeaterItem[]}
						fields={[
							{ key: 'label', label: __('Label', 'doclap') },
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
							setAttributes({
								principles: items as unknown as Principle[],
							})
						}
						createItem={() => ({ label: '', title: '', copy: '' })}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.title ?? '')) ||
							sprintf(__('Principle %d', 'doclap'), index + 1)
						}
						addLabel={__('Add principle', 'doclap')}
						emptyLabel={__('No principles yet.', 'doclap')}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/principles-grid" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<PrinciplesGridAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
