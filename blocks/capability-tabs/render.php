<?php
/**
 * Server renderer for the Doclap capability tabs block.
 *
 * The first tab is selected in the markup and every panel is rendered open, so the
 * section is a complete, readable document with the script absent: a visitor without
 * the bundle reads all three disciplines instead of one. The view bundle takes the
 * inactive panels out of the flow once it initialises, and swaps which pre-rendered
 * panel is shown; no copy is written by JavaScript.
 *
 * Ids are prefixed per instance — `wp_unique_id()` — because the tab and panel
 * ids pair through `aria-controls` / `aria-labelledby`, and two copies of this
 * block on one page must not point at each other's panels.
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

$doclap_tabs   = is_array( $attributes['tabs'] ?? null ) ? array_values( $attributes['tabs'] ) : array();
$doclap_anchor = (string) ( $attributes['anchor'] ?? '' );
$doclap_uid    = wp_unique_id( 'doclap-capability-' );
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
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'tabs',
		// `capabilities` is the reference section's own class; the theme's
		// `dark-panel` band supplies the inverted surface the reference paints.
		'class' => doclap_scope_class( 'doclap-capability-tabs', array( 'section', 'capabilities', 'dark-panel' ) ),
		'style' => $doclap_colour_style,
	),
);
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<div class="section-head"><div><p class="eyebrow"><?php
			echo esc_html( (string) ( $attributes['tabsEyebrow'] ?? '' ) );
		?></p><h2 data-doclap-rich="tabsHeading"><?php
			echo doclap_rich(
			doclap_rich_accent(
				(string) ( $attributes['tabsHeading'] ?? '' ),
				(string) ( $attributes['tabsHeadingAccent'] ?? '' ),
			),
		);
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by `doclap_rich()`.
		?></h2></div></div><?php
		if ( array() === $doclap_tabs ) {
			// No tabs: the heading is the whole section, never an empty tablist.
			?></div></section><?php
			return;
		}
		?><div class="capability-layout">
			<div class="capability-tabs" role="tablist" aria-label="<?php
				echo esc_attr( (string) ( $attributes['tabsLabel'] ?? '' ) );
			?>" aria-orientation="vertical"><?php
			foreach ( $doclap_tabs as $doclap_position => $doclap_tab ) :
				$doclap_tab       = is_array( $doclap_tab ) ? $doclap_tab : array();
				$doclap_number    = (int) $doclap_position + 1;
				$doclap_selected  = 1 === $doclap_number;
				$doclap_tab_id    = $doclap_uid . '-tab-' . $doclap_number;
				$doclap_panel_id  = $doclap_uid . '-panel-' . $doclap_number;
				?><button type="button" role="tab" id="<?php echo esc_attr( $doclap_tab_id ); ?>" aria-selected="<?php
					echo $doclap_selected ? 'true' : 'false';
				?>" aria-controls="<?php echo esc_attr( $doclap_panel_id ); ?>" tabindex="<?php
					echo $doclap_selected ? '0' : '-1';
				?>"><small><?php
					echo esc_html( (string) ( $doclap_tab['index'] ?? '' ) );
				?></small><span><?php
					echo esc_html( (string) ( $doclap_tab['label'] ?? '' ) );
				?></span><?php
				echo $doclap_icon( 'arrow-up-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
				?></button><?php
			endforeach;
			?></div>
			<div><?php
			foreach ( $doclap_tabs as $doclap_position => $doclap_tab ) :
				$doclap_tab      = is_array( $doclap_tab ) ? $doclap_tab : array();
				$doclap_number   = (int) $doclap_position + 1;
				$doclap_selected = 1 === $doclap_number;
				$doclap_tab_id   = $doclap_uid . '-tab-' . $doclap_number;
				$doclap_panel_id = $doclap_uid . '-panel-' . $doclap_number;
				$doclap_chips    = array_values(
					array_filter(
						is_array( $doclap_tab['deliverables'] ?? null ) ? $doclap_tab['deliverables'] : array(),
						static fn( $doclap_chip ): bool => '' !== trim( (string) $doclap_chip ),
					),
				);
				$doclap_cta_label = (string) ( $doclap_tab['ctaLabel'] ?? '' );
				$doclap_cta_url   = (string) ( $doclap_tab['ctaUrl'] ?? '' );
				?><div class="capability-panel" id="<?php echo esc_attr( $doclap_panel_id ); ?>" role="tabpanel" aria-labelledby="<?php
					echo esc_attr( $doclap_tab_id );
				?>" tabindex="0"><h3><?php
					echo doclap_rich( (string) ( $doclap_tab['heading'] ?? '' ) );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by `doclap_rich()`.
				?></h3><p><?php
					echo doclap_rich( (string) ( $doclap_tab['copy'] ?? '' ) );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by `doclap_rich()`.
				?></p><?php
				if ( array() !== $doclap_chips ) :
					?><div class="capability-deliverables"><?php
					foreach ( $doclap_chips as $doclap_chip ) :
						?><span><?php echo esc_html( (string) $doclap_chip ); ?></span><?php
					endforeach;
					?></div><?php
				endif;
				if ( '' !== $doclap_cta_label && '' !== $doclap_cta_url ) :
					?><a class="text-link" href="<?php
						echo esc_url( doclap_resolve_url( $doclap_cta_url ) );
					?>"><span><?php
						echo doclap_rich( $doclap_cta_label );
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by `doclap_rich()`.
					?></span><?php
					echo $doclap_icon( 'arrow-up-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
					?></a><?php
				endif;
				?></div><?php
			endforeach;
			?></div>
		</div>
	</div>
</section>
