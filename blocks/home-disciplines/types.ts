export interface Discipline extends Record<string, unknown> {
	title: string;
	caption: string;
}

export interface HomeDisciplinesAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	disciplines: Discipline[];
}
