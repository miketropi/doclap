<?php
/**
 * Server renderer for the Inner hero block.
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

// Saved content can still carry the split accent attributes; the editor folds
// them into the merged rich values and clears the legacy keys on first save.
$doclap_heading = doclap_rich_accent(
	(string) ( $attributes['heading'] ?? '' ),
	(string) ( $attributes['headingAccent'] ?? '' ),
	'<br><em>',
);
// The generic page template takes its title from the page itself instead of from
// an attribute, so the heading stays authoritative while the block keeps the same
// surface as every other hero. The attribute remains the fallback for a preview
// with no post in context, and the breadcrumb and lead follow the same post.
$doclap_page_title = '';
$doclap_context    = null;

if ( 'page-title' === ( $attributes['headingSource'] ?? 'custom' ) ) {
	$doclap_context    = doclap_queried_post();
	$doclap_page_title = $doclap_context ? trim( get_the_title( $doclap_context ) ) : '';
}

$doclap_breadcrumb_label = (string) ( $attributes['breadcrumbLabel'] ?? '' );

if ( '' === trim( $doclap_breadcrumb_label ) && '' !== $doclap_page_title ) {
	$doclap_breadcrumb_label = $doclap_page_title;
}

$doclap_lead = (string) ( $attributes['lead'] ?? '' );

if ( '' === trim( $doclap_lead ) && null !== $doclap_context ) {
	$doclap_lead = (string) get_the_excerpt( $doclap_context );
}
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
			'doclap-inner-hero',
			array( 'section', 'inner-hero' ),
		),
		'style' => $doclap_colour_style,
	),
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<nav class="breadcrumb" aria-label="<?php echo esc_attr__( 'Page path', 'doclap' ); ?>">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html( (string) ( $attributes['breadcrumbHomeLabel'] ?? '' ) ); ?></a>
			<span aria-hidden="true">/</span>
			<span aria-current="page"><?php echo esc_html( $doclap_breadcrumb_label ); ?></span>
		</nav>
		<h1 data-doclap-rich="heading"><?php echo '' !== $doclap_page_title ? esc_html( $doclap_page_title ) : doclap_rich( $doclap_heading ); ?></h1>
		<?php if ( '' !== trim( $doclap_lead ) ) : ?>
			<div class="hero-summary">
				<span class="hero-mark" aria-hidden="true">✳</span>
				<p class="lead" data-doclap-rich="lead"><?php echo doclap_rich( $doclap_lead ); ?></p>
			</div>
		<?php endif; ?>
	</div>
</section>
