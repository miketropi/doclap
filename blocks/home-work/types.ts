export interface Experiment extends Record<string, unknown> {
	anchor: string;
	editionPrimary: string;
	editionSecondary: string;
	title: string;
	metaLines: string;
	summary: string;
	detailLabel: string;
	canvas: 'flow' | 'orbit';
}

export interface HomeWorkAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	worksHeading: string;
	worksMeta: string;
	experiments: Experiment[];
	worksCaption: string;
}
