export interface AboutSection extends Record<string, unknown> {
	label: string;
	heading: string;
	headingAccent: string;
	paragraphs: string[];
}

export interface Principle extends Record<string, unknown> {
	label: string;
	title: string;
	copy: string;
}

export interface AboutProfileAttributes extends Record<string, unknown> {
	breadcrumbHomeLabel: string;
	breadcrumbLabel: string;
	heading: string;
	headingAccent: string;
	lead: string;
	sections: AboutSection[];
	studioImageId: number;
	studioImageUrl: string;
	studioImageAlt: string;
	studioImageCaption: string;
	statusNote: string;
	principles: Principle[];
	closingEyebrow: string;
	closingHeading: string;
	closingHeadingAccent: string;
	closingCtaLabel: string;
	closingCtaUrl: string;
}
