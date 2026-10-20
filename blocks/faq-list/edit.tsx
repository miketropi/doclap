import { InspectorControls } from '@wordpress/block-editor';
import {
	Notice,
	PanelBody,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import {
	collectSlugIssues,
	describeSlugIssue,
	slugHelp,
} from '../../resources/ts/editor/slug-help';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import { truncateLabel } from '../../resources/ts/editor/accent-migration';
import type { FaqFilter, FaqListAttributes, FaqQuestion } from './types';

interface EditProps {
	attributes: FaqListAttributes;
	setAttributes: (attributes: Partial<FaqListAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{
		path: 'asideHeading',
		label: __('Aside heading', 'doclap'),
		multiline: true,
	},
	{ path: 'asideCopy', label: __('Aside copy', 'doclap'), multiline: true },
	{ path: 'asideLinkLabel', label: __('Aside link label', 'doclap') },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const filters = attributes.filters ?? [];
	const questions = attributes.questions ?? [];
	const filterSlugs = filters.map((filter) => String(filter.slug ?? '').trim());
	const filterIssues = collectSlugIssues(filterSlugs);
	const questionIssues = collectSlugIssues(
		questions.map((question) => String(question.category ?? '')),
		{ knownValues: filterSlugs.filter((slug) => '' !== slug) },
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Aside', 'doclap')} initialOpen>
					<TextControl
						label={__('Label', 'doclap')}
						value={attributes.asideLabel ?? ''}
						onChange={(asideLabel) => setAttributes({ asideLabel })}
					/>
					<TextControl
						label={__('Link URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.asideLinkUrl ?? ''}
						onChange={(asideLinkUrl) => setAttributes({ asideLinkUrl })}
					/>
				</PanelBody>

				<PanelBody title={__('Filters', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('“All” filter label', 'doclap')}
						value={attributes.filterAllLabel ?? ''}
						onChange={(filterAllLabel) => setAttributes({ filterAllLabel })}
					/>
					<Repeater
						label={__('Filter groups', 'doclap')}
						items={filters as unknown as RepeaterItem[]}
						fields={[
							{ key: 'slug', label: __('Group identifier', 'doclap'), help: slugHelp },
							{ key: 'label', label: __('Label', 'doclap') },
						]}
						createItem={() => ({
							slug: 'group',
							label: __('Group', 'doclap'),
						})}
						getItemLabel={(item) => String(item.label ?? '')}
						onChange={(items) => setAttributes({ filters: items as FaqFilter[] })}
						addLabel={__('Add group', 'doclap')}
						emptyLabel={__('No filter groups yet.', 'doclap')}
					/>

					{filterIssues.length > 0 ? (
						<Notice
							className="doclap-slug-notice"
							status="warning"
							isDismissible={false}
						>
							{filterIssues.map((issue) => (
								<p
									className="doclap-slug-notice__line"
									key={`${issue.position}-${issue.kind}`}
								>
									{describeSlugIssue(issue)}
								</p>
							))}
						</Notice>
					) : null}
				</PanelBody>

				<PanelBody title={__('Questions', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Questions', 'doclap')}
						items={questions as unknown as RepeaterItem[]}
						fields={[
							{
								key: 'category',
								label: __('Group identifier', 'doclap'),
								help: __('Must match one of the filter group identifiers above.', 'doclap'),
							},
							{
								key: 'question',
								label: __('Question', 'doclap'),
								control: 'rich',
								tagName: 'span',
							},
							{
								key: 'answer',
								label: __('Answer', 'doclap'),
								control: 'rich',
								tagName: 'p',
								multiline: true,
							},
						]}
						createItem={() => ({
							category: filterSlugs[0] ?? 'start',
							question: __('New question', 'doclap'),
							answer: '',
						})}
						getItemLabel={(item) => truncateLabel(String(item.question ?? ''))}
						onChange={(items) => setAttributes({ questions: items as FaqQuestion[] })}
						addLabel={__('Add question', 'doclap')}
						emptyLabel={__('No questions yet.', 'doclap')}
						minimumItems={1}
					/>

					{questionIssues.length > 0 ? (
						<Notice
							className="doclap-slug-notice"
							status="warning"
							isDismissible={false}
						>
							{questionIssues.map((issue) => (
								<p
									className="doclap-slug-notice__line"
									key={`${issue.position}-${issue.kind}`}
								>
									{describeSlugIssue(issue)}
								</p>
							))}
						</Notice>
					) : null}

					<TextControl
						label={__('Count template', 'doclap')}
						help={__('Use %d for the number of questions.', 'doclap')}
						value={attributes.countTemplate ?? ''}
						onChange={(countTemplate) => setAttributes({ countTemplate })}
					/>
					<TextControl
						label={__('No-results message', 'doclap')}
						value={attributes.emptyLabel ?? ''}
						onChange={(emptyLabel) => setAttributes({ emptyLabel })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/faq-list" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<FaqListAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
