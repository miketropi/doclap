import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type { HomeProcessAttributes, ProcessStep } from './types';

interface EditProps {
	attributes: HomeProcessAttributes;
	setAttributes: (attributes: Partial<HomeProcessAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
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
					<TextControl
						label={__('Heading', 'doclap')}
						value={attributes.processHeading ?? ''}
						onChange={(processHeading) => setAttributes({ processHeading })}
					/>
				</PanelBody>

				<PanelBody title={__('Items', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Steps', 'doclap')}
						items={steps as unknown as RepeaterItem[]}
						fields={[
							{ key: 'title', label: __('Title', 'doclap') },
							{
								key: 'copy',
								label: __('Copy', 'doclap'),
								control: 'textarea',
							},
						]}
						onChange={(items) =>
							setAttributes({ processSteps: items as unknown as ProcessStep[] })
						}
						createItem={() => ({ title: 'New step', copy: '' })}
						getItemLabel={(item, index) =>
							String(item.title || sprintf(__('Step %d', 'doclap'), index + 1))
						}
						addLabel={__('Add step', 'doclap')}
						emptyLabel={__('No steps yet.', 'doclap')}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/home-process"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
