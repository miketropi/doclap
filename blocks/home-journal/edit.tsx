import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import { truncateLabel } from '../../resources/ts/editor/accent-migration';
import type { HomeJournalAttributes, JournalLink } from './types';

interface EditProps {
	attributes: HomeJournalAttributes;
	setAttributes: (attributes: Partial<HomeJournalAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'journalHeading', label: __('Heading', 'doclap'), multiline: true },
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const links = attributes.journalLinks ?? [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.journalEyebrow ?? ''}
						onChange={(journalEyebrow) => setAttributes({ journalEyebrow })}
					/>
					<TextControl
						label={__('Metadata', 'doclap')}
						value={attributes.journalMeta ?? ''}
						onChange={(journalMeta) => setAttributes({ journalMeta })}
					/>
				</PanelBody>

				<PanelBody title={__('Notes', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Notes', 'doclap')}
						items={links as unknown as RepeaterItem[]}
						fields={[
							{ key: 'meta', label: __('Metadata', 'doclap') },
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
							{
								key: 'url',
								label: __('URL', 'doclap'),
								help: urlHelpWithStructuralNote,
							},
						]}
						onChange={(items) =>
							setAttributes({ journalLinks: items as unknown as JournalLink[] })
						}
						createItem={() => ({
							meta: '',
							title: __('New note', 'doclap'),
							copy: '',
							url: '@notes',
						})}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.title ?? '')) ||
							sprintf(__('Note %d', 'doclap'), index + 1)
						}
						addLabel={__('Add note', 'doclap')}
						emptyLabel={__('No notes yet.', 'doclap')}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/home-journal" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<HomeJournalAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
