export interface PricingPlan extends Record<string, unknown> {
	meta: string;
	metaExtra: string;
	title: string;
	copy: string;
	featured: boolean;
	priceProject: string;
	priceOngoing: string;
	captionProject: string;
	captionOngoing: string;
	features: string[];
	ctaLabel: string;
	ctaUrl: string;
}

export interface PricingPlansAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	pricingEyebrow: string;
	pricingHeading: string;
	/** Legacy split accent, folded into `pricingHeading` on the next save. */
	pricingHeadingAccent?: string;
	pricingText: string;
	modeGroupLabel: string;
	modeProjectLabel: string;
	modeOngoingLabel: string;
	/** `project` or `ongoing`; the mode the server renders. */
	modeDefault: string;
	note: string;
	plans: PricingPlan[];
}
