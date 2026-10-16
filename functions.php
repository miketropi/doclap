<?php

/**
 * Doclap child theme bootstrap.
 *
 * WordPress loads a child theme's functions.php before the parent's, so nothing
 * at file scope here may read a NEXTORA_* constant or call a parent function.
 * Parent assets are referenced by their registered handle names inside hooks.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/inc/bootstrap/version.php';

if ( ! defined( 'DOCLAP_DIR' ) ) {
	define( 'DOCLAP_DIR', get_stylesheet_directory() );
}

if ( ! defined( 'DOCLAP_URI' ) ) {
	define( 'DOCLAP_URI', get_stylesheet_directory_uri() );
}

$doclap_autoloader = DOCLAP_DIR . '/vendor/autoload.php';
if ( is_readable( $doclap_autoloader ) ) {
	require_once $doclap_autoloader;
}

require_once DOCLAP_DIR . '/inc/assets/enqueue.php';
require_once DOCLAP_DIR . '/inc/blocks/helpers.php';
require_once DOCLAP_DIR . '/inc/blocks/query.php';
require_once DOCLAP_DIR . '/inc/features/contact-form/load.php';
require_once DOCLAP_DIR . '/blocks/blocks.php';
