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
/*
 * Two card layouts: `voices` is the anatomy this block has always rendered and
 * `preview` is the editorial quote card of the design source. An unrecognised
 * value keeps `voices`, so content saved before this attribute existed renders
 * exactly as it did.
 */
$doclap_is_preview = 'preview' === (string) ( $attributes['testimonialsVariant'] ?? 'voices' );
// Section colours: the attribute values land as custom properties on the block
// root, and an empty attribute emits nothing so the theme default keeps applying.
$doclap_colour_style = '';

foreach (
	array(
		'sectionBg'      => '--doclap-block-bg',
		'sectionHeading' => '--doclap-block-heading',
		'sectionText'    => '--doclap-block-text',
	) as $doclap_attr => $doclap_var
) {
	$doclap_value = trim( (string) ( $attributes[ $doclap_attr ] ?? '' ) );

	if ( '' !== $doclap_value ) {
		$doclap_colour_style .= $doclap_var . ':' . $doclap_value . ';';
	}
}

$doclap_wrapper_attributes = array(
	'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'testimonials',
	'class' => doclap_scope_class(
		'doclap-home-testimonials',
		$doclap_is_preview ? array( 'section', 'voices-preview' ) : array( 'section', 'voices' ),
	),
	'style' => $doclap_colour_style,
);

