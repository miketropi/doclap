<?php
/**
 * Server renderer for the Closing call to action block.
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

// Saved content can still carry the split accent attributes; the editor folds
// them into the merged rich values and clears the legacy keys on first save.
$doclap_heading = doclap_rich_accent(
	(string) ( $attributes['heading'] ?? '' ),
	(string) ( $attributes['headingAccent'] ?? '' ),
	'<br><em>',
);
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
			'doclap-closing-cta',
			array( 'section', 'closing' ),
		),
		'style' => $doclap_colour_style,
	),
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container row-between">
		<div>
			<p class="eyebrow"><?php echo esc_html( (string) ( $attributes['eyebrow'] ?? '' ) ); ?></p>
			<h2 data-doclap-rich="heading"><?php echo doclap_rich( $doclap_heading ); ?></h2>
		</div>
		<a class="circle-cta" href="<?php echo esc_url( doclap_resolve_url( (string) ( $attributes['ctaUrl'] ?? '' ) ) ); ?>">
			<span data-doclap-rich="ctaLabel"><?php echo doclap_rich( (string) ( $attributes['ctaLabel'] ?? '' ) ); ?></span>
			<?php
			echo doclap_icon( 'arrow-up-right' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?>
		</a>
	</div>
</section>
