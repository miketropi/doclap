<?php

/**
 * Server-side loader for doclap/site-header.
 *
 * `blocks/blocks.php` requires this file next to the block after it registers the
 * manifest, so the menu walker is loaded only for sites that register the block —
 * no theme-global include and no load on a request that never renders the header.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-doclap-site-header-menu-walker.php';
