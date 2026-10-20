<?php

/**
 * Server rendering for the Search Results block.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_value = static function ( string $key ) use ( $attributes ): string {
	return isset( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? $attributes[ $key ] : '';
};

$doclap_search_query = get_search_query( false );
// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- public search request.
if ( '' === $doclap_search_query && isset( $_GET['s'] ) ) {
	$doclap_search_query = sanitize_text_field(
		wp_unslash( $_GET['s'] ), // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- public search request.
	);
}
$doclap_has_search = '' !== trim( $doclap_search_query );
$doclap_has_work   = post_type_exists( 'work' );
// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- public search filter.
$doclap_type = isset( $_GET['doclap_type'] )
	? sanitize_key( wp_unslash( $_GET['doclap_type'] ) )
	: '';
$doclap_available  = doclap_search_available_types();
if ( ! in_array( $doclap_type, $doclap_available, true ) ) {
	$doclap_type = '';
}

$doclap_search_results = null;
if ( $doclap_has_search ) {
	global $wp_query;
	if ( is_search() && $wp_query instanceof WP_Query ) {
		$doclap_search_results = $wp_query;
	} else {
		$doclap_search_results = new WP_Query(
			array(
				's'              => $doclap_search_query,
				'post_type'      => doclap_search_query_types( $doclap_type ),
				'post_status'    => 'publish',
				'paged'          => max( 1, get_query_var( 'paged' ), get_query_var( 'page' ) ),
				'posts_per_page' => max( 1, min( 24, (int) get_option( 'posts_per_page', 10 ) ) ),
			),
		);
	}
}

$doclap_wrapper = get_block_wrapper_attributes(
	array( 'class' => doclap_scope_class( 'doclap-search-results' ) ),
);
$doclap_home    = home_url( '/' );
$doclap_form_id = wp_unique_id( 'doclap-search-' );
// Saved content can still carry `headingAccent`; the editor folds the pair into
// the merged heading and clears the legacy key on the block's first save.
$doclap_heading = doclap_rich_accent(
	$doclap_value( 'heading' ),
	$doclap_value( 'headingAccent' ),
	'<br><em>',
);
$doclap_filters = array(
	''     => $doclap_value( 'filterAllLabel' ),
	'page' => $doclap_value( 'filterPageLabel' ),
	'post' => $doclap_value( 'filterNoteLabel' ),
);
if ( $doclap_has_work ) {
	$doclap_filters['work'] = $doclap_value( 'filterWorkLabel' );
}
?>
<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.?>
<div <?php echo $doclap_wrapper; ?>>
	<section class="section inner-hero">
		<div class="container">
			<nav
				class="breadcrumb"
				aria-label="<?php echo esc_attr__( 'Page path', 'doclap' ); ?>"
			>
				<a href="<?php echo esc_url( $doclap_home ); ?>">
					<?php echo esc_html( $doclap_value( 'breadcrumbHomeLabel' ) ); ?>
				</a>
				<span aria-hidden="true">/</span>
				<span aria-current="page">
					<?php echo esc_html( $doclap_value( 'breadcrumbLabel' ) ); ?>
				</span>
			</nav>
			<h1 data-doclap-rich="heading"><?php echo doclap_rich( $doclap_heading ); ?></h1>
			<div class="hero-summary">
				<span class="hero-mark" aria-hidden="true">✳</span>
				<p class="lead" data-doclap-rich="lead"><?php echo doclap_rich( $doclap_value( 'lead' ) ); ?></p>
			</div>
		</div>
	</section>
	<section class="section">
		<div class="container">
			<form
				class="search-form"
				role="search"
				action="<?php echo esc_url( $doclap_home ); ?>"
				method="get"
			>
				<label for="<?php echo esc_attr( $doclap_form_id ); ?>" class="sr-only">
					<?php echo esc_html( $doclap_value( 'searchLabel' ) ); ?>
				</label>
				<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme icon.?>
				<?php echo doclap_icon( 'search' ); ?>
				<input
					type="search"
					id="<?php echo esc_attr( $doclap_form_id ); ?>"
					name="s"
					value="<?php echo esc_attr( $doclap_search_query ); ?>"
					placeholder="<?php echo esc_attr( $doclap_value( 'searchPlaceholder' ) ); ?>"
					maxlength="200"
				>
				<?php if ( '' !== $doclap_type ) : ?>
					<input type="hidden" name="doclap_type" value="<?php echo esc_attr( $doclap_type ); ?>">
				<?php endif; ?>
				<button
					type="submit"
					aria-label="<?php echo esc_attr( $doclap_value( 'submitLabel' ) ); ?>"
				>
					<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme icon.?>
					<?php echo doclap_icon( 'arrow-right' ); ?>
				</button>
			</form>
			<p class="form-note"><?php echo nl2br( esc_html( $doclap_value( 'helpNote' ) ) ); ?></p>

			<?php if ( $doclap_has_search ) : ?>
				<nav
					class="filter-bar"
					style="margin-top:40px"
					aria-label="<?php echo esc_attr__( 'Result type', 'doclap' ); ?>"
				>
					<?php foreach ( $doclap_filters as $doclap_filter_type => $doclap_filter_label ) : ?>
						<form action="<?php echo esc_url( $doclap_home ); ?>" method="get">
							<input type="hidden" name="s" value="<?php echo esc_attr( $doclap_search_query ); ?>">
							<?php if ( '' !== $doclap_filter_type ) : ?>
								<input
									type="hidden"
									name="doclap_type"
									value="<?php echo esc_attr( $doclap_filter_type ); ?>"
								>
							<?php endif; ?>
							<button
								type="submit"
								aria-pressed="<?php echo $doclap_type === $doclap_filter_type ? 'true' : 'false'; ?>"
							>
								<?php echo esc_html( $doclap_filter_label ); ?>
							</button>
						</form>
					<?php endforeach; ?>
				</nav>
				<?php
				$doclap_count      = (int) $doclap_search_results->found_posts;
				$doclap_format     = 1 === $doclap_count
					? $doclap_value( 'resultSingular' )
					: $doclap_value( 'resultPlural' );
				$doclap_count_text = str_replace(
					'%d',
					number_format_i18n( $doclap_count ),
					$doclap_format,
				);
				?>
				<p class="result-summary" role="status">
					<?php echo esc_html( $doclap_count_text ); ?>
					<?php echo esc_html( sprintf( __( 'for “%s”', 'doclap' ), $doclap_search_query ) ); ?>
				</p>

				<?php if ( $doclap_search_results->have_posts() ) : ?>
					<?php
					// The result cards are h3 headings; this hidden heading keeps the
					// document outline sequential without changing the reference layout.
					?>
					<h2 class="sr-only"><?php esc_html_e( 'Search results', 'doclap' ); ?></h2>
					<div class="search-results">
						<?php while ( $doclap_search_results->have_posts() ) : ?>
							<?php
							$doclap_search_results->the_post();
							$doclap_post_type = get_post_type();
							$doclap_type_label = 'page' === $doclap_post_type
								? __( 'Page', 'doclap' )
								: ( 'work' === $doclap_post_type ? __( 'Work', 'doclap' ) : __( 'Note', 'doclap' ) );
							$doclap_permalink = get_permalink();
							?>
							<article class="log-row post-row">
								<div class="meta">
									<?php echo esc_html( $doclap_type_label ); ?>
									<?php if ( 'post' === $doclap_post_type ) : ?>
										<br>
										<time datetime="<?php echo esc_attr( (string) get_the_date( DATE_W3C ) ); ?>">
											<?php echo esc_html( (string) get_the_date() ); ?>
										</time>
									<?php endif; ?>
								</div>
								<div>
									<h3>
										<a href="<?php echo esc_url( (string) $doclap_permalink ); ?>">
											<?php echo esc_html( get_the_title() ); ?>
										</a>
									</h3>
									<p><?php echo esc_html( wp_trim_words( get_the_excerpt(), 30 ) ); ?></p>
								</div>
								<a
									class="icon-link"
									href="<?php echo esc_url( (string) $doclap_permalink ); ?>"
									aria-label="<?php echo esc_attr( sprintf( __( 'View %s', 'doclap' ), get_the_title() ) ); ?>"
								>
									<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme icon.?>
									<?php echo doclap_icon( 'arrow-up-right' ); ?>
								</a>
							</article>
						<?php endwhile; ?>
					</div>
					<?php
					$doclap_pagination = paginate_links(
						array(
							'total'     => $doclap_search_results->max_num_pages,
							'current'   => max( 1, get_query_var( 'paged' ), get_query_var( 'page' ) ),
							'type'      => 'list',
							'prev_text' => __( 'Previous', 'doclap' ),
							'next_text' => __( 'Next', 'doclap' ),
							'add_args'  => '' !== $doclap_type
								? array( 'doclap_type' => $doclap_type )
								: array(),
						),
					);
					if ( is_string( $doclap_pagination ) && '' !== $doclap_pagination ) :
						?>
						<nav
							class="navigation pagination index-grid"
							aria-label="<?php echo esc_attr__( 'Search results pages', 'doclap' ); ?>"
						>
							<?php echo wp_kses_post( $doclap_pagination ); ?>
						</nav>
						<?php
					endif;
					wp_reset_postdata();
					?>
				<?php else : ?>
					<div class="empty-state">
						<h2><?php echo doclap_rich( $doclap_value( 'noResultsHeading' ) ); ?></h2>
						<p><?php echo doclap_rich( $doclap_value( 'noResultsCopy' ) ); ?></p>
						<a
							class="text-link"
							href="<?php echo esc_url( doclap_resolve_url( $doclap_value( 'noResultsLinkUrl' ) ) ); ?>"
						>
							<span data-doclap-rich="noResultsLinkLabel"><?php echo doclap_rich( $doclap_value( 'noResultsLinkLabel' ) ); ?></span>
							<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme icon.?>
							<?php echo doclap_icon( 'arrow-up-right' ); ?>
						</a>
						<a class="text-link" href="<?php echo esc_url( $doclap_home ); ?>">
							<span><?php echo esc_html__( 'Return home', 'doclap' ); ?></span>
							<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme icon.?>
							<?php echo doclap_icon( 'arrow-up-right' ); ?>
						</a>
					</div>
				<?php endif; ?>
			<?php else : ?>
				<div class="empty-state">
					<h2><?php echo doclap_rich( $doclap_value( 'emptyHeading' ) ); ?></h2>
					<p><?php echo doclap_rich( $doclap_value( 'emptyCopy' ) ); ?></p>
				</div>
			<?php endif; ?>
		</div>
	</section>
</div>
