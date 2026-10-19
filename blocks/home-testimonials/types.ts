export interface Testimonial extends Record<string, unknown> {
	statement: string;
	/**
	 * Legacy split statement accent. Kept optional so saved content from before
	 * the merge stays readable: the editor folds it into `statement` once, on
	 * mount, and drops the key. New perspectives never carry it.
	 */
	statementAccent?: string;
	disclaimer: string;
	status: string;
	role: string;
	company: string;
}

export interface HomeTestimonialsAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	testimonialsEyebrow: string;
	testimonialsHeading: string;
	testimonialsIntro: string;
	testimonials: Testimonial[];
	editorialLabel: string;
	editorialTitle: string;
	editorialCopy: string;
	editorialLinkLabel: string;
	editorialLinkUrl: string;
}
