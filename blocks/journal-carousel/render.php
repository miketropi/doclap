<?php
/**
 * Server renderer for the Doclap journal carousel block.
 *
 * The strip is the newest published notes: the query comes from the block
 * attributes, and the counter, the disabled states and the keyboard handling are
 * added by the shared carousel runtime in `resources/ts/runtime/carousel.ts`.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_query  = new WP_Query( doclap_journal_carousel_query_args( $attributes ) );
$doclap_posts  = array_values(
	array_filter(
		(array) $doclap_query->posts,
		static fn( mixed $post ): bool => $post instanceof WP_Post,
	),
);
$doclap_total  = count( $doclap_posts );
$doclap_anchor = (string) ( $attributes['anchor'] ?? '' );
// The view-all link is opt-in and only usable when the attribute also resolves to
// a real target: `@notes` has no destination on a site without a posts page.
$doclap_view_all_label = trim( (string) ( $attributes['viewAllLabel'] ?? '' ) );
$doclap_view_all_href  = trim( (string) doclap_resolve_url( (string) ( $attributes['viewAllUrl'] ?? '' ) ) );

/*
 * Artwork variants cycle by card position, so a strip of notes never repeats the
 * same tile: the plain face and the type and WebGL faces of the design.
 */
$doclap_variants = array( 'motion-art', 'type-art', 'webgl-art' );

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
		'id'            => '' !== $doclap_anchor ? $doclap_anchor : 'journal',
		'class'         => doclap_scope_class( 'doclap-journal-carousel', array( 'section', 'carousel' ) ),
		'style'         => $doclap_colour_style,
		'data-carousel' => '',
		'aria-label'    => (string) ( $attributes['ariaLabel'] ?? '' ),
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
	echo doclap_rich( doclap_rich_accent( (string) ( $attributes['journalHeading'] ?? '' ), (string) ( $attributes['journalHeadingAccent'] ?? '' ), '<br><em>' ) );
?></h2></div><?php
if ( $doclap_total > 0 ) :
	?><div class="carousel-controls"><?php
	if ( '' !== $doclap_view_all_label && '' !== $doclap_view_all_href ) :
		?><a class="text-link" href="<?php
			echo $doclap_url( $doclap_view_all_href );
		?>"><span><?php
			echo esc_html( $doclap_view_all_label );
		?></span><?php
			echo $doclap_icon( 'arrow-up-right' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></a><?php
	endif;
	?><span class="meta" data-doclap-count aria-live="polite"><?php
		echo esc_html( sprintf( '%1$s / %2$s', doclap_ordinal( 0 ), doclap_ordinal( max( 0, $doclap_total - 1 ) ) ) );
	?></span><button type="button" class="round-button" data-doclap-prev aria-label="<?php
		echo esc_attr__( 'Previous articles', 'doclap' );
	?>" disabled><?php
		echo $doclap_icon( 'arrow-left' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
	?></button><button type="button" class="round-button" data-doclap-next aria-label="<?php
		echo esc_attr__( 'Next articles', 'doclap' );
	?>"><?php
		echo $doclap_icon( 'arrow-right' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
	?></button></div><?php
endif;
?></div><?php
if ( 0 === $doclap_total ) :
	// No published notes: the heading stands alone with the empty-state note, and
	// the strip is left out entirely rather than shipped as a dead scroll track.
	?><p class="pricing-note"><?php
		echo esc_html( (string) ( $attributes['emptyLabel'] ?? '' ) );
	?></p><?php
else :
	?><div class="carousel-viewport" tabindex="0" aria-label="<?php
		echo esc_attr__( 'Articles; use arrow keys to browse', 'doclap' );
	?>"><?php
	foreach ( $doclap_posts as $doclap_index => $doclap_post ) :
		$doclap_category = get_the_category( $doclap_post->ID );
		$doclap_category = ! empty( $doclap_category ) && $doclap_category[0] instanceof WP_Term
			? $doclap_category[0]
			: null;
		$doclap_permalink = (string) get_permalink( $doclap_post );
		$doclap_title     = (string) get_the_title( $doclap_post );
		$doclap_words     = preg_split( '/\s+/u', trim( wp_strip_all_tags( $doclap_title ) ) );
		// The artwork word is the title's first word with the punctuation around it
		// dropped, so a quoted or trailed word still reads as a single display word.
		$doclap_art_word = (string) preg_replace(
			'/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/u',
			'',
			trim( (string) ( is_array( $doclap_words ) ? ( $doclap_words[0] ?? '' ) : '' ) ),
		);
		$doclap_variant = $doclap_variants[ $doclap_index % count( $doclap_variants ) ];
		?><article class="carousel-card journal-card"><a href="<?php
			echo $doclap_url( $doclap_permalink );
		?>" aria-label="<?php
			echo esc_attr( sprintf( __( 'Read: %s', 'doclap' ), $doclap_title ) );
		?>"><div class="artwork <?php echo esc_attr( $doclap_variant ); ?>" aria-hidden="true" data-doclap-art="<?php echo esc_attr( $doclap_variant ); ?>"><span class="art-label"><?php
			echo esc_html( (string) ( $attributes['artLabel'] ?? '' ) );
		?></span><span class="art-word"><?php
			// An untitled note still needs a tile, so it falls back to the generic noun.
			echo esc_html( ( '' !== $doclap_art_word ? $doclap_art_word : __( 'Note', 'doclap' ) ) . '.' );
		?></span></div><div class="post-meta"><span><?php
			echo esc_html( doclap_ordinal( (int) $doclap_index ) );
		?></span><span><?php
			echo esc_html(
			$doclap_category instanceof WP_Term
					? strtoupper( $doclap_category->name )
					: (string) ( $attributes['cardMeta'] ?? '' ),
		);
		?></span></div><h3><?php
			echo esc_html( $doclap_title );
		?></h3></a><a class="text-link" href="<?php
			echo $doclap_url( $doclap_permalink );
		?>"><span><?php
			echo esc_html( (string) ( $attributes['readMoreLabel'] ?? '' ) );
		?></span><?php
			echo $doclap_icon( 'arrow-up-right' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></a></article><?php
	endforeach;
	?></div><?php
endif;
?></div></section>
<?php
wp_reset_postdata();
