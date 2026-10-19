export interface ProcessStep extends Record<string, unknown> {
	title: string;
	copy: string;
}

export interface HomeProcessAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	processEyebrow: string;
	processHeading: string;
	processSteps: ProcessStep[];
}
