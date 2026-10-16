import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type { HomeTestimonialsAttributes, Testimonial } from './types';

interface EditProps {
	attributes: HomeTestimonialsAttributes;
	setAttributes: (attributes: Partial<HomeTestimonialsAttributes>) => void;
}

const LINK_HELP = __(
	'Accepts #section, /path/, @notes or @search. Changing a structural anchor needs matching header and footer links.',
	'doclap',
);

export default function Edit({
	attributes,
	setAttributes,
}: EditProps): JSX.Element {
	const testimonials = attributes.testimonials ?? [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Heading', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.testimonialsEyebrow ?? ''}
						onChange={(testimonialsEyebrow) =>
							setAttributes({ testimonialsEyebrow })
						}
					/>
					<TextControl
						label={__('Heading', 'doclap')}
						value={attributes.testimonialsHeading ?? ''}
						onChange={(testimonialsHeading) =>
							setAttributes({ testimonialsHeading })
						}
					/>
					<TextControl
						label={__('Heading accent', 'doclap')}
						value={attributes.testimonialsHeadingAccent ?? ''}
						onChange={(testimonialsHeadingAccent) =>
							setAttributes({ testimonialsHeadingAccent })
						}
					/>
					<TextareaControl
						label={__('Introduction', 'doclap')}
						value={attributes.testimonialsIntro ?? ''}
						onChange={(testimonialsIntro) =>
							setAttributes({ testimonialsIntro })
						}
					/>
				</PanelBody>

				<PanelBody title={__('Perspectives', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Placeholder perspectives', 'doclap')}
						items={testimonials as unknown as RepeaterItem[]}
						fields={[
							{ key: 'statement', label: __('Statement', 'doclap') },
							{ key: 'statementAccent', label: __('Statement accent', 'doclap') },
							{
								key: 'disclaimer',
								label: __('Disclaimer', 'doclap'),
								control: 'textarea',
							},
							{ key: 'status', label: __('Status', 'doclap') },
							{ key: 'role', label: __('Role', 'doclap') },
							{ key: 'company', label: __('Company', 'doclap') },
						]}
						onChange={(items) =>
							setAttributes({ testimonials: items as unknown as Testimonial[] })
						}
						createItem={() => ({
							statement: '',
							statementAccent: '',
							disclaimer: '',
							status: 'Awaiting confirmation',
							role: 'Not provided',
							company: 'Not provided',
						})}
						getItemLabel={(item, index) =>
							String(
								item.statementAccent ||
									item.statement ||
									sprintf(__('Perspective %d', 'doclap'), index + 1),
							)
						}
						addLabel={__('Add perspective', 'doclap')}
						emptyLabel={__('No perspectives yet.', 'doclap')}
					/>
				</PanelBody>

				<PanelBody title={__('Editorial note', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Label', 'doclap')}
						value={attributes.editorialLabel ?? ''}
						onChange={(editorialLabel) => setAttributes({ editorialLabel })}
					/>
					<TextareaControl
						label={__('Title', 'doclap')}
						value={attributes.editorialTitle ?? ''}
						onChange={(editorialTitle) => setAttributes({ editorialTitle })}
					/>
					<TextControl
						label={__('Title accent', 'doclap')}
						value={attributes.editorialTitleAccent ?? ''}
						onChange={(editorialTitleAccent) =>
							setAttributes({ editorialTitleAccent })
						}
					/>
					<TextareaControl
						label={__('Copy', 'doclap')}
						value={attributes.editorialCopy ?? ''}
						onChange={(editorialCopy) => setAttributes({ editorialCopy })}
					/>
					<TextControl
						label={__('Link label', 'doclap')}
						value={attributes.editorialLinkLabel ?? ''}
						onChange={(editorialLinkLabel) =>
							setAttributes({ editorialLinkLabel })
						}
					/>
					<TextControl
						label={__('Link URL', 'doclap')}
						help={LINK_HELP}
						value={attributes.editorialLinkUrl ?? ''}
						onChange={(editorialLinkUrl) => setAttributes({ editorialLinkUrl })}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/home-testimonials"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
