export interface CapabilityTab extends Record<string, unknown> {
	/** Ordinal shown before the label, e.g. `01`. */
	index: string;
	label: string;
	heading: string;
	copy: string;
	deliverables: string[];
	ctaLabel: string;
	ctaUrl: string;
}

export interface CapabilityTabsAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	tabsEyebrow: string;
	tabsHeading: string;
	/** Legacy split accent; folded into `tabsHeading` on first edit. */
	tabsHeadingAccent: string;
	tabsLabel: string;
	tabs: CapabilityTab[];
}
