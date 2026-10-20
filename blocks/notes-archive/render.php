<?php
/**
 * Query-driven notes archive renderer.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_value = static function ( string $key, mixed $fallback = '' ) use ( $attributes ): mixed {
	return $attributes[ $key ] ?? $fallback;
};

$doclap_excerpt = static function ( WP_Post $post ): string {
	$excerpt = trim( (string) get_the_excerpt( $post ) );

	return '' !== $excerpt
		? $excerpt
		: wp_trim_words( wp_strip_all_tags( $post->post_content ), 24 );
};

$doclap_category = static function ( int $post_id ): ?WP_Term {
	$terms = get_the_category( $post_id );

	return ! empty( $terms ) && $terms[0] instanceof WP_Term ? $terms[0] : null;
};

$doclap_count_label = static function ( int $count, string $singular, string $plural ): string {
	$format = 1 === $count ? $singular : $plural;

	return false !== strpos( $format, '%d' )
		? str_replace( '%d', (string) $count, $format )
		: $count . ' ' . $format;
};

$doclap_is_archive_query = ( is_archive() || is_home() )
	&& isset( $GLOBALS['wp_query'] )
	&& $GLOBALS['wp_query'] instanceof WP_Query
	&& $GLOBALS['wp_query']->is_main_query();
$doclap_query          = null;
$doclap_featured       = null;
$doclap_list_posts     = array();
$doclap_paged          = max( 1, (int) get_query_var( 'paged' ), (int) get_query_var( 'page' ) );
// The featured note is the newest post, so it belongs at the top of the archive
// only: repeating it on later pages would push a real list item off the page and
// present an older post as featured.
$doclap_show_featured = (bool) $doclap_value( 'showFeatured', true ) && 1 === $doclap_paged;

if ( $doclap_is_archive_query ) {
	/** @var WP_Query $doclap_query */
	$doclap_query       = $GLOBALS['wp_query'];
	$doclap_query_posts = array_values(
		array_filter(
			(array) $doclap_query->posts,
			static fn( mixed $post ): bool => $post instanceof WP_Post,
		),
	);

	if ( $doclap_show_featured && ! empty( $doclap_query_posts ) ) {
		$doclap_featured   = $doclap_query_posts[0];
		$doclap_list_posts = array_slice( $doclap_query_posts, 1 );
	} else {
		$doclap_list_posts = $doclap_query_posts;
	}
} else {
	$doclap_featured_id = 0;

	if ( $doclap_show_featured ) {
		$doclap_featured_query = new WP_Query(
			array(
				'post_type'              => 'post',
				'post_status'            => 'publish',
				'posts_per_page'         => 1,
				'ignore_sticky_posts'    => true,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
			),
		);

		if (
			! empty( $doclap_featured_query->posts )
			&& $doclap_featured_query->posts[0] instanceof WP_Post
		) {
			$doclap_featured    = $doclap_featured_query->posts[0];
			$doclap_featured_id = $doclap_featured->ID;
		}

		wp_reset_postdata();
	}

	$doclap_query = new WP_Query(
		doclap_notes_archive_query_args( $attributes, $doclap_paged, $doclap_featured_id ),
	);
	$doclap_list_posts = array_values(
		array_filter(
			(array) $doclap_query->posts,
			static fn( mixed $post ): bool => $post instanceof WP_Post,
		),
	);
}

