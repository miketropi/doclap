import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import Repeater, {
	type RepeaterField,
	type RepeaterItem,
} from '../../resources/ts/editor/repeater';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import {
	mergeAccent,
	needsAccentMerge,
	truncateLabel,
} from '../../resources/ts/editor/accent-migration';
import type {
	ComparisonColumn,
	ComparisonGroup,
	PlanComparisonAttributes,
} from './types';

interface EditProps {
	attributes: PlanComparisonAttributes;
	setAttributes: (attributes: Partial<PlanComparisonAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'compareHeading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'linkLabel', label: __('Link label', 'doclap') },
];

/** Fields of one comparison row; the cells are edited by {@link columnValues}. */
const rowFields: RepeaterField[] = [
	{ key: 'feature', label: __('Consideration', 'doclap') },
	{
		key: 'isNumeric',
		label: __('Figure style', 'doclap'),
		control: 'toggle',
		help: __(
			'Prints this row’s cells in the monospace figure style, for fees and amounts.',
			'doclap',
		),
	},
];

/**
 * One text control per comparison column, bound to the row's `values` entry.
 *
 * `values` is a plain list of strings in column order, so the cells are edited
 * against the column titles instead of as a nested repeater: a nested repeater
 * stores records and would change the persisted shape of the row.
 *
 * @param draft   Live row draft.
 * @param update  Immutable patch writer for the row.
 * @param columns Configured comparison columns, in order.
 */
function columnValues(
	draft: RepeaterItem,
	update: (patch: Partial<RepeaterItem>) => void,
	columns: ComparisonColumn[],
): JSX.Element {
	const values = Array.isArray(draft.values)
		? draft.values.map((value) => String(value ?? ''))
		: [];
	const count = Math.max(columns.length, values.length, 1);

	const setValue = (index: number, next: string): void => {
		const list = Array.from(
			{ length: count },
			(_, position) => values[position] ?? '',
		);

		list[index] = next;
		update({ values: list });
	};

	return (
		<>
			{Array.from({ length: count }, (_, index) => (
				<TextControl
					key={index}
					label={
						columns[index]?.title ||
						sprintf(
							/* translators: %d: comparison column number. */
							__('Column %d', 'doclap'),
							index + 1,
						)
					}
					value={values[index] ?? ''}
					onChange={(next) => setValue(index, next)}
				/>
			))}
		</>
	);
}

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const columns = attributes.columns ?? [];
	const groups = attributes.groups ?? [];

	// One-shot legacy fold: saved content can still carry `compareHeadingAccent`.
	// `needsAccentMerge()` is false as soon as the accent is empty, so this runs
	// once per block and never on a keystroke.
	useEffect(() => {
		const legacyAccent = String(attributes.compareHeadingAccent ?? '');

		if (needsAccentMerge(attributes.compareHeading ?? '', legacyAccent)) {
			setAttributes({
				compareHeading: mergeAccent(
					attributes.compareHeading ?? '',
					legacyAccent,
					'<br><em>',
				),
				compareHeadingAccent: '',
			});
		}
	}, [attributes.compareHeadingAccent, setAttributes]);

	/**
	 * The rows of one group, edited in place inside the group's item editor.
	 *
	 * @param draft  Live group draft.
	 * @param update Immutable patch writer for the group.
	 */
	const groupRows = (
		draft: RepeaterItem,
		update: (patch: Partial<RepeaterItem>) => void,
	): JSX.Element => (
		<Repeater
			label={__('Rows', 'doclap')}
			items={
				Array.isArray(draft.rows) ? (draft.rows as RepeaterItem[]) : []
			}
			fields={rowFields}
			onChange={(items) => update({ rows: items })}
			createItem={() => ({
				feature: __('New consideration', 'doclap'),
				values: columns.map(() => ''),
				isNumeric: false,
			})}
			renderItemExtras={(rowDraft, updateRow) =>
				columnValues(rowDraft, updateRow, columns)
			}
			getItemLabel={(item, index) =>
				truncateLabel(String(item.feature ?? '')) ||
				sprintf(__('Row %d', 'doclap'), index + 1)
			}
			addLabel={__('Add row', 'doclap')}
			emptyLabel={__('No rows in this group yet.', 'doclap')}
		/>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.compareEyebrow ?? ''}
						onChange={(compareEyebrow) => setAttributes({ compareEyebrow })}
					/>
					<TextControl
						label={__('Description', 'doclap')}
						value={attributes.compareText ?? ''}
						onChange={(compareText) => setAttributes({ compareText })}
					/>
					<TextControl
						label={__('Table caption', 'doclap')}
						help={__(
							'Read out with the table and printed above it. Left empty it is not rendered.',
							'doclap',
						)}
						value={attributes.caption ?? ''}
						onChange={(caption) => setAttributes({ caption })}
					/>
					<TextControl
						label={__('First-column heading', 'doclap')}
						value={attributes.rowHeaderLabel ?? ''}
						onChange={(rowHeaderLabel) => setAttributes({ rowHeaderLabel })}
					/>
				</PanelBody>

				<PanelBody title={__('Closing note', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Note', 'doclap')}
						value={attributes.note ?? ''}
						onChange={(note) => setAttributes({ note })}
					/>
					<TextControl
						label={__('Link URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.linkUrl ?? ''}
						onChange={(linkUrl) => setAttributes({ linkUrl })}
					/>
				</PanelBody>

				<PanelBody title={__('Columns', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Columns', 'doclap')}
						items={columns as unknown as RepeaterItem[]}
						fields={[
							{ key: 'title', label: __('Plan', 'doclap') },
							{ key: 'detail', label: __('Detail', 'doclap') },
						]}
						onChange={(items) =>
							setAttributes({
								columns: items as unknown as ComparisonColumn[],
							})
						}
						createItem={() => ({
							title: __('New column', 'doclap'),
							detail: '',
						})}
						getItemLabel={(item, index) =>
							String(item.title ?? '') ||
							sprintf(__('Column %d', 'doclap'), index + 1)
						}
						addLabel={__('Add column', 'doclap')}
						emptyLabel={__('No columns yet.', 'doclap')}
						minimumItems={1}
					/>
				</PanelBody>

				<PanelBody title={__('Groups', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Groups', 'doclap')}
						items={groups as unknown as RepeaterItem[]}
						fields={[{ key: 'label', label: __('Group label', 'doclap') }]}
						onChange={(items) =>
							setAttributes({
								groups: items as unknown as ComparisonGroup[],
							})
						}
						createItem={() => ({
							label: __('New group', 'doclap'),
							rows: [],
						})}
						renderItemExtras={groupRows}
						getItemLabel={(item, index) =>
							String(item.label ?? '') ||
							sprintf(__('Group %d', 'doclap'), index + 1)
						}
						addLabel={__('Add group', 'doclap')}
						emptyLabel={__(
							'No groups yet. Without groups the section prints its heading and note only.',
							'doclap',
						)}
						minimumItems={1}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/plan-comparison" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<PlanComparisonAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
