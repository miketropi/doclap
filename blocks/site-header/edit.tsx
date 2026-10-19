/**
 * Block-editor UI for doclap/site-header.
 *
 * The front end is rendered by render.php, so the editor previews that exact
 * markup through the shared BlockPreview. Navigation is not stored in the block:
 * the sidebar only picks which WordPress menu the header reads, and the menu
 * itself is edited under Appearance → Menus.
 */

import { InspectorControls } from '@wordpress/block-editor';
import {
	Notice,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import BlockPreview from '../../resources/ts/editor/block-preview';
import ImageControl from '../../resources/ts/editor/image-control';
import { urlHelp } from '../../resources/ts/editor/url-help';
import type { SiteHeaderAttributes } from './types';

interface EditProps {
	attributes: SiteHeaderAttributes;
	setAttributes: (attributes: Partial<SiteHeaderAttributes>) => void;
}

/** A `wp/v2/menus` record, as far as this block needs it. */
interface MenuEntity {
	id: number;
	name: string;
}

/**
 * The core-data selectors this block calls.
 *
 * `@wordpress/data` types a store by its descriptor, and the `core` descriptor
 * ships in `@wordpress/core-data` — a package the build externalises to a
 * WordPress global, so the query result is typed here instead of globally.
 */
interface CoreMenuSelectors {
	getEntityRecords( kind: string, name: string, query: Record<string, unknown> ): unknown;
}

/**
 * `per_page: 100` is the collection maximum `wp/v2/menus` accepts; `-1` is
 * rejected by the REST schema (`rest_out_of_bounds`, 400), which would leave the
 * picker empty.
 */
const MENU_QUERY = { per_page: 100, context: 'view' };

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const menus = useSelect(
		(select): MenuEntity[] =>
			((select('core') as CoreMenuSelectors).getEntityRecords('root', 'menu', MENU_QUERY) ??
				[]) as MenuEntity[],
		[],
	);

	const menuOptions = [
		{ label: __('Primary menu location', 'doclap'), value: '0' },
		...menus.map((menu) => ({
			label: menu.name || `#${menu.id}`,
			value: String(menu.id),
		})),
	];

	const brandMode = 'image' === attributes.brandMode ? 'image' : 'text';

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Brand', 'doclap')} initialOpen>
					<SelectControl
						label={__('Brand source', 'doclap')}
						options={[
							{ label: __('Text', 'doclap'), value: 'text' },
							{ label: __('Image', 'doclap'), value: 'image' },
						]}
						value={brandMode}
						onChange={(value) =>
							setAttributes({ brandMode: 'image' === value ? 'image' : 'text' })
						}
						help={
							'image' === brandMode
								? __(
										'Until a logo is selected the brand text is used instead.',
										'doclap',
									)
								: undefined
						}
					/>
					{'image' === brandMode ? (
						<ImageControl
							value={{
								id: attributes.brandMediaId ?? 0,
								url: attributes.brandMediaUrl ?? '',
								alt: attributes.brandMediaAlt ?? '',
							}}
							labels={{
								title: __('Brand logo', 'doclap'),
								select: __(
									'Select a logo from the media library or upload a new one.',
									'doclap',
								),
								replace: __('Replace logo', 'doclap'),
								remove: __('Remove logo', 'doclap'),
								alt: __('Logo alternative text', 'doclap'),
								altHelp: __(
									'Read out instead of the logo. The media library value, then the site name, are used while this is empty.',
									'doclap',
								),
							}}
							onSelect={(media) =>
								setAttributes({
									brandMediaId: media.id,
									brandMediaUrl: media.url,
									brandMediaAlt: media.alt,
								})
							}
							onRemove={() =>
								setAttributes({ brandMediaId: 0, brandMediaUrl: '', brandMediaAlt: '' })
							}
							onChangeAlt={(brandMediaAlt) => setAttributes({ brandMediaAlt })}
						/>
					) : (
						<>
							<TextControl
								label={__('Brand text', 'doclap')}
								value={attributes.brandText ?? ''}
								onChange={(brandText) => setAttributes({ brandText })}
							/>
							<TextControl
								label={__('Brand mark', 'doclap')}
								help={__('Rendered as a superscript, e.g. ®.', 'doclap')}
								value={attributes.brandSuffix ?? ''}
								onChange={(brandSuffix) => setAttributes({ brandSuffix })}
							/>
						</>
					)}
					<TextControl
						label={__('Brand URL', 'doclap')}
						help={`${urlHelp} ${__('Leave empty to link to the site home.', 'doclap')}`}
						value={attributes.brandUrl ?? ''}
						onChange={(brandUrl) => setAttributes({ brandUrl })}
					/>
				</PanelBody>

				<PanelBody title={__('Labels and call to action', 'doclap')} initialOpen={false}>
					<TextControl
						label={__('Skip link', 'doclap')}
						value={attributes.skipLabel ?? ''}
						onChange={(skipLabel) => setAttributes({ skipLabel })}
					/>
					<TextControl
						label={__('Navigation label', 'doclap')}
						help={__('Screen-reader label for the nav landmark.', 'doclap')}
						value={attributes.navLabel ?? ''}
						onChange={(navLabel) => setAttributes({ navLabel })}
					/>
					<TextControl
						label={__('Menu button', 'doclap')}
						value={attributes.menuLabel ?? ''}
						onChange={(menuLabel) => setAttributes({ menuLabel })}
					/>
					<TextControl
						label={__('Menu button — open state', 'doclap')}
						value={attributes.menuCloseLabel ?? ''}
						onChange={(menuCloseLabel) => setAttributes({ menuCloseLabel })}
					/>
					<TextControl
						label={__('Header call to action', 'doclap')}
						value={attributes.ctaLabel ?? ''}
						onChange={(ctaLabel) => setAttributes({ ctaLabel })}
					/>
					<TextControl
						label={__('Call to action URL', 'doclap')}
						help={urlHelp}
						value={attributes.ctaUrl ?? ''}
						onChange={(ctaUrl) => setAttributes({ ctaUrl })}
					/>
				</PanelBody>

				<PanelBody title={__('Navigation', 'doclap')} initialOpen>
					{menus.length === 0 && (
						<Notice status="warning" isDismissible={false}>
							{__('Create a menu under Appearance → Menus first.', 'doclap')}
						</Notice>
					)}
					<SelectControl
						label={__('Menu', 'doclap')}
						options={menuOptions}
						value={String(attributes.menuId ?? 0)}
						onChange={(value) => setAttributes({ menuId: Number.parseInt(value, 10) || 0 })}
						help={__(
							'Menu structure and links are managed under Appearance → Menus. Enable Visual Mega Navigation on a top-level menu item to build a rich panel.',
							'doclap',
						)}
					/>
					<RangeControl
						label={__('Menu depth', 'doclap')}
						min={1}
						max={8}
						value={attributes.menuDepth ?? 4}
						onChange={(menuDepth) => setAttributes({ menuDepth: menuDepth ?? 4 })}
					/>
				</PanelBody>

				<PanelBody title={__('Options', 'doclap')} initialOpen={false}>
					<ToggleControl
						label={__('Reading progress bar', 'doclap')}
						checked={Boolean(attributes.showProgress)}
						onChange={(showProgress) => setAttributes({ showProgress })}
					/>
				</PanelBody>
			</InspectorControls>
			<BlockPreview block="doclap/site-header" attributes={attributes} />
		</>
	);
}
