import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextareaControl, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import {
	mergeAccent,
	needsAccentMerge,
	truncateLabel,
} from '../../resources/ts/editor/accent-migration';
import type { HomeTestimonialsAttributes, Testimonial } from './types';

interface EditProps {
	attributes: HomeTestimonialsAttributes;
	setAttributes: (attributes: Partial<HomeTestimonialsAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{
		path: 'testimonialsHeading',
		label: __('Heading', 'doclap'),
		multiline: true,
	},
	{
		path: 'testimonialsIntro',
		label: __('Introduction', 'doclap'),
		multiline: true,
	},
	{
		path: 'editorialTitle',
		label: __('Editorial title', 'doclap'),
		multiline: true,
	},
	{
		path: 'editorialCopy',
		label: __('Editorial copy', 'doclap'),
		multiline: true,
	},
	{ path: 'editorialLinkLabel', label: __('Link label', 'doclap') },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const testimonials = attributes.testimonials ?? [];

	// One-shot legacy folds: saved content can still carry the split accents.
	// `needsAccentMerge()` is false as soon as an accent is empty, so these run
	// once per block and never on a keystroke.
	useEffect(() => {
		const legacyAccent = String(attributes.testimonialsHeadingAccent ?? '');

		if (needsAccentMerge(attributes.testimonialsHeading ?? '', legacyAccent)) {
			setAttributes({
				testimonialsHeading: mergeAccent(
					attributes.testimonialsHeading ?? '',
					legacyAccent,
					'<br><em>',
				),
				testimonialsHeadingAccent: '',
			});
		}
	}, [attributes.testimonialsHeadingAccent, setAttributes]);

	// The title's legacy renderer ran `nl2br()` over the base before appending the
	// accent, so the base has to carry `<br>` before the pair is folded.
	useEffect(() => {
		const legacyAccent = String(attributes.editorialTitleAccent ?? '');
		const base = String(attributes.editorialTitle ?? '').replace(
			/\r\n?|\n/g,
			'<br>',
		);

		if (needsAccentMerge(base, legacyAccent)) {
			setAttributes({
				editorialTitle: mergeAccent(base, legacyAccent, '<br><em>'),
				editorialTitleAccent: '',
			});
		}
	}, [attributes.editorialTitleAccent, setAttributes]);

	useEffect(() => {
		let folded = false;
		const next = testimonials.map((testimonial) => {
			const legacyAccent = String(testimonial.statementAccent ?? '');

			if (!needsAccentMerge(testimonial.statement ?? '', legacyAccent)) {
				return testimonial;
			}

			folded = true;
			const merged: Testimonial = {
				...testimonial,
				statement: mergeAccent(
					testimonial.statement ?? '',
					legacyAccent,
					' <em>',
				),
			};
			delete merged.statementAccent;

			return merged;
		});

		if (folded) {
			setAttributes({ testimonials: next });
		}
	}, [attributes.testimonials, setAttributes]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Layout', 'doclap')} initialOpen>
					<SelectControl
						label={__('Card layout', 'doclap')}
						help={__(
							'Voices: the statement cards with rating and social placeholders. Preview: the editorial quote cards — label, quote, person note and caption row — with a closing note instead of the editorial aside.',
							'doclap',
						)}
						value={attributes.testimonialsVariant || 'voices'}
						options={[
							{
								label: __('Voices — statement cards', 'doclap'),
								value: 'voices',
							},
							{
								label: __('Preview — editorial quote cards', 'doclap'),
								value: 'preview',
							},
						] as Array<{ label: string; value: string }>}
						onChange={(testimonialsVariant) =>
							setAttributes({ testimonialsVariant })
						}
					/>
					<TextareaControl
						label={__('Closing note', 'doclap')}
						help={__(
							'Preview layout only: shown under the cards. Empty hides it.',
							'doclap',
						)}
						value={attributes.testimonialsNote ?? ''}
						onChange={(testimonialsNote) =>
							setAttributes({ testimonialsNote })
						}
					/>
				</PanelBody>

				<PanelBody title={__('Heading', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.testimonialsEyebrow ?? ''}
						onChange={(testimonialsEyebrow) =>
							setAttributes({ testimonialsEyebrow })
						}
					/>
				</PanelBody>

				<PanelBody title={__('Perspectives', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Perspectives', 'doclap')}
						items={testimonials as unknown as RepeaterItem[]}
						fields={[
							{
								key: 'statement',
								label: __('Statement', 'doclap'),
								control: 'rich',
								tagName: 'h3',
							},
							{
								key: 'disclaimer',
								label: __('Disclaimer', 'doclap'),
								control: 'rich',
								tagName: 'p',
								multiline: true,
							},
							{ key: 'status', label: __('Status', 'doclap') },
							{ key: 'role', label: __('Role', 'doclap') },
							{ key: 'company', label: __('Company', 'doclap') },
							{
								key: 'label',
								label: __('Label', 'doclap'),
								help: __(
									'Preview layout: top-left meta line. Empty falls back to CLIENT PERSPECTIVE.',
									'doclap',
								),
								placeholder: 'CLIENT PERSPECTIVE',
							},
							{
								key: 'previewLabel',
								label: __('Preview label', 'doclap'),
								help: __(
									'Preview layout: top-right meta line, for example LAYOUT PREVIEW / 01.',
									'doclap',
								),
							},
							{
								key: 'quote',
								label: __('Quote', 'doclap'),
								control: 'rich',
								tagName: 'p',
								multiline: true,
							},
							{
								key: 'personNote',
								label: __('Person note', 'doclap'),
								help: __(
									'Preview layout: small line under the status.',
									'doclap',
								),
							},
							{
								key: 'captionLeft',
								label: __('Caption (left)', 'doclap'),
								help: __('Preview layout only.', 'doclap'),
							},
							{
								key: 'captionRight',
								label: __('Caption (right)', 'doclap'),
								help: __('Preview layout only.', 'doclap'),
							},
						]}
						onChange={(items) =>
							setAttributes({ testimonials: items as unknown as Testimonial[] })
						}
						createItem={() => ({
							statement: '',
							disclaimer: '',
							status: __('Awaiting confirmation', 'doclap'),
							role: __('Not provided', 'doclap'),
							company: __('Not provided', 'doclap'),
							label: '',
							previewLabel: '',
							quote: '',
							personNote: '',
							captionLeft: '',
							captionRight: '',
						})}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.quote ?? '')) ||
							truncateLabel(String(item.statement ?? '')) ||
							sprintf(__('Perspective %d', 'doclap'), index + 1)
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
					<TextControl
						label={__('Link URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.editorialLinkUrl ?? ''}
						onChange={(editorialLinkUrl) => setAttributes({ editorialLinkUrl })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/home-testimonials" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<HomeTestimonialsAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
