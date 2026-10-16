import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import type { SearchResultsAttributes } from './types';

interface EditProps {
	attributes: SearchResultsAttributes;
	setAttributes: (attributes: Partial<SearchResultsAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
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
						label={__('Introduction', 'doclap')}
						value={attributes.lead ?? ''}
						onChange={(lead) => setAttributes({ lead })}
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
					<TextareaControl
						label={__('Help note', 'doclap')}
						value={attributes.helpNote ?? ''}
						onChange={(helpNote) => setAttributes({ helpNote })}
					/>
				</PanelBody>
				<PanelBody title={__('Filters and count', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('All label', 'doclap')}
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
						help={__('Use %d for the count.', 'doclap')}
						value={attributes.resultSingular ?? ''}
						onChange={(resultSingular) => setAttributes({ resultSingular })}
					/>
					<TextControl
						label={__('Plural result format', 'doclap')}
						help={__('Use %d for the count.', 'doclap')}
						value={attributes.resultPlural ?? ''}
						onChange={(resultPlural) => setAttributes({ resultPlural })}
					/>
				</PanelBody>
				<PanelBody title={__('States', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('No-results heading', 'doclap')}
						value={attributes.noResultsHeading ?? ''}
						onChange={(noResultsHeading) => setAttributes({ noResultsHeading })}
					/>
					<TextareaControl
						label={__('No-results copy', 'doclap')}
						value={attributes.noResultsCopy ?? ''}
						onChange={(noResultsCopy) => setAttributes({ noResultsCopy })}
					/>
					<TextControl
						label={__('Recovery link label', 'doclap')}
						value={attributes.noResultsLinkLabel ?? ''}
						onChange={(noResultsLinkLabel) => setAttributes({ noResultsLinkLabel })}
					/>
					<TextControl
						label={__('Recovery link URL', 'doclap')}
						help={__('Use @notes for the posts archive.', 'doclap')}
						value={attributes.noResultsLinkUrl ?? ''}
						onChange={(noResultsLinkUrl) => setAttributes({ noResultsLinkUrl })}
					/>
					<TextControl
						label={__('Pre-search heading', 'doclap')}
						value={attributes.emptyHeading ?? ''}
						onChange={(emptyHeading) => setAttributes({ emptyHeading })}
					/>
					<TextareaControl
						label={__('Pre-search copy', 'doclap')}
						value={attributes.emptyCopy ?? ''}
						onChange={(emptyCopy) => setAttributes({ emptyCopy })}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/search-results"
				attributes={attributes as Record<string, unknown>}
			/>
		</>
	);
}
