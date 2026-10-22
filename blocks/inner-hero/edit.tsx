import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import RichTextControl from '../../resources/ts/editor/rich-text-control';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import {
	mergeAccent,
	needsAccentMerge,
} from '../../resources/ts/editor/accent-migration';
import type { InnerHeroAttributes, InnerHeroSectionLink } from './types';

interface EditProps {
	attributes: InnerHeroAttributes;
	setAttributes: (attributes: Partial<InnerHeroAttributes>) => void;
	isSelected: boolean;
}

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	// One-shot legacy fold. Every saved block that predates the merge still
	// carries the split accent; `needsAccentMerge()` is false as soon as the
	// accent is empty, so this runs once per block and never on a keystroke.
	useEffect(() => {
		const legacyAccent = String(attributes.headingAccent ?? '');

		if (needsAccentMerge(attributes.heading ?? '', legacyAccent)) {
			setAttributes({
				heading: mergeAccent(
					attributes.heading ?? '',
					legacyAccent,
					'<br><em>',
				),
				headingAccent: '',
			});
		}
	}, [attributes.headingAccent, setAttributes]);

	const usesPageTitle = 'page-title' === attributes.headingSource;
	const sectionIndex = attributes.sectionIndex ?? [];

	/*
	 * A page-sourced title is the post's own data, so only the lead is edited in
	 * place; the custom heading keeps its on-canvas editing.
	 */
	const overlayTargets: RichTextTarget[] = [
		...(usesPageTitle
			? []
			: [{ path: 'heading', label: __('Heading', 'doclap'), multiline: true } as RichTextTarget]),
		{ path: 'lead', label: __('Lead', 'doclap'), multiline: true },
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Hero', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						help={__(
							'Printed above the title. Leave it empty for a plain page hero.',
							'doclap',
						)}
						value={attributes.eyebrow ?? ''}
						onChange={(eyebrow) => setAttributes({ eyebrow })}
					/>
					<SelectControl
						label={__('Heading source', 'doclap')}
						help={__(
							'Page title renders the title of the page this block sits on; custom keeps the heading you edit below.',
							'doclap',
						)}
						value={attributes.headingSource ?? 'custom'}
						options={[
							{ label: __('Custom heading', 'doclap'), value: 'custom' },
							{ label: __('Page title', 'doclap'), value: 'page-title' },
						]}
						onChange={(value) =>
							setAttributes({
								headingSource: 'page-title' === value ? 'page-title' : 'custom',
							})
						}
					/>
					<TextControl
						label={__('Home breadcrumb', 'doclap')}
						value={attributes.breadcrumbHomeLabel ?? ''}
						onChange={(breadcrumbHomeLabel) => setAttributes({ breadcrumbHomeLabel })}
					/>
					<TextControl
						label={__('Current page breadcrumb', 'doclap')}
						value={attributes.breadcrumbLabel ?? ''}
						onChange={(breadcrumbLabel) => setAttributes({ breadcrumbLabel })}
					/>
					<RichTextControl
						label={__('Summary stamp', 'doclap')}
						help={__(
							'Printed beside the lead. It appears only after the lead does, and stays off the page below 920px.',
							'doclap',
						)}
						value={attributes.summaryStamp ?? ''}
						onChange={(summaryStamp) => setAttributes({ summaryStamp })}
						multiline
					/>
					<ToggleControl
						label={__('Decorative hero mark', 'doclap')}
						help={__(
							'The asterisk beside the lead. Turn it off when the summary stamp carries the composition instead.',
							'doclap',
						)}
						checked={attributes.showHeroMark ?? true}
						onChange={(showHeroMark) => setAttributes({ showHeroMark })}
					/>
				</PanelBody>

				<PanelBody title={__('Section index', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Sections', 'doclap')}
						items={sectionIndex as unknown as RepeaterItem[]}
						fields={[
							{
								key: 'index',
								label: __('Index', 'doclap'),
								help: __('Short marker, e.g. 01 or 01B.', 'doclap'),
							},
							{ key: 'label', label: __('Label', 'doclap') },
							{
								key: 'url',
								label: __('Target', 'doclap'),
								help: urlHelpWithStructuralNote,
							},
						]}
						createItem={() => ({
							index: '01',
							label: __('Section', 'doclap'),
							url: '#',
						})}
						getItemLabel={(item) => String(item.label ?? '')}
						onChange={(items) =>
							setAttributes({ sectionIndex: items as InnerHeroSectionLink[] })
						}
						addLabel={__('Add section', 'doclap')}
						emptyLabel={__('No sections yet.', 'doclap')}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			{/*
			 * The heading is a merged rich value and the lead is rich text; both
			 * are edited in place on the canvas through `RichTextOverlay`.
			 */}
			<BlockPreview block="doclap/inner-hero" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<InnerHeroAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
