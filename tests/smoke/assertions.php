<?php

/**
 * Isolated smoke assertions for the Doclap child theme.
 *
 * Runs inside a throwaway WordPress (Playground) or against any WordPress install
 * through WP-CLI (`npm run test:wp -- --wp-cli`). It asserts the contract the
 * theme depends on:
 *
 *   * Doclap is a readable child theme of Nextora;
 *   * every doclap/* block registers as a dynamic block, in the Doclap inserter
 *     category, with a readable render.php;
 *   * every block.json declares the product contract — apiVersion 3, title, icon,
 *     description, keywords, textdomain, supports and resolvable assets;
 *   * the site header stores a WordPress menu source (menu id plus depth), a
 *     brand source (text or media library) and none of the removed
 *     navigation-tree attributes;
 *   * theme.json parses under WordPress and, once merged with the parent's, exposes
 *     the Doclap palette, its child custom templates and its font families;
 *   * every declared font face points at a file that exists, and the compiled
 *     assets are present;
 *   * POST /doclap/v1/contact is registered with argument validation;
 *   * the insertion patterns declare doclap slugs and insert their own block.
 *
 * The active stylesheet is pointed at Doclap for the duration of the run so the
 * child's own registration code (`get_stylesheet_directory()`) resolves, then it is
 * restored: the WordPress install is never left changed.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	fwrite( STDERR, "This script must run inside WordPress.\n" );
	exit( 1 );
}

/**
 * Locate the Doclap theme directory in whichever WordPress is hosting this run.
 *
 * @return string Absolute theme directory.
 */
function doclap_smoke_theme_dir(): string {
	$candidates = array(
		'/wordpress/wp-content/themes/doclap',
		get_theme_root() . '/doclap',
		dirname( __DIR__, 2 ),
	);

	foreach ( $candidates as $candidate ) {
		if ( is_dir( $candidate ) && is_readable( $candidate . '/theme.json' ) ) {
			return rtrim( $candidate, '/' );
		}
	}

	fwrite( STDERR, "FAIL: the Doclap theme directory could not be located.\n" );
	exit( 1 );
}

/**
 * Report one satisfied assertion.
 *
 * @param string $message Message to print.
 */
function doclap_smoke_pass( string $message ): void {
	echo 'DOCLAP-OK ' . $message . "\n";
}

/**
 * Report one failed assertion and stop.
 *
 * @param string $message Failure message.
 */
function doclap_smoke_fail( string $message ): void {
	fwrite( STDERR, 'DOCLAP-FAIL ' . $message . "\n" );
	exit( 1 );
}

$doclap_dir     = doclap_smoke_theme_dir();
$doclap_uri     = 'http://example.test/wp-content/themes/doclap';
$doclap_restore = array(
	'stylesheet' => get_option( 'stylesheet' ),
	'template'   => get_option( 'template' ),
);

update_option( 'stylesheet', 'doclap' );
update_option( 'template', 'nextora' );
wp_clean_themes_cache();

register_shutdown_function(
	static function () use ( $doclap_restore ): void {
		update_option( 'stylesheet', $doclap_restore['stylesheet'] );
		update_option( 'template', $doclap_restore['template'] );
	},
);

// 1. Child-theme relationship.
$doclap_theme = wp_get_theme( 'doclap' );

if ( ! $doclap_theme->exists() ) {
	doclap_smoke_fail( 'the doclap theme is not readable' );
}

if ( 'nextora' !== $doclap_theme->get_template() ) {
	doclap_smoke_fail( 'doclap is not a child of nextora, template is ' . $doclap_theme->get_template() );
}

if ( ! $doclap_theme->parent() ) {
	doclap_smoke_fail( 'the nextora parent theme is missing' );
}

doclap_smoke_pass( 'child-theme' );

// 2. Block registration.
if ( ! defined( 'DOCLAP_DIR' ) ) {
	define( 'DOCLAP_DIR', $doclap_dir );
}

if ( ! defined( 'DOCLAP_URI' ) ) {
	define( 'DOCLAP_URI', $doclap_uri );
}

// In an isolated WordPress the child theme is not active, so its registration code
// has not run yet. Where Doclap is already the active theme its blocks are
// registered, and re-requiring it plus firing `init` a second time would re-run
// every plugin's init hook — so that only happens when it is actually needed.
$doclap_pre_registered = array_values(
	array_filter(
		array_keys( WP_Block_Type_Registry::get_instance()->get_all_registered() ),
		static fn( string $name ): bool => str_starts_with( $name, 'doclap/' ),
	),
);

if ( array() === $doclap_pre_registered ) {
	require_once DOCLAP_DIR . '/functions.php';
	do_action( 'init' );
}

$doclap_registered = WP_Block_Type_Registry::get_instance()->get_all_registered();
$doclap_blocks     = array_values(
	array_filter(
		array_keys( $doclap_registered ),
		static fn( string $name ): bool => str_starts_with( $name, 'doclap/' ),
	),
);
sort( $doclap_blocks );

$doclap_expected = array(
	'doclap/closing-cta',
	'doclap/contact-form',
	'doclap/faq-list',
	'doclap/home-about',
	'doclap/home-contact',
	'doclap/home-disciplines',
	'doclap/home-hero',
	'doclap/home-journal',
	'doclap/home-process',
	'doclap/home-team',
	'doclap/home-testimonials',
	'doclap/home-work',
	'doclap/inner-hero',
	'doclap/media-figure',
	'doclap/note-content',
	'doclap/note-cover',
	'doclap/note-hero',
	'doclap/not-found',
	'doclap/notes-archive',
	'doclap/principles-grid',
	'doclap/related-notes',
	'doclap/search-results',
	'doclap/site-footer',
	'doclap/site-header',
	'doclap/split-narrative',
);

$doclap_missing = array_diff( $doclap_expected, $doclap_blocks );
$doclap_extra   = array_diff( $doclap_blocks, $doclap_expected );

if ( array() !== $doclap_missing ) {
	doclap_smoke_fail( 'blocks missing: ' . implode( ', ', $doclap_missing ) );
}

if ( array() !== $doclap_extra ) {
	doclap_smoke_fail( 'unexpected blocks: ' . implode( ', ', $doclap_extra ) );
}

foreach ( $doclap_expected as $doclap_name ) {
	$doclap_block = $doclap_registered[ $doclap_name ];
	$doclap_slug  = substr( $doclap_name, strlen( 'doclap/' ) );

	if ( 'doclap' !== $doclap_block->category ) {
		doclap_smoke_fail( $doclap_name . ' is not in the doclap category' );
	}

	if ( ! $doclap_block->is_dynamic() ) {
		doclap_smoke_fail( $doclap_name . ' is not a dynamic block' );
	}

	if ( ! is_readable( DOCLAP_DIR . '/blocks/' . $doclap_slug . '/render.php' ) ) {
		doclap_smoke_fail( $doclap_name . ' has no readable render.php' );
	}

	if ( ! is_readable( DOCLAP_DIR . '/blocks/' . $doclap_slug . '/block.json' ) ) {
		doclap_smoke_fail( $doclap_name . ' has no block.json' );
	}
}

// Core's own helper, so every `block_categories_all` callback receives the editor
// context it expects (calling the filter directly breaks plugins that require it).
$doclap_editor_context = class_exists( 'WP_Block_Editor_Context' )
	? new WP_Block_Editor_Context( array( 'name' => 'core/edit-post' ) )
	: null;
$doclap_category_slugs = array_column( get_block_categories( $doclap_editor_context ), 'slug' );

