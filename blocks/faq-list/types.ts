export interface FaqFilter extends Record<string, unknown> {
	slug: string;
	label: string;
}

export interface FaqQuestion extends Record<string, unknown> {
	category: string;
	question: string;
	answer: string;
}

export interface FaqListAttributes extends Record<string, unknown> {
	breadcrumbHomeLabel: string;
	breadcrumbLabel: string;
	heading: string;
	headingAccent: string;
	lead: string;
	asideLabel: string;
	asideHeading: string;
	asideCopy: string;
	asideLinkLabel: string;
	asideLinkUrl: string;
	filterAllLabel: string;
	filters: FaqFilter[];
	questions: FaqQuestion[];
	countTemplate: string;
	emptyLabel: string;
	closingEyebrow: string;
	closingHeading: string;
	closingHeadingAccent: string;
	closingCtaLabel: string;
	closingCtaUrl: string;
}
