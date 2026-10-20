import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

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
import type { Paragraph, SplitNarrativeAttributes } from './types';

interface EditProps {
	attributes: SplitNarrativeAttributes;
	setAttributes: (attributes: Partial<SplitNarrativeAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'heading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'statusNote', label: __('Status note', 'doclap'), multiline: true },
	{ path: 'linkLabel', label: __('Link label', 'doclap') },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const paragraphs: Paragraph[] = (attributes.paragraphs ?? []).map((text) => ({ text }));

	// One-shot legacy fold. Every saved block that predates the merge still
	// carries the split accent; `needsAccentMerge()` is false as soon as the
	// accent is empty, so this runs once per block and never on a keystroke.
	useEffect(() => {
		const legacyAccent = String(attributes.headingAccent ?? '');

		if (needsAccentMerge(attributes.heading ?? '', legacyAccent)) {
			setAttributes({
				heading: mergeAccent(attributes.heading ?? '', legacyAccent, '<br>'),
				headingAccent: '',
			});
		}
	}, [attributes.headingAccent, setAttributes]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Narrative', 'doclap')} initialOpen>
					<TextControl
						label={__('Aside label', 'doclap')}
						value={attributes.label ?? ''}
						onChange={(label) => setAttributes({ label })}
					/>
					<RichTextControl
						label={__('Status note', 'doclap')}
						value={attributes.statusNote ?? ''}
						onChange={(statusNote) => setAttributes({ statusNote })}
						multiline
					/>
				</PanelBody>

				<PanelBody title={__('Paragraphs', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Paragraphs', 'doclap')}
						items={paragraphs as RepeaterItem[]}
						fields={[
							{
								key: 'text',
								label: __('Paragraph', 'doclap'),
								control: 'rich',
								tagName: 'p',
								multiline: true,
							},
						]}
						createItem={() => ({ text: '' })}
						onChange={(items) =>
							setAttributes({
								paragraphs: items.map((item) =>
									String(item.text ?? ''),
								),
							})
						}
						getItemLabel={(_item, index) =>
							sprintf(__('Paragraph %d', 'doclap'), index + 1)
						}
						addLabel={__('Add paragraph', 'doclap')}
						emptyLabel={__('No paragraphs yet.', 'doclap')}
					/>
				</PanelBody>

				<PanelBody title={__('Link', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Link URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.linkUrl ?? ''}
						onChange={(linkUrl) => setAttributes({ linkUrl })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/split-narrative" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<SplitNarrativeAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
