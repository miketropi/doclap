<?php

/**
 * Doclap contact-form settings.
 *
 * Delivery and reCAPTCHA configuration is stored in a single option so the
 * submission handler never has to trust — or receive — a recipient, a subject or
 * a credential from the request. The option is edited on an Appearance submenu
 * and sanitised through the Settings API.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option name holding the contact settings.
 */
const DOCLAP_CONTACT_SETTINGS_OPTION = 'doclap_contact_settings';

/**
 * Settings group used by the Settings API form.
 */
const DOCLAP_CONTACT_SETTINGS_GROUP = 'doclap_contact';

/**
 * Default contact settings.
 *
 * @return array<string, mixed> Default values for every stored key.
 */
function doclap_contact_settings_defaults(): array {
	return array(
		'admin_email'          => sanitize_email( (string) get_option( 'admin_email' ) ),
		'admin_subject'        => __( 'New contact form submission', 'doclap' ),
		'user_subject'         => __( 'Thank you for contacting us', 'doclap' ),
		'recaptcha_enabled'    => false,
		'recaptcha_site_key'   => '',
		'recaptcha_secret_key' => '',
	);
}

/**
 * Sanitise the settings array.
 *
 * Every field is sanitised; the two subjects fall back to their defaults when
 * submitted empty, and an empty secret keeps the stored one so the field can be
 * left untouched on the settings screen.
 *
 * @param array<string, mixed> $input Raw submitted values.
 *
 * @return array<string, mixed> Sanitised values, keyed exactly like the defaults.
 */
function doclap_contact_settings_sanitize( array $input ): array {
	$defaults = doclap_contact_settings_defaults();
	$stored   = get_option( DOCLAP_CONTACT_SETTINGS_OPTION, array() );
	$stored   = is_array( $stored ) ? $stored : array();

	$admin_subject = sanitize_text_field( (string) ( $input['admin_subject'] ?? '' ) );
	$user_subject  = sanitize_text_field( (string) ( $input['user_subject'] ?? '' ) );
	$secret_key    = sanitize_text_field( (string) ( $input['recaptcha_secret_key'] ?? '' ) );

	if ( '' === $admin_subject ) {
		$admin_subject = (string) $defaults['admin_subject'];
	}

	if ( '' === $user_subject ) {
		$user_subject = (string) $defaults['user_subject'];
	}

	// A blank secret submission keeps whatever secret is already stored.
	if ( '' === $secret_key ) {
		$secret_key = sanitize_text_field( (string) ( $stored['recaptcha_secret_key'] ?? '' ) );
	}

	return array(
		'admin_email'          => sanitize_email( (string) ( $input['admin_email'] ?? '' ) ),
		'admin_subject'        => $admin_subject,
		'user_subject'         => $user_subject,
		'recaptcha_enabled'    => ! empty( $input['recaptcha_enabled'] ),
		'recaptcha_site_key'   => sanitize_text_field( (string) ( $input['recaptcha_site_key'] ?? '' ) ),
		'recaptcha_secret_key' => $secret_key,
	);
}

/**
 * Stored contact settings merged over the defaults, always sanitised.
 *
 * @return array<string, mixed> Ready-to-use settings.
 */
function doclap_contact_settings(): array {
	$defaults = doclap_contact_settings_defaults();
	$stored   = get_option( DOCLAP_CONTACT_SETTINGS_OPTION, array() );
	$stored   = is_array( $stored ) ? $stored : array();
	$settings = array_merge( $defaults, $stored );

	$admin_email   = sanitize_email( (string) $settings['admin_email'] );
	$admin_subject = sanitize_text_field( (string) $settings['admin_subject'] );
	$user_subject  = sanitize_text_field( (string) $settings['user_subject'] );

	return array(
		'admin_email'          => '' !== $admin_email ? $admin_email : (string) $defaults['admin_email'],
		'admin_subject'        => '' !== $admin_subject ? $admin_subject : (string) $defaults['admin_subject'],
		'user_subject'         => '' !== $user_subject ? $user_subject : (string) $defaults['user_subject'],
		'recaptcha_enabled'    => ! empty( $settings['recaptcha_enabled'] ),
		'recaptcha_site_key'   => sanitize_text_field( (string) $settings['recaptcha_site_key'] ),
		'recaptcha_secret_key' => sanitize_text_field( (string) $settings['recaptcha_secret_key'] ),
	);
}

