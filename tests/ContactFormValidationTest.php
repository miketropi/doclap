<?php

/**
 * Contact submission sanitising and error shaping.
 *
 * @package Doclap
 */

declare( strict_types=1 );

namespace Doclap\Tests;

use PHPUnit\Framework\TestCase;
use WP_Error;

/**
 * The contact feature must only ever persist allowlisted service values, and every
 * failure must come back as a REST error with a status and the offending fields.
 */
final class ContactFormValidationTest extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		doclap_test_reset();
	}

	public function test_service_allowlist_is_the_reference_set(): void {
		self::assertSame(
			array( 'Web design', 'Motion & interaction', 'Creative development', 'Explore together' ),
			\doclap_contact_form_service_allowlist(),
		);
	}

	public function test_services_outside_the_allowlist_are_dropped(): void {
		$sanitised = \doclap_contact_form_sanitize_services(
			array( 'Web design', 'Free consultation', 'Explore together', '<script>alert(1)</script>' ),
		);

		self::assertSame( array( 'Web design', 'Explore together' ), $sanitised );
	}

	public function test_services_are_returned_in_allowlist_order(): void {
		$sanitised = \doclap_contact_form_sanitize_services(
			array( 'Explore together', 'Creative development', 'Web design' ),
		);

		self::assertSame( array( 'Web design', 'Creative development', 'Explore together' ), $sanitised );
	}

	public function test_non_array_service_input_yields_no_services(): void {
		self::assertSame( array(), \doclap_contact_form_sanitize_services( 'Web design' ) );
		self::assertSame( array(), \doclap_contact_form_sanitize_services( null ) );
	}

	public function test_service_values_are_trimmed_before_comparison(): void {
		self::assertSame( array( 'Web design' ), \doclap_contact_form_sanitize_services( array( "  Web design \n" ) ) );
	}

	public function test_message_argument_accepts_strings_only(): void {
		self::assertSame( 'Hello', \doclap_contact_form_sanitize_message_arg( 'Hello' ) );
		self::assertSame( '', \doclap_contact_form_sanitize_message_arg( array( 'Hello' ) ) );
		self::assertSame( '', \doclap_contact_form_sanitize_message_arg( 42 ) );
	}

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
