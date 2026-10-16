<?php

/**
 * PHPUnit bootstrap.
 *
 * Doclap's units are deliberately WordPress-light: the logic the suite exercises
 * (block registration, query-argument assembly, contact submission sanitising and
 * reading-time estimation) only reads a small, explicit set of WordPress
 * functions. Those are doubled in tests/Support/wp-stubs.php instead of booting a
 * full WordPress test suite, so `composer test` stays fast and dependency-free.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', '/tmp/wordpress/' );
}

require dirname( __DIR__ ) . '/inc/bootstrap/version.php';
require dirname( __DIR__ ) . '/vendor/autoload.php';
require __DIR__ . '/Support/wp-stubs.php';

if ( ! defined( 'DOCLAP_DIR' ) ) {
	define( 'DOCLAP_DIR', dirname( __DIR__ ) );
}

if ( ! defined( 'DOCLAP_URI' ) ) {
	define( 'DOCLAP_URI', 'https://example.test/wp-content/themes/doclap' );
}

require dirname( __DIR__ ) . '/inc/blocks/helpers.php';
require dirname( __DIR__ ) . '/inc/blocks/query.php';
require dirname( __DIR__ ) . '/inc/features/contact-form/handle-submission.php';
require dirname( __DIR__ ) . '/blocks/blocks.php';
