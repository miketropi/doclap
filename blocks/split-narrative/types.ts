export interface Paragraph extends Record<string, unknown> {
	text: string;
}

export interface SplitNarrativeAttributes extends Record<string, unknown> {
	/**
	 * Optional section colours. Each is stored as the custom property the theme
	 * reads (`--doclap-block-bg`, `--doclap-block-heading`, `--doclap-block-text`);
	 * an empty string means "theme default" and emits nothing, so a section keeps
	 * the design unless an author picks a colour.
	 */
	sectionBg: string;
	sectionHeading: string;
	sectionText: string;
	label: string;
	heading: string;
	/**
	 * Legacy split heading accent. The editor folds it into `heading` once, on
	 * mount, and clears the key, so saved content from before the merge keeps
	 * rendering until that block is next saved.
	 */
	headingAccent: string;
	paragraphs: string[];
	statusNote: string;
	linkLabel: string;
	linkUrl: string;
}
