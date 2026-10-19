import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ImageControl from '../../resources/ts/editor/image-control';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import RichTextControl from '../../resources/ts/editor/rich-text-control';
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
	AboutProfileAttributes,
	AboutSection,
	Principle,
} from './types';

interface EditProps {
	attributes: AboutProfileAttributes;
	setAttributes: (attributes: Partial<AboutProfileAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'heading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'lead', label: __('Lead', 'doclap'), multiline: true },
	{
		path: 'closingHeading',
		label: __('Closing heading', 'doclap'),
		multiline: true,
	},
	{ path: 'closingCtaLabel', label: __('Link label', 'doclap') },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const sections = attributes.sections ?? [];
	const principles = attributes.principles ?? [];

	// One-shot legacy fold. Every saved block that predates the merge still
	// carries the split accents; `needsAccentMerge()` is false as soon as the
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

	useEffect(() => {
		let folded = false;
		const next = sections.map((section) => {
			const legacyAccent = String(section.headingAccent ?? '');

			if (!needsAccentMerge(section.heading ?? '', legacyAccent)) {
				return section;
			}

			folded = true;
			const merged: AboutSection = {
				...section,
				heading: mergeAccent(section.heading ?? '', legacyAccent, '<br>'),
			};
			delete merged.headingAccent;

			return merged;
		});

		if (folded) {
			setAttributes({ sections: next });
		}
	}, [attributes.sections, setAttributes]);

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
				</PanelBody>

				<PanelBody title={__('Narrative sections', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Sections', 'doclap')}
						items={sections as unknown as RepeaterItem[]}
						fields={[
							{ key: 'label', label: __('Label', 'doclap') },
							{
								key: 'heading',
								label: __('Heading', 'doclap'),
								control: 'rich',
								tagName: 'h2',
								multiline: true,
							},
						]}
						onChange={(items) =>
							setAttributes({ sections: items as unknown as AboutSection[] })
						}
						createItem={() => ({
							label: '',
							heading: '',
							paragraphs: [],
						})}
						getItemLabel={(item, index) =>
							String(
								item.label || sprintf(__('Section %d', 'doclap'), index + 1),
							)
						}
						// The paragraphs of a section belong to that section, so they
						// are edited inside its own item editor: the nested repeater
						// patches the parent draft through `update` and never writes
						// to the attribute directly, which would desynchronise the
						// draft from the stored value.
						renderItemExtras={(draft, update) => (
							<Repeater
								label={__('Paragraphs', 'doclap')}
								items={(Array.isArray(draft.paragraphs)
									? (draft.paragraphs as unknown[])
									: []
								).map((text) => ({ text: String(text ?? '') }))}
								fields={[
									{
										key: 'text',
										label: __('Paragraph', 'doclap'),
										control: 'rich',
										tagName: 'p',
										multiline: true,
									},
								]}
								onChange={(items) =>
									update({
										paragraphs: items.map((item) =>
											String(item.text ?? ''),
										),
									})
								}
								createItem={() => ({ text: '' })}
								getItemLabel={(_item, paragraphIndex) =>
									sprintf(__('Paragraph %d', 'doclap'), paragraphIndex + 1)
								}
							/>
						)}
					/>
				</PanelBody>

				<PanelBody title={__('Studio image', 'doclap')} initialOpen={false}>
					<ImageControl
						value={{
							id: attributes.studioImageId ?? 0,
							url: attributes.studioImageUrl ?? '',
							alt: attributes.studioImageAlt ?? '',
						}}
						labels={{
							title: __('Studio image', 'doclap'),
							select: __(
								'Select an image from the media library or upload a new one.',
								'doclap',
							),
							replace: __('Replace image', 'doclap'),
							remove: __('Remove image', 'doclap'),
							alt: __('Alternative text', 'doclap'),
							caption: __('Caption', 'doclap'),
						}}
						onSelect={(media) =>
							setAttributes({
								studioImageId: media.id,
								studioImageUrl: media.url,
								studioImageAlt: media.alt,
							})
						}
						onRemove={() =>
							setAttributes({ studioImageId: 0, studioImageUrl: '' })
						}
						onChangeAlt={(studioImageAlt) => setAttributes({ studioImageAlt })}
						caption={attributes.studioImageCaption ?? ''}
						onChangeCaption={(studioImageCaption) =>
							setAttributes({ studioImageCaption })
						}
					/>
				</PanelBody>

				<PanelBody title={__('Principles and status', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Principles', 'doclap')}
						items={principles as unknown as RepeaterItem[]}
						fields={[
							{ key: 'label', label: __('Label', 'doclap') },
							{
								key: 'title',
								label: __('Title', 'doclap'),
								control: 'rich',
								tagName: 'h3',
							},
							{
								key: 'copy',
								label: __('Copy', 'doclap'),
								control: 'rich',
								tagName: 'p',
								multiline: true,
							},
						]}
						onChange={(items) =>
							setAttributes({ principles: items as unknown as Principle[] })
						}
						createItem={() => ({ label: '', title: '', copy: '' })}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.title ?? '')) ||
							sprintf(__('Principle %d', 'doclap'), index + 1)
						}
					/>
					<RichTextControl
						label={__('Portfolio status note', 'doclap')}
						value={attributes.statusNote ?? ''}
						onChange={(statusNote) => setAttributes({ statusNote })}
						multiline
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
			<BlockPreview block="doclap/about-profile" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<AboutProfileAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
