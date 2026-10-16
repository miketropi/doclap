import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import type { NotesArchiveAttributes } from './types';

interface EditProps {
	attributes: NotesArchiveAttributes;
	setAttributes: (attributes: Partial<NotesArchiveAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Hero', 'doclap')}>
					<TextControl
						label={__('Home breadcrumb', 'doclap')}
						value={attributes.breadcrumbHomeLabel}
						onChange={(breadcrumbHomeLabel) => setAttributes({ breadcrumbHomeLabel })}
					/>
					<TextControl
						label={__('Current breadcrumb', 'doclap')}
						value={attributes.breadcrumbLabel}
						onChange={(breadcrumbLabel) => setAttributes({ breadcrumbLabel })}
					/>
					<TextControl
						label={__('Heading', 'doclap')}
						value={attributes.heading}
						onChange={(heading) => setAttributes({ heading })}
					/>
					<TextControl
						label={__('Heading accent', 'doclap')}
						value={attributes.headingAccent}
						onChange={(headingAccent) => setAttributes({ headingAccent })}
					/>
					<TextareaControl
						label={__('Introduction', 'doclap')}
						value={attributes.lead}
						onChange={(lead) => setAttributes({ lead })}
					/>
				</PanelBody>
				<PanelBody title={__('Query and list', 'doclap')} initialOpen={false}>
					<ToggleControl
						label={__('Show featured newest note', 'doclap')}
						checked={attributes.showFeatured}
						onChange={(showFeatured) => setAttributes({ showFeatured })}
					/>
					<RangeControl
						label={__('Posts per page', 'doclap')}
						min={1}
						max={24}
						value={attributes.postsPerPage}
						onChange={(postsPerPage) => setAttributes({ postsPerPage: postsPerPage ?? 6 })}
					/>
					<ToggleControl
						label={__('Show category links', 'doclap')}
						checked={attributes.showCategories}
						onChange={(showCategories) => setAttributes({ showCategories })}
					/>
					<TextControl
						label={__('Section heading', 'doclap')}
						value={attributes.headingSectionTitle}
						onChange={(headingSectionTitle) => setAttributes({ headingSectionTitle })}
					/>
					<TextControl
						label={__('Singular count format', 'doclap')}
						help={__('Include %d for the count.', 'doclap')}
						value={attributes.countSingular}
						onChange={(countSingular) => setAttributes({ countSingular })}
					/>
					<TextControl
						label={__('Plural count format', 'doclap')}
						help={__('Include %d for the count.', 'doclap')}
						value={attributes.countPlural}
						onChange={(countPlural) => setAttributes({ countPlural })}
					/>
					<TextControl
						label={__('Empty-state heading', 'doclap')}
						value={attributes.emptyHeading}
						onChange={(emptyHeading) => setAttributes({ emptyHeading })}
					/>
					<TextareaControl
						label={__('Empty-state copy', 'doclap')}
						value={attributes.emptyCopy}
						onChange={(emptyCopy) => setAttributes({ emptyCopy })}
					/>
					<TextareaControl
						label={__('Editorial disclaimer', 'doclap')}
						value={attributes.disclaimer}
						onChange={(disclaimer) => setAttributes({ disclaimer })}
					/>
				</PanelBody>
				<PanelBody title={__('Closing call to action', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.closingEyebrow}
						onChange={(closingEyebrow) => setAttributes({ closingEyebrow })}
					/>
					<TextControl
						label={__('Heading', 'doclap')}
						value={attributes.closingHeading}
						onChange={(closingHeading) => setAttributes({ closingHeading })}
					/>
					<TextControl
						label={__('Heading accent', 'doclap')}
						value={attributes.closingHeadingAccent}
						onChange={(closingHeadingAccent) => setAttributes({ closingHeadingAccent })}
					/>
					<TextControl
						label={__('Link label', 'doclap')}
						value={attributes.closingCtaLabel}
						onChange={(closingCtaLabel) => setAttributes({ closingCtaLabel })}
					/>
					<TextControl
						label={__('Link URL', 'doclap')}
						value={attributes.closingCtaUrl}
						onChange={(closingCtaUrl) => setAttributes({ closingCtaUrl })}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/notes-archive"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
