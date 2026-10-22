<?php
/**
 * Server renderer for the Newsletter signup block.
 *
 * Progressive enhancement only: the form validates natively, and every status
 * message is printed as a `data-*` attribute so `view.ts` carries no user-facing
 * literal. Nothing here waits for JavaScript — the idle message and the email
 * field are visible without it.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_attr = static function ( string $key, string $fallback = '' ) use ( $attributes ): string {
	return isset( $attributes[ $key ] ) && is_string( $attributes[ $key ] )
		? $attributes[ $key ]
		: $fallback;
};
$doclap_anchor = (string) ( $attributes['anchor'] ?? '' );
// Section colours are optional: an empty attribute emits nothing, so an unset
// colour keeps the theme's default for that property.
$doclap_colour_style = '';

foreach (
	array(
		'sectionBg'      => '--doclap-block-bg',
		'sectionHeading' => '--doclap-block-heading',
		'sectionText'    => '--doclap-block-text',
	) as $doclap_colour_attr => $doclap_colour_var
) {
	$doclap_colour_value = trim( (string) ( $attributes[ $doclap_colour_attr ] ?? '' ) );

	if ( '' !== $doclap_colour_value ) {
		$doclap_colour_style .= $doclap_colour_var . ':' . $doclap_colour_value . ';';
	}
}

$doclap_wrapper = get_block_wrapper_attributes(
	array(
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'newsletter',
		'class' => doclap_scope_class( 'doclap-newsletter-signup', array( 'section' ) ),
		'style' => $doclap_colour_style,
	),
);
// Saved content can still carry `newsletterHeadingAccent`; the editor folds the
// pair into the merged heading and clears the legacy key on the block's first
// save, so the renderer combines them until then.
$doclap_heading = doclap_rich_accent(
	(string) ( $attributes['newsletterHeading'] ?? '' ),
	(string) ( $attributes['newsletterHeadingAccent'] ?? '' ),
	'<br><em>',
);
// Every id a `for` or `aria-describedby` points at is derived from one
// per-instance prefix, so two newsletter blocks on one page never collide.
$doclap_uid = wp_unique_id( 'doclap-newsletter-' );
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container newsletter-layout">
		<div class="newsletter-copy">
			<p class="eyebrow"><?php echo esc_html( $doclap_attr( 'newsletterEyebrow' ) ); ?></p>
			<h2 data-doclap-rich="newsletterHeading"><?php echo doclap_rich( $doclap_heading ); ?></h2>
			<p data-doclap-rich="newsletterText"><?php echo doclap_rich( $doclap_attr( 'newsletterText' ) ); ?></p>
			<div class="newsletter-meta">
				<span><?php echo esc_html( $doclap_attr( 'metaPrimary' ) ); ?></span>
				<span><?php echo esc_html( $doclap_attr( 'metaSecondary' ) ); ?></span>
			</div>
		</div>

		<form
			class="newsletter-form"
			data-doclap-newsletter="1"
			aria-label="<?php echo esc_attr( $doclap_attr( 'formLabel' ) ); ?>"
			data-doclap-idle-status="<?php echo esc_attr( $doclap_attr( 'idleStatus' ) ); ?>"
			data-doclap-saved-status="<?php echo esc_attr( $doclap_attr( 'savedStatus' ) ); ?>"
			data-doclap-restored-status="<?php echo esc_attr( $doclap_attr( 'restoredStatus' ) ); ?>"
			data-doclap-removed-status="<?php echo esc_attr( $doclap_attr( 'removedStatus' ) ); ?>"
			data-doclap-unavailable-status="<?php echo esc_attr( $doclap_attr( 'unavailableStatus' ) ); ?>"
			data-doclap-save-failed-status="<?php echo esc_attr( $doclap_attr( 'saveFailedStatus' ) ); ?>"
			data-doclap-remove-failed-status="<?php echo esc_attr( $doclap_attr( 'removeFailedStatus' ) ); ?>"
		>
			<div class="field">
				<label for="<?php echo esc_attr( $doclap_uid ); ?>-email"><?php echo esc_html( $doclap_attr( 'emailLabel' ) ); ?></label>
				<div class="newsletter-entry">
					<input
						class="input"
						type="email"
						id="<?php echo esc_attr( $doclap_uid ); ?>-email"
						name="email"
						placeholder="<?php echo esc_attr( $doclap_attr( 'emailPlaceholder' ) ); ?>"
						autocomplete="email"
						maxlength="254"
						required
						aria-describedby="<?php echo esc_attr( $doclap_uid ); ?>-disclosure <?php echo esc_attr( $doclap_uid ); ?>-status"
					>
					<button type="submit">
						<span><?php echo esc_html( $doclap_attr( 'submitLabel' ) ); ?></span>
						<?php
						echo doclap_icon( 'arrow-right' );
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
						?>
					</button>
				</div>
			</div>
			<label class="consent" for="<?php echo esc_attr( $doclap_uid ); ?>-consent">
				<input type="checkbox" id="<?php echo esc_attr( $doclap_uid ); ?>-consent" name="consent" required>
				<span><?php echo esc_html( $doclap_attr( 'consentLabel' ) ); ?></span>
			</label>
			<p class="form-note" id="<?php echo esc_attr( $doclap_uid ); ?>-disclosure"><?php echo esc_html( $doclap_attr( 'disclosure' ) ); ?></p>
			<p class="status" id="<?php echo esc_attr( $doclap_uid ); ?>-status" role="status" aria-live="polite" aria-atomic="true"><?php echo esc_html( $doclap_attr( 'idleStatus' ) ); ?></p>
			<button type="button" class="newsletter-reset" id="<?php echo esc_attr( $doclap_uid ); ?>-reset" hidden><?php echo esc_html( $doclap_attr( 'removeLabel' ) ); ?></button>
		</form>
	</div>
</section>
