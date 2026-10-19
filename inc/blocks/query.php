<?php

/**
 * Query arguments shared by the Doclap archive and search surfaces.
 *
 * Both blocks build `WP_Query` arguments from editor attributes, so the rules
 * live here instead of inside each renderer: pages and notes are always part of a
 * Doclap search, and the optional `work` post type only takes part when the site
 * actually registers it.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build the query arguments for the notes archive block.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param int                  $paged      Current page number.
 * @param int                  $exclude_id Post id to exclude, normally the featured note.
 *
 * @return array<string, mixed> Arguments for `WP_Query`.
 */
function doclap_notes_archive_query_args( array $attributes, int $paged, int $exclude_id = 0 ): array {
	$args = array(
		'post_type'              => 'post',
		'post_status'            => 'publish',
		'posts_per_page'         => max( 1, min( 24, (int) ( $attributes['postsPerPage'] ?? 6 ) ) ),
		'paged'                  => max( 1, $paged ),
		'ignore_sticky_posts'    => false,
		'update_post_meta_cache' => false,
	);

	if ( $exclude_id > 0 ) {
		$args['post__not_in'] = array( $exclude_id );
	}

	return $args;
}

/**
 * Post types a Doclap search may look in.
 *
 * @return array<int, string> Pages and notes, plus `work` when that post type exists.
 */
function doclap_search_available_types(): array {
	$types = array( 'page', 'post' );

	if ( post_type_exists( 'work' ) ) {
		$types[] = 'work';
	}

	return $types;
}

/**
 * Resolve a Doclap search type filter into a post-type restriction.
 *
 * @param string $filter Sanitised filter value, e.g. `page`, `post` or `work`.
 *
 * @return array<int, string> Post types to query; an empty array means “no restriction”.
 */
function doclap_search_post_types( string $filter ): array {
	if ( in_array( $filter, doclap_search_available_types(), true ) ) {
		return array( $filter );
	}

	return array();
}

/**
 * Resolve the post types a Doclap search request should query.
 *
 * @param string $filter Sanitised filter value from the request.
 *
 * @return array<int, string> Post types, never empty.
 */
function doclap_search_query_types( string $filter ): array {
	$types = doclap_search_post_types( $filter );

	return array() === $types ? doclap_search_available_types() : $types;
}
