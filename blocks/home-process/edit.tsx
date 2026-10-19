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
import type { HomeProcessAttributes, ProcessStep } from './types';

interface EditProps {
	attributes: HomeProcessAttributes;
	setAttributes: (attributes: Partial<HomeProcessAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'processHeading', label: __('Heading', 'doclap'), multiline: true },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const steps = attributes.processSteps ?? [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.processEyebrow ?? ''}
						onChange={(processEyebrow) => setAttributes({ processEyebrow })}
					/>
				</PanelBody>

				<PanelBody title={__('Process steps', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Steps', 'doclap')}
						items={steps as unknown as RepeaterItem[]}
						fields={[
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
							setAttributes({ processSteps: items as unknown as ProcessStep[] })
						}
						createItem={() => ({ title: __('New step', 'doclap'), copy: '' })}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.title ?? '')) ||
							sprintf(__('Step %d', 'doclap'), index + 1)
						}
						addLabel={__('Add step', 'doclap')}
						emptyLabel={__('No steps yet.', 'doclap')}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/home-process" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<HomeProcessAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
