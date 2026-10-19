/**
 * Single source of truth for the URL token grammar accepted by the Doclap theme.
 *
 * The tokens below are implemented once, in PHP, by
 * `inc/blocks/helpers.php::doclap_resolve_url()`: `@notes` resolves to the
 * configured posts archive, `@search` to the search endpoint, a leading `#` is
 * passed through as a fragment, a leading `?` is appended to the site root, and
 * anything else is resolved against the site. Every inspector control whose value
 * reaches that helper reuses this text, so the grammar is documented exactly
 * once and cannot drift between the eighteen blocks.
 */

import { __ } from '@wordpress/i18n';

/**
 * Grammar shared by every URL field.
 */
export const urlHelp = __(
	'Supports /page/path/, #anchor, @notes (posts archive) and @search (search results).',
	'doclap',
);

/**
 * Extra note for fields that link to a page section by fragment.
 */
export const structuralLinkHelp = __(
	'Changing a structural anchor needs matching header and footer links.',
	'doclap',
);

/**
 * Grammar plus the structural-anchor note, for section and call-to-action links.
 */
export const urlHelpWithStructuralNote = `${urlHelp} ${structuralLinkHelp}`;
