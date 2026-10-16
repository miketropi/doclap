/**
 * Attribute types for doclap/site-header.
 *
 * Mirrors block.json so editor code stays typed; the same shapes are consumed by
 * render.php.
 */

export interface NavLink extends Record<string, unknown> {
	label?: string;
	description?: string;
	url?: string;
	/** Column heading used by the `pages` panel layout. */
	group?: string;
	/** Small index label, e.g. “STUDY / 001”, used by the `mega` layout. */
	indexLabel?: string;
	/** Trailing meta label used by the `mega` layout. */
	footLabel?: string;
}

export interface NavItem extends Record<string, unknown> {
	label?: string;
	panelLayout?: 'list' | 'mega' | 'pages';
	panelLabel?: string;
	panelTitle?: string;
	panelDescription?: string;
	panelAllLabel?: string;
	panelAllUrl?: string;
	panelFooterNote?: string;
	links?: NavLink[];
}

export interface QuickLink extends Record<string, unknown> {
	label?: string;
	url?: string;
}

export interface SiteHeaderAttributes extends Record<string, unknown> {
	brandText?: string;
	brandSuffix?: string;
	brandUrl?: string;
	skipLabel?: string;
	navLabel?: string;
	menuLabel?: string;
	menuCloseLabel?: string;
	closePanelLabel?: string;
	ctaLabel?: string;
	ctaUrl?: string;
	showProgress?: boolean;
	navItems?: NavItem[];
	quickLinks?: QuickLink[];
}
