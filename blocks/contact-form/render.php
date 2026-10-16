<?php
/**
 * Contact form dynamic block.
 *
 * @var array<string, mixed> $attributes Block attributes.
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$attr = static function ( string $key, string $fallback = '' ) use ( $attributes ): string {
	return isset( $attributes[ $key ] ) && is_string( $attributes[ $key ] )
		? $attributes[ $key ]
		: $fallback;
};
$steps = isset( $attributes['asideSteps'] ) && is_array( $attributes['asideSteps'] )
	? $attributes['asideSteps']
	: array();
$services = isset( $attributes['services'] ) && is_array( $attributes['services'] )
	? $attributes['services']
	: array();
$nonce        = wp_create_nonce( 'doclap_contact_form' );
$rest_nonce   = wp_create_nonce( 'wp_rest' );
$uid          = wp_unique_id( 'doclap-contact-' );
$config_token = wp_generate_password( 32, false, false );
set_transient(
	'doclap_contact_config_' . wp_hash( $config_token ),
	array(
		'admin_email'   => sanitize_email( $attr( 'adminEmail' ) ),
		'admin_subject' => sanitize_text_field(
			$attr( 'adminEmailSubject', __( 'New contact form submission', 'doclap' ) ),
		),
		'user_subject'  => sanitize_text_field(
			$attr( 'userEmailSubject', __( 'Thank you for contacting us', 'doclap' ) ),
		),
		'recaptcha'     => ! empty( $attributes['enableRecaptcha'] ),
		'site_key'      => sanitize_text_field( $attr( 'recaptchaSiteKey' ) ),
		'secret_key'    => sanitize_text_field( $attr( 'recaptchaSecretKey' ) ),
	),
	DAY_IN_SECONDS,
);
$recaptcha_enabled = ! empty( $attributes['enableRecaptcha'] )
	&& '' !== $attr( 'recaptchaSiteKey' )
	&& '' !== $attr( 'recaptchaSecretKey' );
if ( $recaptcha_enabled && ! is_admin() ) {
	wp_enqueue_script(
		'google-recaptcha-v3',
		'https://www.google.com/recaptcha/api.js?render=' . rawurlencode( $attr( 'recaptchaSiteKey' ) ),
		array(),
		null,
		array(
			'strategy'  => 'defer',
			'in_footer' => true,
		),
	);
}
$doclap_wrapper = get_block_wrapper_attributes(
	array( 'class' => doclap_scope_class( 'doclap-contact-form' ) ),
);
?>
<div <?php echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escaped.?>>
	<section class="section inner-hero">
		<div class="container">
			<nav class="breadcrumb" aria-label="<?php esc_attr_e( 'Page path', 'doclap' ); ?>">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>">
					<?php echo esc_html( $attr( 'breadcrumbHomeLabel', __( 'Home', 'doclap' ) ) ); ?>
				</a>
				<span aria-hidden="true">/</span>
				<span aria-current="page">
					<?php echo esc_html( $attr( 'breadcrumbLabel', __( 'Contact', 'doclap' ) ) ); ?>
				</span>
			</nav>
			<h1>
				<?php echo esc_html( $attr( 'heading', __( 'Start with', 'doclap' ) ) ); ?><br>
				<em><?php echo esc_html( $attr( 'headingAccent', __( 'a greeting.', 'doclap' ) ) ); ?></em>
			</h1>
			<div class="hero-summary">
				<span class="hero-mark" aria-hidden="true">✳</span>
				<p class="lead"><?php echo esc_html( $attr( 'lead' ) ); ?></p>
			</div>
		</div>
	</section>
	<section class="section">
		<div class="container grid-2 contact-grid">
			<aside class="contact-aside">
				<span class="meta"><?php echo esc_html( $attr( 'asideMeta' ) ); ?></span>
				<h2><?php echo nl2br( esc_html( $attr( 'asideHeading' ) ) ); ?></h2>
				<p><?php echo esc_html( $attr( 'asideCopy' ) ); ?></p>
				<span class="meta"><?php esc_html_e( 'HOW I START', 'doclap' ); ?></span>
				<p>
					<?php foreach ( $steps as $index => $step ) : ?>
						<?php if ( $index > 0 ) : ?><br><?php endif; ?>
						<?php echo esc_html( is_string( $step ) ? $step : '' ); ?>
					<?php endforeach; ?>
				</p>
				<a
					class="text-link"
					href="<?php echo esc_url( doclap_resolve_url( $attr( 'asideLinkUrl', '/faq/' ) ) ); ?>"
				>
					<span><?php echo esc_html( $attr( 'asideLinkLabel' ) ); ?></span>
					<?php
					echo doclap_icon( 'arrow-up-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted helper.
					?>
				</a>
				<p class="form-note"><?php echo esc_html( $attr( 'formNote' ) ); ?></p>
			</aside>
			<form
				class="contact-form"
				data-doclap-contact-form="1"
				data-rest-url="<?php echo esc_url( rest_url( 'doclap/v1/contact' ) ); ?>"
				data-nonce="<?php echo esc_attr( $nonce ); ?>"
				data-rest-nonce="<?php echo esc_attr( $rest_nonce ); ?>"
				data-config="<?php echo esc_attr( $config_token ); ?>"
				data-sending-label="<?php echo esc_attr( $attr( 'sendingLabel', __( 'Sending…', 'doclap' ) ) ); ?>"
				data-success-message="<?php echo esc_attr( $attr( 'successMessage' ) ); ?>"
				data-error-message="<?php echo esc_attr( $attr( 'errorMessage' ) ); ?>"
				data-recaptcha="<?php echo $recaptcha_enabled ? '1' : '0'; ?>"
				data-recaptcha-site-key="<?php echo esc_attr( $recaptcha_enabled ? $attr( 'recaptchaSiteKey' ) : '' ); ?>"
				novalidate
			>
				<input type="hidden" name="_wpnonce" value="<?php echo esc_attr( $nonce ); ?>">
				<div class="field doclap-honeypot" aria-hidden="true">
					<label for="<?php echo esc_attr( $uid ); ?>-website"><?php esc_html_e( 'Website', 'doclap' ); ?></label>
					<input
						id="<?php echo esc_attr( $uid ); ?>-website"
						name="website"
						type="text"
						tabindex="-1"
						autocomplete="off"
					>
				</div>
				<div class="grid-2">
					<div class="field">
						<label for="<?php echo esc_attr( $uid ); ?>-name"><?php echo esc_html( $attr( 'nameLabel' ) ); ?></label>
						<input
							class="input"
							id="<?php echo esc_attr( $uid ); ?>-name"
							name="name"
							required
							autocomplete="name"
							maxlength="100"
							aria-describedby="<?php echo esc_attr( $uid ); ?>-name-error"
						>
						<span class="field-error" id="<?php echo esc_attr( $uid ); ?>-name-error"></span>
					</div>
					<div class="field">
						<label for="<?php echo esc_attr( $uid ); ?>-email"><?php echo esc_html( $attr( 'emailLabel' ) ); ?></label>
						<input
							class="input"
							id="<?php echo esc_attr( $uid ); ?>-email"
							name="email"
							type="email"
							required
							autocomplete="email"
							maxlength="200"
							aria-describedby="<?php echo esc_attr( $uid ); ?>-email-error"
						>
						<span class="field-error" id="<?php echo esc_attr( $uid ); ?>-email-error"></span>
					</div>
				</div>
				<div class="field">
					<label for="<?php echo esc_attr( $uid ); ?>-company"><?php echo esc_html( $attr( 'companyLabel' ) ); ?></label>
					<input
						class="input"
						id="<?php echo esc_attr( $uid ); ?>-company"
						name="company"
						autocomplete="organization"
						maxlength="200"
					>
				</div>
				<fieldset>
					<legend class="choice-label"><?php echo esc_html( $attr( 'servicesLabel' ) ); ?></legend>
					<div class="choice-group">
						<?php foreach ( $services as $service ) : ?>
							<?php
							if ( ! is_array( $service ) ) {
								continue;
							}
							$value = sanitize_text_field( (string) ( $service['value'] ?? '' ) );
							?>
							<label class="choice">
								<input type="checkbox" name="services[]" value="<?php echo esc_attr( $value ); ?>">
								<?php echo esc_html( (string) ( $service['label'] ?? $value ) ); ?>
							</label>
						<?php endforeach; ?>
					</div>
				</fieldset>
				<div class="field">
					<label for="<?php echo esc_attr( $uid ); ?>-message"><?php echo esc_html( $attr( 'messageLabel' ) ); ?></label>
					<textarea
						class="textarea"
						id="<?php echo esc_attr( $uid ); ?>-message"
						name="message"
						required
						minlength="20"
						maxlength="5000"
						placeholder="<?php echo esc_attr( $attr( 'messagePlaceholder' ) ); ?>"
						aria-describedby="<?php echo esc_attr( $uid ); ?>-message-error"
					></textarea>
					<span class="field-error" id="<?php echo esc_attr( $uid ); ?>-message-error"></span>
				</div>
				<label class="consent">
					<input
						type="checkbox"
						required
						name="consent"
						aria-describedby="<?php echo esc_attr( $uid ); ?>-consent-error"
					>
					<?php echo esc_html( $attr( 'consentLabel' ) ); ?>
				</label>
				<span class="field-error" id="<?php echo esc_attr( $uid ); ?>-consent-error"></span>
				<div class="row">
					<button class="btn btn-primary" type="submit">
						<span><?php echo esc_html( $attr( 'buttonLabel' ) ); ?></span>
						<?php
						echo doclap_icon( 'arrow-right' );
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted helper.
						?>
					</button>
				</div>
				<p class="status" role="status" aria-live="polite"></p>
			</form>
		</div>
	</section>
</div>
