import ServerSideRender from '@wordpress/server-side-render';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { SingleNoteAttributes } from './types';

interface EditProps {
	attributes: SingleNoteAttributes;
	setAttributes: (attributes: Partial<SingleNoteAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const blockProps = useBlockProps();

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__('Navigation and article', 'doclap')} initialOpen>
					<TextControl
						label={__('Home breadcrumb label', 'doclap')}
						value={attributes.breadcrumbHomeLabel}
						onChange={(breadcrumbHomeLabel) => setAttributes({ breadcrumbHomeLabel })}
					/>
					<TextControl
						label={__('Archive breadcrumb label', 'doclap')}
						value={attributes.archiveLabel}
						onChange={(archiveLabel) => setAttributes({ archiveLabel })}
					/>
					<TextControl
						label={__('Archive URL', 'doclap')}
						help={__('Use @notes for the configured posts archive.', 'doclap')}
						value={attributes.archiveUrl}
						onChange={(archiveUrl) => setAttributes({ archiveUrl })}
					/>
					<TextControl
						label={__('Metadata prefix', 'doclap')}
						value={attributes.articleMetaPrefix}
						onChange={(articleMetaPrefix) => setAttributes({ articleMetaPrefix })}
					/>
					<TextControl
						label={__('Table of contents label', 'doclap')}
						value={attributes.tocLabel}
						onChange={(tocLabel) => setAttributes({ tocLabel })}
					/>
					<SelectControl
						label={__('When there are no H2 headings', 'doclap')}
						value={attributes.tocEmptyBehaviour}
						options={[
							{ label: __('Hide table of contents', 'doclap'), value: 'hide' },
							{ label: __('Show an empty message', 'doclap'), value: 'message' },
						]}
						onChange={(tocEmptyBehaviour) => setAttributes({ tocEmptyBehaviour })}
					/>
					<TextareaControl
						label={__('Disclaimer', 'doclap')}
						value={attributes.disclaimer}
						onChange={(disclaimer) => setAttributes({ disclaimer })}
					/>
					<TextControl
						label={__('Back link label', 'doclap')}
						value={attributes.backToArchiveLabel}
						onChange={(backToArchiveLabel) => setAttributes({ backToArchiveLabel })}
					/>
				</PanelBody>
				<PanelBody title={__('Related notes', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Heading', 'doclap')}
						value={attributes.relatedHeading}
						onChange={(relatedHeading) => setAttributes({ relatedHeading })}
					/>
					<RangeControl
						label={__('Number of related notes', 'doclap')}
						value={attributes.relatedCount}
						min={0}
						max={6}
						onChange={(relatedCount) => setAttributes({ relatedCount: relatedCount ?? 2 })}
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
			<p className="doclap-single-note-editor__notice">
				{__(
					'Previewing the currently queried post. On non-post editor screens, deterministic sample copy is shown.',
					'doclap',
				)}
			</p>
			<ServerSideRender
				block="doclap/single-note"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</div>
	);
}
