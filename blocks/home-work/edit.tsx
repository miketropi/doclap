import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type { Experiment, HomeWorkAttributes } from './types';

interface EditProps {
	attributes: HomeWorkAttributes;
	setAttributes: (attributes: Partial<HomeWorkAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const experiments = attributes.experiments ?? [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Heading', 'doclap')}
						value={attributes.worksHeading ?? ''}
						onChange={(worksHeading) => setAttributes({ worksHeading })}
					/>
					<TextControl
						label={__('Metadata', 'doclap')}
						value={attributes.worksMeta ?? ''}
						onChange={(worksMeta) => setAttributes({ worksMeta })}
					/>
					<TextareaControl
						label={__('Caption', 'doclap')}
						value={attributes.worksCaption ?? ''}
						onChange={(worksCaption) => setAttributes({ worksCaption })}
					/>
				</PanelBody>

				<PanelBody title={__('Items', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Experiments', 'doclap')}
						items={experiments as unknown as RepeaterItem[]}
						fields={[
							{
								key: 'anchor',
								label: __('Anchor', 'doclap'),
								help: __(
									'The card id used by the header and footer links (#experiment-flow, #experiment-orbit). Keep each id unique across the page.',
									'doclap',
								),
							},
							{ key: 'editionPrimary', label: __('Edition label', 'doclap') },
							{ key: 'editionSecondary', label: __('Edition number', 'doclap') },
							{ key: 'title', label: __('Title', 'doclap') },
							{
								key: 'metaLines',
								label: __('Metadata', 'doclap'),
								control: 'textarea',
							},
							{
								key: 'summary',
								label: __('Summary', 'doclap'),
								control: 'textarea',
							},
							{ key: 'detailLabel', label: __('Detail label', 'doclap') },
							{
								key: 'canvas',
								label: __('Canvas', 'doclap'),
								control: 'select',
								options: [
									{ label: __('Flow', 'doclap'), value: 'flow' },
									{ label: __('Orbit', 'doclap'), value: 'orbit' },
								],
							},
						]}
						onChange={(items) =>
							setAttributes({ experiments: items as unknown as Experiment[] })
						}
						createItem={() => ({
							anchor: 'experiment-flow',
							editionPrimary: '',
							editionSecondary: '',
							title: 'New experiment',
							metaLines: '',
							summary: '',
							detailLabel: '',
							canvas: 'flow',
						})}
						getItemLabel={(item, index) =>
							String(
								item.title ||
									sprintf(__('Experiment %d', 'doclap'), index + 1),
							)
						}
						addLabel={__('Add experiment', 'doclap')}
						emptyLabel={__('No experiments yet.', 'doclap')}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/home-work"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
