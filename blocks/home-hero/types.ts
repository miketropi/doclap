export interface HeroPanel extends Record<string, unknown> {
	eyebrow: string;
	heading: string;
	/**
	 * Legacy split heading accent. Kept optional so saved content from before the
	 * merge stays readable: the editor folds it into `heading` once, on mount, and
	 * drops the key. New panels never carry it.
	 */
	headingAccent?: string;
	lead: string;
	linkLabel: string;
	linkUrl: string;
}

export interface HomeHeroAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	heroKicker: string;
	heroEdition: string;
	heroPanels: HeroPanel[];
	posterId: number;
	posterUrl: string;
	posterAlt: string;
	creditText: string;
	creditUrl: string;
}
