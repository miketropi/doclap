<?php
/**
 * Server renderer for the Doclap home process block.
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

$doclap_steps   = is_array( $attributes['processSteps'] ?? null )
	? $attributes['processSteps']
	: array();
$doclap_anchor  = (string) ( $attributes['anchor'] ?? '' );
$doclap_wrapper = get_block_wrapper_attributes(
	array(
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'process',
		'class' => doclap_scope_class( 'doclap-home-process', array( 'section', 'process' ) ),
	),
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<div class="section-head">
			<div><p class="eyebrow"><?php echo esc_html( (string) ( $attributes['processEyebrow'] ?? '' ) ); ?></p><h2><?php echo esc_html( (string) ( $attributes['processHeading'] ?? '' ) ); ?></h2></div>
		</div>
		<?php foreach ( $doclap_steps as $doclap_index => $doclap_step ) : ?>
			<?php $doclap_step = is_array( $doclap_step ) ? $doclap_step : array(); ?>
			<div class="process-row"><span class="meta"><?php
				echo esc_html(
					str_pad( (string) ( (int) $doclap_index + 1 ), 2, '0', STR_PAD_LEFT ),
				);
			?></span><h3><?php echo esc_html( (string) ( $doclap_step['title'] ?? '' ) ); ?></h3><p><?php echo esc_html( (string) ( $doclap_step['copy'] ?? '' ) ); ?></p></div>
		<?php endforeach; ?>
	</div>
</section>
