<?php
/**
 * Server renderer for the Doclap pricing plans block.
 *
 * Both engagement modes are rendered by the server: the visible node carries the
 * mode the block defaults to, and the other mode travels in the
 * `data-doclap-price-*` / `data-doclap-caption-*` attributes, so the section is
 * complete with JavaScript off and `view.ts` only switches which stored value is
 * shown.
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

$doclap_plans  = is_array( $attributes['plans'] ?? null ) ? $attributes['plans'] : array();
$doclap_anchor = (string) ( $attributes['anchor'] ?? '' );
$doclap_text   = trim( (string) ( $attributes['pricingText'] ?? '' ) );
$doclap_note   = trim( (string) ( $attributes['note'] ?? '' ) );
// Only two modes exist, so anything else falls back to `project`: saved content
// cannot put the pressed button and the rendered values out of step.
$doclap_mode = 'ongoing' === (string) ( $attributes['modeDefault'] ?? 'project' ) ? 'ongoing' : 'project';
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
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'pricing',
		'class' => doclap_scope_class( 'doclap-pricing-plans', array( 'section' ) ),
		'style' => $doclap_colour_style,
	),
);
$doclap_url  = static fn( string $value ): string => esc_url( doclap_resolve_url( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
// Saved content can still carry `pricingHeadingAccent`; the editor folds the pair
// into the merged heading and clears the legacy key on the block's first save.
$doclap_heading = doclap_rich_accent(
	(string) ( $attributes['pricingHeading'] ?? '' ),
	(string) ( $attributes['pricingHeadingAccent'] ?? '' ),
	'<br><em>',
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>><div class="container"><div class="section-head"><div><p class="eyebrow"><?php
	echo esc_html( (string) ( $attributes['pricingEyebrow'] ?? '' ) );
?></p><h2 data-doclap-rich="pricingHeading"><?php
	echo doclap_rich( $doclap_heading );
?></h2><?php
if ( '' !== $doclap_text ) :
	?><p class="section-description"><?php
	echo esc_html( $doclap_text );
	?></p><?php
endif;
?></div><div class="mode-toggle" role="group" aria-label="<?php
	echo esc_attr( (string) ( $attributes['modeGroupLabel'] ?? '' ) );
?>"><button type="button" data-doclap-mode="project" aria-pressed="<?php
	echo 'project' === $doclap_mode ? 'true' : 'false';
?>"><?php
	echo esc_html( (string) ( $attributes['modeProjectLabel'] ?? '' ) );
?></button><button type="button" data-doclap-mode="ongoing" aria-pressed="<?php
	echo 'ongoing' === $doclap_mode ? 'true' : 'false';
?>"><?php
	echo esc_html( (string) ( $attributes['modeOngoingLabel'] ?? '' ) );
?></button></div></div><?php
if ( array() !== $doclap_plans ) :
	?><div class="pricing-grid"><?php
	foreach ( $doclap_plans as $doclap_plan ) :
		$doclap_plan            = is_array( $doclap_plan ) ? $doclap_plan : array();
		$doclap_meta_extra      = trim( (string) ( $doclap_plan['metaExtra'] ?? '' ) );
		$doclap_price_project   = (string) ( $doclap_plan['priceProject'] ?? '' );
		$doclap_price_ongoing   = (string) ( $doclap_plan['priceOngoing'] ?? '' );
		$doclap_caption_project = (string) ( $doclap_plan['captionProject'] ?? '' );
		$doclap_caption_ongoing = (string) ( $doclap_plan['captionOngoing'] ?? '' );
		$doclap_features        = is_array( $doclap_plan['features'] ?? null ) ? $doclap_plan['features'] : array();
		?><article class="<?php
		echo esc_attr( empty( $doclap_plan['featured'] ) ? 'price-card' : 'price-card is-featured' );
		?>"><div class="meta"><span><?php
			echo esc_html( (string) ( $doclap_plan['meta'] ?? '' ) );
		?></span><?php
		if ( '' !== $doclap_meta_extra ) :
			?><span><?php
			echo esc_html( $doclap_meta_extra );
			?></span><?php
		endif;
		?></div><h3><?php
			echo doclap_rich( (string) ( $doclap_plan['title'] ?? '' ) );
		?></h3><p><?php
			echo doclap_rich( (string) ( $doclap_plan['copy'] ?? '' ) );
		?></p><div class="price-value" data-doclap-price data-doclap-price-project="<?php
			echo esc_attr( $doclap_price_project );
		?>" data-doclap-price-ongoing="<?php
			echo esc_attr( $doclap_price_ongoing );
		?>"><?php
			echo esc_html( 'ongoing' === $doclap_mode ? $doclap_price_ongoing : $doclap_price_project );
		?></div><span class="price-caption" data-doclap-caption data-doclap-caption-project="<?php
			echo esc_attr( $doclap_caption_project );
		?>" data-doclap-caption-ongoing="<?php
			echo esc_attr( $doclap_caption_ongoing );
		?>"><?php
			echo esc_html( 'ongoing' === $doclap_mode ? $doclap_caption_ongoing : $doclap_caption_project );
		?></span><?php
		if ( array() !== $doclap_features ) :
			?><ul><?php
			foreach ( $doclap_features as $doclap_feature ) :
				?><li><?php
					echo $doclap_icon( 'check-circle' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
				?><span><?php
					echo esc_html( (string) $doclap_feature );
				?></span></li><?php
			endforeach;
			?></ul><?php
		endif;
		if ( ! empty( $doclap_plan['ctaLabel'] ) && ! empty( $doclap_plan['ctaUrl'] ) ) :
			?><a class="text-link" href="<?php
				echo $doclap_url( (string) $doclap_plan['ctaUrl'] );
			?>"><span><?php
				echo doclap_rich( (string) $doclap_plan['ctaLabel'] );
			?></span> <?php
				echo $doclap_icon( 'arrow-up-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></a><?php
		endif;
		?></article><?php
	endforeach;
	?></div><?php
endif;
if ( '' !== $doclap_note ) :
	?><p class="pricing-note"><?php
	echo esc_html( $doclap_note );
	?></p><?php
endif;
?></div></section>
