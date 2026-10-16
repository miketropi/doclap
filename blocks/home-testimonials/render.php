<?php
/**
 * Server renderer for the Doclap home testimonials block.
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

$doclap_voices  = is_array( $attributes['testimonials'] ?? null )
	? $attributes['testimonials']
	: array();
$doclap_total   = count( $doclap_voices );
$doclap_anchor  = (string) ( $attributes['anchor'] ?? '' );
$doclap_wrapper = get_block_wrapper_attributes(
	array(
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'testimonials',
		'class' => doclap_scope_class( 'doclap-home-testimonials', array( 'section', 'voices' ) ),
	),
);
$doclap_br   = static fn( string $value ): string => nl2br( esc_html( $value ) );
$doclap_url  = static fn( string $value ): string => esc_url( doclap_resolve_url( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>><div class="container"><div class="section-head"><div><p class="eyebrow"><?php
	echo esc_html( (string) ( $attributes['testimonialsEyebrow'] ?? '' ) );
?></p><h2><?php
	echo esc_html( (string) ( $attributes['testimonialsHeading'] ?? '' ) );
?><br><em><?php
	echo esc_html( (string) ( $attributes['testimonialsHeadingAccent'] ?? '' ) );
?></em></h2></div><p class="voices-intro"><?php
	echo $doclap_br( (string) ( $attributes['testimonialsIntro'] ?? '' ) );
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
?></p></div><div class="voices-carousel" role="group" aria-roledescription="carousel" aria-label="<?php echo esc_attr__( 'Client perspective', 'doclap' ); ?>"><div class="voices-viewport"><div class="voices-track"><?php
	foreach ( $doclap_voices as $doclap_index => $doclap_voice ) :
		$doclap_voice = is_array( $doclap_voice ) ? $doclap_voice : array();
		$doclap_name  = sprintf( 'Perspective %1$d of %2$d', (int) $doclap_index + 1, $doclap_total );
		?><article class="voice-card voice-slide" aria-roledescription="slide" aria-label="<?php echo esc_attr( $doclap_name ); ?>"><div class="voice-top"><span class="voice-label">CLIENT PERSPECTIVE</span><?php
			echo $doclap_icon( 'quote' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></div><div class="voice-rating" aria-label="No rating yet"><span class="rating-stars" aria-hidden="true"><?php
			for ( $doclap_star = 0; $doclap_star < 5; $doclap_star++ ) {
				echo $doclap_icon( 'star' );
			}
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></span><span>Not rated yet</span></div><h3 class="voice-statement">“<?php
			echo esc_html( (string) ( $doclap_voice['statement'] ?? '' ) );
		?> <em><?php
			echo esc_html( (string) ( $doclap_voice['statementAccent'] ?? '' ) );
		?></em>”</h3><p class="voice-disclaimer"><?php
			echo esc_html( (string) ( $doclap_voice['disclaimer'] ?? '' ) );
		?></p><div class="voice-person"><div class="voice-avatar" role="img" aria-label="No client avatar yet"><?php
			echo $doclap_icon( 'user-round' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></div><div class="voice-identity"><strong><?php
			echo esc_html( (string) ( $doclap_voice['status'] ?? '' ) );
		?></strong><span>Role · <?php
			echo esc_html( (string) ( $doclap_voice['role'] ?? '' ) );
		?></span><span>Company · <?php
			echo esc_html( (string) ( $doclap_voice['company'] ?? '' ) );
		?></span></div>
<div class="voice-socials" aria-label="No social profile provided">
	<button type="button" disabled aria-label="LinkedIn not provided"><?php
		echo $doclap_icon( 'linkedin' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
	?></button><button type="button" disabled aria-label="No website provided"><?php
		echo $doclap_icon( 'globe' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
	?></button></div></div></article><?php
	endforeach;
?></div></div></div>
<aside class="voice-editorial">
	<div class="voice-editorial-head">
		<span class="voice-label"><?php
			echo esc_html( (string) ( $attributes['editorialLabel'] ?? '' ) );
		?></span><div class="voice-editorial-main"><span class="voice-asterisk">*</span><h3><?php
			echo $doclap_br( (string) ( $attributes['editorialTitle'] ?? '' ) );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
		?><br><em><?php
			echo esc_html( (string) ( $attributes['editorialTitleAccent'] ?? '' ) );
		?></em></h3></div></div><div class="voice-editorial-aside"><p><?php
			echo esc_html( (string) ( $attributes['editorialCopy'] ?? '' ) );
		?></p><a class="voice-request" href="<?php
			echo $doclap_url( (string) ( $attributes['editorialLinkUrl'] ?? '' ) );
		?>"><span><?php
			echo esc_html( (string) ( $attributes['editorialLinkLabel'] ?? '' ) );
		?></span><?php
			echo $doclap_icon( 'arrow-up-right' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></a></div></aside>
<div class="voices-note">
	<span class="gallery-dot"></span>
	<span>Transparent down to the smallest detail — no identities or testimonials are fabricated.</span>
</div></div></section>
