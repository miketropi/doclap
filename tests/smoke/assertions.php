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
	'doclap/about-profile',
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
	'doclap/not-found',
	'doclap/notes-archive',
	'doclap/search-results',
	'doclap/single-note',
	'doclap/site-footer',
	'doclap/site-header',
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

doclap_smoke_pass( 'patterns ' . count( $doclap_patterns ) );