$doclap_wrapper = get_block_wrapper_attributes( $doclap_wrapper_attributes );
$doclap_url  = static fn( string $value ): string => esc_url( doclap_resolve_url( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>><div class="container"><?php
/*
 * The preview layout groups its heading row and its strip in one element: that
 * element is the root the shared carousel runtime boots on, exactly as
 * `.voices-carousel` is for the voices layout. The voices layout emits no such
 * element, so this stays inside the variant guard.
 */
if ( $doclap_is_preview && $doclap_total > 0 ) :
	?><div class="carousel-preview" role="group" aria-roledescription="carousel" aria-label="<?php
	echo esc_attr__( 'Client perspective layout previews', 'doclap' );
	?>" data-doclap-carousel><?php
endif;
?><div class="section-head"><div><p class="eyebrow"><?php
	echo esc_html( (string) ( $attributes['testimonialsEyebrow'] ?? '' ) );
?></p><h2 data-doclap-rich="testimonialsHeading"><?php
	echo doclap_rich( doclap_rich_accent( (string) ( $attributes['testimonialsHeading'] ?? '' ), (string) ( $attributes['testimonialsHeadingAccent'] ?? '' ), '<br><em>' ) );
?></h2><?php
/*
 * Preview layout: the editorial card of the design source. The step controls
 * move into the heading row, the counter becomes a live region and the closing
 * note replaces the editorial aside. Every hook the shared runtime reads is
 * kept — viewport, slide class, counter, step buttons and bar — so `view.ts`
 * drives this markup without knowing which variant rendered it.
 */
if ( $doclap_is_preview && $doclap_total > 0 ) :
	?><div class="carousel-controls" data-doclap-carousel-bar><span class="meta" data-doclap-carousel-count aria-live="polite"><?php
		echo esc_html( sprintf( '%1$s / %2$s', doclap_ordinal( 0 ), doclap_ordinal( max( 0, $doclap_total - 1 ) ) ) );
	?></span><button type="button" class="round-button" data-doclap-carousel-prev aria-label="<?php
		echo esc_attr__( 'Previous perspectives', 'doclap' );
	?>" disabled><?php
		echo $doclap_icon( 'arrow-left' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
	?></button><button type="button" class="round-button" data-doclap-carousel-next aria-label="<?php
		echo esc_attr__( 'Next perspectives', 'doclap' );
	?>"><?php
		echo $doclap_icon( 'arrow-right' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
	?></button></div><?php
endif;
?></div><?php
if ( $doclap_is_preview ) :
	if ( $doclap_total > 0 ) :
		?><div class="carousel-viewport" role="group" aria-label="<?php
		echo esc_attr__( 'Testimonial previews; use arrow keys to browse', 'doclap' );
		?>" tabindex="0" data-doclap-carousel-viewport><?php
		foreach ( $doclap_voices as $doclap_index => $doclap_voice ) :
			$doclap_voice       = is_array( $doclap_voice ) ? $doclap_voice : array();
			$doclap_card_label  = trim( (string) ( $doclap_voice['label'] ?? '' ) );
			$doclap_person_note = trim( (string) ( $doclap_voice['personNote'] ?? '' ) );
			?><article class="carousel-card voice-demo voice-slide" aria-roledescription="slide" aria-label="<?php
			echo esc_attr( sprintf( __( 'Perspective %1$d of %2$d', 'doclap' ), (int) $doclap_index + 1, $doclap_total ) );
			?>"><div class="voice-top"><span class="meta"><?php
			echo esc_html( '' !== $doclap_card_label ? $doclap_card_label : __( 'CLIENT PERSPECTIVE', 'doclap' ) );
			?></span><span class="meta"><?php
			echo esc_html( trim( (string) ( $doclap_voice['previewLabel'] ?? '' ) ) );
			?></span></div><blockquote><?php
			echo doclap_rich( (string) ( $doclap_voice['quote'] ?? '' ) );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
			?></blockquote><p><?php
			echo doclap_rich( (string) ( $doclap_voice['disclaimer'] ?? '' ) );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
			?></p><div class="voice-person"><div class="voice-avatar" role="img" aria-label="<?php
			echo esc_attr__( 'Portrait not published', 'doclap' );
			?>"><?php
			echo $doclap_icon( 'user-round' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></div><div><strong><?php
			echo esc_html( (string) ( $doclap_voice['status'] ?? '' ) );
			?></strong><small><?php
			echo esc_html( $doclap_person_note );
			?></small></div></div><div class="voice-caption"><span><?php
			echo esc_html( trim( (string) ( $doclap_voice['captionLeft'] ?? '' ) ) );
			?></span><span><?php
			echo esc_html( trim( (string) ( $doclap_voice['captionRight'] ?? '' ) ) );
			?></span></div></article><?php
		endforeach;
		?></div></div><?php
	endif;

	$doclap_note = trim( (string) ( $attributes['testimonialsNote'] ?? '' ) );

	if ( '' !== $doclap_note ) :
		?><p class="pricing-note" data-doclap-rich="testimonialsNote"><?php
		echo doclap_rich( $doclap_note );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
		?></p><?php
	endif;
else :
	// —— voices layout: unchanged ——
	?><p class="voices-intro" data-doclap-rich="testimonialsIntro"><?php
	echo doclap_rich( (string) ( $attributes['testimonialsIntro'] ?? '' ) );
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
?></p></div><div class="voices-carousel" role="group" aria-roledescription="carousel" aria-label="<?php echo esc_attr__( 'Client perspective', 'doclap' ); ?>" data-doclap-carousel><div class="voices-viewport" tabindex="0" data-doclap-carousel-viewport><div class="voices-track"><?php
	foreach ( $doclap_voices as $doclap_index => $doclap_voice ) :
		$doclap_voice = is_array( $doclap_voice ) ? $doclap_voice : array();
		?><article class="voice-card voice-slide" aria-roledescription="slide" aria-label="<?php echo esc_attr( sprintf( __( 'Perspective %1$d of %2$d', 'doclap' ), (int) $doclap_index + 1, $doclap_total ) ); ?>"><div class="voice-top"><span class="voice-label"><?php esc_html_e( 'CLIENT PERSPECTIVE', 'doclap' ); ?></span><?php
			echo $doclap_icon( 'quote' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></div><div class="voice-rating" role="group" aria-label="<?php echo esc_attr__( 'No rating yet', 'doclap' ); ?>"><span class="rating-stars" aria-hidden="true"><?php
			for ( $doclap_star = 0; $doclap_star < 5; $doclap_star++ ) {
				echo $doclap_icon( 'star' );
			}
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></span><span><?php esc_html_e( 'Not rated yet', 'doclap' ); ?></span></div><h3 class="voice-statement">“<?php
			echo doclap_rich( doclap_rich_accent( (string) ( $doclap_voice['statement'] ?? '' ), (string) ( $doclap_voice['statementAccent'] ?? '' ), ' <em>' ) );
		?>”</h3><p class="voice-disclaimer"><?php
			echo doclap_rich( (string) ( $doclap_voice['disclaimer'] ?? '' ) );
		?></p><div class="voice-person"><div class="voice-avatar" role="img" aria-label="<?php echo esc_attr__( 'No client avatar yet', 'doclap' ); ?>"><?php
			echo $doclap_icon( 'user-round' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></div><div class="voice-identity"><strong><?php
			echo esc_html( (string) ( $doclap_voice['status'] ?? '' ) );
		?></strong><span><?php
			echo esc_html( sprintf( __( 'Role · %s', 'doclap' ), (string) ( $doclap_voice['role'] ?? '' ) ) );
		?></span><span><?php
			echo esc_html( sprintf( __( 'Company · %s', 'doclap' ), (string) ( $doclap_voice['company'] ?? '' ) ) );
		?></span></div>
<div class="voice-socials" role="group" aria-label="<?php echo esc_attr__( 'No social profile provided', 'doclap' ); ?>">
	<span class="voice-social" aria-hidden="true"><?php
		echo $doclap_icon( 'linkedin' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
	?></span><span class="voice-social" aria-hidden="true"><?php
		echo $doclap_icon( 'globe' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
	?></span></div></div></article><?php
	endforeach;
?></div></div><div class="voices-bar" data-doclap-carousel-bar><p class="voices-count" aria-hidden="true" data-doclap-carousel-count><?php
		echo esc_html( sprintf( '%1$s / %2$s', doclap_ordinal( 0 ), doclap_ordinal( max( 0, $doclap_total - 1 ) ) ) );
	?></p><div class="voices-controls"><button type="button" class="icon-button" data-doclap-carousel-prev aria-label="<?php echo esc_attr__( 'Previous perspectives', 'doclap' ); ?>" disabled><?php
		echo $doclap_icon( 'arrow-left' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
	?></button><button type="button" class="icon-button" data-doclap-carousel-next aria-label="<?php echo esc_attr__( 'Next perspectives', 'doclap' ); ?>"><?php
		echo $doclap_icon( 'arrow-right' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
	?></button></div></div></div>
<aside class="voice-editorial">
	<div class="voice-editorial-head">
		<span class="voice-label"><?php
			echo esc_html( (string) ( $attributes['editorialLabel'] ?? '' ) );
		?></span><div class="voice-editorial-main"><span class="voice-asterisk">*</span><h3 data-doclap-rich="editorialTitle"><?php
			// Legacy saved content keeps its line breaks as `\n`, which the old
			// renderer turned into `<br />`: nl2br() keeps that byte-identical.
			echo doclap_rich( doclap_rich_accent( nl2br( (string) ( $attributes['editorialTitle'] ?? '' ) ), (string) ( $attributes['editorialTitleAccent'] ?? '' ), '<br><em>' ) );
		?></h3></div></div><div class="voice-editorial-aside"><p data-doclap-rich="editorialCopy"><?php
			echo doclap_rich( (string) ( $attributes['editorialCopy'] ?? '' ) );
		?></p><a class="voice-request" href="<?php
			echo $doclap_url( (string) ( $attributes['editorialLinkUrl'] ?? '' ) );
		?>"><span data-doclap-rich="editorialLinkLabel"><?php
			echo doclap_rich( (string) ( $attributes['editorialLinkLabel'] ?? '' ) );
		?></span><?php
			echo $doclap_icon( 'arrow-up-right' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></a></div></aside>
<div class="voices-note">
	<span class="gallery-dot"></span>
	<span><?php esc_html_e( 'Transparent down to the smallest detail — no identities or testimonials are fabricated.', 'doclap' ); ?></span>
</div><?php
endif;
?></div></section>
