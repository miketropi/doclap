<?php

/**
 * Reading-time boundaries for the shared estimator.
 *
 * @package Doclap
 */

declare( strict_types=1 );

namespace Doclap\Tests;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * `doclap_reading_time()` must never report less than a minute and must round up.
 */
final class ReadingTimeTest extends TestCase {

	/**
	 * @return array<string, array{0: string, 1: int}>
	 */
	public static function contents(): array {
		$words_220 = implode( ' ', array_fill( 0, 220, 'word' ) );
		$words_221 = implode( ' ', array_fill( 0, 221, 'word' ) );
		$words_440 = implode( ' ', array_fill( 0, 440, 'word' ) );
		$words_441 = implode( ' ', array_fill( 0, 441, 'word' ) );

		return array(
			'empty content still takes a minute'  => array( '', 1 ),
			'whitespace only'                     => array( "   \n\t  ", 1 ),
			'exactly one page'                    => array( $words_220, 1 ),
			'one word over one page'              => array( $words_221, 2 ),
			'exactly two pages'                   => array( $words_440, 2 ),
			'one word over two pages'             => array( $words_441, 3 ),
			'html tags are not words'             => array( '<p><strong>one</strong> two</p>', 1 ),
			'nested blocks are not words'         => array( '<!-- wp:paragraph --><p>hello</p><!-- /wp:paragraph -->', 1 ),
		);
	}

	/**
	 * @param string $content  Raw content under test.
	 * @param int    $expected Expected reading time in minutes.
	 */
	#[DataProvider( 'contents' )]
	public function test_reading_time_rounds_up_at_page_boundaries( string $content, int $expected ): void {
		self::assertSame( $expected, \doclap_reading_time( $content ) );
	}

	/**
	 * Long-form content scales linearly with the 220 words-per-minute budget.
	 */
	public function test_reading_time_scales_with_length(): void {
		$words = implode( ' ', array_fill( 0, 2200, 'word' ) );

		self::assertSame( 10, \doclap_reading_time( $words ) );
	}
}
