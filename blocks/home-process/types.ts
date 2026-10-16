export interface ProcessStep extends Record<string, unknown> {
	title: string;
	copy: string;
}

export interface HomeProcessAttributes extends Record<string, unknown> {
	processEyebrow: string;
	processHeading: string;
	processSteps: ProcessStep[];
}
