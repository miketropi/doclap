import { InspectorControls } from '@wordpress/block-editor';
import {
	FormTokenField,
	PanelBody,
	RangeControl,
	TextControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import type { JournalCarouselAttributes } from './types';

interface EditProps {
	attributes: JournalCarouselAttributes;
	setAttributes: (attributes: Partial<JournalCarouselAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'journalHeading', label: __('Heading', 'doclap'), multiline: true },
];

/** One taxonomy term as the editor's REST records return it. */
interface Term {
	id: number;
	name: string;
}

/**
 * Terms of one taxonomy, for the filter suggestions.
 *
 * The list is capped: a picker needs suggestions, not every term a large site could
 * hold, and `_fields` keeps the response to the two fields the picker reads.
 *
 * @param taxonomy Taxonomy slug.
 */
function useTerms(taxonomy: 'category' | 'post_tag'): Term[] {
	return (
		useSelect((select) => {
			const core = select('core') as unknown as {
				getEntityRecords: (
					kind: string,
					name: string,
					query?: Record<string, unknown>,
				) => Term[] | null;
			};

			return core.getEntityRecords('taxonomy', taxonomy, {
				per_page: 100,
				orderby: 'name',
				order: 'asc',
				_fields: 'id,name',
			});
		}, [taxonomy]) ?? []
	);
}

interface TermTokenFieldProps {
	label: string;
	help: string;
	terms: Term[];
	ids: number[] | undefined;
	onChange: (ids: number[]) => void;
}

/**
 * Multi-select for one taxonomy, stored as term ids.
 *
 * `FormTokenField` speaks display names, so the saved ids are mapped to names for
 * display and back to ids on change. An id whose term is not in the fetched list
 * stays visible as `#id` instead of silently disappearing, and input is validated
 * against the known names so a typed token cannot create a filter that matches
 * nothing.
 */
function TermTokenField({
	label,
	help,
	terms,
	ids,
	onChange,
}: TermTokenFieldProps): JSX.Element {
	const namesById = useMemo(
		() => new Map(terms.map((term) => [term.id, term.name])),
		[terms],
	);
	const knownNames = useMemo(
		() => new Set(terms.map((term) => term.name)),
		[terms],
	);

	return (
		<>
			<FormTokenField
				label={label}
				value={(ids ?? []).map((id) => namesById.get(id) ?? `#${id}`)}
				suggestions={terms.map((term) => term.name)}
				__experimentalValidateInput={(input: string) => knownNames.has(input)}
				onChange={(tokens) => {
					const next: number[] = [];

					for (const token of tokens as Array<string | { value: string }>) {
						const name = 'string' === typeof token ? token : token.value;
						const match = terms.find((term) => term.name === name);

						if (match && !next.includes(match.id)) {
							next.push(match.id);
						}
					}

					onChange(next);
				}}
			/>
			<p className="components-base-control__help">{help}</p>
		</>
	);
}

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const categories = useTerms('category');
	const tags = useTerms('post_tag');
	const hasFilters =
		(attributes.categories ?? []).length > 0 ||
		(attributes.tags ?? []).length > 0;

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Heading', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.journalEyebrow ?? ''}
						onChange={(journalEyebrow) => setAttributes({ journalEyebrow })}
					/>
				</PanelBody>

				<PanelBody title={__('Query', 'doclap')} initialOpen>
					<RangeControl
						label={__('Posts to show', 'doclap')}
						min={1}
						max={24}
						value={attributes.postsPerPage}
						onChange={(postsPerPage) => setAttributes({ postsPerPage: postsPerPage ?? 3 })}
					/>
					<TermTokenField
						label={__('Categories', 'doclap')}
						help={__(
							'Leave empty for every category. With several, a post in any of them is shown.',
							'doclap',
						)}
						terms={categories}
						ids={attributes.categories}
						onChange={(next) => setAttributes({ categories: next })}
					/>
					<TermTokenField
						label={__('Tags', 'doclap')}
						help={__(
							'Leave empty for every tag. With several, a post carrying any of them is shown.',
							'doclap',
						)}
						terms={tags}
						ids={attributes.tags}
						onChange={(next) => setAttributes({ tags: next })}
					/>
					{hasFilters ? (
						<p className="components-base-control__help">
							{__(
								'Category and tag filters combine: a post must match the chosen categories AND the chosen tags.',
								'doclap',
							)}
						</p>
					) : null}
				</PanelBody>

				<PanelBody title={__('Carousel', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Accessible name', 'doclap')}
						value={attributes.ariaLabel ?? ''}
						onChange={(ariaLabel) => setAttributes({ ariaLabel })}
					/>
					<TextControl
						label={__('Artwork label', 'doclap')}
						value={attributes.artLabel ?? ''}
						onChange={(artLabel) => setAttributes({ artLabel })}
					/>
					<TextControl
						label={__('Fallback card label', 'doclap')}
						value={attributes.cardMeta ?? ''}
						onChange={(cardMeta) => setAttributes({ cardMeta })}
					/>
					<TextControl
						label={__('Read link label', 'doclap')}
						value={attributes.readMoreLabel ?? ''}
						onChange={(readMoreLabel) => setAttributes({ readMoreLabel })}
					/>
					<TextControl
						label={__('Empty state', 'doclap')}
						value={attributes.emptyLabel ?? ''}
						onChange={(emptyLabel) => setAttributes({ emptyLabel })}
					/>
					<TextControl
						label={__('View-all label', 'doclap')}
						value={attributes.viewAllLabel ?? ''}
						onChange={(viewAllLabel) => setAttributes({ viewAllLabel })}
					/>
					<TextControl
						label={__('View-all URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.viewAllUrl ?? ''}
						onChange={(viewAllUrl) => setAttributes({ viewAllUrl })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview
				block="doclap/journal-carousel"
				attributes={attributes}
				notice={
					hasFilters
						? __(
								'Filtered by category or tag — the preview shows only matching notes.',
								'doclap',
							)
						: undefined
				}
			/>
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<JournalCarouselAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