if ( ! in_array( 'doclap', $doclap_category_slugs, true ) ) {
	doclap_smoke_fail( 'the doclap inserter category is not registered' );
}

doclap_smoke_pass( 'blocks ' . count( $doclap_blocks ) );

// 3. theme.json parsing and merge behaviour.
$doclap_raw = (string) file_get_contents( DOCLAP_DIR . '/theme.json' );
$doclap_data = json_decode( $doclap_raw, true );

if ( ! is_array( $doclap_data ) || 3 !== ( $doclap_data['version'] ?? null ) ) {
	doclap_smoke_fail( 'theme.json did not parse as a version 3 theme.json' );
}

$doclap_parent_raw  = (string) file_get_contents( $doclap_theme->get_template_directory() . '/theme.json' );
$doclap_parent_data = json_decode( $doclap_parent_raw, true );

if ( ! is_array( $doclap_parent_data ) ) {
	doclap_smoke_fail( 'the parent theme.json did not parse' );
}

$doclap_parent_json = new WP_Theme_JSON( $doclap_parent_data, 'theme' );
$doclap_child_json  = new WP_Theme_JSON( $doclap_data, 'theme' );
$doclap_parent_json->merge( $doclap_child_json );
$doclap_settings = $doclap_parent_json->get_settings();

$doclap_palette = array_column( $doclap_settings['color']['palette']['theme'] ?? array(), 'slug' );

foreach ( array( 'base', 'surface', 'contrast', 'paragraph', 'primary', 'accent', 'accent-soft', 'foreground-soft', 'border', 'transparent' ) as $doclap_slug ) {
	if ( ! in_array( $doclap_slug, $doclap_palette, true ) ) {
		doclap_smoke_fail( 'palette slug missing after the merge: ' . $doclap_slug );
	}
}

// WordPress exposes merged custom templates through its own accessor rather than
// through `get_settings()`, so ask it the way the Site Editor does.
$doclap_custom_templates = function_exists( 'wp_get_theme_data_custom_templates' )
	? wp_get_theme_data_custom_templates()
	: array();
$doclap_templates        = array_keys( $doclap_custom_templates );

foreach ( array( 'about-us', 'contact-us', 'frequently-asked-questions' ) as $doclap_template ) {
	if ( ! in_array( $doclap_template, $doclap_templates, true ) ) {
		doclap_smoke_fail( 'a required page template is not registered: ' . $doclap_template );
	}
}

// The child theme must not shadow the parent's template registration: declaring
// `customTemplates` in a child theme.json merges positionally and would drop
// entries the parent registered.
if ( ! in_array( 'page-full-width', $doclap_templates, true ) ) {
	doclap_smoke_fail( 'the child theme.json dropped the parent custom template page-full-width' );
}

$doclap_families = array_column( $doclap_settings['typography']['fontFamilies']['theme'] ?? array(), 'slug' );

foreach ( array( 'be-vietnam-pro', 'bodoni-moda', 'ibm-plex-mono' ) as $doclap_family ) {
	if ( ! in_array( $doclap_family, $doclap_families, true ) ) {
		doclap_smoke_fail( 'font family missing after the merge: ' . $doclap_family );
	}
}

$doclap_global_settings = wp_get_global_settings();

doclap_smoke_pass(
	sprintf(
		'theme-json palette=%d templates=%d families=%d globalSettings=%s',
		count( $doclap_palette ),
		count( $doclap_templates ),
		count( $doclap_families ),
		is_array( $doclap_global_settings ) && array() !== $doclap_global_settings ? 'populated' : 'empty-in-this-context',
	),
);

// 4. Declared font faces and compiled assets.
$doclap_faces = 0;
$doclap_files = array();

foreach ( $doclap_data['settings']['typography']['fontFamilies'] as $doclap_family ) {
	foreach ( $doclap_family['fontFace'] ?? array() as $doclap_face ) {
		++$doclap_faces;

		foreach ( $doclap_face['src'] as $doclap_src ) {
			$doclap_files[] = DOCLAP_DIR . '/' . ltrim( str_replace( 'file:./', '', $doclap_src ), '/' );
		}
	}
}

$doclap_unreadable = array_values(
	array_filter( $doclap_files, static fn( string $file ): bool => ! is_readable( $file ) ),
);

if ( array() !== $doclap_unreadable ) {
	doclap_smoke_fail( 'declared font files are missing: ' . implode( ', ', array_slice( $doclap_unreadable, 0, 3 ) ) );
}

if ( $doclap_faces < 20 ) {
	doclap_smoke_fail( 'expected at least 20 declared font faces, found ' . $doclap_faces );
}

$doclap_assets = array(
	'/assets/css/app.css',
	'/assets/js/main.js',
	'/assets/models/david-head.bin',
	'/assets/images/david-head-poster.png',
	'/assets/images/studio-workspace.jpg',
);

foreach ( $doclap_assets as $doclap_asset ) {
	if ( ! is_readable( DOCLAP_DIR . $doclap_asset ) ) {
		doclap_smoke_fail( 'compiled asset missing: ' . $doclap_asset );
	}
}

doclap_smoke_pass( 'fonts faces=' . $doclap_faces . ' files=' . count( $doclap_files ) );

// 5. Contact REST route.
$doclap_server = rest_get_server();
do_action( 'rest_api_init', $doclap_server );
$doclap_routes = $doclap_server->get_routes();

if ( ! isset( $doclap_routes['/doclap/v1/contact'] ) ) {
	doclap_smoke_fail( 'the contact REST route is not registered' );
}

$doclap_route = null;

foreach ( $doclap_routes['/doclap/v1/contact'] as $doclap_candidate ) {
	if ( isset( $doclap_candidate['methods']['POST'] ) ) {
		$doclap_route = $doclap_candidate;
		break;
	}
}

if ( null === $doclap_route ) {
	doclap_smoke_fail( 'the contact REST route does not accept POST' );
}

foreach ( array( '_wpnonce', 'name', 'email', 'message', 'consent', 'services' ) as $doclap_arg ) {
	if ( ! isset( $doclap_route['args'][ $doclap_arg ] ) ) {
		doclap_smoke_fail( 'the contact REST route does not validate the ' . $doclap_arg . ' argument' );
	}
}

doclap_smoke_pass( 'rest-route' );

// 6. Insertion patterns.
$doclap_patterns = glob( DOCLAP_DIR . '/patterns/*.php' );

if ( ! is_array( $doclap_patterns ) || count( $doclap_patterns ) < 10 ) {
	doclap_smoke_fail( 'expected at least 10 insertion patterns' );
}

/**
 * Collect the block names a pattern body inserts, in document order.
 *
 * @param string $body Raw pattern file contents.
 *
 * @return string[] Block names.
 */
function doclap_smoke_pattern_blocks( string $body ): array {
	$names = array();

	if ( preg_match_all( '#<!--\s+wp:([a-z0-9-]+/[a-z0-9-]+)#i', $body, $matches ) ) {
		$names = $matches[1];
	}

	return $names;
}

$doclap_expected_home = array(
	'doclap/home-hero',
	'doclap/home-disciplines',
	'doclap/home-work',
	'doclap/home-about',
	'doclap/home-process',
	'doclap/home-team',
	'doclap/home-testimonials',
	'doclap/home-journal',
	'doclap/home-contact',
);