/**
 * Whether reCAPTCHA is enabled and completely configured.
 *
 * @param array<string, mixed> $settings Contact settings.
 *
 * @return bool True when the site key and the secret key are both present.
 */
function doclap_contact_form_recaptcha_is_enabled( array $settings ): bool {
	return ! empty( $settings['recaptcha_enabled'] )
		&& '' !== (string) $settings['recaptcha_site_key']
		&& '' !== (string) $settings['recaptcha_secret_key'];
}

/**
 * Register the Appearance submenu.
 *
 * Menu registration has to run on `admin_menu`. WordPress resolves the current
 * screen's access at the end of that hook (`wp-admin/includes/menu.php` →
 * `user_can_access_admin_page()`, which fires before `admin_init`), so a page
 * added later still appends itself to the Appearance list — that array is updated
 * immediately — and is then refused when it is opened with "Sorry, you are not
 * allowed to access this page."
 *
 * @return void
 */
function doclap_contact_settings_menu(): void {
	add_submenu_page(
		'themes.php',
		__( 'Doclap Contact', 'doclap' ),
		__( 'Doclap Contact', 'doclap' ),
		'manage_options',
		'doclap-contact',
		'doclap_contact_settings_render_page',
	);
}
add_action( 'admin_menu', 'doclap_contact_settings_menu' );

/**
 * Register the setting, the settings section and the settings fields.
 */
function doclap_contact_settings_register(): void {
	register_setting(
		DOCLAP_CONTACT_SETTINGS_GROUP,
		DOCLAP_CONTACT_SETTINGS_OPTION,
		array(
			'type'              => 'array',
			'description'       => __( 'Doclap contact form delivery and reCAPTCHA settings.', 'doclap' ),
			'sanitize_callback' => 'doclap_contact_settings_sanitize',
			'default'           => doclap_contact_settings_defaults(),
			'show_in_rest'      => false,
		),
	);

	add_settings_section(
		'doclap_contact_delivery',
		__( 'Delivery', 'doclap' ),
		'doclap_contact_settings_section_delivery',
		'doclap-contact',
	);

	add_settings_field(
		'doclap_contact_admin_email',
		__( 'Recipient email', 'doclap' ),
		'doclap_contact_settings_field_admin_email',
		'doclap-contact',
		'doclap_contact_delivery',
	);

	add_settings_field(
		'doclap_contact_admin_subject',
		__( 'Admin subject', 'doclap' ),
		'doclap_contact_settings_field_admin_subject',
		'doclap-contact',
		'doclap_contact_delivery',
	);

	add_settings_field(
		'doclap_contact_user_subject',
		__( 'Reply subject', 'doclap' ),
		'doclap_contact_settings_field_user_subject',
		'doclap-contact',
		'doclap_contact_delivery',
	);

	add_settings_section(
		'doclap_contact_recaptcha',
		__( 'reCAPTCHA', 'doclap' ),
		'doclap_contact_settings_section_recaptcha',
		'doclap-contact',
	);

	add_settings_field(
		'doclap_contact_recaptcha_enabled',
		__( 'reCAPTCHA v3', 'doclap' ),
		'doclap_contact_settings_field_recaptcha_enabled',
		'doclap-contact',
		'doclap_contact_recaptcha',
	);

	add_settings_field(
		'doclap_contact_recaptcha_site_key',
		__( 'Site key', 'doclap' ),
		'doclap_contact_settings_field_recaptcha_site_key',
		'doclap-contact',
		'doclap_contact_recaptcha',
	);

	add_settings_field(
		'doclap_contact_recaptcha_secret_key',
		__( 'Secret key', 'doclap' ),
		'doclap_contact_settings_field_recaptcha_secret_key',
		'doclap-contact',
		'doclap_contact_recaptcha',
	);
}
add_action( 'admin_init', 'doclap_contact_settings_register' );

/**
 * Render the settings screen.
 */
function doclap_contact_settings_render_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Doclap Contact', 'doclap' ); ?></h1>
		<?php
		/*
		 * `settings_fields()` only prints the nonce: without this call the screen
		 * redirects back after a save and shows nothing, so the editor cannot tell
		 * whether the form was stored.
		 */
		settings_errors();
		?>
		<form method="post" action="options.php">
			<?php
			settings_fields( DOCLAP_CONTACT_SETTINGS_GROUP );
			do_settings_sections( 'doclap-contact' );
			submit_button();
			?>
		</form>
	</div>
	<?php
}

