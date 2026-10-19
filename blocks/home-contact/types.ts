export interface HomeContactAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	contactEyebrow: string;
	contactHeading: string;
	contactLead: string;
	contactCtaLabel: string;
	contactCtaUrl: string;
}
