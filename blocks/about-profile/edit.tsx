import {
	InspectorControls,
	MediaPlaceholder,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type {
	AboutProfileAttributes,
	AboutSection,
	Principle,
} from './types';

interface EditProps {
	attributes: AboutProfileAttributes;
	setAttributes: (attributes: Partial<AboutProfileAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const sections = attributes.sections ?? [];
	const principles = attributes.principles ?? [];
	const updateSection = (index: number, patch: Partial<AboutSection>): void => {
		setAttributes({
			sections: sections.map((item, position) =>
				position === index ? { ...item, ...patch } : item,
			),
		});
	};

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
						label={__('Current page breadcrumb', 'doclap')}
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
						label={__('Lead', 'doclap')}
						value={attributes.lead ?? ''}
						onChange={(lead) => setAttributes({ lead })}
					/>
				</PanelBody>

				<PanelBody title={__('Narrative sections', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Sections', 'doclap')}
						items={sections as unknown as RepeaterItem[]}
						fields={[
							{ key: 'label', label: __('Label', 'doclap') },
							{ key: 'heading', label: __('Heading', 'doclap') },
							{
								key: 'headingAccent',
								label: __('Heading second line', 'doclap'),
							},
						]}
						onChange={(items) =>
							setAttributes({ sections: items as unknown as AboutSection[] })
						}
						createItem={() => ({
							label: '',
							heading: '',
							headingAccent: '',
							paragraphs: [],
						})}
						getItemLabel={(item, index) =>
							String(
								item.label || sprintf(__('Section %d', 'doclap'), index + 1),
							)
						}
					/>
				</PanelBody>
				{sections.map((section, index) => (
					<PanelBody
						key={`section-paragraphs-${index}`}
						title={sprintf(
							__('%s paragraphs', 'doclap'),
							section.label || sprintf(__('Section %d', 'doclap'), index + 1),
						)}
						initialOpen={false}
					>
						<Repeater
							label={__('Paragraphs', 'doclap')}
							items={(section.paragraphs ?? []).map((text) => ({ text }))}
							fields={[
								{
									key: 'text',
									label: __('Paragraph', 'doclap'),
									control: 'textarea',
								},
							]}
							onChange={(items) =>
								updateSection(index, {
									paragraphs: items.map((item) => String(item.text ?? '')),
								})
							}
							createItem={() => ({ text: '' })}
							getItemLabel={(_item, paragraphIndex) =>
								sprintf(__('Paragraph %d', 'doclap'), paragraphIndex + 1)
							}
						/>
					</PanelBody>
				))}

				<PanelBody title={__('Studio image', 'doclap')} initialOpen={false}>
					{attributes.studioImageUrl ? (
						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media: {
									id?: number;
									url?: string;
									alt?: string;
								}) =>
									setAttributes({
										studioImageId: media.id ?? 0,
										studioImageUrl: media.url ?? '',
										studioImageAlt:
											media.alt || attributes.studioImageAlt,
									})
								}
								allowedTypes={['image']}
								value={attributes.studioImageId || undefined}
								render={({ open }) => (
									<>
										<Button variant="secondary" onClick={open}>
											{__('Replace image', 'doclap')}
										</Button>
										<Button
											variant="tertiary"
											isDestructive
											onClick={() =>
												setAttributes({
													studioImageId: 0,
													studioImageUrl: '',
												})
											}
										>
											{__('Remove image', 'doclap')}
										</Button>
									</>
								)}
							/>
						</MediaUploadCheck>
					) : (
						<MediaPlaceholder
							allowedTypes={['image']}
							labels={{ title: __('Studio image', 'doclap') }}
							onSelect={(media: {
								id?: number;
								url?: string;
								alt?: string;
							}) =>
								setAttributes({
									studioImageId: media.id ?? 0,
									studioImageUrl: media.url ?? '',
									studioImageAlt: media.alt || attributes.studioImageAlt,
								})
							}
						/>
					)}
					<TextControl
						label={__('Alternative text', 'doclap')}
						value={attributes.studioImageAlt ?? ''}
						onChange={(studioImageAlt) => setAttributes({ studioImageAlt })}
					/>
					<TextareaControl
						label={__('Caption', 'doclap')}
						value={attributes.studioImageCaption ?? ''}
						onChange={(studioImageCaption) => setAttributes({ studioImageCaption })}
					/>
				</PanelBody>

				<PanelBody title={__('Principles and status', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Principles', 'doclap')}
						items={principles as unknown as RepeaterItem[]}
						fields={[
							{ key: 'label', label: __('Label', 'doclap') },
							{ key: 'title', label: __('Title', 'doclap') },
							{
								key: 'copy',
								label: __('Copy', 'doclap'),
								control: 'textarea',
							},
						]}
						onChange={(items) =>
							setAttributes({ principles: items as unknown as Principle[] })
						}
						createItem={() => ({ label: '', title: '', copy: '' })}
						getItemLabel={(item, index) =>
							String(
								item.title || sprintf(__('Principle %d', 'doclap'), index + 1),
							)
						}
					/>
					<TextareaControl
						label={__('Portfolio status note', 'doclap')}
						value={attributes.statusNote ?? ''}
						onChange={(statusNote) => setAttributes({ statusNote })}
					/>
				</PanelBody>

				<PanelBody title={__('Closing call to action', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.closingEyebrow ?? ''}
						onChange={(closingEyebrow) => setAttributes({ closingEyebrow })}
					/>
					<TextControl
						label={__('Heading', 'doclap')}
						value={attributes.closingHeading ?? ''}
						onChange={(closingHeading) => setAttributes({ closingHeading })}
					/>
					<TextControl
						label={__('Heading accent', 'doclap')}
						value={attributes.closingHeadingAccent ?? ''}
						onChange={(closingHeadingAccent) => setAttributes({ closingHeadingAccent })}
					/>
					<TextControl
						label={__('Link label', 'doclap')}
						value={attributes.closingCtaLabel ?? ''}
						onChange={(closingCtaLabel) => setAttributes({ closingCtaLabel })}
					/>
					<TextControl
						label={__('Link URL', 'doclap')}
						value={attributes.closingCtaUrl ?? ''}
						onChange={(closingCtaUrl) => setAttributes({ closingCtaUrl })}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/about-profile"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
