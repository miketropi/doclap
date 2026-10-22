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
 * Normalise a stored list of term ids.
 *
 * Block attributes come from saved post content, so a value can be a scalar, a list
 * of numeric strings, or carry duplicates and zeros. Only positive integers survive,
 * in the order they were saved, because `category__in` / `tag__in` treat a zero as a
 * real term id and would otherwise silently filter everything out.
 *
 * @param mixed $value Raw attribute value.
 *
 * @return array<int, int> Unique positive term ids.
 */
function doclap_query_term_ids( mixed $value ): array {
	$candidates = is_array( $value ) ? $value : array( $value );
	$ids        = array();

	foreach ( $candidates as $candidate ) {
		if ( ! is_scalar( $candidate ) ) {
			continue;
		}

		$id = (int) $candidate;

		if ( $id > 0 ) {
			$ids[] = $id;
		}
	}

	return array_values( array_unique( $ids ) );
}

/**
 * Query args for the journal carousel.
 *
 * A plain latest-posts query. The optional taxonomy filters narrow that list
 * without changing the kind of query it is, so the same helper serves the unfiltered
 * block and an editor-scoped one: an empty filter list adds no clause at all.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param int                  $exclude_id Optional post to leave out of the list.
 *
 * @return array<string, mixed>
 */
function doclap_journal_carousel_query_args( array $attributes, int $exclude_id = 0 ): array {
	// A value that is not a number at all is a hand-edited save, not a page size:
	// it falls back to the attribute default instead of collapsing to one card.
	$posts_per_page = $attributes['postsPerPage'] ?? 3;

	if ( ! is_numeric( $posts_per_page ) ) {
		$posts_per_page = 3;
	}

	$args = array(
		'post_type'              => 'post',
		'post_status'            => 'publish',
		'posts_per_page'         => max( 1, min( 24, (int) $posts_per_page ) ),
		'ignore_sticky_posts'    => false,
		'no_found_rows'          => true,
		'update_post_meta_cache' => false,
		'update_post_term_cache' => true,
	);

	if ( $exclude_id > 0 ) {
		$args['post__not_in'] = array( $exclude_id );
	}

	/*
	 * Category and tag filters are additive: each list narrows the same
	 * latest-posts query, and a list with no usable id adds no clause, so an
	 * unfiltered block keeps exactly the arguments it had before the filters
	 * existed. Within one list WordPress ORs the terms; across the two taxonomies it
	 * ANDs them, which is what an editor expects from “in these categories AND
	 * carrying these tags”.
	 */
	$categories = doclap_query_term_ids( $attributes['categories'] ?? array() );
	$tags       = doclap_query_term_ids( $attributes['tags'] ?? array() );

	if ( array() !== $categories ) {
		$args['category__in'] = $categories;
	}

	if ( array() !== $tags ) {
		$args['tag__in'] = $tags;
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
