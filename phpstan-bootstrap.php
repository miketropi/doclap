<?php

/**
 * Constants for PHPStan analysis.
 *
 * Mirrors the constants that functions.php defines at runtime so static analysis
 * can resolve DOCLAP_* references without booting WordPress.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', '/tmp/wordpress/' );
}

require_once __DIR__ . '/inc/bootstrap/version.php';

if ( ! defined( 'DOCLAP_DIR' ) ) {
	define( 'DOCLAP_DIR', __DIR__ );
}

if ( ! defined( 'DOCLAP_URI' ) ) {
	define( 'DOCLAP_URI', 'https://example.test/wp-content/themes/doclap' );
}
