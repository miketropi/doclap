export interface JournalLink extends Record<string, unknown> {
	meta: string;
	title: string;
	copy: string;
	url: string;
}

export interface HomeJournalAttributes extends Record<string, unknown> {
	journalEyebrow: string;
	journalHeading: string;
	journalMeta: string;
	journalLinks: JournalLink[];
}
