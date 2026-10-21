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
	'rest_routes'        => array(),
	'transients'         => array(),
	'mail'               => array(),
	'settings'           => array(),
	'submenus'           => array(),
	'settings_sections'  => array(),
	'settings_fields'    => array(),
	'recaptcha_body'     => null,
	'nonce_valid'        => true,
	// Hook wiring performed while the theme files load; kept across resets so a
	// test can assert which hook a boot-time callback is attached to.
	'boot_actions'       => array(),
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
	$GLOBALS['doclap_test']['rest_routes']        = array();
	$GLOBALS['doclap_test']['transients']         = array();
	$GLOBALS['doclap_test']['mail']               = array();
	$GLOBALS['doclap_test']['settings']           = array();
	$GLOBALS['doclap_test']['submenus']           = array();
	$GLOBALS['doclap_test']['settings_sections']  = array();
	$GLOBALS['doclap_test']['settings_fields']    = array();
	$GLOBALS['doclap_test']['recaptcha_body']     = null;
	$GLOBALS['doclap_test']['nonce_valid']        = true;
}

if ( ! defined( 'MINUTE_IN_SECONDS' ) ) {
	define( 'MINUTE_IN_SECONDS', 60 );
}

if ( ! defined( 'DAY_IN_SECONDS' ) ) {
	define( 'DAY_IN_SECONDS', 86400 );
}

// ---------------------------------------------------------------------------
// Hook API
// ---------------------------------------------------------------------------

function add_action( string $hook, $callback, int $priority = 10, int $accepted_args = 1 ): bool {
	$GLOBALS['doclap_test']['actions'][] = compact( 'hook', 'callback', 'priority', 'accepted_args' );

	$wiring = $hook . ':' . ( is_string( $callback ) ? $callback : 'closure' );

	if ( ! in_array( $wiring, $GLOBALS['doclap_test']['boot_actions'], true ) ) {
		$GLOBALS['doclap_test']['boot_actions'][] = $wiring;
	}

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

function esc_html__( string $text, string $domain = 'default' ): string {
	return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
}

function esc_attr__( string $text, string $domain = 'default' ): string {
	return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
}

function esc_html_e( string $text, string $domain = 'default' ): void {
	echo esc_html__( $text, $domain );
}

function esc_attr_e( string $text, string $domain = 'default' ): void {
	echo esc_attr__( $text, $domain );
}

function wp_kses_post( $value ): string {
	return is_string( $value )
		? strip_tags( $value, '<p><br><strong><em><a><ul><ol><li><div><h1><h2><span>' )
		: '';
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

// ---------------------------------------------------------------------------
// REST, nonces, mail, transients
// ---------------------------------------------------------------------------

/**
 * Test double for a REST request.
 */
class WP_REST_Request {

	/** @var array<string, mixed> */
	private array $params;

	/**
	 * @param array<string, mixed> $params Request parameters.
	 */
	public function __construct( array $params = array() ) {
		$this->params = $params;
	}

	/**
	 * @return mixed
	 */
	public function get_param( string $key ) {
		return $this->params[ $key ] ?? null;
	}

	/**
	 * @param mixed $value New value.
	 */
	public function set_param( string $key, $value ): void {
		$this->params[ $key ] = $value;
	}

	/**
	 * @return array<string, mixed>
	 */
	public function get_params(): array {
		return $this->params;
	}
}

function register_rest_route( string $namespace, string $route, array $args = array(), bool $override = false ): bool {
	$GLOBALS['doclap_test']['rest_routes'][ $namespace . $route ] = $args;

	return true;
}

function wp_verify_nonce( string $nonce, string $action = '-1' ) {
	return (bool) $GLOBALS['doclap_test']['nonce_valid'];
}

function rest_sanitize_boolean( $value ): bool {
	if ( is_bool( $value ) ) {
		return $value;
	}

	if ( is_string( $value ) ) {
		return ! in_array( strtolower( $value ), array( '', '0', 'false', 'no', 'off' ), true );
	}

	return (bool) $value;
}

function sanitize_email( string $email ): string {
	$email = trim( $email );

	if ( false === strpos( $email, '@' ) ) {
		return '';
	}

	return (string) preg_replace( '/[^A-Za-z0-9@._%+\-]/', '', $email );
}

function is_email( string $email ): bool {
	return 1 === preg_match( '/^[^@\s]+@[^@\s]+\.[^@\s]+$/', $email );
}

function wp_unslash( $value ) {
	return $value;
}

function wp_hash( string $data, string $scheme = 'auth' ): string {
	return 'hash-' . md5( $scheme . $data );
}

function get_transient( string $key ) {
	return $GLOBALS['doclap_test']['transients'][ $key ] ?? false;
}

function set_transient( string $key, $value, int $expiration = 0 ): bool {
	$GLOBALS['doclap_test']['transients'][ $key ] = $value;

	return true;
}

function wp_mail( $to, string $subject, string $message, $headers = '' ): bool {
	$GLOBALS['doclap_test']['mail'][] = array(
		'to'      => $to,
		'subject' => $subject,
		'message' => $message,
		'headers' => $headers,
	);

	return true;
}

function is_wp_error( $thing ): bool {
	return $thing instanceof WP_Error;
}

function rest_ensure_response( $response ) {
	return $response;
}

function wp_remote_post( string $url, array $args = array() ) {
	return array(
		'body' => (string) ( $GLOBALS['doclap_test']['recaptcha_body'] ?? '{"success":true,"score":0.9}' ),
	);
}

function wp_remote_retrieve_body( $response ): string {
	return is_array( $response ) ? (string) ( $response['body'] ?? '' ) : '';
}

// ---------------------------------------------------------------------------
// Settings API
// ---------------------------------------------------------------------------

function register_setting( string $group, string $name, array $args = array() ): void {
	$GLOBALS['doclap_test']['settings'][ $name ] = $args + array( 'group' => $group );
}

function add_submenu_page( string $parent_slug, string $page_title, string $menu_title, string $capability, string $menu_slug, $callback = null, int $position = 0 ): string {
	$GLOBALS['doclap_test']['submenus'][] = array(
		'parent'     => $parent_slug,
		'slug'       => $menu_slug,
		'capability' => $capability,
	);

	return 'settings_page_' . $menu_slug;
}

function add_settings_section( string $id, string $title, $callback, string $page ): void {
	$GLOBALS['doclap_test']['settings_sections'][] = array(
		'id'   => $id,
		'page' => $page,
	);
}

function add_settings_field( string $id, string $title, $callback, string $page, string $section = 'default', array $args = array() ): void {
	$GLOBALS['doclap_test']['settings_fields'][] = array(
		'id'      => $id,
		'page'    => $page,
		'section' => $section,
	);
}
