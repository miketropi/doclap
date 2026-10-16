/**
 * Block-editor UI for doclap/site-header.
 *
 * The front end is rendered by render.php, so the editor shows that exact markup
 * through ServerSideRender and edits it through inspector controls.
 */

import { InspectorControls } from '@wordpress/block-editor';
import { Button, PanelBody, SelectControl, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import Repeater, { type RepeaterItem } from '../../resources/ts/editor/repeater';
import type { NavItem, NavLink, QuickLink, SiteHeaderAttributes } from './types';

interface EditProps {
	attributes: SiteHeaderAttributes;
	setAttributes: (attributes: Partial<SiteHeaderAttributes>) => void;
}

const layoutOptions = [
	{ label: __('Simple dropdown', 'doclap'), value: 'list' },
	{ label: __('Mega panel — project cards', 'doclap'), value: 'mega' },
	{ label: __('Mega panel — page columns', 'doclap'), value: 'pages' },
];

const linkFields = [
	{ key: 'label', label: __('Label', 'doclap') },
	{ key: 'description', label: __('Description', 'doclap'), control: 'textarea' as const },
	{ key: 'url', label: __('URL', 'doclap'), help: __('Use #section, a path such as /about-us/, or @notes / @search.', 'doclap') },
	{ key: 'group', label: __('Column heading', 'doclap'), help: __('Used by the page-columns layout.', 'doclap') },
	{ key: 'indexLabel', label: __('Index label', 'doclap'), help: __('Used by the project-card layout, e.g. STUDY / 001.', 'doclap') },
	{ key: 'footLabel', label: __('Footer label', 'doclap'), help: __('Used by the project-card layout.', 'doclap') },
];

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const navItems = attributes.navItems ?? [];
	const quickLinks = attributes.quickLinks ?? [];

	const updateNavItem = (index: number, patch: Partial<NavItem>): void => {
		setAttributes({
			navItems: navItems.map((item, position) => (position === index ? { ...item, ...patch } : item)),
		});
	};

	const createNavItem = (): NavItem => ({
		label: __('New panel', 'doclap'),
		panelLayout: 'list',
		panelLabel: __('SECTION', 'doclap'),
		panelTitle: '',
		panelDescription: '',
		panelAllLabel: '',
		panelAllUrl: '',
		panelFooterNote: '',
		links: [],
	});

	const createNavLink = (): RepeaterItem => ({
		label: __('New link', 'doclap'),
		description: '',
		url: '',
		group: '',
		indexLabel: '',
		footLabel: '',
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Brand', 'doclap')} initialOpen={false}>
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
					<TextControl
						label={__('Brand URL', 'doclap')}
						help={__('Leave empty to link to the site home.', 'doclap')}
						value={attributes.brandUrl ?? ''}
						onChange={(brandUrl) => setAttributes({ brandUrl })}
					/>
				</PanelBody>

				<PanelBody title={__('Labels', 'doclap')} initialOpen={false}>
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
						label={__('Panel close label', 'doclap')}
						help={__('Use %s for the panel name.', 'doclap')}
						value={attributes.closePanelLabel ?? ''}
						onChange={(closePanelLabel) => setAttributes({ closePanelLabel })}
					/>
					<TextControl
						label={__('Header call to action', 'doclap')}
						value={attributes.ctaLabel ?? ''}
						onChange={(ctaLabel) => setAttributes({ ctaLabel })}
					/>
					<TextControl
						label={__('Call to action URL', 'doclap')}
						value={attributes.ctaUrl ?? ''}
						onChange={(ctaUrl) => setAttributes({ ctaUrl })}
					/>
				</PanelBody>

				<PanelBody title={__('Panels', 'doclap')} initialOpen={false}>
					<Button
						variant="secondary"
						onClick={() => setAttributes({ navItems: [...navItems, createNavItem()] })}
					>
						{__('Add panel', 'doclap')}
					</Button>
					<p className="doclap-repeater__empty">
						{__('Each panel below is edited in its own section.', 'doclap')}
					</p>
				</PanelBody>

				{navItems.map((item, index) => (
					<PanelBody
						key={index}
						title={sprintf(__('Panel: %s', 'doclap'), item.label || String(index + 1))}
						initialOpen={false}
					>
						<TextControl
							label={__('Trigger label', 'doclap')}
							value={item.label ?? ''}
							onChange={(label) => updateNavItem(index, { label })}
						/>
						<SelectControl
							label={__('Panel layout', 'doclap')}
							options={layoutOptions}
							value={item.panelLayout ?? 'list'}
							onChange={(panelLayout) =>
								updateNavItem(index, { panelLayout: panelLayout as NavItem['panelLayout'] })
							}
						/>
						<TextControl
							label={__('Panel label', 'doclap')}
							value={item.panelLabel ?? ''}
							onChange={(panelLabel) => updateNavItem(index, { panelLabel })}
						/>
						<TextareaControl
							label={__('Panel title', 'doclap')}
							help={__('Line breaks render as line breaks. Mega layouts only.', 'doclap')}
							value={item.panelTitle ?? ''}
							onChange={(panelTitle) => updateNavItem(index, { panelTitle })}
							rows={2}
						/>
						<TextareaControl
							label={__('Panel description', 'doclap')}
							value={item.panelDescription ?? ''}
							onChange={(panelDescription) => updateNavItem(index, { panelDescription })}
							rows={2}
						/>
						<TextControl
							label={__('Panel footer link label', 'doclap')}
							value={item.panelAllLabel ?? ''}
							onChange={(panelAllLabel) => updateNavItem(index, { panelAllLabel })}
						/>
						<TextControl
							label={__('Panel footer link URL', 'doclap')}
							value={item.panelAllUrl ?? ''}
							onChange={(panelAllUrl) => updateNavItem(index, { panelAllUrl })}
						/>
						<TextControl
							label={__('Panel footer note', 'doclap')}
							value={item.panelFooterNote ?? ''}
							onChange={(panelFooterNote) => updateNavItem(index, { panelFooterNote })}
						/>

						<Repeater
							label={__('Links', 'doclap')}
							items={(item.links ?? []) as RepeaterItem[]}
							fields={linkFields}
							createItem={createNavLink}
							getItemLabel={(link) => String(link.label ?? '')}
							onChange={(links) => updateNavItem(index, { links: links as NavLink[] })}
						/>

						<Button
							isDestructive
							variant="tertiary"
							onClick={() => setAttributes({ navItems: navItems.filter((_, position) => position !== index) })}
						>
							{__('Remove panel', 'doclap')}
						</Button>
					</PanelBody>
				))}

				<PanelBody title={__('Quick links', 'doclap')} initialOpen={false}>
					<Repeater
						label={__('Inline links', 'doclap')}
						items={quickLinks as RepeaterItem[]}
						fields={[
							{ key: 'label', label: __('Label', 'doclap') },
							{ key: 'url', label: __('URL', 'doclap') },
						]}
						createItem={() => ({ label: __('New link', 'doclap'), url: '' })}
						getItemLabel={(link) => String(link.label ?? '')}
						onChange={(links) => setAttributes({ quickLinks: links as QuickLink[] })}
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

			<ServerSideRender block="doclap/site-header" attributes={attributes as Record<string, unknown>} />
		</>
	);
}
