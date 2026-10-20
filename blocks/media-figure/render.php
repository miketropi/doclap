<?php
/**
 * Server renderer for the Media figure block.
 *
 * The image resolves from the media library first, then from the URL attribute,
 * and only falls back to the bundled studio photograph when both are empty, so a
 * block that never had an image still renders a figure instead of an empty one.
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

$doclap_image_id  = absint( $attributes['imageId'] ?? 0 );
$doclap_image_url = '';

if ( $doclap_image_id ) {
	$doclap_attachment_url = wp_get_attachment_image_url( $doclap_image_id, 'full' );

	if ( $doclap_attachment_url ) {
		$doclap_image_url = (string) $doclap_attachment_url;
	}
}

if ( '' === $doclap_image_url ) {
	$doclap_image_url = (string) ( $attributes['imageUrl'] ?? '' );
}

if ( '' === $doclap_image_url ) {
	$doclap_image_url = DOCLAP_URI . '/assets/images/studio-workspace.jpg';
}

$doclap_caption = (string) ( $attributes['caption'] ?? '' );
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
		'class' => doclap_scope_class(
			'doclap-media-figure',
			array( 'section' ),
		),
		'style' => $doclap_colour_style,
	),
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<figure class="studio-figure">
			<img
				class="content-img"
				src="<?php echo esc_url( $doclap_image_url ); ?>"
				width="1600"
				height="1068"
				alt="<?php echo esc_attr( (string) ( $attributes['imageAlt'] ?? '' ) ); ?>"
				loading="lazy"
			>
			<?php if ( '' !== $doclap_caption ) : ?>
				<figcaption><?php echo esc_html( $doclap_caption ); ?></figcaption>
			<?php endif; ?>
		</figure>
	</div>
</section>
