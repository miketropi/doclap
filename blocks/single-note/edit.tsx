import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import {
	mergeAccent,
	needsAccentMerge,
} from '../../resources/ts/editor/accent-migration';
import type { SingleNoteAttributes } from './types';

interface EditProps {
	attributes: SingleNoteAttributes;
	setAttributes: (attributes: Partial<SingleNoteAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'disclaimer', label: __('Disclaimer', 'doclap'), multiline: true },
	{
		path: 'relatedHeading',
		label: __('Related notes heading', 'doclap'),
		multiline: true,
	},
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
	// One-shot legacy fold: saved content can still carry
	// `closingHeadingAccent`. `needsAccentMerge()` is false as soon as the accent
	// is empty, so this runs once per block and never on a keystroke.
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
						help={urlHelpWithStructuralNote}
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
						onChange={(tocEmptyBehaviour) =>
							setAttributes({
								tocEmptyBehaviour: 'message' === tocEmptyBehaviour ? 'message' : 'hide',
							})
						}
					/>
					<TextControl
						label={__('Back link label', 'doclap')}
						value={attributes.backToArchiveLabel}
						onChange={(backToArchiveLabel) => setAttributes({ backToArchiveLabel })}
					/>
				</PanelBody>

				<PanelBody title={__('Related notes', 'doclap')} initialOpen={false}>
					<RangeControl
						label={__('Number of related notes', 'doclap')}
						value={attributes.relatedCount}
						min={0}
						max={6}
						onChange={(relatedCount) => setAttributes({ relatedCount: relatedCount ?? 2 })}
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
				block="doclap/single-note"
				attributes={attributes}
				notice={__(
					'Previewing the currently queried post. On non-post editor screens, deterministic sample copy is shown.',
					'doclap',
				)}
			/>
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<SingleNoteAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
