export interface JournalCarouselAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	journalEyebrow: string;
	journalHeading: string;
	journalHeadingAccent: string;
	postsPerPage: number;
	viewAllLabel: string;
	viewAllUrl: string;
	ariaLabel: string;
	artLabel: string;
	readMoreLabel: string;
	emptyLabel: string;
	cardMeta: string;
}
