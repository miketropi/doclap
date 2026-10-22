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
	/**
	 * Voices layout only. Stars out of five, `0` (default) keeps the card's
	 * "not rated yet" placeholder and publishes no rating at all.
	 */
	rating?: number;
	/**
	 * Preview layout only. Top-left meta line; empty falls back to
	 * "CLIENT PERSPECTIVE" in the renderer.
	 */
	label?: string;
	/** Preview layout only. Top-right meta line, e.g. `LAYOUT PREVIEW / 01`. */
	previewLabel?: string;
	/** Preview layout only. Rich quote rendered in a `blockquote`. */
	quote?: string;
	/** Preview layout only. Small line under the status. */
	personNote?: string;
	/** Preview layout only. First caption line under the person block. */
	captionLeft?: string;
	/** Preview layout only. Second caption line under the person block. */
	captionRight?: string;
}

export interface HomeTestimonialsAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	testimonialsEyebrow: string;
	testimonialsHeading: string;
	testimonialsIntro: string;
	/**
	 * Card layout: `voices` is the statement card this block has always
	 * rendered, `preview` is the editorial quote card of the design source.
	 */
	testimonialsVariant: string;
	testimonials: Testimonial[];
	/** Closing paragraph of the `preview` layout; empty hides it. */
	testimonialsNote: string;
	editorialLabel: string;
	editorialTitle: string;
	editorialCopy: string;
	editorialLinkLabel: string;
	editorialLinkUrl: string;
}
