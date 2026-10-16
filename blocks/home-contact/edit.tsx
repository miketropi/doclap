import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import type { HomeContactAttributes } from './types';

interface EditProps {
	attributes: HomeContactAttributes;
	setAttributes: (attributes: Partial<HomeContactAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.contactEyebrow ?? ''}
						onChange={(contactEyebrow) => setAttributes({ contactEyebrow })}
					/>
					<TextControl
						label={__('Heading', 'doclap')}
						value={attributes.contactHeading ?? ''}
						onChange={(contactHeading) => setAttributes({ contactHeading })}
					/>
					<TextControl
						label={__('Heading accent', 'doclap')}
						value={attributes.contactHeadingAccent ?? ''}
						onChange={(contactHeadingAccent) =>
							setAttributes({ contactHeadingAccent })
						}
					/>
					<TextareaControl
						label={__('Lead', 'doclap')}
						value={attributes.contactLead ?? ''}
						onChange={(contactLead) => setAttributes({ contactLead })}
					/>
				</PanelBody>

				<PanelBody title={__('Call to action', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Label', 'doclap')}
						value={attributes.contactCtaLabel ?? ''}
						onChange={(contactCtaLabel) => setAttributes({ contactCtaLabel })}
					/>
					<TextControl
						label={__('URL', 'doclap')}
						help={__(
							'Accepts #section, /path/, @notes or @search. Changing a structural anchor needs matching header and footer links.',
							'doclap',
						)}
						value={attributes.contactCtaUrl ?? ''}
						onChange={(contactCtaUrl) => setAttributes({ contactCtaUrl })}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/home-contact"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
