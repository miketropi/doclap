import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type { HomeJournalAttributes, JournalLink } from './types';

interface EditProps {
	attributes: HomeJournalAttributes;
	setAttributes: (attributes: Partial<HomeJournalAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
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
						label={__('Heading', 'doclap')}
						value={attributes.journalHeading ?? ''}
						onChange={(journalHeading) => setAttributes({ journalHeading })}
					/>
					<TextControl
						label={__('Metadata', 'doclap')}
						value={attributes.journalMeta ?? ''}
						onChange={(journalMeta) => setAttributes({ journalMeta })}
					/>
				</PanelBody>

				<PanelBody title={__('Items', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Notes', 'doclap')}
						items={links as unknown as RepeaterItem[]}
						fields={[
							{ key: 'meta', label: __('Metadata', 'doclap') },
							{ key: 'title', label: __('Title', 'doclap') },
							{
								key: 'copy',
								label: __('Copy', 'doclap'),
								control: 'textarea',
							},
							{
								key: 'url',
								label: __('URL', 'doclap'),
								help: __(
									'Accepts #section, /path/, @notes or @search. Changing a structural anchor needs matching header and footer links.',
									'doclap',
								),
							},
						]}
						onChange={(items) =>
							setAttributes({ journalLinks: items as unknown as JournalLink[] })
						}
						createItem={() => ({ meta: '', title: 'New note', copy: '', url: '@notes' })}
						getItemLabel={(item, index) =>
							String(item.title || sprintf(__('Note %d', 'doclap'), index + 1))
						}
						addLabel={__('Add note', 'doclap')}
						emptyLabel={__('No notes yet.', 'doclap')}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="doclap/home-journal"
				attributes={attributes as unknown as Record<string, unknown>}
			/>
		</>
	);
}