$doclap_found_posts = (int) $doclap_query->found_posts;
if ( ! $doclap_is_archive_query && $doclap_featured instanceof WP_Post ) {
	++$doclap_found_posts;
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
	array( 'class' => doclap_scope_class( 'doclap-notes-archive', array( 'section' ) ), 'style' => $doclap_colour_style ),
);
?>
<section <?php echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escaped.?>>
	<div class="container">
		<?php if ( $doclap_featured instanceof WP_Post ) : ?>
			<?php $doclap_featured_category = $doclap_category( $doclap_featured->ID ); ?>
			<article class="featured-post">
				<div
					class="artwork motion-art"
					aria-label="<?php echo esc_attr__( 'Typography graphic: Slow.', 'doclap' ); ?>"
				>
					<span class="art-label"><?php echo esc_html__( 'STUDY / MOTION', 'doclap' ); ?></span>
					<span class="art-word"><?php echo esc_html__( 'Slow.', 'doclap' ); ?></span>
				</div>
				<div>
					<span class="meta">
						<?php echo esc_html__( 'FEATURED NOTES', 'doclap' ); ?><?php
						echo $doclap_featured_category
							? ' / ' . esc_html( strtoupper( $doclap_featured_category->name ) )
							: '';
						?>
					</span>
					<h2>
						<a href="<?php echo esc_url( get_permalink( $doclap_featured ) ); ?>">
							<?php echo esc_html( get_the_title( $doclap_featured ) ); ?>
						</a>
					</h2>
					<p><?php echo esc_html( $doclap_excerpt( $doclap_featured ) ); ?></p>
					<a class="text-link" href="<?php echo esc_url( get_permalink( $doclap_featured ) ); ?>">
						<span><?php echo esc_html__( 'Read notes', 'doclap' ); ?></span>
						<?php
						echo doclap_icon( 'arrow-up-right' );
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted helper markup.
						?>
					</a>
				</div>
			</article>
		<?php endif; ?>
		<div class="section-head">
			<h2 data-doclap-rich="headingSectionTitle"><?php echo doclap_rich( (string) $doclap_value( 'headingSectionTitle', __( 'From the desk.', 'doclap' ) ) ); ?></h2>
			<span class="meta" role="status">
				<?php
				echo esc_html(
					strtoupper(
						$doclap_count_label(
							$doclap_found_posts,
							(string) $doclap_value( 'countSingular', __( '%d note', 'doclap' ) ),
							(string) $doclap_value( 'countPlural', __( '%d notes', 'doclap' ) ),
						),
					),
				);
				?>
			</span>
		</div>
		<?php if ( (bool) $doclap_value( 'showCategories', true ) ) : ?>
			<nav class="filter-bar" aria-label="<?php echo esc_attr__( 'Filter notes', 'doclap' ); ?>">
				<a
					href="<?php echo esc_url( doclap_resolve_url( '@notes' ) ); ?>"
					<?php echo is_home() && ! is_category() ? ' aria-current="page"' : ''; ?>
				>
					<?php echo esc_html__( 'All', 'doclap' ); ?>
				</a>
				<?php foreach ( get_categories( array( 'hide_empty' => true ) ) as $doclap_term ) : ?>
					<?php
					$doclap_term_url = get_term_link( $doclap_term );
					if ( is_wp_error( $doclap_term_url ) ) {
						continue;
					}
					?>
					<a
						href="<?php echo esc_url( $doclap_term_url ); ?>"
						<?php echo is_category( $doclap_term->term_id ) ? ' aria-current="page"' : ''; ?>
					>
						<?php echo esc_html( $doclap_term->name ); ?>
					</a>
				<?php endforeach; ?>
			</nav>
		<?php endif; ?>
		<?php if ( empty( $doclap_list_posts ) && ! ( $doclap_featured instanceof WP_Post ) ) : ?>
			<div class="empty-state" role="status">
				<h3><?php echo doclap_rich( (string) $doclap_value( 'emptyHeading', __( 'No notes yet.', 'doclap' ) ) ); ?></h3>
				<p><?php echo doclap_rich( (string) $doclap_value( 'emptyCopy', '' ) ); ?></p>
			</div>
		<?php else : ?>
			<div class="archive-rows">
				<?php foreach ( $doclap_list_posts as $doclap_index => $doclap_post ) : ?>
					<?php $doclap_post_category = $doclap_category( $doclap_post->ID ); ?>
					<article class="log-row post-row">
						<span class="meta">
							<?php
							echo esc_html(
								doclap_ordinal( $doclap_index ) . ' / '
								. ( $doclap_post_category ? $doclap_post_category->name : __( 'Note', 'doclap' ) ),
							);
							?><br><?php
							$doclap_reading_time = doclap_reading_time( $doclap_post->post_content );
							echo esc_html(
								get_the_date( '', $doclap_post ) . ' · '
								. sprintf(
									_n( '%d min read', '%d mins read', $doclap_reading_time, 'doclap' ),
									$doclap_reading_time,
								),
							);
							?>
						</span>
						<div>
							<h3>
								<a href="<?php echo esc_url( get_permalink( $doclap_post ) ); ?>">
									<?php echo esc_html( get_the_title( $doclap_post ) ); ?>
								</a>
							</h3>
							<p><?php echo esc_html( $doclap_excerpt( $doclap_post ) ); ?></p>
						</div>
						<a
							href="<?php echo esc_url( get_permalink( $doclap_post ) ); ?>"
							class="icon-link"
							aria-label="<?php
							echo esc_attr(
								sprintf( __( 'Read: %s', 'doclap' ), get_the_title( $doclap_post ) ),
							);
							?>"
						>
							<?php
							echo doclap_icon( 'arrow-up-right' );
							// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted helper markup.
							?>
						</a>
					</article>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
		<?php if ( $doclap_query->max_num_pages > 1 ) : ?>
			<nav
				class="navigation pagination index-grid"
				aria-label="<?php echo esc_attr__( 'Notes pagination', 'doclap' ); ?>"
			>
				<?php
				echo wp_kses_post(
					paginate_links(
						array(
							'current'   => $doclap_paged,
							'total'     => (int) $doclap_query->max_num_pages,
							'type'      => 'list',
							'prev_text' => __( 'Previous', 'doclap' ),
							'next_text' => __( 'Next', 'doclap' ),
						),
					),
				);
				?>
			</nav>
		<?php endif; ?>
		<p class="form-note" data-doclap-rich="disclaimer"><?php echo doclap_rich( (string) $doclap_value( 'disclaimer', '' ) ); ?></p>
	</div>
</section>
<?php
if ( ! $doclap_is_archive_query ) {
	wp_reset_postdata();
}
