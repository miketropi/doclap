export interface HeroPanel extends Record<string, unknown> {
	eyebrow: string;
	heading: string;
	headingAccent: string;
	lead: string;
	linkLabel: string;
	linkUrl: string;
}

export interface HomeHeroAttributes extends Record<string, unknown> {
	heroKicker: string;
	heroEdition: string;
	heroPanels: HeroPanel[];
	posterId: number;
	posterUrl: string;
	posterAlt: string;
	creditText: string;
	creditUrl: string;
}
