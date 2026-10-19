<?php
/**
 * Server renderer for the Doclap home journal block.
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

$doclap_links   = is_array( $attributes['journalLinks'] ?? null )
	? $attributes['journalLinks']
	: array();
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
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'journal',
		'class' => doclap_scope_class( 'doclap-home-journal', array( 'section' ) ),
		'style' => $doclap_colour_style,
	),
);
$doclap_url  = static fn( string $value ): string => esc_url( doclap_resolve_url( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>><div class="container"><div class="section-head"><div><p class="eyebrow"><?php
	echo esc_html( (string) ( $attributes['journalEyebrow'] ?? '' ) );
?></p><h2 data-doclap-rich="journalHeading"><?php
	echo doclap_rich( (string) ( $attributes['journalHeading'] ?? '' ) );
?></h2></div><span class="meta"><?php
	echo esc_html( (string) ( $attributes['journalMeta'] ?? '' ) );
?></span></div><?php
	foreach ( $doclap_links as $doclap_entry ) :
		$doclap_entry = is_array( $doclap_entry ) ? $doclap_entry : array();
		?><a class="journal-row" href="<?php
			echo $doclap_url( (string) ( $doclap_entry['url'] ?? '' ) );
		?>"><span class="meta"><?php
			echo esc_html( (string) ( $doclap_entry['meta'] ?? '' ) );
		?></span><div><h3><?php
			echo doclap_rich( (string) ( $doclap_entry['title'] ?? '' ) );
		?></h3><p><?php
			echo doclap_rich( (string) ( $doclap_entry['copy'] ?? '' ) );
		?></p></div><span class="journal-icon"><?php
			echo $doclap_icon( 'arrow-up-right' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></span></a><?php
	endforeach;
?></div></section>
