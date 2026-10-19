export interface TeamCard extends Record<string, unknown> {
	meta: string;
	title: string;
	copy: string;
	ctaLabel: string;
	ctaUrl: string;
}

export interface HomeTeamAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	teamHeading: string;
	teamMeta: string;
	teamIntro: string;
	teamImageId: number;
	teamImageUrl: string;
	teamImageAlt: string;
	teamImageCaption: string;
	teamCards: TeamCard[];
}
