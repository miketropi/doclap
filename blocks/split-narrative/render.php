<?php
/**
 * Server renderer for the Split narrative block.
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

$doclap_paragraphs = is_array( $attributes['paragraphs'] ?? null )
	? $attributes['paragraphs']
	: array();
$doclap_status     = (string) ( $attributes['statusNote'] ?? '' );
$doclap_link_label = (string) ( $attributes['linkLabel'] ?? '' );
$doclap_link_url   = (string) ( $attributes['linkUrl'] ?? '' );
$doclap_has_link   = '' !== $doclap_link_label && '' !== $doclap_link_url;
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
			'doclap-split-narrative',
			array( 'section' ),
		),
		'style' => $doclap_colour_style,
	),
);
// Saved content can still carry the split accent attribute; the editor folds it
// into the merged rich value and clears the legacy key on first save.
$doclap_heading = doclap_rich_accent(
	(string) ( $attributes['heading'] ?? '' ),
	(string) ( $attributes['headingAccent'] ?? '' ),
	'<br>',
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container grid-1-2 body-grid">
		<aside class="aside-title">
			<span><?php echo esc_html( (string) ( $attributes['label'] ?? '' ) ); ?></span>
			<h2 data-doclap-rich="heading"><?php echo doclap_rich( $doclap_heading ); ?></h2>
		</aside>
		<div>
			<div class="prose">
				<?php
				foreach ( $doclap_paragraphs as $doclap_paragraph ) :
					?>
					<p><?php echo doclap_rich( $doclap_paragraph ); ?></p>
				<?php endforeach; ?>
				<?php if ( '' !== $doclap_status ) : ?>
					<p data-doclap-rich="statusNote"><?php echo doclap_rich( $doclap_status ); ?></p>
				<?php endif; ?>
			</div>
			<?php if ( $doclap_has_link ) : ?>
				<a
					class="text-link"
					href="<?php echo esc_url( doclap_resolve_url( $doclap_link_url ) ); ?>"
				>
					<span data-doclap-rich="linkLabel"><?php echo doclap_rich( $doclap_link_label ); ?></span>
					<?php
					echo doclap_icon( 'arrow-up-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
					?>
				</a>
			<?php endif; ?>
		</div>
	</div>
</section>
