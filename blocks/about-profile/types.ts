export interface AboutSection extends Record<string, unknown> {
	label: string;
	heading: string;
	/**
	 * Legacy split heading accent. Kept optional so saved content from before the
	 * merge stays readable: the editor folds it into `heading` once, on mount, and
	 * drops the key. New items never carry it.
	 */
	headingAccent?: string;
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
	closingCtaLabel: string;
	closingCtaUrl: string;
}
