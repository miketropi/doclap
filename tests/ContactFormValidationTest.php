<?php

/**
 * Contact settings, REST surface, submission sanitising and error shaping.
 *
 * The feature must keep delivery addresses, subjects and reCAPTCHA credentials
 * entirely server-side: the request may only carry the values the form itself
 * renders, and every failure must come back as a REST error with a status and the
 * offending fields.
 *
 * @package Doclap
 */

declare( strict_types=1 );

namespace Doclap\Tests;

use PHPUnit\Framework\TestCase;
use WP_Error;
use WP_REST_Request;

/**
 * Contact form contract tests.
 */
final class ContactFormValidationTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		doclap_test_reset();
	}

	// -----------------------------------------------------------------------
	// REST surface
	// -----------------------------------------------------------------------

	public function test_route_exposes_only_the_public_form_args(): void {
		\doclap_contact_form_register_rest_route();

		$routes = $GLOBALS['doclap_test']['rest_routes'];
		$route  = $routes['doclap/v1/contact'] ?? array();
		$args   = $route['args'] ?? array();

		self::assertSame( 'POST', $route['methods'] ?? '' );
		self::assertSame( 'doclap_handle_contact_form_submission', $route['callback'] ?? '' );
		self::assertSame( '__return_true', $route['permission_callback'] ?? '' );

		$expected = array(
			'name',
			'email',
			'company',
			'services',
			'message',
			'consent',
			'website',
			'_wpnonce',
			'recaptcha_token',
		);

		self::assertSame( $expected, array_keys( $args ) );

		foreach ( array( 'admin_email', 'admin_subject', 'user_subject', 'recaptcha_site_key', 'recaptcha_config' ) as $removed ) {
			self::assertArrayNotHasKey( $removed, $args );
		}

		foreach ( $args as $name => $definition ) {
			self::assertArrayHasKey( 'sanitize_callback', $definition, $name . ' must be sanitised' );
			self::assertIsCallable( $definition['sanitize_callback'], $name . ' sanitize_callback must be callable' );
		}

		self::assertSame( 'doclap_contact_form_sanitize_services', $args['services']['sanitize_callback'] );
		self::assertSame( 'doclap_contact_form_sanitize_message_arg', $args['message']['sanitize_callback'] );
		self::assertSame( 'rest_sanitize_boolean', $args['consent']['sanitize_callback'] );
		self::assertSame( 'sanitize_email', $args['email']['sanitize_callback'] );
	}

	// -----------------------------------------------------------------------
	// Service sanitising
	// -----------------------------------------------------------------------

	public function test_more_than_ten_services_are_truncated_to_ten(): void {
		$input = array();

		for ( $index = 0; $index < 25; $index++ ) {
			$input[] = 'service-' . $index;
		}

		$services = \doclap_contact_form_sanitize_services( $input );

		self::assertCount( 10, $services );
		self::assertSame( 'service-0', $services[0] );
		self::assertSame( 'service-9', $services[9] );
	}

	public function test_over_long_service_values_are_multibyte_truncated(): void {
		$services = \doclap_contact_form_sanitize_services( array( str_repeat( 'đ', 150 ) ) );

		self::assertCount( 1, $services );
		self::assertSame( 100, mb_strlen( $services[0] ) );
	}

	public function test_duplicate_services_collapse_and_keep_first_appearance_order(): void {
		$services = \doclap_contact_form_sanitize_services(
			array( 'Motion', 'Design', 'Motion', 'Design', '' ),
		);

		self::assertSame( array( 'Motion', 'Design' ), $services );
	}

	public function test_non_array_service_input_yields_no_services(): void {
		self::assertSame( array(), \doclap_contact_form_sanitize_services( 'Web design' ) );
		self::assertSame( array(), \doclap_contact_form_sanitize_services( null ) );
	}

	public function test_non_string_service_values_are_dropped(): void {
		self::assertSame(
			array( 'Design' ),
			\doclap_contact_form_sanitize_services( array( array( 'nested' ), 'Design' ) ),
		);
	}

	public function test_message_argument_accepts_strings_only(): void {
		self::assertSame( 'Hello', \doclap_contact_form_sanitize_message_arg( 'Hello' ) );
		self::assertSame( '', \doclap_contact_form_sanitize_message_arg( array( 'Hello' ) ) );
		self::assertSame( '', \doclap_contact_form_sanitize_message_arg( 42 ) );
	}

	// -----------------------------------------------------------------------
	// Settings
	// -----------------------------------------------------------------------

	public function test_settings_merge_stored_values_over_defaults(): void {
		$GLOBALS['doclap_test']['options']['doclap_contact_settings'] = array(
			'admin_email' => 'owner@example.test',
			'user_subject' => 'Stored reply',
		);

		$settings = \doclap_contact_settings();

		self::assertSame( 'owner@example.test', $settings['admin_email'] );
		self::assertSame( 'Stored reply', $settings['user_subject'] );
		self::assertSame( 'New contact form submission', $settings['admin_subject'] );
		self::assertFalse( $settings['recaptcha_enabled'] );
		self::assertSame( '', $settings['recaptcha_secret_key'] );
	}

	public function test_settings_sanitize_keeps_a_stored_secret_when_the_field_is_blank(): void {
		$GLOBALS['doclap_test']['options']['doclap_contact_settings'] = array(
			'recaptcha_secret_key' => 'stored-secret',
		);

		$sanitised = \doclap_contact_settings_sanitize(
			array(
				'admin_email'          => 'owner@example.test',
				'admin_subject'        => '',
				'user_subject'         => '',
				'recaptcha_enabled'    => '1',
				'recaptcha_site_key'   => 'site-key',
				'recaptcha_secret_key' => '',
			),
		);

		self::assertSame( 'stored-secret', $sanitised['recaptcha_secret_key'] );
		self::assertSame( 'New contact form submission', $sanitised['admin_subject'] );
		self::assertSame( 'Thank you for contacting us', $sanitised['user_subject'] );
		self::assertTrue( $sanitised['recaptcha_enabled'] );
		self::assertSame( 'site-key', $sanitised['recaptcha_site_key'] );
	}

	public function test_settings_sanitize_replaces_the_secret_when_a_new_one_is_submitted(): void {
		$GLOBALS['doclap_test']['options']['doclap_contact_settings'] = array(
			'recaptcha_secret_key' => 'stored-secret',
		);

		$sanitised = \doclap_contact_settings_sanitize(
			array( 'recaptcha_secret_key' => 'new-secret' ),
		);

		self::assertSame( 'new-secret', $sanitised['recaptcha_secret_key'] );
	}

	public function test_recaptcha_is_enabled_only_with_both_keys(): void {
		self::assertFalse(
			\doclap_contact_form_recaptcha_is_enabled(
				array( 'recaptcha_enabled' => true, 'recaptcha_site_key' => 'site', 'recaptcha_secret_key' => '' ),
			),
		);
		self::assertFalse(
			\doclap_contact_form_recaptcha_is_enabled(
				array( 'recaptcha_enabled' => false, 'recaptcha_site_key' => 'site', 'recaptcha_secret_key' => 'secret' ),
			),
		);
		self::assertTrue(
			\doclap_contact_form_recaptcha_is_enabled(
				array( 'recaptcha_enabled' => true, 'recaptcha_site_key' => 'site', 'recaptcha_secret_key' => 'secret' ),
			),
		);
	}

	public function test_settings_register_the_option_and_the_appearance_screen(): void {
		\doclap_contact_settings_register();

		$registered = $GLOBALS['doclap_test']['settings']['doclap_contact_settings'] ?? array();

		self::assertSame( 'doclap_contact', $registered['group'] ?? '' );
		self::assertSame( 'doclap_contact_settings_sanitize', $registered['sanitize_callback'] ?? '' );

		$submenu = $GLOBALS['doclap_test']['submenus'][0] ?? array();

		self::assertSame( 'themes.php', $submenu['parent'] ?? '' );
		self::assertSame( 'doclap-contact', $submenu['slug'] ?? '' );
		self::assertSame( 'manage_options', $submenu['capability'] ?? '' );

		$section_ids = array_column( $GLOBALS['doclap_test']['settings_sections'], 'id' );
		$field_ids   = array_column( $GLOBALS['doclap_test']['settings_fields'], 'id' );

		self::assertContains( 'doclap_contact_delivery', $section_ids );
		self::assertContains( 'doclap_contact_recaptcha', $section_ids );
		self::assertContains( 'doclap_contact_admin_email', $field_ids );
		self::assertContains( 'doclap_contact_recaptcha_secret_key', $field_ids );

		foreach ( $GLOBALS['doclap_test']['settings_sections'] as $section ) {
			self::assertSame( 'doclap-contact', $section['page'] );
		}

		foreach ( $GLOBALS['doclap_test']['settings_fields'] as $field ) {
			self::assertSame( 'doclap-contact', $field['page'] );
		}
	}

	// -----------------------------------------------------------------------
	// Submission handler
	// -----------------------------------------------------------------------

	public function test_handler_delivers_to_stored_settings_ignoring_request_values(): void {
		$GLOBALS['doclap_test']['options']['doclap_contact_settings'] = array(
			'admin_email'   => 'owner@example.test',
			'admin_subject' => 'Stored subject',
			'user_subject'  => 'Stored reply',
		);

		$response = \doclap_handle_contact_form_submission(
			new WP_REST_Request(
				array(
					'_wpnonce'          => 'nonce',
					'consent'           => '1',
					'name'              => 'Visitor',
					'email'             => 'visitor@example.test',
					'message'           => 'A long enough message.',
					'website'           => '',
					'company'           => '',
					'services'          => array( 'Design' ),
					// Delivery overrides an attacker would attempt:
					'admin_email'       => 'attacker@evil.test',
					'admin_subject'     => 'Hijacked subject',
					'user_subject'      => 'Hijacked reply',
					'recaptcha_config'  => 'forged-config-token',
					'recaptcha_token'   => '',
				),
			),
		);

		self::assertIsArray( $response );
		self::assertTrue( $response['success'] );

		$mail = $GLOBALS['doclap_test']['mail'];

		self::assertCount( 2, $mail );
		self::assertSame( 'owner@example.test', $mail[0]['to'] );
		self::assertSame( 'Stored subject', $mail[0]['subject'] );
		self::assertSame( 'visitor@example.test', $mail[1]['to'] );
		self::assertSame( 'Stored reply', $mail[1]['subject'] );
	}

	public function test_handler_rejects_a_request_without_a_valid_nonce(): void {
		$GLOBALS['doclap_test']['nonce_valid'] = false;

		$error = \doclap_handle_contact_form_submission(
			new WP_REST_Request(
				array(
					'_wpnonce' => 'stale',
					'consent'  => '1',
					'name'     => 'Visitor',
					'email'    => 'visitor@example.test',
					'message'  => 'A long enough message.',
				),
			),
		);

		self::assertInstanceOf( WP_Error::class, $error );
		self::assertSame( 'invalid_nonce', $error->get_error_code() );
		self::assertSame( array(), $GLOBALS['doclap_test']['mail'] );
	}

	public function test_handler_rejects_the_honeypot(): void {
		$error = \doclap_handle_contact_form_submission(
			new WP_REST_Request(
				array(
					'_wpnonce' => 'nonce',
					'consent'  => '1',
					'name'     => 'Visitor',
					'email'    => 'visitor@example.test',
					'message'  => 'A long enough message.',
					'website'  => 'https://spam.example',
				),
			),
		);

		self::assertInstanceOf( WP_Error::class, $error );
		self::assertSame( 'spam_detected', $error->get_error_code() );
		self::assertSame( array(), $GLOBALS['doclap_test']['mail'] );
	}

	public function test_handler_verifies_recaptcha_from_settings_not_the_request(): void {
		$GLOBALS['doclap_test']['options']['doclap_contact_settings'] = array(
			'recaptcha_enabled'    => true,
			'recaptcha_site_key'   => 'site-key',
			'recaptcha_secret_key' => 'secret-key',
		);

		$error = \doclap_handle_contact_form_submission(
			new WP_REST_Request(
				array(
					'_wpnonce'         => 'nonce',
					'consent'          => '1',
					'name'             => 'Visitor',
					'email'            => 'visitor@example.test',
					'message'          => 'A long enough message.',
					// A forged config token must not be able to skip verification.
					'recaptcha_config' => 'forged-config-token',
					'recaptcha_token'  => '',
				),
			),
		);

		self::assertInstanceOf( WP_Error::class, $error );
		self::assertSame( 'recaptcha_failed', $error->get_error_code() );
		self::assertSame( array(), $GLOBALS['doclap_test']['mail'] );
	}

	public function test_handler_accepts_a_verified_recaptcha_token(): void {
		$GLOBALS['doclap_test']['options']['doclap_contact_settings'] = array(
			'recaptcha_enabled'    => true,
			'recaptcha_site_key'   => 'site-key',
			'recaptcha_secret_key' => 'secret-key',
			'admin_email'          => 'owner@example.test',
		);

		$response = \doclap_handle_contact_form_submission(
			new WP_REST_Request(
				array(
					'_wpnonce'        => 'nonce',
					'consent'         => '1',
					'name'            => 'Visitor',
					'email'           => 'visitor@example.test',
					'message'         => 'A long enough message.',
					'recaptcha_token' => 'verified-token',
				),
			),
		);

		self::assertIsArray( $response );
		self::assertTrue( $response['success'] );
		self::assertCount( 2, $GLOBALS['doclap_test']['mail'] );
	}

	// -----------------------------------------------------------------------
	// Error shaping
	// -----------------------------------------------------------------------

	public function test_errors_carry_code_status_and_offending_fields(): void {
		$error = \doclap_contact_form_error( 'missing_fields', 'Required', 400, array( 'name', 'email' ) );

		self::assertInstanceOf( WP_Error::class, $error );
		self::assertSame( 'missing_fields', $error->get_error_code() );
		self::assertSame( 'Required', $error->get_error_message() );

		$data = $error->get_error_data();

		self::assertSame( 400, $data['status'] );
		self::assertSame( array( 'name', 'email' ), $data['fields'] );
	}

	public function test_errors_default_to_an_empty_field_list(): void {
		$data = \doclap_contact_form_error( 'spam_detected', 'Rejected', 403 )->get_error_data();

		self::assertSame( 403, $data['status'] );
		self::assertSame( array(), $data['fields'] );
	}
}
