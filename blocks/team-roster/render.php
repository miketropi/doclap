<?php
/**
 * Server renderer for the Doclap team roster block.
 *
 * The figure's image resolves from the media library first — the attachment keeps
 * `srcset` and the intrinsic dimensions — then from the stored URL, and only then
 * from the theme's bundled studio photograph, so a freshly inserted block shows
 * the section the copy describes instead of a figure with no image in it. The
 * reference's inline base64 photograph is deliberately not shipped.
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

$doclap_cards  = is_array( $attributes['teamCards'] ?? null ) ? array_values( $attributes['teamCards'] ) : array();
$doclap_anchor = (string) ( $attributes['anchor'] ?? '' );
$doclap_caption = (string) ( $attributes['teamImageCaption'] ?? '' );
$doclap_note    = (string) ( $attributes['teamNote'] ?? '' );
$doclap_meta    = (string) ( $attributes['teamMeta'] ?? '' );
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

$doclap_wrapper = get_block_wrapper_attributes(
	array(
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'team',
		'class' => doclap_scope_class( 'doclap-team-roster', array( 'section' ) ),
		'style' => $doclap_colour_style,
	),
);

/**
 * The figure's image element.
 *
 * The attachment path lets core write the intrinsic dimensions from its own
 * metadata; the stored URL and the bundled fallback carry the reference's
 * 1600×1068 dimensions so the column never reflows while the image loads.
 */
$doclap_image = ( static function () use ( $attributes ): string {
	$doclap_image_id  = absint( $attributes['teamImageId'] ?? 0 );
	$doclap_image_url = trim( (string) ( $attributes['teamImageUrl'] ?? '' ) );
	$doclap_image_alt = (string) ( $attributes['teamImageAlt'] ?? '' );

	if ( $doclap_image_id > 0 ) {
		$doclap_attachment = wp_get_attachment_image(
			$doclap_image_id,
			'full',
			false,
			array(
				'class'    => 'content-img',
				'alt'      => $doclap_image_alt,
				'loading'  => 'lazy',
				'decoding' => 'async',
			),
		);

		if ( '' !== $doclap_attachment ) {
			return (string) $doclap_attachment;
		}
	}

	if ( '' === $doclap_image_url ) {
		// Last resort: the theme's bundled studio photograph, never the
		// reference's inline base64 JPEG. A theme that ships without it renders
		// no figure at all rather than a broken image.
		if ( ! is_readable( DOCLAP_DIR . '/assets/images/studio-workspace.jpg' ) ) {
			return '';
		}

		$doclap_image_url = DOCLAP_URI . '/assets/images/studio-workspace.jpg';
	}

	return sprintf(
		'<img class="content-img" src="%1$s" width="1600" height="1068" alt="%2$s" loading="lazy" decoding="async">',
		esc_url( $doclap_image_url ),
		esc_attr( $doclap_image_alt ),
	);
} )();
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<div class="section-head"><div><p class="eyebrow"><?php
			echo esc_html( (string) ( $attributes['teamEyebrow'] ?? '' ) );
		?></p><h2 data-doclap-rich="teamHeading"><?php
			echo doclap_rich(
			doclap_rich_accent(
				(string) ( $attributes['teamHeading'] ?? '' ),
				(string) ( $attributes['teamHeadingAccent'] ?? '' ),
			),
		);
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by `doclap_rich()`.
		?></h2></div><?php
		if ( '' !== trim( (string) ( $attributes['teamDescription'] ?? '' ) ) ) :
			?><p class="section-description" data-doclap-rich="teamDescription"><?php
				echo doclap_rich( (string) ( $attributes['teamDescription'] ?? '' ) );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by `doclap_rich()`.
			?></p><?php
		endif;
		if ( '' !== trim( $doclap_meta ) ) :
			?><span class="meta"><?php echo esc_html( $doclap_meta ); ?></span><?php
		endif;
		?></div>
		<div class="team-layout"><?php
		if ( '' !== $doclap_image ) :
			?><figure class="team-image"><?php
				echo $doclap_image;
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the image branch above.
				if ( '' !== $doclap_caption ) :
					?><figcaption><?php echo esc_html( $doclap_caption ); ?></figcaption><?php
				endif;
			?></figure><?php
		endif;
			?><div><?php
			foreach ( $doclap_cards as $doclap_card ) :
				$doclap_card = is_array( $doclap_card ) ? $doclap_card : array();
				?><article class="role-card"><span class="meta"><?php
					echo esc_html( (string) ( $doclap_card['meta'] ?? '' ) );
				?></span><div><h3><?php
					echo doclap_rich( (string) ( $doclap_card['title'] ?? '' ) );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by `doclap_rich()`.
				?></h3><p><?php
					echo doclap_rich( (string) ( $doclap_card['copy'] ?? '' ) );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by `doclap_rich()`.
				?></p></div></article><?php
			endforeach;
			if ( '' !== trim( $doclap_note ) ) :
				?><p class="team-note"><?php echo esc_html( $doclap_note ); ?></p><?php
			endif;
			?></div>
		</div>
	</div>
</section>
