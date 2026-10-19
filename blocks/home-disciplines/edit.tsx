import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import { truncateLabel } from '../../resources/ts/editor/accent-migration';
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
				<PanelBody title={__('Disciplines', 'doclap')} initialOpen>
					<Repeater
						label={__('Disciplines', 'doclap')}
						items={disciplines as unknown as RepeaterItem[]}
						fields={[
							{
								key: 'title',
								label: __('Title', 'doclap'),
								control: 'rich',
								tagName: 'span',
							},
							{
								key: 'caption',
								label: __('Caption', 'doclap'),
								control: 'rich',
								tagName: 'span',
								multiline: true,
							},
						]}
						onChange={(items) =>
							setAttributes({ disciplines: items as unknown as Discipline[] })
						}
						createItem={() => ({ title: '', caption: '' })}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.title ?? '')) ||
							sprintf(__('Discipline %d', 'doclap'), index + 1)
						}
						addLabel={__('Add discipline', 'doclap')}
						emptyLabel={__('No disciplines yet.', 'doclap')}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/home-disciplines" attributes={attributes} />
		</>
	);
}
