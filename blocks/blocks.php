<?php

/**
 * Register every Doclap block that ships a block.json manifest.
 *
 * The parent registrar scans get_template_directory(), so child blocks are only
 * registered here — from the stylesheet directory.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register all child blocks found in blocks/<slug>/block.json.
 */
function doclap_register_blocks(): void {
	$blocks_dir = get_stylesheet_directory() . '/blocks';

	if ( ! is_dir( $blocks_dir ) ) {
		return;
	}

	$block_dirs = glob( $blocks_dir . '/*', GLOB_ONLYDIR );

	if ( false === $block_dirs ) {
		return;
	}

	foreach ( $block_dirs as $block_dir ) {
		if ( ! is_readable( $block_dir . '/block.json' ) ) {
			continue;
		}

		register_block_type( $block_dir );

		$register_editor = $block_dir . '/register-editor.php';

		if ( is_readable( $register_editor ) ) {
			require_once $register_editor;
		}
	}
}
add_action( 'init', 'doclap_register_blocks' );

/**
 * Add the Doclap block category to the inserter.
 *
 * @param array<int, array<string, string>> $categories Registered block categories.
 *
 * @return array<int, array<string, string>> Filtered categories.
 */
function doclap_register_block_categories( array $categories ): array {
	foreach ( $categories as $category ) {
		if ( isset( $category['slug'] ) && 'doclap' === $category['slug'] ) {
			return $categories;
		}
	}

	array_unshift(
		$categories,
		array(
			'slug'  => 'doclap',
			'title' => __( 'Doclap Blocks', 'doclap' ),
			'icon'  => 'art',
		),
	);

	return $categories;
}
add_filter( 'block_categories_all', 'doclap_register_block_categories' );

/**
 * Force every doclap/* block into the Doclap category regardless of block.json.
 *
 * @param array<string, mixed> $args Block type registration arguments.
 * @param string               $name Block name.
 *
 * @return array<string, mixed> Filtered arguments.
 */
function doclap_filter_block_type_args( array $args, string $name ): array {
	if ( str_starts_with( $name, 'doclap/' ) ) {
		$args['category'] = 'doclap';
	}

	return $args;
}
add_filter( 'register_block_type_args', 'doclap_filter_block_type_args', 10, 2 );

/**
 * Mirror the server-side category in the client-side block registry.
 *
 * The editor validates the category of a registered block against the categories
 * the client knows about; block.json values are applied client-side too, so the
 * same normalisation has to happen in JS.
 */
function doclap_enqueue_block_category_filter(): void {
	$script = <<<'JS'
( function ( hooks ) {
	hooks.addFilter( 'blocks.registerBlockType', 'doclap/category', function ( settings, name ) {
		if ( name && name.indexOf( 'doclap/' ) === 0 ) {
			settings = Object.assign( {}, settings, { category: 'doclap' } );
		}
		return settings;
	} );
} )( window.wp.hooks );
JS;

	wp_add_inline_script( 'wp-blocks', $script, 'after' );
}
add_action( 'enqueue_block_editor_assets', 'doclap_enqueue_block_category_filter', 5 );

/**
 * Enqueue the shared block-editor stylesheet.
 *
 * Each doclap/* block keeps only canvas-preview rules in its own
 * blocks/<slug>/editor.css; the inspector affordances shared by all twenty-five
 * blocks — the repeater list editor, the block preview shell, the image picker
 * and the identifier notice — live in the single compiled
 * assets/css/editor.css. The editor canvas already receives assets/css/app.css
 * through `enqueue_block_assets` and `add_editor_style()`, so this handle only
 * adds the inspector layer.
 */
function doclap_enqueue_editor_styles(): void {
	$relative_path = '/assets/css/editor.css';

	if ( ! is_readable( DOCLAP_DIR . $relative_path ) ) {
		return;
	}

	wp_enqueue_style(
		'doclap-editor-blocks',
		DOCLAP_URI . $relative_path,
		array(),
		doclap_asset_version( $relative_path ),
	);
}
add_action( 'enqueue_block_editor_assets', 'doclap_enqueue_editor_styles' );

/**
 * Give the editor canvas the same shared stylesheet.
 *
 * The block editor renders block markup inside an iframe, and styles enqueued on
 * `enqueue_block_editor_assets` stay in the editor document around it. The shared
 * sheet carries one rule the canvas needs — the preview surface being inert — so
 * it is registered as an editor style too, exactly like assets/css/app.css.
 */
function doclap_add_editor_canvas_styles(): void {
	if ( is_readable( DOCLAP_DIR . '/assets/css/editor.css' ) ) {
		add_editor_style( 'assets/css/editor.css' );
	}
}
add_action( 'after_setup_theme', 'doclap_add_editor_canvas_styles', 20 );

/**
 * Register the pattern category used by the Doclap insertion patterns.
 */
function doclap_register_pattern_categories(): void {
	if ( ! function_exists( 'register_block_pattern_category' ) ) {
		return;
	}

	register_block_pattern_category(
		'doclap',
		array(
			'label'       => __( 'Doclap', 'doclap' ),
			'description' => __( 'Doclap portfolio surfaces.', 'doclap' ),
		),
	);
}
add_action( 'init', 'doclap_register_pattern_categories' );
