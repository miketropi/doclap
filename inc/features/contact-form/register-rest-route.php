<?php

/**
 * Doclap contact-form REST route.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Register POST /doclap/v1/contact. */
function doclap_contact_form_register_rest_route(): void {
	$text_arg = array( 'sanitize_callback' => 'sanitize_text_field' );
	register_rest_route(
		'doclap/v1',
		'/contact',
		array(
			'methods'             => 'POST',
			'callback'            => 'doclap_handle_contact_form_submission',
			'permission_callback' => '__return_true',
			'args'                => array(
				'name'              => $text_arg,
				'email'             => array( 'sanitize_callback' => 'sanitize_email' ),
				'company'           => $text_arg,
				'services'          => array( 'sanitize_callback' => 'doclap_contact_form_sanitize_services' ),
				'message'           => array( 'sanitize_callback' => 'doclap_contact_form_sanitize_message_arg' ),
				'consent'           => array( 'sanitize_callback' => 'rest_sanitize_boolean' ),
				'website'           => $text_arg,
				'_wpnonce'          => $text_arg,
				'admin_email'       => array( 'sanitize_callback' => 'sanitize_email' ),
				'admin_subject'     => $text_arg,
				'user_subject'      => $text_arg,
				'recaptcha_token'   => $text_arg,
				'recaptcha_site_key'=> $text_arg,
				'recaptcha_config'  => $text_arg,
			),
		),
	);
}
add_action( 'rest_api_init', 'doclap_contact_form_register_rest_route' );
