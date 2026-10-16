export interface NotesArchiveAttributes extends Record<string, unknown> {
	[key: string]: unknown;
	breadcrumbHomeLabel: string;
	breadcrumbLabel: string;
	heading: string;
	headingAccent: string;
	lead: string;
	showFeatured: boolean;
	postsPerPage: number;
	showCategories: boolean;
	headingSectionTitle: string;
	countSingular: string;
	countPlural: string;
	emptyHeading: string;
	emptyCopy: string;
	disclaimer: string;
	closingEyebrow: string;
	closingHeading: string;
	closingHeadingAccent: string;
	closingCtaLabel: string;
	closingCtaUrl: string;
}
