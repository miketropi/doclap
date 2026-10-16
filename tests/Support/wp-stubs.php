<?php

/**
 * Minimal WordPress doubles for the Doclap unit suite.
 *
 * The suite tests Doclap's own decisions — which blocks get registered, what the
 * query arguments are, how submissions are sanitised, how reading time is
 * computed — so it only needs the handful of WordPress functions those decisions
 * touch. Everything here is a test double: it records calls and returns values the
 * test controls. No WordPress core file is loaded.
 *
 * @package Doclap
 */

declare( strict_types=1 );

$GLOBALS['doclap_test'] = array(
	'actions'            => array(),
	'filters'            => array(),
	'blocks'             => array(),
	'inline_scripts'     => array(),
	'pattern_categories' => array(),
	'editor_registrars'  => array(),
	'post_types'         => array( 'post', 'page' ),
	'options'            => array( 'posts_per_page' => 10, 'page_for_posts' => 0, 'admin_email' => 'admin@example.test' ),
	'stylesheet_dir'     => '',
	'home_url'           => 'https://example.test',
	'permalink'          => 'https://example.test/',
);

/**
 * Reset every recorded double between tests.
 */
function doclap_test_reset(): void {
	$GLOBALS['doclap_test']['actions']            = array();
	$GLOBALS['doclap_test']['filters']            = array();
	$GLOBALS['doclap_test']['blocks']             = array();
	$GLOBALS['doclap_test']['inline_scripts']     = array();
	$GLOBALS['doclap_test']['pattern_categories'] = array();
	$GLOBALS['doclap_test']['editor_registrars']  = array();
	$GLOBALS['doclap_test']['post_types']         = array( 'post', 'page' );
	$GLOBALS['doclap_test']['options']            = array( 'posts_per_page' => 10, 'page_for_posts' => 0, 'admin_email' => 'admin@example.test' );
}

// ---------------------------------------------------------------------------
// Hook API
// ---------------------------------------------------------------------------

function add_action( string $hook, $callback, int $priority = 10, int $accepted_args = 1 ): bool {
	$GLOBALS['doclap_test']['actions'][] = compact( 'hook', 'callback', 'priority', 'accepted_args' );

	return true;
}

function add_filter( string $hook, $callback, int $priority = 10, int $accepted_args = 1 ): bool {
	$GLOBALS['doclap_test']['filters'][] = compact( 'hook', 'callback', 'priority', 'accepted_args' );

	return true;
}

function apply_filters( string $hook, $value, ...$args ) { // phpcs:ignore WordPress.NamingConventions.ValidFunctionName.FunctionNameInvalid -- test double.
	return $value;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

function register_block_type( $block_type, array $args = array() ): bool {
	$GLOBALS['doclap_test']['blocks'][] = is_string( $block_type ) ? $block_type : (string) ( $block_type->name ?? '' );

	return true;
}

function register_block_pattern_category( string $slug, array $properties = array() ): bool {
	$GLOBALS['doclap_test']['pattern_categories'][ $slug ] = $properties;

	return true;
}

function wp_add_inline_script( string $handle, string $script, string $position = 'after' ): bool {
	$GLOBALS['doclap_test']['inline_scripts'][] = compact( 'handle', 'script', 'position' );

	return true;
}

function get_stylesheet_directory(): string {
	return (string) $GLOBALS['doclap_test']['stylesheet_dir'];
}

function post_type_exists( string $post_type ): bool {
	return in_array( $post_type, (array) $GLOBALS['doclap_test']['post_types'], true );
}

// ---------------------------------------------------------------------------
// i18n and escaping
// ---------------------------------------------------------------------------

function __( string $text, string $domain = 'default' ): string {
	return $text;
}

function esc_attr( string $text ): string {
	return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
}

function esc_url( string $url ): string {
	return $url;
}

function esc_html( string $text ): string {
	return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
}

function sanitize_text_field( $value ): string {
	return is_string( $value ) ? trim( preg_replace( '/[\r\n\t ]+/', ' ', $value ) ?? '' ) : '';
}

function sanitize_key( $value ): string {
	return is_string( $value ) ? strtolower( preg_replace( '/[^a-z0-9_\-]/i', '', $value ) ?? '' ) : '';
}

function wp_strip_all_tags( string $text, bool $remove_breaks = false ): string {
	$stripped = strip_tags( $text );

	return $remove_breaks ? trim( preg_replace( '/\s+/', ' ', $stripped ) ?? '' ) : trim( $stripped );
}

// ---------------------------------------------------------------------------
// URLs and options
// ---------------------------------------------------------------------------

function home_url( string $path = '' ): string {
	return rtrim( (string) $GLOBALS['doclap_test']['home_url'], '/' ) . '/' . ltrim( $path, '/' );
}

function get_option( string $option, $default = false ) {
	return $GLOBALS['doclap_test']['options'][ $option ] ?? $default;
}

function get_permalink( $post = 0 ): string {
	return (string) $GLOBALS['doclap_test']['permalink'];
}

function wp_parse_url( string $url, int $component = -1 ) {
	return -1 === $component ? parse_url( $url ) : parse_url( $url, $component );
}

function untrailingslashit( string $value ): string {
	return rtrim( $value, '/\\' );
}

function is_front_page(): bool {
	return false;
}

function is_home(): bool {
	return false;
}

function is_singular( $post_types = '' ): bool {
	return false;
}

function is_search(): bool {
	return false;
}

// ---------------------------------------------------------------------------
// WP_Error
// ---------------------------------------------------------------------------

if ( ! class_exists( 'WP_Error' ) ) {
	/**
	 * Test double for the WordPress error object.
	 */
	class WP_Error {

		/** @var array<string, array<int, string>> */
		private array $messages = array();

		/** @var array<string, mixed> */
		private array $data;

		/**
		 * @param string               $code    Error code.
		 * @param string               $message Error message.
		 * @param array<string, mixed> $data    Error data.
		 */
		public function __construct( string $code = '', string $message = '', array $data = array() ) {
			if ( '' !== $code ) {
				$this->messages[ $code ] = array( $message );
			}

			$this->data = $data;
		}

		public function get_error_code(): string {
			$codes = array_keys( $this->messages );

			return (string) ( $codes[0] ?? '' );
		}

		public function get_error_message(): string {
			$code = $this->get_error_code();

			return (string) ( $this->messages[ $code ][0] ?? '' );
		}

		public function get_error_data() {
			return $this->data;
		}
	}
}
