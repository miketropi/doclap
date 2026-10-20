import { InspectorControls } from '@wordpress/block-editor';
import {
	Notice,
	PanelBody,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
import MediaControl from '../../resources/ts/editor/media-control';
import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import RichTextOverlay, {
	type RichTextTarget,
} from '../../resources/ts/editor/rich-text-overlay';
import {
	anchorHelp,
	collectSlugIssues,
	describeSlugIssue,
} from '../../resources/ts/editor/slug-help';
import { truncateLabel } from '../../resources/ts/editor/accent-migration';
import type { HomeWorkAttributes, MediaType, Project } from './types';

interface EditProps {
	attributes: HomeWorkAttributes;
	setAttributes: (attributes: Partial<HomeWorkAttributes>) => void;
	isSelected: boolean;
}

/** Rich values edited in place on the canvas (they render unconditionally). */
const overlayTargets: RichTextTarget[] = [
	{ path: 'worksHeading', label: __('Heading', 'doclap'), multiline: true },
	{ path: 'worksCaption', label: __('Caption', 'doclap'), multiline: true },
];

/** Media block used by one project card. */
type ProjectMediaType = 'image' | 'video';

/**
 * Media picker for one project, rendered inside the repeater's item editor.
 *
 * Switching the type clears the selection on purpose: the picker only accepts one
 * attachment kind, so an image URL left behind under `video` would render an empty
 * player with no way to tell why.
 */
function projectMedia(
	draft: RepeaterItem,
	update: (patch: Partial<RepeaterItem>) => void,
): JSX.Element {
	const kind: ProjectMediaType = 'video' === draft.mediaType ? 'video' : 'image';
	const isVideo = 'video' === kind;
	const labels = isVideo
		? {
				title: __('Project video', 'doclap'),
				select: __(
					'Select a video from the media library or upload a new one.',
					'doclap',
				),
				replace: __('Replace video', 'doclap'),
				remove: __('Remove video', 'doclap'),
				alt: __('Video description', 'doclap'),
				altHelp: __(
					'Read out in the dialog. The card itself is announced by its own button.',
					'doclap',
				),
			}
		: {
				title: __('Project image', 'doclap'),
				select: __(
					'Select an image from the media library or upload a new one.',
					'doclap',
				),
				replace: __('Replace image', 'doclap'),
				remove: __('Remove image', 'doclap'),
				alt: __('Image alternative text', 'doclap'),
				altHelp: __(
					'Read out in the dialog. The media library value is used while this is empty.',
					'doclap',
				),
			};

	return (
		<>
			<SelectControl
				label={__('Media type', 'doclap')}
				options={[
					{ label: __('Image', 'doclap'), value: 'image' },
					{ label: __('Video', 'doclap'), value: 'video' },
				]}
				value={kind}
				help={__(
					'Changing the type clears the selected media.',
					'doclap',
				)}
				onChange={(value) => {
					const mediaType: MediaType = 'video' === value ? 'video' : 'image';

					update({ mediaType, mediaId: 0, mediaUrl: '', mediaAlt: '' });
				}}
			/>
			<MediaControl
				kind={kind}
				value={{
					id: Number(draft.mediaId ?? 0),
					url: String(draft.mediaUrl ?? ''),
					alt: String(draft.mediaAlt ?? ''),
				}}
				labels={labels}
				onSelect={(media) =>
					update({ mediaId: media.id, mediaUrl: media.url, mediaAlt: media.alt })
				}
				onRemove={() => update({ mediaId: 0, mediaUrl: '', mediaAlt: '' })}
				onChangeAlt={(mediaAlt) => update({ mediaAlt })}
			/>
		</>
	);
}

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const projects = attributes.projects ?? [];
	const anchorIssues = collectSlugIssues(
		projects.map((project) => String(project.anchor ?? '')),
		{ shape: 'anchor' },
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'doclap')} initialOpen>
					<TextControl
						label={__('Metadata', 'doclap')}
						value={attributes.worksMeta ?? ''}
						onChange={(worksMeta) => setAttributes({ worksMeta })}
					/>
					<TextControl
						label={__('Card action label', 'doclap')}
						help={__(
							'Printed on a card that has media to open.',
							'doclap',
						)}
						value={attributes.viewLabel ?? ''}
						onChange={(viewLabel) => setAttributes({ viewLabel })}
					/>
				</PanelBody>

				<PanelBody title={__('Projects', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Projects', 'doclap')}
						items={projects as unknown as RepeaterItem[]}
						fields={[
							{
								key: 'anchor',
								label: __('Anchor', 'doclap'),
								help: `${anchorHelp} ${__(
									'The header and footer link to it as #anchor.',
									'doclap',
								)}`,
							},
							{ key: 'editionPrimary', label: __('Edition label', 'doclap') },
							{ key: 'editionSecondary', label: __('Edition number', 'doclap') },
							{
								key: 'title',
								label: __('Title', 'doclap'),
								control: 'rich',
								tagName: 'h3',
							},
							{
								key: 'metaLines',
								label: __('Metadata', 'doclap'),
								control: 'textarea',
							},
							{
								key: 'summary',
								label: __('Summary', 'doclap'),
								control: 'rich',
								tagName: 'p',
								multiline: true,
							},
							{ key: 'detailLabel', label: __('Detail label', 'doclap') },
						]}
						onChange={(items) =>
							setAttributes({ projects: items as unknown as Project[] })
						}
						createItem={() => ({
							anchor: '',
							editionPrimary: '',
							editionSecondary: '',
							title: __('New project', 'doclap'),
							metaLines: '',
							summary: '',
							detailLabel: '',
							mediaType: 'image',
							mediaId: 0,
							mediaUrl: '',
							mediaAlt: '',
						})}
						renderItemExtras={projectMedia}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.title ?? '')) ||
							sprintf(__('Project %d', 'doclap'), index + 1)
						}
						addLabel={__('Add project', 'doclap')}
						emptyLabel={__('No projects yet.', 'doclap')}
						minimumItems={1}
					/>

					{anchorIssues.length > 0 ? (
						<Notice
							className="doclap-slug-notice"
							status="warning"
							isDismissible={false}
						>
							{anchorIssues.map((issue) => (
								<p
									className="doclap-slug-notice__line"
									key={`${issue.position}-${issue.kind}`}
								>
									{describeSlugIssue(issue)}
								</p>
							))}
						</Notice>
					) : null}
				</PanelBody>
				<ColourControls
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>
			<BlockPreview block="doclap/home-work" attributes={attributes} />
			<RichTextOverlay
				targets={overlayTargets}
				attributes={attributes}
				setAttributes={(next) =>
					setAttributes(next as Partial<HomeWorkAttributes>)
				}
				isSelected={isSelected}
			/>
		</>
	);
}
