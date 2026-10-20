export interface FaqFilter extends Record<string, unknown> {
	slug: string;
	label: string;
}

export interface FaqQuestion extends Record<string, unknown> {
	category: string;
	question: string;
	answer: string;
}

export interface FaqListAttributes extends Record<string, unknown> {
	/**
	 * Optional section colours. Each is stored as the custom property the theme
	 * reads (`--doclap-block-bg`, `--doclap-block-heading`, `--doclap-block-text`);
	 * an empty string means "theme default" and emits nothing, so a section keeps
	 * the design unless an author picks a colour.
	 */
	sectionBg: string;
	sectionHeading: string;
	sectionText: string;
	asideLabel: string;
	asideHeading: string;
	asideCopy: string;
	asideLinkLabel: string;
	asideLinkUrl: string;
	filterAllLabel: string;
	filters: FaqFilter[];
	questions: FaqQuestion[];
	countTemplate: string;
	emptyLabel: string;
}
