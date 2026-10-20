<?php
/**
 * Server renderer for the Page content block.
 *
 * The page's own blocks are the authoritative body, so this renderer asks for the
 * queried post, runs its content through `the_content` — the same filter the page
 * would get on its own — and prints the result inside the theme's container and
 * prose measure. A render with no page in context (the block preview, or the block
 * placed somewhere without a queried post) shows deterministic sample copy instead
 * of querying anything itself.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_page     = doclap_queried_post();
$doclap_raw      = $doclap_page ? (string) $doclap_page->post_content : '';
/*
 * `the_content` runs `do_blocks()`, so a page whose own content contains this
 * block would resolve to itself and render itself again until PHP aborts. That is
 * a real authoring mistake — the block belongs in a template — and a
 * self-referencing page has no body to show, so it falls back to the same empty
 * copy instead of recursing.
 */
$doclap_self_ref = null !== $doclap_page && has_block( 'doclap/page-content', $doclap_page );

if ( '' === $doclap_raw || $doclap_self_ref ) {
	$doclap_content = '<p>' . esc_html__( 'This page has no content yet.', 'doclap' ) . '</p>';
} else {
	$doclap_content = (string) apply_filters( 'the_content', $doclap_raw );
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
		'class' => doclap_scope_class( 'doclap-page-body', array( 'section' ) ),
		'style' => $doclap_colour_style,
	),
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<article class="prose">
			<?php
			echo $doclap_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- the_content filters.
			?>
		</article>
	</div>
</section>
