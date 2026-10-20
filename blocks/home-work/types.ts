/** Which media element a project card renders. */
export type MediaType = 'image' | 'video';

export interface Project extends Record<string, unknown> {
	anchor: string;
	editionPrimary: string;
	editionSecondary: string;
	title: string;
	metaLines: string;
	summary: string;
	detailLabel: string;
	mediaType: MediaType;
	/** Attachment id; the renderer prefers it over `mediaUrl`. */
	mediaId: number;
	/** Stored URL, used when the attachment is gone and as the URL-only path. */
	mediaUrl: string;
	/** Text alternative: `alt` on an image, `aria-label` on the dialog video. */
	mediaAlt: string;
}

export interface HomeWorkAttributes extends Record<string, unknown> {
	/** Section colours; an empty string keeps the theme default. */
	sectionBg?: string;
	sectionHeading?: string;
	sectionText?: string;
	worksHeading: string;
	worksMeta: string;
	/** Media hint printed on a card that has something to open. */
	viewLabel: string;
	projects: Project[];
	worksCaption: string;
}
