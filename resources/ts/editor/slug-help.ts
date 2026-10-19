/**
 * Shared slug and anchor validation for the Doclap block inspectors.
 *
 * Two attribute families end up inside the rendered markup as identifiers rather
 * than as text: the FAQ filter slugs (matched against `questions[].category` and
 * printed through `sanitize_key()`) and the home-work experiment anchors (printed
 * straight into an element `id` and targeted by `#fragment` links). Both are
 * validated here so the inspector can warn about them the same way.
 *
 * The inspector never rewrites the value: the author keeps typing whatever they
 * want, and PHP normalises it while rendering. The wording of every message below
 * therefore says so, because a notice that silently "fixes" nothing is confusing
 * without that promise.
 */

import { __, sprintf } from '@wordpress/i18n';

/**
 * Identifier shape an attribute is validated against.
 */
export type SlugShape = 'slug' | 'anchor';

export type SlugIssueKind = 'empty' | 'duplicate' | 'format' | 'unknown';

export interface SlugIssue {
	kind: SlugIssueKind;
	/** 1-based position of the offending item. */
	position: number;
	value: string;
}

/**
 * Help text for `sanitize_key()`-style slugs.
 */
export const slugHelp = __(
	'Lowercase letters, numbers, dashes and underscores. Anything else is normalised when the block renders.',
	'doclap',
);

/**
 * Help text for anchors that become element ids.
 */
export const anchorHelp = __(
	'Letters, numbers, dashes and underscores, starting with a letter. Used as the element id and as the #fragment target of other links.',
	'doclap',
);

const SLUG_PATTERN = /^[a-z0-9_-]+$/;
const ANCHOR_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;

/**
 * Collect every problem with a list of identifier values.
 *
 * Each item reports at most one issue, in priority order: an empty value cannot
 * also be a duplicate, and a malformed value is reported before its membership of
 * a known set.
 *
 * @param values  Raw identifier values, in list order.
 * @param options Optional shape and the set of values considered known.
 * @return One entry per offending item, empty when the list is clean.
 */
export function collectSlugIssues(
	values: string[],
	options: { shape?: SlugShape; knownValues?: string[] } = {},
): SlugIssue[] {
	const pattern =
		'anchor' === (options.shape ?? 'slug') ? ANCHOR_PATTERN : SLUG_PATTERN;
	const issues: SlugIssue[] = [];

	values.forEach((rawValue, index) => {
		const value = rawValue.trim();
		const position = index + 1;

		if ('' === value) {
			issues.push({ kind: 'empty', position, value });
			return;
		}

		if (!pattern.test(value)) {
			issues.push({ kind: 'format', position, value });
			return;
		}

		const duplicated = values.some(
			(other, otherIndex) => otherIndex !== index && other.trim() === value,
		);

		if (duplicated) {
			issues.push({ kind: 'duplicate', position, value });
			return;
		}

		if (options.knownValues && !options.knownValues.includes(value)) {
			issues.push({ kind: 'unknown', position, value });
		}
	});

	return issues;
}

/**
 * Translate one issue into the sentence shown in the inspector notice.
 *
 * @param issue Issue returned by `collectSlugIssues()`.
 * @return Translated message.
 */
export function describeSlugIssue(issue: SlugIssue): string {
	switch (issue.kind) {
		case 'empty':
			return sprintf(
				/* translators: %d: position of the item in the list. */
				__(
					'Item %d has no identifier yet. A missing identifier is normalised when the block renders.',
					'doclap',
				),
				issue.position,
			);
		case 'duplicate':
			return sprintf(
				/* translators: 1: position of the item, 2: the repeated identifier. */
				__(
					'Item %1$d repeats the identifier “%2$s”. Duplicate identifiers are normalised when the block renders.',
					'doclap',
				),
				issue.position,
				issue.value,
			);
		case 'format':
			return sprintf(
				/* translators: 1: position of the item, 2: the entered identifier. */
				__(
					'Item %1$d uses “%2$s”. Characters outside the allowed set are normalised when the block renders.',
					'doclap',
				),
				issue.position,
				issue.value,
			);
		case 'unknown':
			return sprintf(
				/* translators: 1: position of the item, 2: the entered group name. */
				__(
					'Item %1$d uses the group “%2$s”, which no filter defines, so it falls outside every filter when the block renders.',
					'doclap',
				),
				issue.position,
				issue.value,
			);
	}
}
