/**
 * Attribute types for doclap/site-header.
 *
 * Mirrors block.json so editor code stays typed; the same shapes are consumed by
 * render.php, which resolves `menuId` against the WordPress menu registry.
 */

export interface SiteHeaderAttributes extends Record<string, unknown> {
	brandText?: string;
	brandSuffix?: string;
	/** `text` renders `brandText`, `image` renders the selected media. */
	brandMode?: 'text' | 'image';
	brandMediaId?: number;
	brandMediaUrl?: string;
	brandMediaAlt?: string;
	brandUrl?: string;
	skipLabel?: string;
	navLabel?: string;
	menuLabel?: string;
	menuCloseLabel?: string;
	ctaLabel?: string;
	ctaUrl?: string;
	showProgress?: boolean;
	/** WordPress menu term id; `0` renders the menu assigned to `primary`. */
	menuId?: number;
	/** Maximum rendered menu depth, clamped to 1..8 by the renderer. */
	menuDepth?: number;
}
