<?php
/**
 * Server renderer for the Doclap plan comparison block.
 *
 * The table is a real table: a header row that names the engagement, one
 * `th[scope="colgroup"]` row per group and one `th[scope="row"]` per
 * consideration, so the matrix is navigable by a screen reader in a way a grid of
 * divs is not. Cells are plain text, except a row flagged `isNumeric`, whose cells
 * carry the figure style the design system already uses for numbers.
 *
 * Content whitespace mirrors the ported section exactly: extra or missing
 * whitespace between inline children changes how the theme's `text-wrap` rules
 * balance lines.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_groups  = is_array( $attributes['groups'] ?? null ) ? $attributes['groups'] : array();
$doclap_columns = is_array( $attributes['columns'] ?? null ) ? $attributes['columns'] : array();
$doclap_anchor  = (string) ( $attributes['anchor'] ?? '' );
$doclap_note    = trim( (string) ( $attributes['note'] ?? '' ) );
$doclap_label   = trim( (string) ( $attributes['linkLabel'] ?? '' ) );
// The group heading spans the consideration column plus one column per plan.
$doclap_colspan = (string) ( 1 + count( $doclap_columns ) );
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
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'comparison',
		'class' => doclap_scope_class( 'doclap-plan-comparison', array( 'section' ) ),
		'style' => $doclap_colour_style,
	),
);
$doclap_url  = static fn( string $value ): string => esc_url( doclap_resolve_url( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
// Saved content can still carry `compareHeadingAccent`; the editor folds the pair
// into the merged heading and clears the legacy key on the block's first save.
$doclap_heading = doclap_rich_accent(
	(string) ( $attributes['compareHeading'] ?? '' ),
	(string) ( $attributes['compareHeadingAccent'] ?? '' ),
	'<br><em>',
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>><div class="container"><div class="section-head"><div><p class="eyebrow"><?php
	echo esc_html( (string) ( $attributes['compareEyebrow'] ?? '' ) );
?></p><h2 data-doclap-rich="compareHeading"><?php
	echo doclap_rich( $doclap_heading );
?></h2></div><p class="section-description"><?php
	echo esc_html( (string) ( $attributes['compareText'] ?? '' ) );
?></p></div><?php
if ( array() !== $doclap_groups ) :
	?><table class="ds-table comparison-table"><caption><?php
	echo esc_html( (string) ( $attributes['caption'] ?? '' ) );
	?></caption><thead><tr><th scope="col"><?php
	echo esc_html( (string) ( $attributes['rowHeaderLabel'] ?? '' ) );
	?></th><?php
	foreach ( $doclap_columns as $doclap_column ) :
		$doclap_column = is_array( $doclap_column ) ? $doclap_column : array();
		$doclap_detail = trim( (string) ( $doclap_column['detail'] ?? '' ) );
		?><th scope="col"><?php
		echo esc_html( (string) ( $doclap_column['title'] ?? '' ) );
		if ( '' !== $doclap_detail ) :
			?><span class="plan-detail"><?php
			echo esc_html( $doclap_detail );
			?></span><?php
		endif;
		?></th><?php
	endforeach;
	?></tr></thead><tbody><?php
	foreach ( $doclap_groups as $doclap_group ) :
		$doclap_group = is_array( $doclap_group ) ? $doclap_group : array();
		$doclap_rows  = is_array( $doclap_group['rows'] ?? null ) ? $doclap_group['rows'] : array();
		?><tr class="comparison-group"><th scope="colgroup" colspan="<?php
		echo esc_attr( $doclap_colspan );
		?>"><?php
		echo esc_html( (string) ( $doclap_group['label'] ?? '' ) );
		?></th></tr><?php
		foreach ( $doclap_rows as $doclap_row ) :
			$doclap_row     = is_array( $doclap_row ) ? $doclap_row : array();
			$doclap_values  = is_array( $doclap_row['values'] ?? null ) ? $doclap_row['values'] : array();
			$doclap_numeric = ! empty( $doclap_row['isNumeric'] );
			?><tr><th scope="row"><?php
			echo esc_html( (string) ( $doclap_row['feature'] ?? '' ) );
			?></th><?php
			foreach ( array_keys( $doclap_columns ) as $doclap_index ) :
				$doclap_cell = (string) ( $doclap_values[ $doclap_index ] ?? '' );
				if ( $doclap_numeric ) :
					?><td><span class="num"><?php
					echo esc_html( $doclap_cell );
					?></span></td><?php
				else :
					?><td><?php
					echo esc_html( $doclap_cell );
					?></td><?php
				endif;
			endforeach;
			?></tr><?php
		endforeach;
	endforeach;
	?></tbody></table><div class="comparison-bottom"><?php
	if ( '' !== $doclap_note ) :
		?><p class="pricing-note"><?php
		echo esc_html( $doclap_note );
		?></p><?php
	endif;
	if ( '' !== $doclap_label ) :
		?><a class="text-link" href="<?php
			echo $doclap_url( (string) ( $attributes['linkUrl'] ?? '' ) );
		?>"><span><?php
			echo doclap_rich( $doclap_label );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rich helper escapes, then re-allows inline markup.
		?></span> <?php
			echo $doclap_icon( 'arrow-up-right' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></a><?php
	endif;
	?></div><?php
elseif ( '' !== $doclap_note ) :
	?><p class="pricing-note"><?php
	echo esc_html( $doclap_note );
	?></p><?php
endif;
?></div></section>
