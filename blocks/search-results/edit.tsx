import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import RichTextControl from '../../resources/ts/editor/rich-text-control';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelp } from '../../resources/ts/editor/url-help';
import {
	mergeAccent,
	needsAccentMerge,
} from '../../resources/ts/editor/accent-migration';
import type { SearchResultsAttributes } from './types';

interface EditProps {
	attributes: SearchResultsAttributes;
	setAttributes: (attributes: Partial<SearchResultsAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'heading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'lead', label: __('Introduction', 'doclap'), multiline: true },
	{
		path: 'noResultsLinkLabel',
		label: __('Recovery link label', 'doclap'),
	},
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	// One-shot legacy fold: saved content can still carry `headingAccent`.
	// `needsAccentMerge()` is false as soon as the accent is empty, so this runs
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

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Hero', 'doclap')} initialOpen>
					<TextControl
						label={__('Home breadcrumb', 'doclap')}
						value={attributes.breadcrumbHomeLabel ?? ''}
						onChange={(breadcrumbHomeLabel) => setAttributes({ breadcrumbHomeLabel })}
					/>
					<TextControl
						label={__('Current breadcrumb', 'doclap')}
						value={attributes.breadcrumbLabel ?? ''}
						onChange={(breadcrumbLabel) => setAttributes({ breadcrumbLabel })}
					/>
				</PanelBody>

				<PanelBody title={__('Search form', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Input label', 'doclap')}
						value={attributes.searchLabel ?? ''}
						onChange={(searchLabel) => setAttributes({ searchLabel })}
					/>
					<TextControl
						label={__('Placeholder', 'doclap')}
						value={attributes.searchPlaceholder ?? ''}
						onChange={(searchPlaceholder) => setAttributes({ searchPlaceholder })}
					/>
					<TextControl
						label={__('Submit label', 'doclap')}
						value={attributes.submitLabel ?? ''}
						onChange={(submitLabel) => setAttributes({ submitLabel })}
					/>
					<TextControl
						label={__('Help note', 'doclap')}
						value={attributes.helpNote ?? ''}
						onChange={(helpNote) => setAttributes({ helpNote })}
					/>
				</PanelBody>

				<PanelBody title={__('Filters and count', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('“All” label', 'doclap')}
						value={attributes.filterAllLabel ?? ''}
						onChange={(filterAllLabel) => setAttributes({ filterAllLabel })}
					/>
					<TextControl
						label={__('Pages label', 'doclap')}
						value={attributes.filterPageLabel ?? ''}
						onChange={(filterPageLabel) => setAttributes({ filterPageLabel })}
					/>
					<TextControl
						label={__('Notes label', 'doclap')}
						value={attributes.filterNoteLabel ?? ''}
						onChange={(filterNoteLabel) => setAttributes({ filterNoteLabel })}
					/>
					<TextControl
						label={__('Work label', 'doclap')}
						value={attributes.filterWorkLabel ?? ''}
						onChange={(filterWorkLabel) => setAttributes({ filterWorkLabel })}
					/>
					<TextControl
						label={__('Singular result format', 'doclap')}
						help={__('Use %d for the number of results.', 'doclap')}
						value={attributes.resultSingular ?? ''}
						onChange={(resultSingular) => setAttributes({ resultSingular })}
					/>
					<TextControl
						label={__('Plural result format', 'doclap')}
						help={__('Use %d for the number of results.', 'doclap')}
						value={attributes.resultPlural ?? ''}
						onChange={(resultPlural) => setAttributes({ resultPlural })}
					/>
				</PanelBody>

				<PanelBody title={__('Result and empty states', 'doclap')} initialOpen={false}>
					<RichTextControl
						label={__('No-results heading', 'doclap')}
						value={attributes.noResultsHeading ?? ''}
						onChange={(noResultsHeading) => setAttributes({ noResultsHeading })}
						tagName="h2"
					/>
					<RichTextControl
						label={__('No-results copy', 'doclap')}
						value={attributes.noResultsCopy ?? ''}
						onChange={(noResultsCopy) => setAttributes({ noResultsCopy })}
						multiline
					/>
					<TextControl
						label={__('Recovery link URL', 'doclap')}
						help={urlHelp}
						value={attributes.noResultsLinkUrl ?? ''}
						onChange={(noResultsLinkUrl) => setAttributes({ noResultsLinkUrl })}
					/>
					<RichTextControl
						label={__('Pre-search heading', 'doclap')}
						value={attributes.emptyHeading ?? ''}
						onChange={(emptyHeading) => setAttributes({ emptyHeading })}
						tagName="h2"
					/>
					<RichTextControl
						label={__('Pre-search copy', 'doclap')}
						value={attributes.emptyCopy ?? ''}
						onChange={(emptyCopy) => setAttributes({ emptyCopy })}
						multiline
					/>
				</PanelBody>
			</InspectorControls>
			<BlockPreview
				block="doclap/search-results"
				attributes={attributes}
				notice={__(
					'The results come from the current search request, so the preview shows contextual data and the search form inside it is inert.',
					'doclap',
				)}
			/>
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<SearchResultsAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
