<?php

/**
 * Shared server-side rendering helpers for Doclap blocks.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Inline SVG bodies for every icon used by Doclap blocks.
 *
 * Geometry is taken from Lucide (ISC licence) and inlined so the theme ships no
 * icon font, no sprite request and no runtime icon script.
 *
 * @return array<string, string> Icon name => SVG inner markup.
 */
function doclap_icon_paths(): array {
	return array(
		'arrow-up-right'  => '<path d="M7 17 17 7M7 7h10v10"/>',
		'arrow-up'        => '<path d="m5 12 7-7 7 7M12 19V5"/>',
		'arrow-left'      => '<path d="m12 19-7-7 7-7M19 12H5"/>',
		'arrow-right'     => '<path d="M5 12h14m-6-6 6 6-6 6"/>',
		'chevron-down'    => '<path d="m6 9 6 6 6-6"/>',
		'check'           => '<path d="M20 6 9 17l-5-5"/>',
		'x'               => '<path d="m18 6-12 12M6 6l12 12"/>',
		'menu'            => '<path d="M4 6h16M4 12h16M4 18h16"/>',
		'search'          => '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
		'plus'            => '<path d="M12 5v14M5 12h14"/>',
		'minus'           => '<path d="M5 12h14"/>',
		'play'            => '<polygon points="6 3 20 12 6 21 6 3"/>',
		'pause'           => '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
		'star'            => '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
		'user-round'      => '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
		'linkedin'        => '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
		'globe'           => '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
		'quote'           => '<path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1z"/><path d="M10 11c0 4-2 6-5 7"/><path d="M20 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1z"/><path d="M20 11c0 4-2 6-5 7"/>',
		'move-horizontal' => '<path d="m18 8 4 4-4 4M6 8l-4 4 4 4M2 12h20"/>',
	);
}

/**
 * Render one inline Lucide-style icon.
 *
 * @param string                $name Icon name.
 * @param array<string, string> $args Optional `class` override.
 *
 * @return string Escaped SVG markup, or an empty string for an unknown icon.
 */
function doclap_icon( string $name, array $args = array() ): string {
	$paths = doclap_icon_paths();

	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}

	$class = $args['class'] ?? 'lucide lucide-' . $name;

	return sprintf(
		'<svg class="%1$s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">%2$s</svg>',
		esc_attr( $class ),
		$paths[ $name ],
	);
}

/**
 * Build the shared ``doclap-scope`` class list for a block wrapper.
 *
 * Every Doclap stylesheet selector is scoped under ``.doclap-scope``, so each
 * block root must carry it in addition to its own block class.
 *
 * @param string   $class_name Block-specific root class.
 * @param string[] $extra      Additional class names.
 *
 * @return string Space-separated class attribute value.
 */
function doclap_scope_class( string $class_name, array $extra = array() ): string {
	return trim( implode( ' ', array_filter( array_merge( array( 'doclap-scope', $class_name ), $extra ) ) ) );
}

/**
 * Resolve a block's brand source into an image tag.
 *
 * The header and the footer both offer the brand as text or as a media-library
 * logo, and both have to agree on the fallback order, so the chain lives here
 * once: the attachment id wins over the stored URL (it keeps `srcset` and the
 * intrinsic dimensions), the URL covers a logo whose attachment was deleted, and
 * an empty return tells the caller to render its own text brand. A brand with
 * neither a selected attachment nor a URL is therefore never a broken image.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param string               $class_name Class the image carries.
 * @param string               $loading    `eager` above the fold, `lazy` below it.
 *
 * @return string Image markup, or an empty string when the brand is text.
 */
function doclap_brand_image( array $attributes, string $class_name, string $loading = 'eager' ): string {
	if ( 'image' !== ( $attributes['brandMode'] ?? 'text' ) ) {
		return '';
	}

	$media_id  = absint( $attributes['brandMediaId'] ?? 0 );
	$media_url = trim( (string) ( $attributes['brandMediaUrl'] ?? '' ) );
	$alt       = doclap_brand_alt( $attributes, $media_id );

	if ( $media_id > 0 ) {
		$image = wp_get_attachment_image(
			$media_id,
			'full',
			false,
			array_filter(
				array(
					'class'   => $class_name,
					'alt'     => $alt,
					'loading' => $loading,
				),
			),
		);

		if ( '' !== $image ) {
			return (string) $image;
		}
	}

	if ( '' === $media_url ) {
		return '';
	}

	return sprintf(
		'<img class="%1$s" src="%2$s" alt="%3$s" loading="%4$s" decoding="async">',
		esc_attr( $class_name ),
		esc_url( $media_url ),
		esc_attr( $alt ),
		esc_attr( $loading ),
	);
}

