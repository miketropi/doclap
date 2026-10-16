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

$error_code           = (string) ( $attributes['errorCode'] ?? '404' );
$eyebrow              = (string) ( $attributes['eyebrow'] ?? 'SLIGHTLY OFF COURSE' );
$heading              = (string) ( $attributes['heading'] ?? 'A blank space.' );
$heading_accent       = (string) ( $attributes['headingAccent'] ?? 'Not the end point.' );
$lead                 = (string) (
	$attributes['lead']
	?? "This page does not exist or has moved.\nBut there is still much worth exploring."
);
$primary_label        = (string) ( $attributes['primaryLabel'] ?? 'Back to home' );
$primary_url          = doclap_resolve_url( (string) ( $attributes['primaryUrl'] ?? '' ) );
$secondary_label      = (string) ( $attributes['secondaryLabel'] ?? 'Find another direction' );
$secondary_url        = doclap_resolve_url( (string) ( $attributes['secondaryUrl'] ?? '@search' ) );
$aside_label          = (string) ( $attributes['asideLabel'] ?? 'KEEP WANDERING' );
$aside_heading        = (string) ( $attributes['asideHeading'] ?? 'Change direction.' );
$aside_heading_accent = (string) ( $attributes['asideHeadingAccent'] ?? 'Stay curious.' );
$links                = is_array( $attributes['links'] ?? null ) ? $attributes['links'] : array();
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
				<span>/</span>
				<span><?php echo esc_html( $eyebrow ); ?></span>
			</div>
			<div class="error-number" aria-label="Error 404"><?php echo esc_html( $error_code ); ?></div>
			<h1>
				<?php echo esc_html( $heading ); ?><br>
				<em><?php echo esc_html( $heading_accent ); ?></em>
			</h1>
			<p class="lead"><?php echo nl2br( esc_html( $lead ) ); ?></p>
			<div class="error-actions">
				<a class="btn btn-primary" href="<?php echo esc_url( $primary_url ); ?>">
					<span><?php echo esc_html( $primary_label ); ?></span>
					<?php
					echo doclap_icon( 'arrow-up-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
					?>
				</a>
				<a class="text-link" href="<?php echo esc_url( $secondary_url ); ?>">
					<span><?php echo esc_html( $secondary_label ); ?></span>
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
				<h2>
					<?php echo esc_html( $aside_heading ); ?><br>
					<?php echo esc_html( $aside_heading_accent ); ?>
				</h2>
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