/**
 * Delivery section introduction.
 */
function doclap_contact_settings_section_delivery(): void {
	echo '<p>' . esc_html__( 'Where the contact form delivers messages and how those messages are titled.', 'doclap' ) . '</p>';
}

/**
 * reCAPTCHA section introduction.
 */
function doclap_contact_settings_section_recaptcha(): void {
	echo '<p>' . esc_html__( 'Optional reCAPTCHA v3 protection. Verification only runs when the checkbox is on and both keys are filled in.', 'doclap' ) . '</p>';
}

/**
 * Recipient email field.
 */
function doclap_contact_settings_field_admin_email(): void {
	$settings = doclap_contact_settings();
	?>
	<input
		type="email"
		class="regular-text"
		name="<?php echo esc_attr( DOCLAP_CONTACT_SETTINGS_OPTION ); ?>[admin_email]"
		id="doclap_contact_admin_email"
		value="<?php echo esc_attr( (string) $settings['admin_email'] ); ?>"
		autocomplete="email"
	>
	<p class="description"><?php esc_html_e( 'Messages are delivered here. Leave blank to use the site administration email.', 'doclap' ); ?></p>
	<?php
}

/**
 * Admin notification subject field.
 */
function doclap_contact_settings_field_admin_subject(): void {
	$settings = doclap_contact_settings();
	?>
	<input
		type="text"
		class="regular-text"
		name="<?php echo esc_attr( DOCLAP_CONTACT_SETTINGS_OPTION ); ?>[admin_subject]"
		id="doclap_contact_admin_subject"
		value="<?php echo esc_attr( (string) $settings['admin_subject'] ); ?>"
	>
	<?php
}

/**
 * Reply subject field.
 */
function doclap_contact_settings_field_user_subject(): void {
	$settings = doclap_contact_settings();
	?>
	<input
		type="text"
		class="regular-text"
		name="<?php echo esc_attr( DOCLAP_CONTACT_SETTINGS_OPTION ); ?>[user_subject]"
		id="doclap_contact_user_subject"
		value="<?php echo esc_attr( (string) $settings['user_subject'] ); ?>"
	>
	<?php
}

/**
 * reCAPTCHA enable checkbox.
 */
function doclap_contact_settings_field_recaptcha_enabled(): void {
	$settings = doclap_contact_settings();
	?>
	<label for="doclap_contact_recaptcha_enabled">
		<input
			type="checkbox"
			name="<?php echo esc_attr( DOCLAP_CONTACT_SETTINGS_OPTION ); ?>[recaptcha_enabled]"
			id="doclap_contact_recaptcha_enabled"
			value="1"
			<?php checked( ! empty( $settings['recaptcha_enabled'] ) ); ?>
		>
		<?php esc_html_e( 'Verify submissions with reCAPTCHA v3.', 'doclap' ); ?>
	</label>
	<?php
}

/**
 * reCAPTCHA public site key field.
 */
function doclap_contact_settings_field_recaptcha_site_key(): void {
	$settings = doclap_contact_settings();
	?>
	<input
		type="text"
		class="regular-text"
		name="<?php echo esc_attr( DOCLAP_CONTACT_SETTINGS_OPTION ); ?>[recaptcha_site_key]"
		id="doclap_contact_recaptcha_site_key"
		value="<?php echo esc_attr( (string) $settings['recaptcha_site_key'] ); ?>"
		autocomplete="off"
	>
	<?php
}

/**
 * reCAPTCHA secret key field.
 *
 * The stored secret is never echoed back into the markup; submitting the field
 * empty keeps the stored value.
 */
function doclap_contact_settings_field_recaptcha_secret_key(): void {
	$settings = doclap_contact_settings();
	$has_secret = '' !== (string) $settings['recaptcha_secret_key'];
	?>
	<input
		type="password"
		class="regular-text"
		name="<?php echo esc_attr( DOCLAP_CONTACT_SETTINGS_OPTION ); ?>[recaptcha_secret_key]"
		id="doclap_contact_recaptcha_secret_key"
		value=""
		autocomplete="off"
	>
	<p class="description">
		<?php
		if ( $has_secret ) {
			esc_html_e( 'A secret key is stored. Leave this field blank to keep it, or enter a new secret to replace it.', 'doclap' );
		} else {
			esc_html_e( 'Paste the secret key for the site key above. The value is stored but never displayed again.', 'doclap' );
		}
		?>
	</p>
	<?php
}
