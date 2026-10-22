<?php

/**
 * Child asset pipeline.
 *
 * The compiled stylesheet and script are enqueued after the parent's
 * `nextora-app` (style, priority 10) and `nextora-main` (script, priority 20)
 * so both cascade and runtime order stay predictable.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolve the cache-busting version for a build artefact.
 *
 * @param string $relative_path Path relative to the child theme root.
 *
 * @return string Version string: file mtime, otherwise DOCLAP_VERSION.
 */
function doclap_asset_version( string $relative_path ): string {
	$path = DOCLAP_DIR . $relative_path;

	if ( is_readable( $path ) ) {
		$mtime = filemtime( $path );

		if ( false !== $mtime ) {
			return (string) $mtime;
		}
	}

	return DOCLAP_VERSION;
}

/**
 * Enqueue the compiled child stylesheet on the front end.
 *
 * Deliberately not registered on `enqueue_block_assets`: that hook also runs in
 * wp-admin, where this sheet's reset — a bare `body { font-family: … }`, plus the
 * page background and text colour — wins over WordPress's own admin typography and
 * repaints the whole editor chrome. The block editor canvas still receives the same
 * file through `add_editor_style()`, which loads inside the editor iframe where the
 * reset belongs.
 */
function doclap_enqueue_styles(): void {
	$relative_path = '/assets/css/app.css';

	if ( ! is_readable( DOCLAP_DIR . $relative_path ) ) {
		return;
	}

	$deps = array();

	if ( wp_style_is( 'global-styles', 'registered' ) ) {
		$deps[] = 'global-styles';
	}

	if ( wp_style_is( 'nextora-app', 'registered' ) || wp_style_is( 'nextora-app', 'enqueued' ) ) {
		$deps[] = 'nextora-app';
	}

	wp_enqueue_style(
		'doclap-app',
		DOCLAP_URI . $relative_path,
		$deps,
		doclap_asset_version( $relative_path ),
	);
}
add_action( 'wp_enqueue_scripts', 'doclap_enqueue_styles', 25 );

/**
 * Enqueue the compiled child script after the parent script.
 */
function doclap_enqueue_scripts(): void {
	$relative_path = '/assets/js/main.js';

	if ( ! is_readable( DOCLAP_DIR . $relative_path ) ) {
		return;
	}

	$deps = array();

	if ( wp_script_is( 'nextora-main', 'registered' ) || wp_script_is( 'nextora-main', 'enqueued' ) ) {
		$deps[] = 'nextora-main';
	}

	wp_enqueue_script(
		'doclap-main',
		DOCLAP_URI . $relative_path,
		$deps,
		doclap_asset_version( $relative_path ),
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		),
	);
}
add_action( 'wp_enqueue_scripts', 'doclap_enqueue_scripts', 30 );

/**
 * Give the block editor the same compiled stylesheet as the front end.
 */
add_action(
	'after_setup_theme',
	static function (): void {
		if ( is_readable( DOCLAP_DIR . '/assets/css/app.css' ) ) {
			add_editor_style( 'assets/css/app.css' );
		}
	},
	15,
);
