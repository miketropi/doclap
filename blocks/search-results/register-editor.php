<?php

/**
 * Search-query integration for the Search Results block.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Apply the shareable Doclap type filter to WordPress's main search query.
 *
 * @param WP_Query $query Query being prepared.
 */
function doclap_search_results_filter_main_query( WP_Query $query ): void {
	if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() ) {
		return;
	}

	$requested_type = isset( $_GET['doclap_type'] ) ? sanitize_key( wp_unslash( $_GET['doclap_type'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- public search filter.
	$allowed_types  = array( 'page', 'post' );

	if ( post_type_exists( 'work' ) ) {
		$allowed_types[] = 'work';
	}

	if ( in_array( $requested_type, $allowed_types, true ) ) {
		$query->set( 'post_type', $requested_type );
	}
}
add_action( 'pre_get_posts', 'doclap_search_results_filter_main_query' );
