/**
 * String helpers shared by the Doclap view bundles.
 *
 * Every user-facing string a bundle needs comes from the renderer as a `data-*`
 * attribute, so the bundles never carry an English literal. A missing attribute
 * resolves to an empty string, which callers treat as "announce nothing" — never
 * as an English fallback.
 */

/**
 * Read a user-facing string from a data attribute.
 *
 * @param source Element carrying the attribute.
 * @param key    Attribute name without the `data-` prefix.
 *
 * @return Attribute value, or `''` when the attribute is missing.
 */
export function readString(
	source: HTMLElement | null | undefined,
	key: string,
): string {
	return source?.getAttribute( `data-${ key }` ) ?? "";
}

/**
 * Fill a translated template with values.
 *
 * Supports numbered placeholders (`%1$d`, `%2$s`) first and then sequential ones
 * (`%d`, `%s`) left to right, so both `sprintf`-style translations and simple
 * `%d` templates work.
 *
 * @param template Translated template.
 * @param values   Replacement values.
 *
 * @return Filled template, or `''` when the template is empty.
 */
export function formatTemplate(
	template: string,
	...values: Array< string | number >
): string {
	if ( "" === template ) {
		return "";
	}

	let result = template;

	values.forEach( ( value: string | number, index: number ): void => {
		const text = String( value );
		const position = index + 1;

		result = result.split( `%${ position }$d` ).join( text );
		result = result.split( `%${ position }$s` ).join( text );
	} );

	let next = 0;

	return result.replace(
		/%(?:d|s)/g,
		(): string => {
			const value = values[ next ];
			next += 1;

			return undefined === value ? "" : String( value );
		},
	);
}
