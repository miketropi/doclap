export interface JournalLink extends Record<string, unknown> {
	meta: string;
	title: string;
	copy: string;
	url: string;
}

export interface HomeJournalAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	journalEyebrow: string;
	journalHeading: string;
	journalMeta: string;
	journalLinks: JournalLink[];
}
