<?php

/**
 * Block registration and inserter category behaviour.
 *
 * @package Doclap
 */

declare( strict_types=1 );

namespace Doclap\Tests;

use PHPUnit\Framework\TestCase;

/**
 * The child registrar must only reach its own blocks and only real manifests.
 */
final class BlockRegistrationTest extends TestCase {

	private string $fixture = '';

	protected function setUp(): void {
		parent::setUp();
		doclap_test_reset();

		$this->fixture = sys_get_temp_dir() . '/doclap-blocks-' . uniqid();
		mkdir( $this->fixture . '/blocks/alpha', 0777, true );
		mkdir( $this->fixture . '/blocks/beta', 0777, true );
		mkdir( $this->fixture . '/blocks/gamma', 0777, true );

		file_put_contents( $this->fixture . '/blocks/alpha/block.json', '{"name":"doclap/alpha"}' );
		file_put_contents(
			$this->fixture . '/blocks/alpha/register-editor.php',
			'<?php $GLOBALS["doclap_test"]["editor_registrars"][] = "alpha";',
		);
		// beta has no manifest: it must be skipped rather than registered blindly.
		file_put_contents( $this->fixture . '/blocks/gamma/block.json', '{"name":"doclap/gamma"}' );

		$GLOBALS['doclap_test']['stylesheet_dir'] = $this->fixture;
	}

	protected function tearDown(): void {
		foreach ( array( 'alpha', 'beta', 'gamma' ) as $slug ) {
			$file = $this->fixture . "/blocks/{$slug}/block.json";

			if ( is_file( $file ) ) {
				unlink( $file );
			}

			$editor = $this->fixture . "/blocks/{$slug}/register-editor.php";

			if ( is_file( $editor ) ) {
				unlink( $editor );
			}

			rmdir( $this->fixture . "/blocks/{$slug}" );
		}

		rmdir( $this->fixture . '/blocks' );
		rmdir( $this->fixture );

		parent::tearDown();
	}

	public function test_child_blocks_are_registered_from_the_stylesheet_directory(): void {
		\doclap_register_blocks();

		$registered = array_map(
			static fn( string $path ): string => basename( $path ),
			$GLOBALS['doclap_test']['blocks'],
		);

		self::assertSame( array( 'alpha', 'gamma' ), $registered );
		self::assertContains( 'alpha', $GLOBALS['doclap_test']['editor_registrars'] );
	}

	public function test_register_editor_hook_is_not_required_twice(): void {
		\doclap_register_blocks();
		\doclap_register_blocks();

		self::assertCount( 1, $GLOBALS['doclap_test']['editor_registrars'] );
	}

	public function test_category_is_added_once_and_keeps_existing_categories(): void {
		$existing = array(
			array(
				'slug'  => 'nextora',
				'title' => 'Nextora Blocks',
			),
		);

		$first = \doclap_register_block_categories( $existing );
		$again = \doclap_register_block_categories( $first );

		self::assertSame( 'doclap', $first[0]['slug'] );
		self::assertCount( 2, $first );
		self::assertCount( 2, $again );
		self::assertSame( $first, $again );
	}

	public function test_category_is_forced_only_for_doclap_blocks(): void {
		$doclap = \doclap_filter_block_type_args( array( 'category' => 'widgets' ), 'doclap/site-header' );
		$parent = \doclap_filter_block_type_args( array( 'category' => 'widgets' ), 'nextora/header' );

		self::assertSame( 'doclap', $doclap['category'] );
		self::assertSame( 'widgets', $parent['category'] );
	}
}