foreach ( $doclap_patterns as $doclap_pattern_file ) {
	$doclap_headers = get_file_data(
		$doclap_pattern_file,
		array(
			'title' => 'Title',
			'slug'  => 'Slug',
		),
	);
	$doclap_body    = (string) file_get_contents( $doclap_pattern_file );
	$doclap_names   = doclap_smoke_pattern_blocks( $doclap_body );

	if ( ! str_starts_with( (string) $doclap_headers['slug'], 'doclap/' ) ) {
		doclap_smoke_fail( 'pattern without a doclap slug: ' . basename( $doclap_pattern_file ) );
	}

	if ( '' === (string) $doclap_headers['title'] ) {
		doclap_smoke_fail( 'pattern without a title: ' . basename( $doclap_pattern_file ) );
	}

	if ( array() === $doclap_names ) {
		doclap_smoke_fail( 'pattern without a block: ' . basename( $doclap_pattern_file ) );
	}

	foreach ( $doclap_names as $doclap_name ) {
		if ( ! str_starts_with( $doclap_name, 'doclap/' ) ) {
			doclap_smoke_fail(
				'pattern inserts a non-doclap block ' . $doclap_name . ': ' . basename( $doclap_pattern_file ),
			);
		}
	}
}

// The landing composition is the contract for the full home page: nine section
// blocks, in the canonical landing order, each on its own.
$doclap_landing = DOCLAP_DIR . '/patterns/home-landing.php';

if ( ! is_readable( $doclap_landing ) ) {
	doclap_smoke_fail( 'the doclap/home-landing composition pattern is missing' );
}

$doclap_landing_names = doclap_smoke_pattern_blocks( (string) file_get_contents( $doclap_landing ) );

if ( $doclap_expected_home !== $doclap_landing_names ) {
	doclap_smoke_fail(
		'the home landing pattern is not the ordered nine-block composition: '
		. implode( ', ', $doclap_landing_names ),
	);
}

// Every pattern slug the theme ships, declared exactly once: the nine home
// sections, the home landing composition, the reusable inner-page sections, the
// three narrowed inner-page blocks, the four note-detail blocks, the five
// full-page compositions and the chrome/utility surfaces.
$doclap_expected_patterns = array(
	'doclap/about-us-page',
	'doclap/closing-cta',
	'doclap/contact-form',
	'doclap/contact-us-page',
	'doclap/faq-list',
	'doclap/faq-page',
	'doclap/home-about',
	'doclap/home-contact',
	'doclap/home-disciplines',
	'doclap/home-hero',
	'doclap/home-journal',
	'doclap/home-landing',
	'doclap/home-process',
	'doclap/home-team',
	'doclap/home-testimonials',
	'doclap/home-work',
	'doclap/inner-hero',
	'doclap/media-figure',
	'doclap/note-content',
	'doclap/note-cover',
	'doclap/note-hero',
	'doclap/not-found',
	'doclap/notes-archive',
	'doclap/notes-archive-page',
	'doclap/post-detail-page',
	'doclap/principles-grid',
	'doclap/related-notes',
	'doclap/search-results',
	'doclap/site-footer',
	'doclap/site-header',
	'doclap/split-narrative',
);
$doclap_pattern_slugs = array();

foreach ( $doclap_patterns as $doclap_pattern_file ) {
	$doclap_headers      = get_file_data( $doclap_pattern_file, array( 'slug' => 'Slug' ) );
	$doclap_slug         = (string) $doclap_headers['slug'];
	$doclap_block_name   = 'doclap/' . basename( $doclap_pattern_file, '.php' );

	if ( in_array( $doclap_slug, $doclap_pattern_slugs, true ) ) {
		doclap_smoke_fail( 'duplicate pattern slug: ' . $doclap_slug );
	}

	// A pattern file is named after its slug, so a renamed slug cannot keep
	// inserting the wrong block unnoticed.
	if ( $doclap_block_name !== $doclap_slug ) {
		doclap_smoke_fail(
			basename( $doclap_pattern_file ) . ' declares the slug ' . $doclap_slug . ' instead of ' . $doclap_block_name,
		);
	}

	$doclap_pattern_slugs[] = $doclap_slug;
}

sort( $doclap_pattern_slugs );
$doclap_patterns_missing = array_diff( $doclap_expected_patterns, $doclap_pattern_slugs );
$doclap_patterns_extra   = array_diff( $doclap_pattern_slugs, $doclap_expected_patterns );

if ( array() !== $doclap_patterns_missing ) {
	doclap_smoke_fail( 'patterns missing: ' . implode( ', ', $doclap_patterns_missing ) );
}

if ( array() !== $doclap_patterns_extra ) {
	doclap_smoke_fail( 'unexpected patterns: ' . implode( ', ', $doclap_patterns_extra ) );
}

// Every requested template is composed directly from its canonical composition
// pattern: same ordered sections, file templates, no core/pattern indirection.
$doclap_template_patterns = array(
	'templates/about-us.html'                 => 'patterns/about-us-page.php',
	'templates/contact-us.html'               => 'patterns/contact-us-page.php',
	'templates/frequently-asked-questions.html' => 'patterns/faq-page.php',
	'templates/archive.html'                  => 'patterns/notes-archive-page.php',
	'templates/home.html'                     => 'patterns/notes-archive-page.php',
	'templates/single.html'                   => 'patterns/post-detail-page.php',
);

foreach ( $doclap_template_patterns as $doclap_template => $doclap_pattern ) {
	$doclap_template_body = (string) file_get_contents( DOCLAP_DIR . '/' . $doclap_template );
	$doclap_pattern_body  = (string) file_get_contents( DOCLAP_DIR . '/' . $doclap_pattern );
	$doclap_template_list = doclap_smoke_pattern_blocks( $doclap_template_body );
	$doclap_pattern_list  = doclap_smoke_pattern_blocks( $doclap_pattern_body );

	if ( array() === $doclap_pattern_list ) {
		doclap_smoke_fail( $doclap_pattern . ' composes no block' );
	}

	if ( $doclap_template_list !== $doclap_pattern_list ) {
		doclap_smoke_fail(
			$doclap_template . ' is not the ordered composition of ' . $doclap_pattern . ': '
			. implode( ', ', $doclap_template_list ),
		);
	}

	foreach ( array( 'doclap/about-profile', 'doclap/single-note' ) as $doclap_removed ) {
		if ( in_array( $doclap_removed, $doclap_template_list, true ) ) {
			doclap_smoke_fail( $doclap_template . ' still places the removed ' . $doclap_removed );
		}
	}

	if ( str_contains( $doclap_template_body, 'wp:pattern' ) ) {
		doclap_smoke_fail( $doclap_template . ' references a pattern instead of placing its blocks' );
	}

	foreach ( array( 'slug":"header', 'slug":"footer', 'class="wp-block-group doclap-scope doclap-page-content"' ) as $doclap_fragment ) {
		if ( ! str_contains( $doclap_template_body, $doclap_fragment ) ) {
			doclap_smoke_fail( $doclap_template . ' lost its shared shell fragment: ' . $doclap_fragment );
		}
	}
}

// The post template closes the article with the discussion — the comment list,
// its title, the form and the pagination the stylesheet dresses — placed before
// the closing invitation.
$doclap_single = (string) file_get_contents( DOCLAP_DIR . '/templates/single.html' );

foreach ( array( 'wp:comments', 'wp:comments-title', 'wp:comment-template', 'wp:post-comments-form', 'doclap-comments' ) as $doclap_fragment ) {
	if ( ! str_contains( $doclap_single, $doclap_fragment ) ) {
		doclap_smoke_fail( 'templates/single.html lost its discussion section: ' . $doclap_fragment );
	}
}