/**
 * Accessible name for a brand image.
 *
 * The brand links home, so it needs a name: the block attribute, then the media
 * library value, then the site name. A decorative logo would otherwise leave the
 * link unlabelled for assistive technology.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param int                  $media_id   Attachment id, when the brand has one.
 *
 * @return string Alternative text, never empty.
 */
function doclap_brand_alt( array $attributes, int $media_id = 0 ): string {
	$alt = trim( (string) ( $attributes['brandMediaAlt'] ?? '' ) );

	if ( '' === $alt && $media_id > 0 ) {
		$alt = trim( (string) get_post_meta( $media_id, '_wp_attachment_image_alt', true ) );
	}

	return '' === $alt ? trim( (string) get_bloginfo( 'name' ) ) : $alt;
}

/**
 * Estimate reading time in minutes for a piece of content.
 *
 * @param string $content Raw content, HTML or plain text.
 *
 * @return int Reading time in minutes, never below 1.
 */
function doclap_reading_time( string $content ): int {
	$words = preg_split( '/\s+/', trim( wp_strip_all_tags( $content ) ) );

	if ( false === $words ) {
		return 1;
	}

	$count = count( array_filter( $words ) );

	return max( 1, (int) ceil( $count / 220 ) );
}

/**
 * Two-letter ordinal used by the editorial numbering in the design.
 *
 * @param int $index Zero-based item index.
 *
 * @return string Zero-padded number, e.g. ``03``.
 */
function doclap_ordinal( int $index ): string {
	return str_pad( (string) ( $index + 1 ), 2, '0', STR_PAD_LEFT );
}

/**
 * Resolve a link attribute into a real URL.
 *
 * Supported inputs:
 * - `@notes`  — the blog archive (the page set as "Posts page", otherwise home)
 * - `@search` — the WordPress search endpoint
 * - `#anchor` / absolute URLs — passed through
 * - `?query`  — appended to the site root
 * - `/path/`  — resolved against the current site
 * - empty     — the site home
 *
 * @param string $url Raw attribute value.
 *
 * @return string Escaped-ready absolute URL.
 */
function doclap_resolve_url( string $url ): string {
	$url = trim( $url );

	if ( '' === $url ) {
		return home_url( '/' );
	}

	if ( '@notes' === $url ) {
		$posts_page = (int) get_option( 'page_for_posts' );

		return $posts_page > 0 ? (string) get_permalink( $posts_page ) : home_url( '/' );
	}

	if ( '@search' === $url ) {
		return home_url( '/?s=' );
	}

	if ( str_starts_with( $url, '#' ) || str_starts_with( $url, '//' ) ) {
		return $url;
	}

	if ( preg_match( '#^[a-z][a-z0-9+.-]*:#i', $url ) ) {
		return $url;
	}

	if ( str_starts_with( $url, '?' ) ) {
		return home_url( '/' ) . $url;
	}

	return home_url( '/' . ltrim( $url, '/' ) );
}

/**
 * Path component of a URL, without a trailing slash.
 *
 * @param string $url Absolute or relative URL.
 *
 * @return string Normalised path, `''` for the site root.
 */
function doclap_url_path( string $url ): string {
	$path = (string) wp_parse_url( $url, PHP_URL_PATH );

	return untrailingslashit( $path );
}

/**
 * Whether a link attribute points at the surface currently being rendered.
 *
 * Fragments and off-site URLs are never marked as current.
 *
 * @param string $url Raw attribute value.
 *
 * @return bool True when the resolved target is the current request.
 */
function doclap_link_is_current( string $url ): bool {
	$url = trim( $url );

	if ( '' === $url || str_starts_with( $url, '#' ) ) {
		return false;
	}

	if ( '@search' === $url ) {
		return is_search();
	}

	$target = doclap_url_path( doclap_resolve_url( $url ) );

	if ( '' === $target ) {
		return is_front_page();
	}

	if ( is_singular() ) {
		return $target === doclap_url_path( (string) get_permalink() );
	}

	$posts_page = (int) get_option( 'page_for_posts' );

	if ( is_home() && $posts_page > 0 ) {
		return $target === doclap_url_path( (string) get_permalink( $posts_page ) );
	}

	return false;
}

