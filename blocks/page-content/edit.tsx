import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import type { PageContentAttributes } from './types';

interface EditProps {
	attributes: PageContentAttributes;
	setAttributes: (attributes: Partial<PageContentAttributes>) => void;
	isSelected: boolean;
}

export default function Edit({
	attributes,
	setAttributes,
}: EditProps): JSX.Element {
	/*
	 * The body is the page's own content, so the block declares no copy of its
	 * own: the sidebar carries the section colours and the canvas previews the
	 * server-rendered output, with sample copy on a screen that has no page.
	 */
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Page body', 'doclap')} initialOpen>
					<p>
						{__(
							'This section renders the page content itself. Edit the page to change it.',
							'doclap',
						)}
					</p>
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview
				block="doclap/page-content"
				attributes={attributes}
				notice={__(
					'Previewing the page this block sits on. Sample copy is shown where the page has no content yet.',
					'doclap',
				)}
			/>
		</>
	);
}
