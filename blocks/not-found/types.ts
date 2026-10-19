export interface RecoveryLink extends Record<string, unknown> {
	label: string;
	url: string;
}

export interface NotFoundAttributes extends Record<string, unknown> {
	[key: string]: unknown;
	errorCode: string;
	eyebrow: string;
	heading: string;
	lead: string;
	primaryLabel: string;
	primaryUrl: string;
	secondaryLabel: string;
	secondaryUrl: string;
	asideLabel: string;
	asideHeading: string;
	links: RecoveryLink[];
}
