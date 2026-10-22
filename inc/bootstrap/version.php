<?php

/**
 * Single source of truth for the Doclap theme version.
 *
 * Read by phpstan-bootstrap.php, tests/bootstrap.php, scripts/build-package.mjs
 * and functions.php. Keep the style.css header in sync when releasing.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'DOCLAP_VERSION' ) ) {
	define( 'DOCLAP_VERSION', '1.1.0' );
}
