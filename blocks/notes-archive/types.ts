export interface NotesArchiveAttributes extends Record<string, unknown> {
	/**
	 * Optional section colours. Each is stored as the custom property the theme
	 * reads (`--doclap-block-bg`, `--doclap-block-heading`, `--doclap-block-text`);
	 * an empty string means "theme default" and emits nothing, so a section keeps
	 * the design unless an author picks a colour.
	 */
	sectionBg: string;
	sectionHeading: string;
	sectionText: string;
	[key: string]: unknown;
	showFeatured: boolean;
	postsPerPage: number;
	showCategories: boolean;
	headingSectionTitle: string;
	countSingular: string;
	countPlural: string;
	emptyHeading: string;
	emptyCopy: string;
	disclaimer: string;
}
