<?php
/**
 * Server renderer for the Doclap home contact block.
 *
 * Content whitespace mirrors the former single landing block exactly: extra or
 * missing whitespace between inline children changes how the theme's `text-wrap`
 * rules balance lines.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_anchor  = (string) ( $attributes['anchor'] ?? '' );
$doclap_wrapper = get_block_wrapper_attributes(
	array(
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'contact',
		'class' => doclap_scope_class( 'doclap-home-contact', array( 'section', 'contact' ) ),
	),
);
$doclap_url  = static fn( string $value ): string => esc_url( doclap_resolve_url( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>><div class="container"><p class="eyebrow"><?php
	echo esc_html( (string) ( $attributes['contactEyebrow'] ?? '' ) );
?></p><h2><?php
	echo esc_html( (string) ( $attributes['contactHeading'] ?? '' ) );
?><br><em><?php
	echo esc_html( (string) ( $attributes['contactHeadingAccent'] ?? '' ) );
?></em></h2><p class="lead"><?php
	echo esc_html( (string) ( $attributes['contactLead'] ?? '' ) );
?></p><a class="btn btn-primary" href="<?php
	echo $doclap_url( (string) ( $attributes['contactCtaUrl'] ?? '' ) );
?>"><?php
	echo esc_html( (string) ( $attributes['contactCtaLabel'] ?? '' ) );
?> <?php
	echo $doclap_icon( 'arrow-up-right' );
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
?></a></div></section>
