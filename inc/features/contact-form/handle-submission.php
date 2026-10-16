<?php

/**
 * Doclap contact-form submission transport.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** @return string[] */
function doclap_contact_form_service_allowlist(): array {
	return array(
		'Web design',
		'Motion & interaction',
		'Creative development',
		'Explore together',
	);
}

/**
 * Reduce submitted service values to the allowlist.
 *
 * @param mixed $value Raw checkbox value from the request.
 *
 * @return array<int, string> Allowed service values present in the input.
 */
function doclap_contact_form_sanitize_services( $value ): array {
	$values = is_array( $value ) ? $value : array();

	return array_values(
		array_intersect(
			doclap_contact_form_service_allowlist(),
			array_map( 'sanitize_text_field', $values ),
		),
	);
}

/** @param mixed $value */
function doclap_contact_form_sanitize_message_arg( $value ): string {
	return is_string( $value ) ? $value : '';
}

/**
 * Build a consistently shaped REST error.
 *
 * @param string             $code    Machine-readable error code.
 * @param string             $message Human-readable message.
 * @param int                $status  HTTP status code.
 * @param array<int, string> $fields  Field names that failed validation.
 */
function doclap_contact_form_error(
	string $code,
	string $message,
	int $status,
	array $fields = array(),
): WP_Error {
	return new WP_Error(
		$code,
		$message,
		array(
			'status' => $status,
			'fields' => $fields,
		),
	);
}

/** @return true|WP_Error */
function doclap_contact_form_verify_recaptcha( string $token, string $secret ) {
	if ( '' === $token ) {
		return doclap_contact_form_error(
			'recaptcha_failed',
			__( 'Security verification failed. Please try again.', 'doclap' ),
			403,
		);
	}

	$response = wp_remote_post(
		'https://www.google.com/recaptcha/api/siteverify',
		array(
			'timeout' => 10,
			'body'    => array(
				'secret'   => $secret,
				'response' => $token,
			),
		),
	);
	if ( is_wp_error( $response ) ) {
		return doclap_contact_form_error(
			'recaptcha_unavailable',
			__( 'Security verification is temporarily unavailable.', 'doclap' ),
			503,
		);
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );
	if (
		! is_array( $data )
		|| empty( $data['success'] )
		|| ( isset( $data['score'] ) && (float) $data['score'] < 0.5 )
	) {
		return doclap_contact_form_error(
			'recaptcha_failed',
			__( 'Security verification failed. Please try again.', 'doclap' ),
			403,
		);
	}

	return true;
}

