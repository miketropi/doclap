<?php
/**
 * Server renderer for the Doclap home contact block.
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
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'contact',
		'class' => doclap_scope_class( 'doclap-home-contact', array( 'section', 'contact' ) ),
		'style' => $doclap_colour_style,
	),
);
$doclap_url  = static fn( string $value ): string => esc_url( doclap_resolve_url( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
// Saved content can still carry `contactHeadingAccent`; the editor folds the pair
// into the merged heading and clears the legacy key on the block's first save.
$doclap_heading = doclap_rich_accent(
	(string) ( $attributes['contactHeading'] ?? '' ),
	(string) ( $attributes['contactHeadingAccent'] ?? '' ),
	'<br><em>',
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>><div class="container"><p class="eyebrow"><?php
	echo esc_html( (string) ( $attributes['contactEyebrow'] ?? '' ) );
?></p><h2 data-doclap-rich="contactHeading"><?php
	echo doclap_rich( $doclap_heading );
?></h2><p class="lead" data-doclap-rich="contactLead"><?php
	echo doclap_rich( (string) ( $attributes['contactLead'] ?? '' ) );
?></p><a class="btn btn-primary" href="<?php
	echo $doclap_url( (string) ( $attributes['contactCtaUrl'] ?? '' ) );
?>"><span data-doclap-rich="contactCtaLabel"><?php
	echo doclap_rich( (string) ( $attributes['contactCtaLabel'] ?? '' ) );
?></span> <?php
	echo $doclap_icon( 'arrow-up-right' );
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
?></a></div></section>
