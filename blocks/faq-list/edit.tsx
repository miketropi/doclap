import { InspectorControls } from '@wordpress/block-editor';
import {
	Notice,
	PanelBody,
	TextControl,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
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
import {
	mergeAccent,
	needsAccentMerge,
	truncateLabel,
} from '../../resources/ts/editor/accent-migration';
import type { FaqFilter, FaqListAttributes, FaqQuestion } from './types';

interface EditProps {
	attributes: FaqListAttributes;
	setAttributes: (attributes: Partial<FaqListAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'heading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'lead', label: __('Lead', 'doclap'), multiline: true },
	{
		path: 'asideHeading',
		label: __('Aside heading', 'doclap'),
		multiline: true,
	},
	{ path: 'asideCopy', label: __('Aside copy', 'doclap'), multiline: true },
	{
		path: 'closingHeading',
		label: __('Closing heading', 'doclap'),
		multiline: true,
	},
	{ path: 'asideLinkLabel', label: __('Aside link label', 'doclap') },
	{ path: 'closingCtaLabel', label: __('Closing link label', 'doclap') },
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

	// One-shot legacy folds: saved content can still carry the split accents.
	// `needsAccentMerge()` is false as soon as the accent is empty, so these run
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
						value={attributes.breadcrumbHomeLabel ?? ''}
						onChange={(breadcrumbHomeLabel) => setAttributes({ breadcrumbHomeLabel })}
					/>
					<TextControl
						label={__('Current breadcrumb', 'doclap')}
						value={attributes.breadcrumbLabel ?? ''}
						onChange={(breadcrumbLabel) => setAttributes({ breadcrumbLabel })}
					/>
				</PanelBody>

				<PanelBody title={__('Aside', 'doclap')} initialOpen={false}>
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

				<PanelBody
					title={__('Closing call to action', 'doclap')}
					initialOpen={false}
				>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.closingEyebrow ?? ''}
						onChange={(closingEyebrow) => setAttributes({ closingEyebrow })}
					/>
					<TextControl
						label={__('Link URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.closingCtaUrl ?? ''}
						onChange={(closingCtaUrl) => setAttributes({ closingCtaUrl })}
					/>
				</PanelBody>
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
