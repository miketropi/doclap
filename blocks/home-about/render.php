<?php
/**
 * Server renderer for the Doclap home about block.
 *
 * Text content stays on the same line as its tag — extra whitespace inside a
 * text-bearing element changes how the theme's `text-wrap` rules balance lines.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_services = is_array( $attributes['services'] ?? null ) ? $attributes['services'] : array();
$doclap_anchor   = (string) ( $attributes['anchor'] ?? '' );
$doclap_wrapper  = get_block_wrapper_attributes(
	array(
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'about',
		'class' => doclap_scope_class( 'doclap-home-about', array( 'section' ) ),
	),
);
$doclap_br   = static fn( string $value ): string => nl2br( esc_html( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container grid-1-2 about-grid">
		<div><p class="eyebrow"><?php echo esc_html( (string) ( $attributes['aboutEyebrow'] ?? '' ) ); ?></p><h2><?php echo esc_html( (string) ( $attributes['aboutHeading'] ?? '' ) ); ?></h2><p class="principle"><?php
			echo $doclap_br( (string) ( $attributes['aboutPrinciple'] ?? '' ) );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
		?></p></div>
		<div><p class="lead"><?php echo esc_html( (string) ( $attributes['aboutLead'] ?? '' ) ); ?></p><div class="discipline"><?php
			foreach ( $doclap_services as $doclap_index => $doclap_service ) :
				$doclap_service = is_array( $doclap_service ) ? $doclap_service : array();
				?><article class="log-row"><span class="meta"><?php
					echo esc_html(
					str_pad( (string) ( (int) $doclap_index + 1 ), 2, '0', STR_PAD_LEFT ),
				);
				?></span><div><h3><?php echo esc_html( (string) ( $doclap_service['title'] ?? '' ) ); ?></h3><p><?php echo esc_html( (string) ( $doclap_service['meta'] ?? '' ) ); ?></p></div><span class="pull"><?php
					echo $doclap_icon( 'arrow-up-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
				?></span></article><?php
			endforeach;
		?></div></div>
	</div>
</section>