if ( strpos( $doclap_single, 'doclap-comments' ) > strpos( $doclap_single, 'doclap/closing-cta' ) ) {
	doclap_smoke_fail( 'templates/single.html places the discussion after the closing invitation' );
}

// The posts index and the generic archive render the same composition, so the
// two templates cannot drift apart.
if (
	doclap_smoke_pattern_blocks( (string) file_get_contents( DOCLAP_DIR . '/templates/archive.html' ) )
	!== doclap_smoke_pattern_blocks( (string) file_get_contents( DOCLAP_DIR . '/templates/home.html' ) )
) {
	doclap_smoke_fail( 'templates/archive.html and templates/home.html no longer share one composition' );
}

doclap_smoke_pass( 'patterns ' . count( $doclap_patterns ) . ' templates ' . count( $doclap_template_patterns ) );

// 7. Per-block metadata and asset contract.
/**
 * Resolve a `file:./name` declaration the way WordPress does when registering a
 * block from metadata: relative to the block.json directory, falling back to the
 * parent theme for assets a child block inherits.
 *
 * @param string $slug     Block slug inside blocks/.
 * @param string $relative Declared value, for example `file:./render.php`.
 *
 * @return string Absolute readable path, or an empty string when nothing resolves.
 */
function doclap_smoke_resolve_asset( string $slug, string $relative ): string {
	$file       = ltrim( (string) preg_replace( '#^file:\.?/#', '', $relative ), '/' );
	$candidates = array(
		DOCLAP_DIR . '/blocks/' . $slug . '/' . $file,
		get_template_directory() . '/blocks/' . $slug . '/' . $file,
	);

	foreach ( $candidates as $candidate ) {
		if ( is_readable( $candidate ) ) {
			return $candidate;
		}
	}

	return '';
}

$doclap_manifests = array();
$doclap_js_assets = 0;

foreach ( $doclap_expected as $doclap_name ) {
	$doclap_slug     = substr( $doclap_name, strlen( 'doclap/' ) );
	$doclap_manifest = json_decode(
		(string) file_get_contents( DOCLAP_DIR . '/blocks/' . $doclap_slug . '/block.json' ),
		true,
	);

	if ( ! is_array( $doclap_manifest ) ) {
		doclap_smoke_fail( $doclap_name . ' block.json does not parse as JSON' );
	}

	$doclap_manifests[ $doclap_name ] = $doclap_manifest;

	if ( 3 !== ( $doclap_manifest['apiVersion'] ?? null ) ) {
		doclap_smoke_fail( $doclap_name . ' does not declare apiVersion 3' );
	}

	if ( $doclap_name !== ( $doclap_manifest['name'] ?? '' ) ) {
		doclap_smoke_fail( $doclap_name . ' declares the name ' . (string) ( $doclap_manifest['name'] ?? '' ) );
	}

	foreach ( array( 'title', 'category', 'icon', 'description' ) as $doclap_key ) {
		$doclap_value = $doclap_manifest[ $doclap_key ] ?? null;

		if ( ! is_string( $doclap_value ) || '' === trim( $doclap_value ) ) {
			doclap_smoke_fail( $doclap_name . ' declares no ' . $doclap_key );
		}
	}

	if ( ! is_array( $doclap_manifest['keywords'] ?? null ) || array() === $doclap_manifest['keywords'] ) {
		doclap_smoke_fail( $doclap_name . ' declares no keywords' );
	}

	if ( 'doclap' !== ( $doclap_manifest['textdomain'] ?? null ) ) {
		doclap_smoke_fail( $doclap_name . ' does not declare the doclap textdomain' );
	}

	if ( false !== ( $doclap_manifest['supports']['html'] ?? null ) ) {
		doclap_smoke_fail( $doclap_name . ' does not declare supports.html false' );
	}

	if ( true !== ( $doclap_manifest['supports']['anchor'] ?? null ) ) {
		doclap_smoke_fail( $doclap_name . ' does not declare supports.anchor true' );
	}

	foreach ( array( 'render', 'editorScript', 'editorStyle', 'style', 'viewScript' ) as $doclap_key ) {
		$doclap_relative = $doclap_manifest[ $doclap_key ] ?? '';

		if ( ! is_string( $doclap_relative ) || '' === $doclap_relative ) {
			continue;
		}

		if ( ! str_starts_with( $doclap_relative, 'file:' ) ) {
			doclap_smoke_fail( $doclap_name . ' declares a non-file ' . $doclap_key . ': ' . $doclap_relative );
		}

		$doclap_resolved = doclap_smoke_resolve_asset( $doclap_slug, $doclap_relative );

		if ( '' === $doclap_resolved ) {
			doclap_smoke_fail( $doclap_name . ' declares an unreadable ' . $doclap_key . ': ' . $doclap_relative );
		}

		if ( ! str_ends_with( $doclap_resolved, '.js' ) ) {
			continue;
		}

		++$doclap_js_assets;

		$doclap_asset_php = (string) preg_replace( '#\.js$#', '.asset.php', $doclap_resolved );

		if ( ! is_readable( $doclap_asset_php ) ) {
			doclap_smoke_fail( $doclap_name . ' has no ' . basename( $doclap_asset_php ) . ' beside ' . basename( $doclap_resolved ) );
		}

		$doclap_asset = include $doclap_asset_php;

		if ( ! is_array( $doclap_asset ) || ! is_array( $doclap_asset['dependencies'] ?? null ) ) {
			doclap_smoke_fail( $doclap_name . ' ships an ' . basename( $doclap_asset_php ) . ' without a dependency list' );
		}
	}

	// The registered block type must carry the editor style handle and the dynamic
	// render callback, not just the metadata declaring them.
	$doclap_block   = $doclap_registered[ $doclap_name ];
	$doclap_handles = array();

	if ( is_array( $doclap_block->editor_style_handles ?? null ) ) {
		$doclap_handles = $doclap_block->editor_style_handles;
	}

	if ( array() === $doclap_handles ) {
		foreach ( array( 'editorStyle', 'style' ) as $doclap_property ) {
			$doclap_value = $doclap_block->$doclap_property ?? null;

			if ( is_array( $doclap_value ) && array() !== $doclap_value ) {
				$doclap_handles[] = $doclap_property;
			} elseif ( is_string( $doclap_value ) && '' !== $doclap_value ) {
				$doclap_handles[] = $doclap_property;
			}
		}
	}

	if ( array() === $doclap_handles ) {
		doclap_smoke_fail( $doclap_name . ' exposes no editor style handle' );
	}

	if ( ! is_callable( $doclap_block->render_callback ?? null ) ) {
		doclap_smoke_fail( $doclap_name . ' has no callable render callback' );
	}
}

// The hero and closing sections moved out of the narrowed blocks into their own
// reusable sections, so those attributes must be gone from the three manifests
// and the shared section blocks must declare exactly what they render.
$doclap_migrated_attributes = array(
	'doclap/contact-form'  => array( 'breadcrumbHomeLabel', 'breadcrumbLabel', 'heading', 'headingAccent', 'lead' ),
	'doclap/faq-list'      => array(
		'breadcrumbHomeLabel',
		'breadcrumbLabel',
		'heading',
		'headingAccent',
		'lead',
		'closingEyebrow',
		'closingHeading',
		'closingHeadingAccent',
		'closingCtaLabel',
		'closingCtaUrl',
	),
	'doclap/notes-archive' => array(
		'breadcrumbHomeLabel',
		'breadcrumbLabel',
		'heading',
		'headingAccent',
		'lead',
		'closingEyebrow',
		'closingHeading',
		'closingHeadingAccent',
		'closingCtaLabel',
		'closingCtaUrl',
	),
);

