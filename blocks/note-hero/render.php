<?php
/**
 * Server renderer for the Note hero block.
 *
 * The queried post is authoritative: the title and the excerpt are read from it
 * and never from an attribute, so a post-less render (the block preview, or a
 * page that hosts the block instead of the note-detail template) falls back to
 * the deterministic copy this section has always shown. The block never queries
 * a post of its own.
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

$doclap_post        = doclap_queried_post();
$doclap_title       = $doclap_post ? get_the_title( $doclap_post ) : __( 'Editorial note', 'doclap' );
$doclap_title       = '' !== trim( $doclap_title ) ? $doclap_title : __( 'Untitled note', 'doclap' );
$doclap_excerpt     = $doclap_post
	? get_the_excerpt( $doclap_post )
	: __( 'A perspective from the độc lập design practice.', 'doclap' );
$doclap_excerpt     = '' !== trim( $doclap_excerpt )
	? $doclap_excerpt
	: __( 'A perspective from the độc lập design practice.', 'doclap' );
$doclap_archive_url = doclap_resolve_url( (string) ( $attributes['archiveUrl'] ?? '@notes' ) );
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
			'doclap-note-hero',
			array( 'section', 'inner-hero', 'article-hero' ),
		),
		'style' => $doclap_colour_style,
	),
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="reading-progress" data-doclap-progress aria-hidden="true"></div>
	<div class="container">
		<nav class="breadcrumb" aria-label="<?php echo esc_attr__( 'Page path', 'doclap' ); ?>">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html( (string) ( $attributes['breadcrumbHomeLabel'] ?? __( 'Home', 'doclap' ) ) ); ?></a>
			<span aria-hidden="true">/</span>
			<a href="<?php echo esc_url( $doclap_archive_url ); ?>"><?php echo esc_html( (string) ( $attributes['archiveLabel'] ?? __( 'Archive', 'doclap' ) ) ); ?></a>
			<span aria-hidden="true">/</span>
			<span aria-current="page"><?php echo esc_html( (string) ( $attributes['articleLabel'] ?? __( 'Article', 'doclap' ) ) ); ?></span>
		</nav>
		<h1><?php echo esc_html( $doclap_title ); ?></h1>
		<div class="hero-summary">
			<span class="hero-mark" aria-hidden="true">✳</span>
			<p class="lead"><?php echo esc_html( $doclap_excerpt ); ?></p>
		</div>
	</div>
</section>
