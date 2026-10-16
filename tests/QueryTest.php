<?php

/**
 * Archive and search query assembly.
 *
 * These are the rules the two query-driven blocks rely on: notes archives never
 * repeat the featured note, and a Doclap search only reaches outside pages and
 * notes when the site actually registers the `work` post type.
 *
 * @package Doclap
 */

declare( strict_types=1 );

namespace Doclap\Tests;

use PHPUnit\Framework\TestCase;

/**
 * Query arguments and search type resolution.
 */
final class QueryTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		doclap_test_reset();
	}

	public function test_archive_defaults_query_published_notes_without_exclusions(): void {
		$args = \doclap_notes_archive_query_args( array(), 1 );

		self::assertSame( 'post', $args['post_type'] );
		self::assertSame( 'publish', $args['post_status'] );
		self::assertSame( 6, $args['posts_per_page'] );
		self::assertSame( 1, $args['paged'] );
		self::assertFalse( $args['ignore_sticky_posts'] );
		self::assertArrayNotHasKey( 'post__not_in', $args );
	}

	public function test_archive_excludes_the_featured_note(): void {
		$args = \doclap_notes_archive_query_args( array(), 1, 42 );

		self::assertSame( array( 42 ), $args['post__not_in'] );
	}

	public function test_archive_ignores_a_non_positive_exclusion(): void {
		self::assertArrayNotHasKey( 'post__not_in', \doclap_notes_archive_query_args( array(), 1, 0 ) );
		self::assertArrayNotHasKey( 'post__not_in', \doclap_notes_archive_query_args( array(), 1, -7 ) );
	}

	public function test_archive_clamps_nonsense_paging_and_page_size(): void {
		$args = \doclap_notes_archive_query_args( array( 'postsPerPage' => 0 ), 0 );

		self::assertSame( 1, $args['posts_per_page'] );
		self::assertSame( 1, $args['paged'] );
	}

	public function test_archive_honours_editor_page_size_and_current_page(): void {
		$args = \doclap_notes_archive_query_args( array( 'postsPerPage' => 12 ), 3 );

		self::assertSame( 12, $args['posts_per_page'] );
		self::assertSame( 3, $args['paged'] );
	}

	public function test_search_without_the_work_post_type_only_covers_pages_and_notes(): void {
		$GLOBALS['doclap_test']['post_types'] = array( 'post', 'page' );

		self::assertSame( array( 'page', 'post' ), \doclap_search_available_types() );
		self::assertSame( array(), \doclap_search_post_types( 'work' ) );
		self::assertSame( array( 'page', 'post' ), \doclap_search_query_types( 'work' ) );
	}

	public function test_search_with_the_work_post_type_includes_it(): void {
		$GLOBALS['doclap_test']['post_types'] = array( 'post', 'page', 'work' );

		self::assertSame( array( 'page', 'post', 'work' ), \doclap_search_available_types() );
		self::assertSame( array( 'work' ), \doclap_search_post_types( 'work' ) );
		self::assertSame( array( 'page', 'post', 'work' ), \doclap_search_query_types( '' ) );
	}

	public function test_search_type_filter_is_a_single_type_when_supported(): void {
		$GLOBALS['doclap_test']['post_types'] = array( 'post', 'page', 'work' );

		self::assertSame( array( 'page' ), \doclap_search_post_types( 'page' ) );
		self::assertSame( array( 'post' ), \doclap_search_post_types( 'post' ) );
		self::assertSame( array( 'page' ), \doclap_search_query_types( 'page' ) );
	}

	public function test_search_ignores_an_unknown_filter(): void {
		self::assertSame( array(), \doclap_search_post_types( 'attachment' ) );
		self::assertSame( array( 'page', 'post' ), \doclap_search_query_types( 'attachment' ) );
	}
}
