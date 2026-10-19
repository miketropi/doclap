export interface SingleNoteAttributes extends Record<string, unknown> {
	breadcrumbHomeLabel: string;
	archiveLabel: string;
	archiveUrl: string;
	articleMetaPrefix: string;
	disclaimer: string;
	tocLabel: string;
	tocEmptyBehaviour: 'hide' | 'message';
	backToArchiveLabel: string;
	relatedHeading: string;
	relatedCount: number;
	closingEyebrow: string;
	closingHeading: string;
	closingCtaLabel: string;
	closingCtaUrl: string;
}
