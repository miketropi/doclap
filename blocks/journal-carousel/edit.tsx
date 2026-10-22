import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import { urlHelpWithStructuralNote } from '../../resources/ts/editor/url-help';
import type { JournalCarouselAttributes } from './types';

interface EditProps {
	attributes: JournalCarouselAttributes;
	setAttributes: (attributes: Partial<JournalCarouselAttributes>) => void;
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
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Heading', 'doclap')} initialOpen>
					<TextControl
						label={__('Eyebrow', 'doclap')}
						value={attributes.journalEyebrow ?? ''}
						onChange={(journalEyebrow) => setAttributes({ journalEyebrow })}
					/>
					<RangeControl
						label={__('Posts to show', 'doclap')}
						min={1}
						max={24}
						value={attributes.postsPerPage}
						onChange={(postsPerPage) => setAttributes({ postsPerPage: postsPerPage ?? 3 })}
					/>
				</PanelBody>

				<PanelBody title={__('Carousel', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Accessible name', 'doclap')}
						value={attributes.ariaLabel ?? ''}
						onChange={(ariaLabel) => setAttributes({ ariaLabel })}
					/>
					<TextControl
						label={__('Artwork label', 'doclap')}
						value={attributes.artLabel ?? ''}
						onChange={(artLabel) => setAttributes({ artLabel })}
					/>
					<TextControl
						label={__('Fallback card label', 'doclap')}
						value={attributes.cardMeta ?? ''}
						onChange={(cardMeta) => setAttributes({ cardMeta })}
					/>
					<TextControl
						label={__('Read link label', 'doclap')}
						value={attributes.readMoreLabel ?? ''}
						onChange={(readMoreLabel) => setAttributes({ readMoreLabel })}
					/>
					<TextControl
						label={__('Empty state', 'doclap')}
						value={attributes.emptyLabel ?? ''}
						onChange={(emptyLabel) => setAttributes({ emptyLabel })}
					/>
					<TextControl
						label={__('View-all label', 'doclap')}
						value={attributes.viewAllLabel ?? ''}
						onChange={(viewAllLabel) => setAttributes({ viewAllLabel })}
					/>
					<TextControl
						label={__('View-all URL', 'doclap')}
						help={urlHelpWithStructuralNote}
						value={attributes.viewAllUrl ?? ''}
						onChange={(viewAllUrl) => setAttributes({ viewAllUrl })}
					/>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/journal-carousel" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<JournalCarouselAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
