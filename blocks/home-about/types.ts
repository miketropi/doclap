export interface Service extends Record<string, unknown> {
	title: string;
	meta: string;
}

export interface HomeAboutAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	aboutEyebrow: string;
	aboutHeading: string;
	aboutPrinciple: string;
	aboutLead: string;
	services: Service[];
}
