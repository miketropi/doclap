export interface ComparisonColumn extends Record<string, unknown> {
	title: string;
	detail: string;
}

export interface ComparisonRow extends Record<string, unknown> {
	feature: string;
	/** One cell per column, in column order. */
	values: string[];
	/** Prints this row's cells in the monospace figure style. */
	isNumeric: boolean;
}

export interface ComparisonGroup extends Record<string, unknown> {
	label: string;
	rows: ComparisonRow[];
}

export interface PlanComparisonAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	compareEyebrow: string;
	compareHeading: string;
	/** Legacy split accent, folded into `compareHeading` on the next save. */
	compareHeadingAccent?: string;
	compareText: string;
	caption: string;
	rowHeaderLabel: string;
	columns: ComparisonColumn[];
	groups: ComparisonGroup[];
	note: string;
	linkLabel: string;
	linkUrl: string;
}
