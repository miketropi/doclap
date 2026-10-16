export interface Discipline extends Record<string, unknown> {
	title: string;
	caption: string;
}

export interface HomeDisciplinesAttributes extends Record<string, unknown> {
	disciplines: Discipline[];
}
