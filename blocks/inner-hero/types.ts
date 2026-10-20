export interface InnerHeroAttributes extends Record<string, unknown> {
	/**
	 * Optional section colours. Each is stored as the custom property the theme
	 * reads (`--doclap-block-bg`, `--doclap-block-heading`, `--doclap-block-text`);
	 * an empty string means "theme default" and emits nothing, so a section keeps
	 * the design unless an author picks a colour.
	 */
	sectionBg: string;
	sectionHeading: string;
	sectionText: string;
	breadcrumbHomeLabel: string;
	breadcrumbLabel: string;
	/**
	 * Where the hero title comes from: the block's own rich `heading`
	 * (`custom`), or the title of the page the block is rendered on
	 * (`page-title`, which falls back to `heading` when there is no post).
	 */
	headingSource: 'custom' | 'page-title';
	heading: string;
	/**
	 * Legacy split heading accent. Saved content from before the merge still
	 * carries it: the editor folds it into `heading` once, on mount, and clears
	 * the key. New content never fills it.
	 */
	headingAccent: string;
	lead: string;
}
