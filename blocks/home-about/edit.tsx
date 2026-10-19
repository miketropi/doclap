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
import type { HomeAboutAttributes, Service } from './types';

interface EditProps {
	attributes: HomeAboutAttributes;
	setAttributes: (attributes: Partial<HomeAboutAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'aboutHeading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'aboutPrinciple', label: __('Principle', 'doclap'), multiline: true },
	{ path: 'aboutLead', label: __('Lead', 'doclap'), multiline: true },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const services = attributes.services ?? [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.aboutEyebrow ?? ''}
						onChange={(aboutEyebrow) => setAttributes({ aboutEyebrow })}
					/>
				</PanelBody>

				<PanelBody title={__('Services', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Services', 'doclap')}
						items={services as unknown as RepeaterItem[]}
						fields={[
							{
								key: 'title',
								label: __('Title', 'doclap'),
								control: 'rich',
								tagName: 'h3',
							},
							{ key: 'meta', label: __('Metadata', 'doclap') },
						]}
						onChange={(items) =>
							setAttributes({ services: items as unknown as Service[] })
						}
						createItem={() => ({ title: __('New service', 'doclap'), meta: '' })}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.title ?? '')) ||
							sprintf(__('Service %d', 'doclap'), index + 1)
						}
						addLabel={__('Add service', 'doclap')}
						emptyLabel={__('No services yet.', 'doclap')}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/home-about" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<HomeAboutAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