foreach ( $doclap_migrated_attributes as $doclap_name => $doclap_keys ) {
	$doclap_declared = array_keys( (array) ( $doclap_manifests[ $doclap_name ]['attributes'] ?? array() ) );

	foreach ( $doclap_keys as $doclap_key ) {
		if ( in_array( $doclap_key, $doclap_declared, true ) ) {
			doclap_smoke_fail( $doclap_name . ' still declares the migrated attribute ' . $doclap_key );
		}
	}
}

$doclap_section_contract = array(
	'doclap/inner-hero'      => array( 'breadcrumbHomeLabel', 'breadcrumbLabel', 'heading', 'headingAccent', 'lead' ),
	'doclap/closing-cta'     => array( 'eyebrow', 'heading', 'headingAccent', 'ctaLabel', 'ctaUrl' ),
	'doclap/split-narrative' => array( 'label', 'heading', 'headingAccent', 'paragraphs', 'statusNote', 'linkLabel', 'linkUrl' ),
	'doclap/media-figure'    => array( 'imageId', 'imageUrl', 'imageAlt', 'caption' ),
	'doclap/principles-grid' => array( 'eyebrow', 'heading', 'principles' ),
	'doclap/note-hero'       => array( 'breadcrumbHomeLabel', 'archiveLabel', 'archiveUrl', 'articleLabel' ),
	'doclap/note-cover'      => array( 'articleMetaPrefix' ),
	'doclap/note-content'    => array( 'archiveUrl', 'tocLabel', 'tocEmptyBehaviour', 'disclaimer', 'backToArchiveLabel' ),
	'doclap/related-notes'   => array( 'heading', 'count' ),
);

foreach ( $doclap_section_contract as $doclap_name => $doclap_keys ) {
	$doclap_attributes = (array) ( $doclap_manifests[ $doclap_name ]['attributes'] ?? array() );

	foreach ( $doclap_keys as $doclap_key ) {
		if ( ! is_array( $doclap_attributes[ $doclap_key ] ?? null ) ) {
			doclap_smoke_fail( $doclap_name . ' does not declare the ' . $doclap_key . ' attribute' );
		}
	}

	// A section block edits only its own section: no page title, breadcrumb or
	// closing field may leak into a block that does not render one.
	foreach ( array( 'closingEyebrow', 'closingHeading', 'closingCtaUrl' ) as $doclap_foreign ) {
		if ( 'doclap/closing-cta' !== $doclap_name && array_key_exists( $doclap_foreign, $doclap_attributes ) ) {
			doclap_smoke_fail( $doclap_name . ' declares the closing attribute ' . $doclap_foreign );
		}
	}

	if ( 'doclap/inner-hero' !== $doclap_name && 'doclap/note-hero' !== $doclap_name && array_key_exists( 'breadcrumbLabel', $doclap_attributes ) ) {
		doclap_smoke_fail( $doclap_name . ' declares the hero attribute breadcrumbLabel' );
	}
}

$doclap_table_of_contents = (array) ( $doclap_manifests['doclap/note-content']['attributes']['tocEmptyBehaviour'] ?? array() );

// Every block whose editor mounts the shared Colours panel must declare the three
// optional colours it writes, as strings that default to "theme default".
$doclap_colour_users = array();

foreach ( (array) glob( DOCLAP_DIR . '/blocks/*/edit.tsx' ) as $doclap_editor ) {
	if ( ! str_contains( (string) file_get_contents( $doclap_editor ), '<ColourControls' ) ) {
		continue;
	}

	$doclap_colour_users[] = 'doclap/' . basename( dirname( $doclap_editor ) );
}

sort( $doclap_colour_users );

if ( array() === $doclap_colour_users ) {
	doclap_smoke_fail( 'no block mounts the shared Colours panel' );
}

foreach ( $doclap_colour_users as $doclap_name ) {
	$doclap_attributes = (array) ( $doclap_manifests[ $doclap_name ]['attributes'] ?? array() );

	foreach ( array( 'sectionBg', 'sectionHeading', 'sectionText' ) as $doclap_key ) {
		$doclap_attribute = $doclap_attributes[ $doclap_key ] ?? null;

		if (
			! is_array( $doclap_attribute )
			|| 'string' !== ( $doclap_attribute['type'] ?? null )
			|| '' !== ( $doclap_attribute['default'] ?? null )
		) {
			doclap_smoke_fail( $doclap_name . ' mounts the Colours panel without declaring ' . $doclap_key );
		}
	}

	// An unset colour must stay unset: the renderer only emits a property for a
	// non-empty value, so the section keeps the designed colours.
	if ( ! str_contains( (string) file_get_contents( DOCLAP_DIR . '/blocks/' . substr( $doclap_name, strlen( 'doclap/' ) ) . '/render.php' ), '$doclap_colour_style' ) ) {
		doclap_smoke_fail( $doclap_name . ' declares colours its renderer never publishes' );
	}
}

if ( ! in_array( 'doclap/inner-hero', $doclap_colour_users, true ) || ! in_array( 'doclap/principles-grid', $doclap_colour_users, true ) ) {
	doclap_smoke_fail( 'the inner-page section blocks are not colour-aware' );
}

if (
	'string' !== ( $doclap_table_of_contents['type'] ?? null )
	|| 'hide' !== ( $doclap_table_of_contents['default'] ?? null )
) {
	doclap_smoke_fail( 'doclap/note-content does not default tocEmptyBehaviour to hide' );
}

$doclap_related_count = (array) ( $doclap_manifests['doclap/related-notes']['attributes']['count'] ?? array() );

if (
	'integer' !== ( $doclap_related_count['type'] ?? null )
	|| 2 !== ( $doclap_related_count['default'] ?? null )
) {
	doclap_smoke_fail( 'doclap/related-notes does not default count to 2' );
}

doclap_smoke_pass( 'inner-page-schema ' . count( $doclap_section_contract ) . ' sections' );

// The contact delivery schema is server-side only: the six 1.0.0 delivery
// attributes are gone and nothing secret-like has been reintroduced.
$doclap_contact_attributes = array_keys( (array) ( $doclap_manifests['doclap/contact-form']['attributes'] ?? array() ) );

foreach ( array( 'adminEmail', 'adminEmailSubject', 'userEmailSubject', 'enableRecaptcha', 'recaptchaSiteKey', 'recaptchaSecretKey' ) as $doclap_key ) {
	if ( in_array( $doclap_key, $doclap_contact_attributes, true ) ) {
		doclap_smoke_fail( 'the contact block still declares ' . $doclap_key );
	}
}

foreach ( $doclap_contact_attributes as $doclap_key ) {
	if ( preg_match( '/secret|recaptcha|subject|adminemail/i', $doclap_key ) ) {
		doclap_smoke_fail( 'the contact block declares a delivery attribute: ' . $doclap_key );
	}
}

foreach ( array( 'doclap/site-header', 'doclap/site-footer' ) as $doclap_name ) {
	if ( false !== ( $doclap_manifests[ $doclap_name ]['supports']['reusable'] ?? null ) ) {
		doclap_smoke_fail( $doclap_name . ' does not declare supports.reusable false' );
	}
}

