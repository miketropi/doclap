import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import RichTextControl from '../../resources/ts/editor/rich-text-control';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import {
	mergeAccent,
	needsAccentMerge,
} from '../../resources/ts/editor/accent-migration';
import type { NotesArchiveAttributes } from './types';

interface EditProps {
	attributes: NotesArchiveAttributes;
	setAttributes: (attributes: Partial<NotesArchiveAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'heading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'lead', label: __('Introduction', 'doclap'), multiline: true },
	{
		path: 'headingSectionTitle',
		label: __('Section heading', 'doclap'),
		multiline: true,
	},
	{ path: 'disclaimer', label: __('Editorial disclaimer', 'doclap'), multiline: true },
	{
		path: 'closingHeading',
		label: __('Closing heading', 'doclap'),
		multiline: true,
	},
	{ path: 'closingCtaLabel', label: __('Link label', 'doclap') },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	// One-shot legacy folds: saved content can still carry the split accents.
	// `needsAccentMerge()` is false as soon as an accent is empty, so these run
	// once per block and never on a keystroke.
	useEffect(() => {
		const legacyAccent = String(attributes.headingAccent ?? '');

		if (needsAccentMerge(attributes.heading ?? '', legacyAccent)) {
			setAttributes({
				heading: mergeAccent(attributes.heading ?? '', legacyAccent, '<br><em>'),
				headingAccent: '',
			});
		}
	}, [attributes.headingAccent, setAttributes]);

	useEffect(() => {
		const legacyAccent = String(attributes.closingHeadingAccent ?? '');

		if (needsAccentMerge(attributes.closingHeading ?? '', legacyAccent)) {
			setAttributes({
				closingHeading: mergeAccent(
					attributes.closingHeading ?? '',
					legacyAccent,
					'<br><em>',
				),
				closingHeadingAccent: '',
			});
		}
	}, [attributes.closingHeadingAccent, setAttributes]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Hero', 'doclap')} initialOpen>
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
						label={__('Singular count format', 'doclap')}
						help={__('Use %d for the number of notes.', 'doclap')}
						value={attributes.countSingular}
						onChange={(countSingular) => setAttributes({ countSingular })}
					/>
					<TextControl
						label={__('Plural count format', 'doclap')}
						help={__('Use %d for the number of notes.', 'doclap')}
						value={attributes.countPlural}
						onChange={(countPlural) => setAttributes({ countPlural })}
					/>
				</PanelBody>

				<PanelBody title={__('Empty and editorial states', 'doclap')} initialOpen={false}>
					<RichTextControl
						label={__('Empty-state heading', 'doclap')}
						value={attributes.emptyHeading}
						onChange={(emptyHeading) => setAttributes({ emptyHeading })}
						tagName="h3"
					/>
					<RichTextControl
						label={__('Empty-state copy', 'doclap')}
						value={attributes.emptyCopy}
						onChange={(emptyCopy) => setAttributes({ emptyCopy })}
						multiline
					/>
				</PanelBody>

				<PanelBody
					title={__('Closing call to action', 'doclap')}
					initialOpen={false}
				>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.closingEyebrow}
						onChange={(closingEyebrow) => setAttributes({ closingEyebrow })}
					/>
					<TextControl
						label={__('Link URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.closingCtaUrl}
						onChange={(closingCtaUrl) => setAttributes({ closingCtaUrl })}
					/>
				</PanelBody>
			</InspectorControls>
			<BlockPreview
				block="doclap/notes-archive"
				attributes={attributes}
				notice={__(
					'The list is built from the posts query of the template this block sits in, so the preview shows the notes that query returns rather than a fixed sample.',
					'doclap',
				)}
			/>
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<NotesArchiveAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
