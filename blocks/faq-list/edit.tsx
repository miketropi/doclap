import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type { FaqFilter, FaqListAttributes, FaqQuestion } from './types';

interface EditProps {
	attributes: FaqListAttributes;
	setAttributes: (attributes: Partial<FaqListAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const filters = attributes.filters ?? [];
	const questions = attributes.questions ?? [];
	const text = (key: keyof FaqListAttributes, label: string) => (
		<TextControl
			label={label}
			value={String(attributes[key] ?? '')}
			onChange={(value) => setAttributes({ [key]: value })}
		/>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Hero', 'doclap')}>
					{text('breadcrumbHomeLabel', __('Home breadcrumb', 'doclap'))}
					{text('breadcrumbLabel', __('Current breadcrumb', 'doclap'))}
					{text('heading', __('Heading', 'doclap'))}
					{text('headingAccent', __('Heading accent', 'doclap'))}
					<TextareaControl
						label={__('Lead', 'doclap')}
						value={attributes.lead ?? ''}
						onChange={(lead) => setAttributes({ lead })}
					/>
				</PanelBody>

				<PanelBody title={__('Aside', 'doclap')} initialOpen={false}>
					{text('asideLabel', __('Label', 'doclap'))}
					<TextareaControl
						label={__('Heading', 'doclap')}
						value={attributes.asideHeading ?? ''}
						onChange={(asideHeading) => setAttributes({ asideHeading })}
					/>
					<TextareaControl
						label={__('Copy', 'doclap')}
						value={attributes.asideCopy ?? ''}
						onChange={(asideCopy) => setAttributes({ asideCopy })}
					/>
					{text('asideLinkLabel', __('Link label', 'doclap'))}
					{text('asideLinkUrl', __('Link URL', 'doclap'))}
				</PanelBody>

				<PanelBody title={__('Filters', 'doclap')} initialOpen={false}>
					{text('filterAllLabel', __('All label', 'doclap'))}
					<Repeater
						label={__('Filter groups', 'doclap')}
						items={filters as RepeaterItem[]}
						fields={[
							{ key: 'slug', label: __('Slug', 'doclap') },
							{ key: 'label', label: __('Label', 'doclap') },
						]}
						createItem={() => ({
							slug: 'group',
							label: __('Group', 'doclap'),
						})}
						getItemLabel={(item) => String(item.label ?? '')}
						onChange={(items) => setAttributes({ filters: items as FaqFilter[] })}
					/>
				</PanelBody>

				<PanelBody title={__('Questions', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Questions', 'doclap')}
						items={questions as RepeaterItem[]}
						fields={[
							{ key: 'category', label: __('Category slug', 'doclap') },
							{ key: 'question', label: __('Question', 'doclap') },
							{
								key: 'answer',
								label: __('Answer', 'doclap'),
								control: 'textarea',
							},
						]}
						createItem={() => ({
							category: filters[0]?.slug ?? 'start',
							question: __('New question', 'doclap'),
							answer: '',
						})}
						getItemLabel={(item) => String(item.question ?? '')}
						onChange={(items) => setAttributes({ questions: items as FaqQuestion[] })}
					/>
					{text('countTemplate', __('Count template (%d is replaced)', 'doclap'))}
					{text('emptyLabel', __('No-results message', 'doclap'))}
				</PanelBody>

				<PanelBody title={__('Closing call to action', 'doclap')} initialOpen={false}>
					{text('closingEyebrow', __('Eyebrow', 'doclap'))}
					{text('closingHeading', __('Heading', 'doclap'))}
					{text('closingHeadingAccent', __('Heading accent', 'doclap'))}
					{text('closingCtaLabel', __('Link label', 'doclap'))}
					{text('closingCtaUrl', __('Link URL', 'doclap'))}
				</PanelBody>
			</InspectorControls>

			<ServerSideRender
				block="doclap/faq-list"
				attributes={attributes as Record<string, unknown>}
			/>
		</>
	);
}
