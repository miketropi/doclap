import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type { NotFoundAttributes, RecoveryLink } from './types';

interface EditProps {
	attributes: NotFoundAttributes;
	setAttributes: (attributes: Partial<NotFoundAttributes>) => void;
}

const linkFields = [
	{
		key: 'label',
		label: __('Label', 'doclap'),
	},
	{
		key: 'url',
		label: __('URL', 'doclap'),
		help: __('Use #section, a site path, @notes, or @search.', 'doclap'),
	},
];

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const links = attributes.links ?? [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Error hero', 'doclap')} initialOpen>
					<TextControl
						label={__('Error code', 'doclap')}
						value={attributes.errorCode ?? ''}
						onChange={(errorCode) => setAttributes({ errorCode })}
					/>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.eyebrow ?? ''}
						onChange={(eyebrow) => setAttributes({ eyebrow })}
					/>
					<TextControl
						label={__('Heading', 'doclap')}
						value={attributes.heading ?? ''}
						onChange={(heading) => setAttributes({ heading })}
					/>
					<TextControl
						label={__('Heading accent', 'doclap')}
						value={attributes.headingAccent ?? ''}
						onChange={(headingAccent) => setAttributes({ headingAccent })}
					/>
					<TextareaControl
						label={__('Lead', 'doclap')}
						help={__('Line breaks are preserved.', 'doclap')}
						value={attributes.lead ?? ''}
						rows={3}
						onChange={(lead) => setAttributes({ lead })}
					/>
				</PanelBody>
				<PanelBody title={__('Actions', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Primary label', 'doclap')}
						value={attributes.primaryLabel ?? ''}
						onChange={(primaryLabel) => setAttributes({ primaryLabel })}
					/>
					<TextControl
						label={__('Primary URL', 'doclap')}
						help={__('Leave empty for the site home.', 'doclap')}
						value={attributes.primaryUrl ?? ''}
						onChange={(primaryUrl) => setAttributes({ primaryUrl })}
					/>
					<TextControl
						label={__('Secondary label', 'doclap')}
						value={attributes.secondaryLabel ?? ''}
						onChange={(secondaryLabel) => setAttributes({ secondaryLabel })}
					/>
					<TextControl
						label={__('Secondary URL', 'doclap')}
						value={attributes.secondaryUrl ?? ''}
						onChange={(secondaryUrl) => setAttributes({ secondaryUrl })}
					/>
				</PanelBody>
				<PanelBody title={__('Other directions', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Section label', 'doclap')}
						value={attributes.asideLabel ?? ''}
						onChange={(asideLabel) => setAttributes({ asideLabel })}
					/>
					<TextControl
						label={__('Section heading', 'doclap')}
						value={attributes.asideHeading ?? ''}
						onChange={(asideHeading) => setAttributes({ asideHeading })}
					/>
					<TextControl
						label={__('Section heading second line', 'doclap')}
						value={attributes.asideHeadingAccent ?? ''}
						onChange={(asideHeadingAccent) => setAttributes({ asideHeadingAccent })}
					/>
					<Repeater
						label={__('Recovery links', 'doclap')}
						items={links as unknown as RepeaterItem[]}
						fields={linkFields}
						onChange={(items) =>
							setAttributes({ links: items as unknown as RecoveryLink[] })
						}
						createItem={() => ({
							label: __('New destination', 'doclap'),
							url: '',
						})}
						getItemLabel={(item) =>
							String(item.label || __('Destination', 'doclap'))
						}
						addLabel={__('Add destination', 'doclap')}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/not-found"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
