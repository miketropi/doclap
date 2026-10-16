export interface Testimonial extends Record<string, unknown> {
	statement: string;
	statementAccent: string;
	disclaimer: string;
	status: string;
	role: string;
	company: string;
}

export interface HomeTestimonialsAttributes extends Record<string, unknown> {
	testimonialsEyebrow: string;
	testimonialsHeading: string;
	testimonialsHeadingAccent: string;
	testimonialsIntro: string;
	testimonials: Testimonial[];
	editorialLabel: string;
	editorialTitle: string;
	editorialTitleAccent: string;
	editorialCopy: string;
	editorialLinkLabel: string;
	editorialLinkUrl: string;
}
