<?php
/**
 * Server renderer for the Related notes block.
 *
 * The list prefers notes from the categories of the queried post and fills the
 * remaining slots from the latest notes, never repeating the post itself. With
 * no queried post there is nothing to relate to, so the block renders the empty
 * state and runs no query at all.
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

$doclap_post       = doclap_note_queried_post();
$doclap_id         = $doclap_post ? (int) $doclap_post->ID : 0;
$doclap_categories = $doclap_id ? get_the_category( $doclap_id ) : array();
$doclap_count      = max( 0, min( 6, (int) ( $attributes['count'] ?? 2 ) ) );
$doclap_related    = array();
$doclap_excluded   = $doclap_id ? array( $doclap_id ) : array();

if ( $doclap_id && $doclap_count > 0 ) {
	$doclap_category_ids = wp_list_pluck( (array) $doclap_categories, 'term_id' );

	if ( ! empty( $doclap_category_ids ) ) {
		$doclap_same_query = new WP_Query(
			array(
				'post_type'              => 'post',
				'post_status'            => 'publish',
				'posts_per_page'         => $doclap_count,
				'post__not_in'           => $doclap_excluded,
				'category__in'           => $doclap_category_ids,
				'ignore_sticky_posts'    => true,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
			),
		);
		$doclap_related  = is_array( $doclap_same_query->posts ) ? $doclap_same_query->posts : array();
		$doclap_excluded = array_merge(
			$doclap_excluded,
			wp_list_pluck( $doclap_related, 'ID' ),
		);
	}

	$doclap_remaining = $doclap_count - count( $doclap_related );
	if ( $doclap_remaining > 0 ) {
		$doclap_latest_query = new WP_Query(
			array(
				'post_type'              => 'post',
				'post_status'            => 'publish',
				'posts_per_page'         => $doclap_remaining,
				'post__not_in'           => $doclap_excluded,
				'ignore_sticky_posts'    => true,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
			),
		);
		$doclap_latest  = is_array( $doclap_latest_query->posts ) ? $doclap_latest_query->posts : array();
		$doclap_related = array_merge( $doclap_related, $doclap_latest );
	}

	wp_reset_postdata();
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
	array( 'class' => doclap_scope_class( 'doclap-related-notes', array( 'section' ) ), 'style' => $doclap_colour_style ),
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<div class="section-head">
			<h2 data-doclap-rich="heading">
				<?php
				$doclap_heading = (string) ( $attributes['heading'] ?? '' );
				echo doclap_rich(
					'' !== trim( wp_strip_all_tags( $doclap_heading ) )
						? $doclap_heading
						: __( 'Read another perspective.', 'doclap' ),
				);
				?>
			</h2>
		</div>
		<?php if ( empty( $doclap_related ) ) : ?>
			<p class="form-note">
				<?php esc_html_e( 'More perspectives will be published here soon.', 'doclap' ); ?>
			</p>
		<?php endif; ?>
		<?php foreach ( $doclap_related as $doclap_related_post ) : ?>
			<?php
			if ( ! $doclap_related_post instanceof WP_Post ) {
				continue;
			}
			$doclap_related_terms = get_the_category( $doclap_related_post->ID );
			$doclap_related_title = get_the_title( $doclap_related_post );
			$doclap_related_title = '' !== trim( $doclap_related_title )
				? $doclap_related_title
				: __( 'Untitled note', 'doclap' );
			$doclap_related_url = (string) get_permalink( $doclap_related_post );
			?>
			<article class="log-row post-row">
				<span class="meta">
					<?php
					echo esc_html(
						! empty( $doclap_related_terms )
							? $doclap_related_terms[0]->name
							: __( 'Uncategorized', 'doclap' ),
					);
					?>
				</span>
				<h3>
					<a href="<?php echo esc_url( $doclap_related_url ); ?>">
						<?php echo esc_html( $doclap_related_title ); ?>
					</a>
				</h3>
				<a
					class="icon-link"
					href="<?php echo esc_url( $doclap_related_url ); ?>"
					aria-label="<?php echo esc_attr( sprintf( __( 'Read %s', 'doclap' ), $doclap_related_title ) ); ?>"
				>
					<?php
					echo doclap_icon( 'arrow-up-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
					?>
				</a>
			</article>
		<?php endforeach; ?>
	</div>
</section>