// The header stores a WordPress menu source (menu id and depth) and a brand
// source (text or a media-library logo), never a mirrored menu tree or a logo URL
// detached from its attachment.
$doclap_header_attributes = (array) ( $doclap_manifests['doclap/site-header']['attributes'] ?? array() );
$doclap_header_contract   = array(
	'menuId'        => array( 'number', 0 ),
	'menuDepth'     => array( 'number', 4 ),
	'brandMode'     => array( 'string', 'text' ),
	'brandMediaId'  => array( 'number', 0 ),
	'brandMediaUrl' => array( 'string', '' ),
	'brandMediaAlt' => array( 'string', '' ),
);

foreach ( $doclap_header_contract as $doclap_key => $doclap_expected ) {
	$doclap_attribute = $doclap_header_attributes[ $doclap_key ] ?? null;

	if (
		! is_array( $doclap_attribute )
		|| $doclap_expected[0] !== ( $doclap_attribute['type'] ?? null )
		|| $doclap_expected[1] !== ( $doclap_attribute['default'] ?? null )
	) {
		doclap_smoke_fail(
			'the site header does not declare '
			. $doclap_key . ' as ' . (string) $doclap_expected[0]
			. ' with the default ' . wp_json_encode( $doclap_expected[1] ),
		);
	}
}

foreach ( array( 'navItems', 'quickLinks', 'closePanelLabel' ) as $doclap_key ) {
	if ( array_key_exists( $doclap_key, $doclap_header_attributes ) ) {
		doclap_smoke_fail( 'the site header still declares the removed attribute ' . $doclap_key );
	}
}

// The work block shows the owner's own media, not the retired canvas studies:
// every default project carries its media source and no canvas selector survives.
$doclap_work_defaults = (array) ( $doclap_manifests['doclap/home-work']['attributes']['projects']['default'] ?? array() );

if ( array() === $doclap_work_defaults ) {
	doclap_smoke_fail( 'the home work block declares no default project' );
}

foreach ( $doclap_work_defaults as $doclap_project ) {
	if ( ! is_array( $doclap_project ) ) {
		doclap_smoke_fail( 'a default home work project is not an array' );
		continue;
	}

	foreach ( array( 'mediaType', 'mediaId', 'mediaUrl', 'mediaAlt' ) as $doclap_key ) {
		if ( ! array_key_exists( $doclap_key, $doclap_project ) ) {
			doclap_smoke_fail( 'a default home work project declares no ' . $doclap_key );
		}
	}

	if ( ! in_array( $doclap_project['mediaType'] ?? '', array( 'image', 'video' ), true ) ) {
		doclap_smoke_fail( 'a default home work project declares an unknown media type' );
	}
}

if ( str_contains( (string) file_get_contents( DOCLAP_DIR . '/blocks/home-work/block.json' ), '"canvas"' ) ) {
	doclap_smoke_fail( 'the home work manifest still declares a canvas attribute' );
}

// Delivery configuration has exactly one home: the doclap_contact_settings option.
$doclap_option_sources = array_merge(
	(array) glob( DOCLAP_DIR . '/inc/*.php' ),
	(array) glob( DOCLAP_DIR . '/inc/*/*.php' ),
	(array) glob( DOCLAP_DIR . '/inc/*/*/*.php' ),
	(array) glob( DOCLAP_DIR . '/blocks/*/*.php' ),
	(array) glob( DOCLAP_DIR . '/functions.php' ),
);
$doclap_option_found   = false;

foreach ( $doclap_option_sources as $doclap_source ) {
	if ( str_contains( (string) file_get_contents( $doclap_source ), 'doclap_contact_settings' ) ) {
		$doclap_option_found = true;
		break;
	}
}

if ( ! $doclap_option_found ) {
	doclap_smoke_fail( 'no theme PHP file reads the doclap_contact_settings option' );
}

doclap_smoke_pass( 'contact-settings' );

doclap_smoke_pass( 'block-metadata ' . count( $doclap_manifests ) . ' js-assets=' . $doclap_js_assets );

// 8. Rendered sections.
/**
 * Render one block comment through the front-end pipeline.
 *
 * @param string $comment Block comment.
 *
 * @return string Rendered markup.
 */
function doclap_smoke_render( string $comment ): string {
	return (string) do_blocks( $comment );
}

/**
 * Assert the single root section a section block must render.
 *
 * @param string   $label   Case label.
 * @param string   $html    Rendered markup.
 * @param string[] $classes Class names the root must carry.
 */
function doclap_smoke_render_root( string $label, string $html, array $classes ): void {
	if ( 1 !== substr_count( $html, '<section' ) ) {
		doclap_smoke_fail( $label . ' rendered ' . substr_count( $html, '<section' ) . ' sections instead of one' );
	}

	if ( ! preg_match( '#<section\s[^>]*class="([^"]*)"#', $html, $matches ) ) {
		doclap_smoke_fail( $label . ' rendered no section with a class attribute' );
	}

	foreach ( $classes as $doclap_class ) {
		if ( ! preg_match( '#(?:^|\s)' . preg_quote( $doclap_class, '#' ) . '(?:\s|$)#', $matches[1] ) ) {
			doclap_smoke_fail( $label . ' root section is missing the ' . $doclap_class . ' class' );
		}
	}

	foreach ( array( 'doclap-about-profile', 'doclap-single-note' ) as $doclap_removed ) {
		if ( str_contains( $html, $doclap_removed ) ) {
			doclap_smoke_fail( $label . ' rendered the removed aggregate ' . $doclap_removed );
		}
	}
}

/**
 * Assert a rendered fragment is present.
 *
 * @param string $label  Case label.
 * @param string $html   Rendered markup.
 * @param string $needle Expected fragment.
 */
function doclap_smoke_render_has( string $label, string $html, string $needle ): void {
	if ( ! str_contains( $html, $needle ) ) {
		doclap_smoke_fail( $label . ' did not render: ' . $needle );
	}
}

/**
 * Assert a fragment is absent from rendered markup.
 *
 * @param string $label  Case label.
 * @param string $html   Rendered markup.
 * @param string $needle Fragment that must not appear.
 */
function doclap_smoke_render_lacks( string $label, string $html, string $needle ): void {
	if ( str_contains( $html, $needle ) ) {
		doclap_smoke_fail( $label . ' rendered an unexpected: ' . $needle );
	}
}

$doclap_renders = array();

// The hero: defaults render, rich values are escaped, scripts cannot survive.
$doclap_html = doclap_smoke_render( '<!-- wp:doclap/inner-hero /-->' );

