<?php
/**
 * Server-side rendering for the Not Found block.
 *
 * @var array<string, mixed> $attributes Block attributes.
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$error_code           = (string) ( $attributes['errorCode'] ?? __( '404', 'doclap' ) );
$eyebrow              = (string) ( $attributes['eyebrow'] ?? __( 'SLIGHTLY OFF COURSE', 'doclap' ) );
$lead                 = (string) (
	$attributes['lead']
	?? __( 'This page does not exist or has moved.<br>But there is still much worth exploring.', 'doclap' )
);
$primary_label        = (string) ( $attributes['primaryLabel'] ?? __( 'Back to home', 'doclap' ) );
$primary_url          = doclap_resolve_url( (string) ( $attributes['primaryUrl'] ?? '' ) );
$secondary_label      = (string) ( $attributes['secondaryLabel'] ?? __( 'Find another direction', 'doclap' ) );
$secondary_url        = doclap_resolve_url( (string) ( $attributes['secondaryUrl'] ?? '@search' ) );
$aside_label          = (string) ( $attributes['asideLabel'] ?? __( 'KEEP WANDERING', 'doclap' ) );
$links                = is_array( $attributes['links'] ?? null ) ? $attributes['links'] : array();
// Saved content can still carry the split accent attributes; the editor folds
// them into the merged rich values and clears the legacy keys on first save.
$heading              = doclap_rich_accent(
	(string) ( $attributes['heading'] ?? __( 'A blank space.<br><em>Not the end point.</em>', 'doclap' ) ),
	(string) ( $attributes['headingAccent'] ?? '' ),
	'<br><em>',
);
$aside_heading        = doclap_rich_accent(
	(string) ( $attributes['asideHeading'] ?? __( 'Change direction.<br>Stay curious.', 'doclap' ) ),
	(string) ( $attributes['asideHeadingAccent'] ?? '' ),
	'<br>',
);
$doclap_wrapper       = get_block_wrapper_attributes(
	array( 'class' => doclap_scope_class( 'doclap-not-found' ) ),
);
?>
<div <?php echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.?>>
	<section class="section inner-hero error-hero">
		<div class="container">
			<div class="breadcrumb">
				<a href="<?php echo esc_url( doclap_resolve_url( '' ) ); ?>">
					<?php echo esc_html__( 'độc lập', 'doclap' ); ?>
				</a>
				<span aria-hidden="true">/</span>
				<span><?php echo esc_html( $eyebrow ); ?></span>
			</div>
			<div class="error-number" role="img" aria-label="<?php echo esc_attr( sprintf( __( 'Error %s', 'doclap' ), $error_code ) ); ?>"><?php echo esc_html( $error_code ); ?></div>
			<h1 data-doclap-rich="heading"><?php echo doclap_rich( $heading ); ?></h1>
			<p class="lead" data-doclap-rich="lead"><?php echo doclap_rich( $lead ); ?></p>
			<div class="error-actions">
				<a class="btn btn-primary" href="<?php echo esc_url( $primary_url ); ?>">
					<span data-doclap-rich="primaryLabel"><?php echo doclap_rich( $primary_label ); ?></span>
					<?php
					echo doclap_icon( 'arrow-up-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
					?>
				</a>
				<a class="text-link" href="<?php echo esc_url( $secondary_url ); ?>">
					<span data-doclap-rich="secondaryLabel"><?php echo doclap_rich( $secondary_label ); ?></span>
					<?php
					echo doclap_icon( 'arrow-up-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
					?>
				</a>
			</div>
		</div>
	</section>
	<section class="section">
		<div class="container grid-1-2 body-grid">
			<div class="aside-title">
				<span><?php echo esc_html( $aside_label ); ?></span>
				<h2 data-doclap-rich="asideHeading"><?php echo doclap_rich( $aside_heading ); ?></h2>
			</div>
			<div class="index-grid">
				<?php foreach ( $links as $link ) : ?>
					<?php
					if ( ! is_array( $link ) ) {
						continue;
					}
					$link_label = (string) ( $link['label'] ?? '' );
					$link_url   = doclap_resolve_url( (string) ( $link['url'] ?? '' ) );
					?>
					<a class="text-link" href="<?php echo esc_url( $link_url ); ?>">
						<span><?php echo esc_html( $link_label ); ?></span>
						<?php
						echo doclap_icon( 'arrow-up-right' );
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
						?>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</section>
</div>