/** @return WP_REST_Response|WP_Error */
function doclap_handle_contact_form_submission( WP_REST_Request $request ) {
	$nonce = sanitize_text_field( (string) $request->get_param( '_wpnonce' ) );
	if ( ! wp_verify_nonce( $nonce, 'doclap_contact_form' ) ) {
		return doclap_contact_form_error(
			'invalid_nonce',
			__( 'Security check failed. Reload the page and try again.', 'doclap' ),
			403,
		);
	}
	if ( '' !== sanitize_text_field( (string) $request->get_param( 'website' ) ) ) {
		return doclap_contact_form_error(
			'spam_detected',
			__( 'Submission rejected.', 'doclap' ),
			403,
		);
	}
	if ( ! rest_sanitize_boolean( (string) $request->get_param( 'consent' ) ) ) {
		return doclap_contact_form_error(
			'missing_consent',
			__( 'Please confirm your consent.', 'doclap' ),
			400,
			array( 'consent' ),
		);
	}

	$name = sanitize_text_field( (string) $request->get_param( 'name' ) );
	if ( '' === $name ) {
		return doclap_contact_form_error(
			'missing_name',
			__( 'Please enter your name.', 'doclap' ),
			400,
			array( 'name' ),
		);
	}

	$email = sanitize_email( (string) $request->get_param( 'email' ) );
	if ( '' === $email ) {
		return doclap_contact_form_error(
			'missing_email',
			__( 'Please enter your email address.', 'doclap' ),
			400,
			array( 'email' ),
		);
	}
	if ( ! is_email( $email ) ) {
		return doclap_contact_form_error(
			'invalid_email',
			__( 'Please enter a valid email address.', 'doclap' ),
			400,
			array( 'email' ),
		);
	}

	$raw_message = (string) $request->get_param( 'message' );
	if ( '' === trim( wp_strip_all_tags( $raw_message ) ) ) {
		return doclap_contact_form_error(
			'missing_message',
			__( 'Please enter your message.', 'doclap' ),
			400,
			array( 'message' ),
		);
	}
	$message = function_exists( 'nextora_contact_form_sanitize_message' )
		? nextora_contact_form_sanitize_message( $raw_message )
		: wp_kses_post( $raw_message );
	if ( is_wp_error( $message ) || '' === trim( wp_strip_all_tags( (string) $message ) ) ) {
		return doclap_contact_form_error(
			'missing_message',
			__( 'Please enter your message.', 'doclap' ),
			400,
			array( 'message' ),
		);
	}

	$ip = isset( $_SERVER['REMOTE_ADDR'] )
		? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) )
		: '';
	$rate_key = 'doclap_contact_rate_' . wp_hash( $ip . '|' . strtolower( $email ) );
	if ( false !== get_transient( $rate_key ) ) {
		return doclap_contact_form_error(
			'rate_limited',
			__( 'Please wait before sending another message.', 'doclap' ),
			429,
		);
	}

	$config_key = sanitize_text_field( (string) $request->get_param( 'recaptcha_config' ) );
	$config     = get_transient( 'doclap_contact_config_' . wp_hash( $config_key ) );
	$config     = is_array( $config ) ? $config : array();
	if ( ! empty( $config['recaptcha'] ) && ! empty( $config['secret_key'] ) ) {
		$check = doclap_contact_form_verify_recaptcha(
			sanitize_text_field( (string) $request->get_param( 'recaptcha_token' ) ),
			(string) $config['secret_key'],
		);
		if ( is_wp_error( $check ) ) {
			return $check;
		}
	}

	$company    = sanitize_text_field( (string) $request->get_param( 'company' ) );
	$services   = doclap_contact_form_sanitize_services( $request->get_param( 'services' ) );
	$admin_email = sanitize_email( (string) ( $config['admin_email'] ?? '' ) );
	if ( ! is_email( $admin_email ) ) {
		$admin_email = sanitize_email( (string) get_option( 'admin_email' ) );
	}
	$admin_email = (string) apply_filters( 'doclap_contact_form_admin_email', $admin_email );
	$admin_subject = (string) apply_filters(
		'doclap_contact_form_admin_subject',
		(string) ( $config['admin_subject'] ?? __( 'New contact form submission', 'doclap' ) ),
	);
	$user_subject = (string) apply_filters(
		'doclap_contact_form_user_subject',
		(string) ( $config['user_subject'] ?? __( 'Thank you for contacting us', 'doclap' ) ),
	);
	$admin_body = sprintf(
		'<h1>%s</h1><p><strong>%s:</strong> %s</p><p><strong>%s:</strong> %s</p>'
		. '<p><strong>%s:</strong> %s</p><p><strong>%s:</strong> %s</p>'
		. '<p><strong>%s:</strong> %s</p><div>%s</div>',
		esc_html__( 'New contact form submission', 'doclap' ),
		esc_html__( 'Name', 'doclap' ),
		esc_html( $name ),
		esc_html__( 'Email', 'doclap' ),
		esc_html( $email ),
		esc_html__( 'Company', 'doclap' ),
		esc_html( $company ),
		esc_html__( 'Services', 'doclap' ),
		esc_html( implode( ', ', $services ) ),
		esc_html__( 'Consent', 'doclap' ),
		esc_html__( 'Yes', 'doclap' ),
		wp_kses_post( (string) $message ),
	);
	$headers = array(
		'Content-Type: text/html; charset=UTF-8',
		sprintf( 'Reply-To: %s <%s>', $name, $email ),
	);
	if ( ! wp_mail( $admin_email, $admin_subject, $admin_body, $headers ) ) {
		return doclap_contact_form_error(
			'mail_failed',
			__( 'Your message could not be sent. Please try again.', 'doclap' ),
			500,
		);
	}

	set_transient( $rate_key, '1', MINUTE_IN_SECONDS );
	$user_body = sprintf(
		__(
			"Hi %1\$s,\n\nThank you for your message. We have received it and will respond as soon as possible."
			. "\n\nYour message:\n%2\$s",
			'doclap',
		),
		$name,
		wp_strip_all_tags( (string) $message, true ),
	);
	wp_mail(
		$email,
		$user_subject,
		$user_body,
		array( 'Content-Type: text/plain; charset=UTF-8' ),
	);

	return rest_ensure_response(
		array(
			'success' => true,
			'message' => __( 'Thank you. Your message has been sent.', 'doclap' ),
		),
	);
}
