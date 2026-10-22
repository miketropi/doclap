import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import {
	mergeAccent,
	needsAccentMerge,
} from '../../resources/ts/editor/accent-migration';
import type { NewsletterSignupAttributes } from './types';

interface EditProps {
	attributes: NewsletterSignupAttributes;
	setAttributes: (attributes: Partial<NewsletterSignupAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{
		path: 'newsletterHeading',
		label: __('Heading', 'doclap'),
		multiline: true,
	},
	{
		path: 'newsletterText',
		label: __('Supporting text', 'doclap'),
		multiline: true,
	},
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	// One-shot legacy fold: saved content can still carry
	// `newsletterHeadingAccent`. `needsAccentMerge()` is false as soon as the
	// accent is empty, so this runs once per block and never on a keystroke.
	useEffect(() => {
		const legacyAccent = String(attributes.newsletterHeadingAccent ?? '');

		if (needsAccentMerge(attributes.newsletterHeading ?? '', legacyAccent)) {
			setAttributes({
				newsletterHeading: mergeAccent(
					attributes.newsletterHeading ?? '',
					legacyAccent,
					'<br><em>',
				),
				newsletterHeadingAccent: '',
			});
		}
	}, [attributes.newsletterHeadingAccent, setAttributes]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.newsletterEyebrow ?? ''}
						onChange={(newsletterEyebrow) =>
							setAttributes({ newsletterEyebrow })
						}
					/>
					<TextControl
						label={__('Meta line — left', 'doclap')}
						value={attributes.metaPrimary ?? ''}
						onChange={(metaPrimary) => setAttributes({ metaPrimary })}
					/>
					<TextControl
						label={__('Meta line — right', 'doclap')}
						value={attributes.metaSecondary ?? ''}
						onChange={(metaSecondary) => setAttributes({ metaSecondary })}
					/>
				</PanelBody>

				<PanelBody title={__('Form', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Form label', 'doclap')}
						help={__(
							'Read by assistive technology instead of a visible heading.',
							'doclap',
						)}
						value={attributes.formLabel ?? ''}
						onChange={(formLabel) => setAttributes({ formLabel })}
					/>
					<TextControl
						label={__('Email field label', 'doclap')}
						value={attributes.emailLabel ?? ''}
						onChange={(emailLabel) => setAttributes({ emailLabel })}
					/>
					<TextControl
						label={__('Email placeholder', 'doclap')}
						value={attributes.emailPlaceholder ?? ''}
						onChange={(emailPlaceholder) =>
							setAttributes({ emailPlaceholder })
						}
					/>
					<TextControl
						label={__('Submit label', 'doclap')}
						value={attributes.submitLabel ?? ''}
						onChange={(submitLabel) => setAttributes({ submitLabel })}
					/>
					<TextControl
						label={__('Consent label', 'doclap')}
						value={attributes.consentLabel ?? ''}
						onChange={(consentLabel) => setAttributes({ consentLabel })}
					/>
					<TextControl
						label={__('Disclosure', 'doclap')}
						help={__(
							'Explains what the signup actually does. It is linked from the email field.',
							'doclap',
						)}
						value={attributes.disclosure ?? ''}
						onChange={(disclosure) => setAttributes({ disclosure })}
					/>
					<TextControl
						label={__('Remove link label', 'doclap')}
						value={attributes.removeLabel ?? ''}
						onChange={(removeLabel) => setAttributes({ removeLabel })}
					/>
				</PanelBody>

				<PanelBody title={__('Status messages', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Idle', 'doclap')}
						value={attributes.idleStatus ?? ''}
						onChange={(idleStatus) => setAttributes({ idleStatus })}
					/>
					<TextControl
						label={__('Saved', 'doclap')}
						value={attributes.savedStatus ?? ''}
						onChange={(savedStatus) => setAttributes({ savedStatus })}
					/>
					<TextControl
						label={__('Restored', 'doclap')}
						value={attributes.restoredStatus ?? ''}
						onChange={(restoredStatus) => setAttributes({ restoredStatus })}
					/>
					<TextControl
						label={__('Removed', 'doclap')}
						value={attributes.removedStatus ?? ''}
						onChange={(removedStatus) => setAttributes({ removedStatus })}
					/>
					<TextControl
						label={__('Storage unavailable', 'doclap')}
						value={attributes.unavailableStatus ?? ''}
						onChange={(unavailableStatus) =>
							setAttributes({ unavailableStatus })
						}
					/>
					<TextControl
						label={__('Save failed', 'doclap')}
						value={attributes.saveFailedStatus ?? ''}
						onChange={(saveFailedStatus) =>
							setAttributes({ saveFailedStatus })
						}
					/>
					<TextControl
						label={__('Remove failed', 'doclap')}
						value={attributes.removeFailedStatus ?? ''}
						onChange={(removeFailedStatus) =>
							setAttributes({ removeFailedStatus })
						}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/newsletter-signup" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<NewsletterSignupAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
