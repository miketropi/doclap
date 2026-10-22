export interface InnerHeroSectionLink extends Record<string, unknown> {
	/** Short label shown before the link text, e.g. `01` or `01B`. */
	index: string;
	label: string;
	/** Structural URL or fragment target, resolved by the renderer. */
	url: string;
}

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
	/** Small label above the title. Empty keeps the hero as it was. */
	eyebrow: string;
	/** Rich stamp printed beside the lead. Empty emits no stamp node. */
	summaryStamp: string;
	/** Jump list of the sections on the page. Empty emits no navigation. */
	sectionIndex: InnerHeroSectionLink[];
	/** Whether the decorative mark beside the lead is printed. */
	showHeroMark: boolean;
}