doclap_smoke_render_root( 'inner-hero defaults', $doclap_html, array( 'doclap-scope', 'doclap-inner-hero', 'section', 'inner-hero' ) );
doclap_smoke_render_has( 'inner-hero defaults', $doclap_html, '<nav class="breadcrumb"' );
doclap_smoke_render_has( 'inner-hero defaults', $doclap_html, 'href="' . esc_url( home_url( '/' ) ) . '"' );
doclap_smoke_render_has( 'inner-hero defaults', $doclap_html, 'data-doclap-rich="heading"' );
doclap_smoke_render_has( 'inner-hero defaults', $doclap_html, '<span class="hero-mark" aria-hidden="true">✳</span>' );
doclap_smoke_render_has( 'inner-hero defaults', $doclap_html, '>Page</span>' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/inner-hero {"heading":"A \\u0026 B \\u003cem\\u003ex\\u003c/em\\u003e","breadcrumbLabel":"A \\u0026 B","lead":"\\u003cscript\\u003ealert(1)\\u003c/script\\u003eSafe"} /-->' );

doclap_smoke_render_has( 'inner-hero rich values', $doclap_html, 'A &amp; B <em>x</em>' );
doclap_smoke_render_has( 'inner-hero rich values', $doclap_html, '>A &amp; B</span>' );
// `wp_kses_post()` drops the disallowed `<script>` element and leaves its text
// as inert, escaped output: the tag is gone, the characters cannot execute.
doclap_smoke_render_lacks( 'inner-hero rich values', $doclap_html, '<script' );
doclap_smoke_render_has( 'inner-hero rich values', $doclap_html, 'alert(1)' );
doclap_smoke_render_has( 'inner-hero rich values', $doclap_html, 'Safe' );
$doclap_renders[] = $doclap_html;

// The closing invitation: the rich heading keeps its emphasis, the link is
// resolved against the site and an unescaped scheme cannot survive.
$doclap_html = doclap_smoke_render( '<!-- wp:doclap/closing-cta /-->' );

doclap_smoke_render_root( 'closing-cta defaults', $doclap_html, array( 'doclap-scope', 'doclap-closing-cta', 'section', 'closing' ) );
doclap_smoke_render_has( 'closing-cta defaults', $doclap_html, 'EVERYTHING STARTS WITH A QUESTION' );
doclap_smoke_render_has( 'closing-cta defaults', $doclap_html, '<em>Make it different.</em>' );
doclap_smoke_render_has( 'closing-cta defaults', $doclap_html, 'href="' . esc_url( home_url( '/contact/' ) ) . '"' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/closing-cta {"ctaUrl":"javascript:alert(1)","heading":"Plain heading","headingAccent":"one \\u0026 two"} /-->' );

doclap_smoke_render_lacks( 'closing-cta escaping', $doclap_html, 'javascript:' );
doclap_smoke_render_has( 'closing-cta escaping', $doclap_html, 'Plain heading<br><em>one &amp; two</em>' );
$doclap_renders[] = $doclap_html;

// The narrative section: optional status and link markup is omitted, never
// rendered empty.
$doclap_html = doclap_smoke_render( '<!-- wp:doclap/split-narrative /-->' );

doclap_smoke_render_root( 'split-narrative defaults', $doclap_html, array( 'doclap-scope', 'doclap-split-narrative', 'section' ) );
doclap_smoke_render_has( 'split-narrative defaults', $doclap_html, 'class="container grid-1-2 body-grid"' );
doclap_smoke_render_has( 'split-narrative defaults', $doclap_html, 'class="aside-title"' );
doclap_smoke_render_has( 'split-narrative defaults', $doclap_html, 'class="prose"' );
doclap_smoke_render_has( 'split-narrative defaults', $doclap_html, 'Cared for.<br>No compromise.' );
doclap_smoke_render_lacks( 'split-narrative defaults', $doclap_html, 'class="text-link"' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/split-narrative {"paragraphs":[],"statusNote":"","linkLabel":"","linkUrl":""} /-->' );

doclap_smoke_render_lacks( 'split-narrative empty optionals', $doclap_html, 'class="text-link"' );
doclap_smoke_render_lacks( 'split-narrative empty optionals', $doclap_html, '<p>' );
doclap_smoke_render_has( 'split-narrative empty optionals', $doclap_html, 'class="prose"' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/split-narrative {"statusNote":"A \\u0026 B status","linkLabel":"Read \\u003cem\\u003emore\\u003c/em\\u003e","linkUrl":"/faq/"} /-->' );

doclap_smoke_render_has( 'split-narrative optionals', $doclap_html, 'A &amp; B status' );
doclap_smoke_render_has( 'split-narrative optionals', $doclap_html, 'href="' . esc_url( home_url( '/faq/' ) ) . '"' );
doclap_smoke_render_has( 'split-narrative optionals', $doclap_html, 'Read <em>more</em>' );
$doclap_renders[] = $doclap_html;

// The media section: the bundled artwork is the only fallback, and a blank
// caption renders no figcaption.
$doclap_html = doclap_smoke_render( '<!-- wp:doclap/media-figure /-->' );

doclap_smoke_render_root( 'media-figure defaults', $doclap_html, array( 'doclap-scope', 'doclap-media-figure', 'section' ) );
doclap_smoke_render_has( 'media-figure defaults', $doclap_html, 'class="studio-figure"' );
doclap_smoke_render_has( 'media-figure defaults', $doclap_html, '/assets/images/studio-workspace.jpg' );
doclap_smoke_render_has( 'media-figure defaults', $doclap_html, 'loading="lazy"' );
doclap_smoke_render_lacks( 'media-figure defaults', $doclap_html, '<figcaption>' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/media-figure {"imageId":999999,"imageAlt":"A \\u0026 B","caption":"Caption \\u0026 more"} /-->' );

doclap_smoke_render_has( 'media-figure caption', $doclap_html, '<figcaption>Caption &amp; more</figcaption>' );
doclap_smoke_render_has( 'media-figure caption', $doclap_html, 'alt="A &amp; B"' );
doclap_smoke_render_has( 'media-figure caption', $doclap_html, '/assets/images/studio-workspace.jpg' );
$doclap_renders[] = $doclap_html;

// The principles panel: the three default cards render, and an empty list is a
// valid configuration with no fabricated card.
$doclap_html = doclap_smoke_render( '<!-- wp:doclap/principles-grid /-->' );

doclap_smoke_render_root( 'principles-grid defaults', $doclap_html, array( 'doclap-scope', 'doclap-principles-grid', 'section', 'dark-panel' ) );
doclap_smoke_render_has( 'principles-grid defaults', $doclap_html, '02 / WHAT DOES NOT CHANGE' );
doclap_smoke_render_has( 'principles-grid defaults', $doclap_html, 'Just enough motion.' );

if ( 3 !== substr_count( $doclap_html, 'class="feature card-flat"' ) ) {
	doclap_smoke_fail( 'the principles grid does not render its three default cards' );
}

$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/principles-grid {"principles":[]} /-->' );

doclap_smoke_render_lacks( 'principles-grid empty', $doclap_html, 'class="feature card-flat"' );
doclap_smoke_render_has( 'principles-grid empty', $doclap_html, 'class="grid-3"' );
doclap_smoke_render_has( 'principles-grid empty', $doclap_html, 'Beautiful. And justified.' );
$doclap_renders[] = $doclap_html;

// The narrowed blocks: the shared hero and closing markup is gone while every
// delivery, filter and query contract they still own is intact.
$doclap_html = doclap_smoke_render( '<!-- wp:doclap/contact-form /-->' );

doclap_smoke_render_root( 'contact-form narrowed', $doclap_html, array( 'doclap-scope', 'doclap-contact-form', 'section' ) );
doclap_smoke_render_lacks( 'contact-form narrowed', $doclap_html, 'class="breadcrumb"' );
doclap_smoke_render_lacks( 'contact-form narrowed', $doclap_html, 'class="hero-summary"' );
doclap_smoke_render_has( 'contact-form narrowed', $doclap_html, 'class="container grid-2 contact-grid"' );
doclap_smoke_render_has( 'contact-form narrowed', $doclap_html, 'data-doclap-contact-form="1"' );
doclap_smoke_render_has( 'contact-form narrowed', $doclap_html, 'data-rest-url="' . esc_url( rest_url( 'doclap/v1/contact' ) ) . '"' );
doclap_smoke_render_has( 'contact-form narrowed', $doclap_html, 'doclap-honeypot' );
doclap_smoke_render_has( 'contact-form narrowed', $doclap_html, 'name="services[]"' );
doclap_smoke_render_has( 'contact-form narrowed', $doclap_html, 'role="status" aria-live="polite"' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/faq-list /-->' );

doclap_smoke_render_root( 'faq-list narrowed', $doclap_html, array( 'doclap-scope', 'doclap-faq-list', 'section' ) );
doclap_smoke_render_lacks( 'faq-list narrowed', $doclap_html, 'class="breadcrumb"' );
doclap_smoke_render_lacks( 'faq-list narrowed', $doclap_html, 'class="circle-cta"' );
doclap_smoke_render_has( 'faq-list narrowed', $doclap_html, 'data-faq-count' );
doclap_smoke_render_has( 'faq-list narrowed', $doclap_html, 'data-faq-empty hidden' );
doclap_smoke_render_has( 'faq-list narrowed', $doclap_html, 'class="filter-bar"' );
doclap_smoke_render_has( 'faq-list narrowed', $doclap_html, 'aria-pressed="true"' );

if ( 10 !== substr_count( $doclap_html, '<details' ) ) {
	doclap_smoke_fail( 'the FAQ list does not render its ten default questions' );
}

$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/notes-archive /-->' );

doclap_smoke_render_root( 'notes-archive narrowed', $doclap_html, array( 'doclap-scope', 'doclap-notes-archive', 'section' ) );
doclap_smoke_render_lacks( 'notes-archive narrowed', $doclap_html, 'class="breadcrumb"' );
doclap_smoke_render_lacks( 'notes-archive narrowed', $doclap_html, 'class="circle-cta"' );
doclap_smoke_render_has( 'notes-archive narrowed', $doclap_html, 'class="container"' );
doclap_smoke_render_has( 'notes-archive narrowed', $doclap_html, 'class="section-head"' );
doclap_smoke_render_has( 'notes-archive narrowed', $doclap_html, 'data-doclap-rich="disclaimer"' );

if (
	! str_contains( $doclap_html, 'class="featured-post"' )
	&& ! str_contains( $doclap_html, 'class="archive-rows"' )
	&& ! str_contains( $doclap_html, 'class="empty-state"' )
) {
	doclap_smoke_fail( 'the narrowed notes archive rendered neither a featured note, rows, nor the empty state' );
}

$doclap_renders[] = $doclap_html;

// The note blocks resolve the queried post. With no post in context they render
// the deterministic fallback copy and never query or recurse into a host post.
$doclap_html = doclap_smoke_render( '<!-- wp:doclap/note-hero /-->' );

doclap_smoke_render_root( 'note-hero fallback', $doclap_html, array( 'doclap-scope', 'doclap-note-hero', 'section', 'inner-hero', 'article-hero' ) );
doclap_smoke_render_has( 'note-hero fallback', $doclap_html, 'data-doclap-progress' );
doclap_smoke_render_has( 'note-hero fallback', $doclap_html, '>Editorial note</h1>' );
doclap_smoke_render_has( 'note-hero fallback', $doclap_html, 'A perspective from the độc lập design practice.' );
doclap_smoke_render_has( 'note-hero fallback', $doclap_html, 'aria-current="page">Article</span>' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/note-cover /-->' );

doclap_smoke_render_root( 'note-cover fallback', $doclap_html, array( 'doclap-scope', 'doclap-note-cover', 'section' ) );
doclap_smoke_render_has( 'note-cover fallback', $doclap_html, 'class="article-meta"' );
doclap_smoke_render_has( 'note-cover fallback', $doclap_html, 'ĐỘC LẬP / EDITORIAL NOTES' );
doclap_smoke_render_has( 'note-cover fallback', $doclap_html, 'Uncategorized' );
doclap_smoke_render_has( 'note-cover fallback', $doclap_html, 'class="artwork motion-art"' );
doclap_smoke_render_has( 'note-cover fallback', $doclap_html, 'class="art-word">Slow.</span>' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/note-content /-->' );

doclap_smoke_render_root( 'note-content fallback', $doclap_html, array( 'doclap-scope', 'doclap-note-content', 'section' ) );
doclap_smoke_render_has( 'note-content fallback', $doclap_html, 'class="container grid-1-2 article-layout"' );
doclap_smoke_render_has( 'note-content fallback', $doclap_html, 'This note has no published content yet.' );
doclap_smoke_render_has( 'note-content fallback', $doclap_html, 'data-doclap-save' );
doclap_smoke_render_has( 'note-content fallback', $doclap_html, 'data-doclap-copy' );
doclap_smoke_render_has( 'note-content fallback', $doclap_html, 'data-doclap-article-status' );
doclap_smoke_render_has( 'note-content fallback', $doclap_html, 'data-doclap-rich="disclaimer"' );
doclap_smoke_render_has( 'note-content fallback', $doclap_html, 'Back to all notes' );
// The default is to hide a table of contents without headings.
doclap_smoke_render_lacks( 'note-content fallback', $doclap_html, 'IN THIS ARTICLE' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/note-content {"tocEmptyBehaviour":"message"} /-->' );

doclap_smoke_render_has( 'note-content empty table of contents', $doclap_html, 'IN THIS ARTICLE' );
doclap_smoke_render_has( 'note-content empty table of contents', $doclap_html, 'No sections are listed for this article.' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/related-notes /-->' );

doclap_smoke_render_root( 'related-notes fallback', $doclap_html, array( 'doclap-scope', 'doclap-related-notes', 'section' ) );
doclap_smoke_render_has( 'related-notes fallback', $doclap_html, 'Read another perspective.' );
doclap_smoke_render_has( 'related-notes fallback', $doclap_html, 'More perspectives will be published here soon.' );
$doclap_renders[] = $doclap_html;

// Section colours: an unset colour emits nothing, a set one publishes the custom
// property the stylesheet reads. Core trims the trailing semicolon from the style
// attribute, so the assertion stops at the last value.
$doclap_html = doclap_smoke_render( '<!-- wp:doclap/principles-grid /-->' );

doclap_smoke_render_lacks( 'principles-grid default colours', $doclap_html, '--doclap-block-' );
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/principles-grid {"sectionBg":"#101010","sectionHeading":"var(--wp--preset--color--base)","sectionText":"#eeeeee"} /-->' );

doclap_smoke_render_root( 'principles-grid colours', $doclap_html, array( 'doclap-scope', 'doclap-principles-grid', 'section', 'dark-panel' ) );
doclap_smoke_render_has(
	'principles-grid colours',
	$doclap_html,
	'--doclap-block-bg:#101010;--doclap-block-heading:var(--wp--preset--color--base);--doclap-block-text:#eeeeee',
);
$doclap_renders[] = $doclap_html;

$doclap_html = doclap_smoke_render( '<!-- wp:doclap/inner-hero {"sectionBg":"#ffffff","sectionHeading":"#111111","sectionText":"#444444"} /-->' );

doclap_smoke_render_has(
	'inner-hero colours',
	$doclap_html,
	'--doclap-block-bg:#ffffff;--doclap-block-heading:#111111;--doclap-block-text:#444444',
);
$doclap_renders[] = $doclap_html;

// A block that renders one of the split sections can never re-enter itself
// through the host post's own content.
foreach ( $doclap_renders as $doclap_index => $doclap_rendered ) {
	if ( str_contains( $doclap_rendered, 'wp:doclap/' ) ) {
		doclap_smoke_fail( 'render case ' . $doclap_index . ' echoed unparsed block markup' );
	}
}

doclap_smoke_pass( 'renders ' . count( $doclap_renders ) . ' cases' );