/**
 * Escape a rich-text attribute for output.
 *
 * Rich attributes are stored as sanitized HTML fragments — bold, italic, links and
 * line breaks — instead of plain text. `wp_kses_post()` is the single output gate
 * for every one of them, so the policy lives here rather than being repeated in
 * fifteen renderers, and a grep for `doclap_rich(` lists every attribute that is
 * intentionally allowed to carry markup. Plain attributes keep using `esc_html()`.
 *
 * Text runs are escaped *before* `wp_kses_post()` re-allows the inline markup,
 * which keeps two behaviours identical to a plain attribute:
 *
 * * core runs `wptexturize()` over block-template output, and `wptexturize()`
 *   deliberately skips existing entities — so an `esc_html()`-escaped `'` stays a
 *   straight apostrophe while a bare `'` coming out of `wp_kses_post()` would be
 *   curled into `&#8217;`. Escaping first means a rich value and a plain value with
 *   the same copy render the same characters, and it matches the markup this theme
 *   produced before rich text existed.
 * * `esc_html()` never double-encodes: it escapes through `_wp_specialchars()`,
 *   whose `$double_encode` default is `false`, so an entity the editor already
 *   stored (`&amp;`) passes through untouched while a bare `&` becomes `&amp;`.
 *
 * @param mixed $value Stored attribute value.
 *
 * @return string Escaped HTML fragment.
 */
function doclap_rich( $value ): string {
	$value = (string) $value;

	$escaped = preg_replace_callback(
		'#(?:<[^>]*>)|([^<]+)#',
		static function ( array $matches ): string {
			return isset( $matches[1] ) ? esc_html( $matches[1] ) : $matches[0];
		},
		$value,
	);

	return wp_kses_post( is_string( $escaped ) ? $escaped : $value );
}

/**
 * Fold a legacy split accent attribute into its merged base value.
 *
 * The heading/accent pairs shipped as two attributes (e.g. `heading` plus
 * `headingAccent`) until 1.0.0; they are now one rich attribute whose value holds
 * the accent inside the same fragment. Saved content from before that change still
 * carries the accent key, so renderers combine the pair on the fly and stay
 * byte-compatible until that block is next saved in the editor — the editor folds
 * the pair once and clears the legacy key, and a save happens to be exactly when
 * the legacy key stops being written to the block comment. After that this
 * function is a no-op.
 *
 * @param string $base   Merged base value, possibly already containing the accent.
 * @param string $accent Legacy accent value, still present in pre-merge content.
 * @param string $join   Literal markup the old renderer emitted between the two
 *                       fragments: `'<br><em>'`, `'<br>'` or `' <em>'`.
 *
 * @return string Combined HTML fragment.
 */
function doclap_rich_accent( string $base, string $accent, string $join = '<br><em>' ): string {
	$base   = trim( $base );
	$accent = trim( $accent );

	if ( '' === $accent || str_contains( $base, '<em>' ) ) {
		return $base;
	}

	$combined = $base . $join . esc_html( $accent );

	if ( ' <em>' === $join || '<br><em>' === $join ) {
		$combined .= '</em>';
	}

	return $combined;
}

/**
 * Plain-text label derived from a rich heading value.
 *
 * The hero view tabs and the editor's list labels show the accent fragment of a
 * heading — the emphasised part inside `<em>` — falling back to the whole value
 * when the editor produced no emphasis. Markup is always stripped, so the result
 * is safe for `esc_html()`, an `aria-label` or a `<span>` of text.
 *
 * @param string $value Rich heading value.
 *
 * @return string Single-line, tag-free label; empty when the value carries no text.
 */
function doclap_rich_accent_label( string $value ): string {
	$value = trim( $value );

	if ( '' !== $value && preg_match( '#<em>(.*?)</em>#s', $value, $matches ) ) {
		$value = $matches[1];
	}

	return trim( (string) preg_replace( '/\s+/', ' ', wp_strip_all_tags( $value ) ) );
}

/**
 * The post the current request is rendering.
 *
 * The query-aware sections resolve the same post — the four note-detail blocks and
 * the page hero: the queried object on a singular request, and the global post as
 * the fallback a block preview or an inner template render needs. A null result
 * means "no post here", which every such renderer answers with its own
 * deterministic fallback copy rather than with a query of its own.
 *
 * @return WP_Post|null Queried post, or null when no post is in context.
 */
function doclap_queried_post(): ?WP_Post {
	$object = get_queried_object();
	$post   = $object instanceof WP_Post ? $object : ( $GLOBALS['post'] ?? null );

	return $post instanceof WP_Post ? $post : null;
}
