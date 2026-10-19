import { InspectorControls } from '@wordpress/block-editor';
import { Notice, PanelBody, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ColourControls from '../../resources/ts/editor/colour-controls';
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
import type { Experiment, HomeWorkAttributes } from './types';

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

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
}: EditProps): JSX.Element {
	const experiments = attributes.experiments ?? [];
	const anchorIssues = collectSlugIssues(
		experiments.map((experiment) => String(experiment.anchor ?? '')),
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
				</PanelBody>

				<PanelBody title={__('Experiments', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Experiments', 'doclap')}
						items={experiments as unknown as RepeaterItem[]}
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
							{
								key: 'canvas',
								label: __('Canvas', 'doclap'),
								control: 'select',
								options: [
									{ label: __('Flow', 'doclap'), value: 'flow' },
									{ label: __('Orbit', 'doclap'), value: 'orbit' },
								],
							},
						]}
						onChange={(items) =>
							setAttributes({ experiments: items as unknown as Experiment[] })
						}
						createItem={() => ({
							anchor: 'experiment-flow',
							editionPrimary: '',
							editionSecondary: '',
							title: __('New experiment', 'doclap'),
							metaLines: '',
							summary: '',
							detailLabel: '',
							canvas: 'flow',
						})}
						getItemLabel={(item, index) =>
							truncateLabel(String(item.title ?? '')) ||
							sprintf(__('Experiment %d', 'doclap'), index + 1)
						}
						addLabel={__('Add experiment', 'doclap')}
						emptyLabel={__('No experiments yet.', 'doclap')}
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
