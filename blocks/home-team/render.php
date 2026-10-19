<?php
/**
 * Server renderer for the Doclap home team block.
 *
 * Content whitespace mirrors the former single landing block exactly: extra or
 * missing whitespace between inline children changes how the theme's `text-wrap`
 * rules balance lines.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_cards      = is_array( $attributes['teamCards'] ?? null ) ? $attributes['teamCards'] : array();
$doclap_team_image = ! empty( $attributes['teamImageUrl'] )
	? (string) $attributes['teamImageUrl']
	: DOCLAP_URI . '/assets/images/studio-workspace.jpg';
$doclap_anchor  = (string) ( $attributes['anchor'] ?? '' );
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
		'class' => doclap_scope_class( 'doclap-home-team', array( 'section' ) ),
		'style' => $doclap_colour_style,
	),
);
$doclap_url  = static fn( string $value ): string => esc_url( doclap_resolve_url( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>><div class="container"><div class="section-head"><h2 data-doclap-rich="teamHeading"><?php
	echo doclap_rich( (string) ( $attributes['teamHeading'] ?? '' ) );
?></h2><span class="meta"><?php
	echo esc_html( (string) ( $attributes['teamMeta'] ?? '' ) );
?></span></div><div class="team-intro"><p data-doclap-rich="teamIntro"><?php
	echo doclap_rich( (string) ( $attributes['teamIntro'] ?? '' ) );
?></p></div><figure class="team-image"><img src="<?php
	echo esc_url( $doclap_team_image );
?>" width="1600" height="1068" alt="<?php
	echo esc_attr( (string) ( $attributes['teamImageAlt'] ?? '' ) );
?>" loading="lazy"><figcaption><?php
	echo esc_html( (string) ( $attributes['teamImageCaption'] ?? '' ) );
?></figcaption></figure><div class="grid-3 team-roles"><?php
	foreach ( $doclap_cards as $doclap_card ) :
		$doclap_card = is_array( $doclap_card ) ? $doclap_card : array();
		?><article class="feature card-flat"><span class="meta"><?php
			echo esc_html( (string) ( $doclap_card['meta'] ?? '' ) );
		?></span><h3><?php
			echo doclap_rich( (string) ( $doclap_card['title'] ?? '' ) );
		?></h3><p><?php
			echo doclap_rich( (string) ( $doclap_card['copy'] ?? '' ) );
		?></p><?php
		if ( ! empty( $doclap_card['ctaLabel'] ) && ! empty( $doclap_card['ctaUrl'] ) ) :
			?><a href="<?php
				echo $doclap_url( (string) $doclap_card['ctaUrl'] );
			?>"><?php
				echo doclap_rich( (string) $doclap_card['ctaLabel'] );
			?> <?php
				echo $doclap_icon( 'arrow-up-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></a><?php
		endif;
		?></article><?php
	endforeach;
?></div></div></section>
