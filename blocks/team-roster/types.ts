export interface RoleCard extends Record<string, unknown> {
	/** Ordinal shown beside the card, e.g. `01`. */
	meta: string;
	title: string;
	copy: string;
}

export interface TeamRosterAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	teamEyebrow: string;
	teamHeading: string;
	/** Legacy split accent; folded into `teamHeading` on first edit. */
	teamHeadingAccent: string;
	teamDescription: string;
	teamMeta: string;
	teamImageId: number;
	teamImageUrl: string;
	teamImageAlt: string;
	teamImageCaption: string;
	teamNote: string;
	teamCards: RoleCard[];
}
