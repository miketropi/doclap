export interface Service extends Record<string, unknown> {
	title: string;
	meta: string;
}

export interface HomeAboutAttributes extends Record<string, unknown> {
	aboutEyebrow: string;
	aboutHeading: string;
	aboutPrinciple: string;
	aboutLead: string;
	services: Service[];
}
