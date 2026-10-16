import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type { HomeAboutAttributes, Service } from './types';

interface EditProps {
	attributes: HomeAboutAttributes;
	setAttributes: (attributes: Partial<HomeAboutAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
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
					<TextareaControl
						label={__('Heading', 'doclap')}
						value={attributes.aboutHeading ?? ''}
						onChange={(aboutHeading) => setAttributes({ aboutHeading })}
					/>
					<TextareaControl
						label={__('Principle', 'doclap')}
						value={attributes.aboutPrinciple ?? ''}
						onChange={(aboutPrinciple) => setAttributes({ aboutPrinciple })}
					/>
					<TextareaControl
						label={__('Lead', 'doclap')}
						value={attributes.aboutLead ?? ''}
						onChange={(aboutLead) => setAttributes({ aboutLead })}
					/>
				</PanelBody>

				<PanelBody title={__('Items', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Services', 'doclap')}
						items={services as unknown as RepeaterItem[]}
						fields={[
							{ key: 'title', label: __('Title', 'doclap') },
							{ key: 'meta', label: __('Metadata', 'doclap') },
						]}
						onChange={(items) =>
							setAttributes({ services: items as unknown as Service[] })
						}
						createItem={() => ({ title: 'New service', meta: '' })}
						getItemLabel={(item, index) =>
							String(
								item.title || sprintf(__('Service %d', 'doclap'), index + 1),
							)
						}
						addLabel={__('Add service', 'doclap')}
						emptyLabel={__('No services yet.', 'doclap')}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/home-about"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
