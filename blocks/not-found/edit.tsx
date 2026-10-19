import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import Repeater, {
	type RepeaterField,
	type RepeaterItem,
} from '../../resources/ts/editor/repeater';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelp } from '../../resources/ts/editor/url-help';
import {
	mergeAccent,
	needsAccentMerge,
} from '../../resources/ts/editor/accent-migration';
import type { NotFoundAttributes, RecoveryLink } from './types';

interface EditProps {
	attributes: NotFoundAttributes;
	setAttributes: (attributes: Partial<NotFoundAttributes>) => void;
	isSelected: boolean;
}

const linkFields: RepeaterField[] = [
	{
		key: 'label',
		label: __('Label', 'doclap'),
	},
	{
		key: 'url',
		label: __('URL', 'doclap'),
		help: urlHelp,
	},
];

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'heading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'lead', label: __('Lead', 'doclap'), multiline: true },
	{
		path: 'asideHeading',
		label: __('Section heading', 'doclap'),
		multiline: true,
	},
	{ path: 'primaryLabel', label: __('Primary label', 'doclap') },
	{ path: 'secondaryLabel', label: __('Secondary label', 'doclap') },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const links = attributes.links ?? [];

	// One-shot legacy folds: saved content can still carry the split accents.
	// `needsAccentMerge()` is false as soon as an accent is empty, so these run
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
		const legacyAccent = String(attributes.asideHeadingAccent ?? '');

		if (needsAccentMerge(attributes.asideHeading ?? '', legacyAccent)) {
			setAttributes({
				asideHeading: mergeAccent(
					attributes.asideHeading ?? '',
					legacyAccent,
					'<br>',
				),
				asideHeadingAccent: '',
			});
		}
	}, [attributes.asideHeadingAccent, setAttributes]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Error hero', 'doclap')} initialOpen>
					<TextControl
						label={__('Error code', 'doclap')}
						value={attributes.errorCode ?? ''}
						onChange={(errorCode) => setAttributes({ errorCode })}
					/>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.eyebrow ?? ''}
						onChange={(eyebrow) => setAttributes({ eyebrow })}
					/>
				</PanelBody>

				<PanelBody title={__('Actions', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Primary URL', 'doclap')}
						help={`${urlHelp} ${__(
							'Leave empty to link to the site home.',
							'doclap',
						)}`}
						value={attributes.primaryUrl ?? ''}
						onChange={(primaryUrl) => setAttributes({ primaryUrl })}
					/>
					<TextControl
						label={__('Secondary URL', 'doclap')}
						help={urlHelp}
						value={attributes.secondaryUrl ?? ''}
						onChange={(secondaryUrl) => setAttributes({ secondaryUrl })}
					/>
				</PanelBody>

				<PanelBody title={__('Other directions', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Section label', 'doclap')}
						value={attributes.asideLabel ?? ''}
						onChange={(asideLabel) => setAttributes({ asideLabel })}
					/>
					<Repeater
						label={__('Recovery links', 'doclap')}
						items={links as unknown as RepeaterItem[]}
						fields={linkFields}
						onChange={(items) =>
							setAttributes({ links: items as unknown as RecoveryLink[] })
						}
						createItem={() => ({
							label: __('New destination', 'doclap'),
							url: '',
						})}
						getItemLabel={(item) =>
							String(item.label || __('Destination', 'doclap'))
						}
						addLabel={__('Add destination', 'doclap')}
						emptyLabel={__('No recovery links yet.', 'doclap')}
					/>
				</PanelBody>
			</InspectorControls>
			<BlockPreview block="doclap/not-found" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<NotFoundAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
