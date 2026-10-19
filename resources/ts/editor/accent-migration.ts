/**
 * Legacy “heading + heading accent” attribute migration.
 *
 * Fourteen Doclap blocks used to store a two-part heading in two attributes: a
 * base value and a second line/accent. The front end glued them together at
 * render time (`$base . $join . $accent`) and escaped both parts, so the accent
 * never carried markup of its own. Every pair now lives in the base attribute as
 * one sanitized HTML fragment, and these helpers fold the legacy value into it
 * with exactly the glue the old renderer emitted.
 *
 * They are pure and dependency-free (no React, no WordPress imports) for two
 * reasons: the fold runs inside `useEffect` in ten different edit components, and
 * a plain function can be reasoned about without a DOM.
 *
 * The fold is deliberately conservative — it never introduces `<em>` where the
 * old renderer had none, so a block whose content predates the merge keeps
 * rendering byte-identically until its first save.
 */

export interface AccentPair {
	/** Attribute that survives the merge. */
	base: string;
	/** Legacy attribute that is folded in and then cleared. */
	accent: string;
	/** Exact glue the old renderer emitted between the two parts. */
	join: '<br><em>' | '<br>' | ' <em>';
}

/** Entities the label previews can meet in editor-authored fragments. */
const ENTITIES: Record<string, string> = {
	'&nbsp;': ' ',
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&apos;': "'",
	'&#39;': "'",
	'&#160;': ' ',
};

/**
 * True when the legacy accent still needs folding into the base value.
 *
 * False when the accent is empty after trimming, or when the base already carries
 * an `<em>` element (a merged value, or an accent the author typed by hand).
 *
 * This is deliberately the *renderer's* predicate, character for character:
 * `doclap_rich_accent()` in `inc/blocks/helpers.php` folds exactly when the
 * trimmed accent is non-empty and the base has no `<em>`. A stricter editor-side
 * test would leave content showing the pre-merge `base + accent` rendering while
 * refusing to fold it, so the accent would silently disappear from the saved value
 * on the first save. If the two predicates ever diverge, the renderer's wins.
 *
 * @param base   Current base attribute value.
 * @param accent Legacy accent attribute value.
 * @return Whether the pair still has to be folded.
 */
export function needsAccentMerge(base: string, accent: string): boolean {
	const value = typeof base === 'string' ? base : '';
	const legacy = typeof accent === 'string' ? accent.trim() : '';

	return '' !== legacy && !value.includes('<em>');
}

/**
 * Fold a legacy accent into the base value.
 *
 * Mirrors `doclap_rich_accent()` in `inc/blocks/helpers.php`, which every
 * affected renderer keeps for unsaved content: `trim(base) . join .
 * esc_html(trim(accent)) . ('</em>' unless the join is a plain line break)`.
 * Nothing is merged when there is nothing to merge, so the result is always safe
 * to write back to the attribute.
 *
 * The accent is escaped the way `esc_html()` escapes it, because that is what the
 * legacy renderer did with it: `&`, `<` and `>` become entities, while an entity
 * the author typed stays as it is (`esc_html()` does not double-encode). Without
 * this, folding an accent that contains an ampersand or a stray `<` would store a
 * fragment that renders differently from the very output the fold replaces.
 *
 * @param base   Current base attribute value.
 * @param accent Legacy accent attribute value.
 * @param join   Glue the old renderer emitted between the two parts.
 * @return The merged value, or the trimmed base unchanged.
 */
export function mergeAccent(
	base: string,
	accent: string,
	join: AccentPair['join'],
): string {
	const value = typeof base === 'string' ? base.trim() : '';

	if (!needsAccentMerge(value, accent)) {
		return value;
	}

	const escaped = String(accent)
		.trim()
		.replace(
			/&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6});)/g,
			'&amp;',
		)
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	return value + join + escaped + ('<br>' === join ? '' : '</em>');
}

/**
 * Attribute-safe single-line label: strip markup, decode entities, collapse
 * whitespace. Line breaks become spaces so two lines never run into each other.
 *
 * @param value HTML fragment.
 * @return Plain text label.
 */
export function plainLabel(value: string): string {
	const stripped = String(value ?? '')
		.replace(/<br\s*\/?>/gi, ' ')
		.replace(/<[^>]*>/g, '');

	return stripped
		.replace(
			/&(?:nbsp|amp|lt|gt|quot|apos|#39|#160);/g,
			(entity) => ENTITIES[entity] ?? entity,
		)
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Operator-help/label preview: the first 60 characters of a plain label.
 *
 * @param value  HTML fragment.
 * @param length Maximum number of characters to keep.
 * @return Truncated plain text label.
 */
export function truncateLabel(value: string, length = 60): string {
	const label = plainLabel(value);
	const limit =
		typeof length === 'number' && Number.isFinite(length)
			? Math.max(0, Math.floor(length))
			: 60;

	return label.length > limit ? label.slice(0, limit) : label;
}
