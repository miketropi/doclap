import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type { Discipline, HomeDisciplinesAttributes } from './types';

interface EditProps {
	attributes: HomeDisciplinesAttributes;
	setAttributes: (attributes: Partial<HomeDisciplinesAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const disciplines = attributes.disciplines ?? [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Items', 'doclap')} initialOpen>
					<Repeater
						label={__('Disciplines', 'doclap')}
						items={disciplines as unknown as RepeaterItem[]}
						fields={[
							{ key: 'title', label: __('Title', 'doclap') },
							{ key: 'caption', label: __('Caption', 'doclap') },
						]}
						onChange={(items) =>
							setAttributes({ disciplines: items as unknown as Discipline[] })
						}
						createItem={() => ({ title: '', caption: '' })}
						getItemLabel={(item, index) =>
							String(
								item.title ||
									sprintf(__('Discipline %d', 'doclap'), index + 1),
							)
						}
						addLabel={__('Add discipline', 'doclap')}
						emptyLabel={__('No disciplines yet.', 'doclap')}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/home-disciplines"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
