export interface SearchResultsAttributes extends Record<string, unknown> {
	breadcrumbHomeLabel?: string;
	breadcrumbLabel?: string;
	heading?: string;
	lead?: string;
	searchPlaceholder?: string;
	searchLabel?: string;
	submitLabel?: string;
	helpNote?: string;
	filterAllLabel?: string;
	filterPageLabel?: string;
	filterNoteLabel?: string;
	filterWorkLabel?: string;
	resultSingular?: string;
	resultPlural?: string;
	noResultsHeading?: string;
	noResultsCopy?: string;
	noResultsLinkLabel?: string;
	noResultsLinkUrl?: string;
	emptyHeading?: string;
	emptyCopy?: string;
}
