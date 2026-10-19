import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import {
	mergeAccent,
	needsAccentMerge,
} from '../../resources/ts/editor/accent-migration';
import type { HomeContactAttributes } from './types';

interface EditProps {
	attributes: HomeContactAttributes;
	setAttributes: (attributes: Partial<HomeContactAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{
		path: 'contactHeading',
		label: __('Heading', 'doclap'),
		multiline: true,
	},
	{ path: "contactLead", label: __("Lead", "doclap"), multiline: true },
	{ path: "contactCtaLabel", label: __("Link label", "doclap") },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	// One-shot legacy fold: saved content can still carry `contactHeadingAccent`.
	// `needsAccentMerge()` is false as soon as the accent is empty, so this runs
	// once per block and never on a keystroke.
	useEffect(() => {
		const legacyAccent = String(attributes.contactHeadingAccent ?? '');

		if (needsAccentMerge(attributes.contactHeading ?? '', legacyAccent)) {
			setAttributes({
				contactHeading: mergeAccent(
					attributes.contactHeading ?? '',
					legacyAccent,
					'<br><em>',
				),
				contactHeadingAccent: '',
			});
		}
	}, [attributes.contactHeadingAccent, setAttributes]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.contactEyebrow ?? ''}
						onChange={(contactEyebrow) => setAttributes({ contactEyebrow })}
					/>
				</PanelBody>

				<PanelBody
					title={__('Closing call to action', 'doclap')}
					initialOpen={false}
				>
					<TextControl
						label={__('Link URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.contactCtaUrl ?? ''}
						onChange={(contactCtaUrl) => setAttributes({ contactCtaUrl })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/home-contact" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<HomeContactAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
