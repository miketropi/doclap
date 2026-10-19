<?php
/**
 * Server renderer for the Doclap home discipline band.
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

$doclap_disciplines = is_array( $attributes['disciplines'] ?? null )
	? $attributes['disciplines']
	: array();
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

$doclap_wrapper     = get_block_wrapper_attributes(
	array(
		'class' => doclap_scope_class(
			'doclap-home-disciplines',
			array( 'discipline-band', 'doclap-discipline' ),
		),
		'style' => $doclap_colour_style,
	),
);
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
?>
<div <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?> role="group" aria-label="<?php echo esc_attr__( 'Creative disciplines', 'doclap' ); ?>"><ul class="discipline-list"><?php
	foreach ( $doclap_disciplines as $doclap_index => $doclap_item ) :
		$doclap_item = is_array( $doclap_item ) ? $doclap_item : array();
		?><li class="discipline-item"><span class="discipline-number"><?php
			echo esc_html(
			str_pad( (string) ( (int) $doclap_index + 1 ), 2, '0', STR_PAD_LEFT ),
		);
		?></span><div class="discipline-copy"><span class="discipline-title"><?php
			echo doclap_rich( (string) ( $doclap_item['title'] ?? '' ) );
		?></span><span class="discipline-caption"><?php
			echo doclap_rich( (string) ( $doclap_item['caption'] ?? '' ) );
		?></span></div><span class="discipline-arrow"><?php
			echo $doclap_icon( 'arrow-up-right' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></span></li><?php
	endforeach;
?></ul></div>
