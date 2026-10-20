<?php
/**
 * Server renderer for the Principles grid block.
 *
 * An empty list is a valid state: the panel keeps its eyebrow and heading and
 * the grid stays empty rather than inventing cards.
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

$doclap_principles = is_array( $attributes['principles'] ?? null )
	? $attributes['principles']
	: array();
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
			'doclap-principles-grid',
			array( 'section', 'dark-panel' ),
		),
		'style' => $doclap_colour_style,
	),
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<div class="section-head">
			<div>
				<p class="eyebrow"><?php echo esc_html( (string) ( $attributes['eyebrow'] ?? '' ) ); ?></p>
				<h2 data-doclap-rich="heading"><?php echo doclap_rich( (string) ( $attributes['heading'] ?? '' ) ); ?></h2>
			</div>
		</div>
		<div class="grid-3">
			<?php foreach ( $doclap_principles as $doclap_principle ) : ?>
				<?php
				if ( ! is_array( $doclap_principle ) ) {
					continue;
				}
				?>
				<article class="feature card-flat">
					<span class="meta"><?php echo esc_html( (string) ( $doclap_principle['label'] ?? '' ) ); ?></span>
					<h3><?php echo doclap_rich( (string) ( $doclap_principle['title'] ?? '' ) ); ?></h3>
					<p><?php echo doclap_rich( (string) ( $doclap_principle['copy'] ?? '' ) ); ?></p>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
