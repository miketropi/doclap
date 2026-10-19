<?php
/**
 * Server rendering for the Single Note block.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_object      = get_queried_object();
$doclap_post        = $doclap_object instanceof WP_Post ? $doclap_object : ( $GLOBALS['post'] ?? null );
$doclap_post        = $doclap_post instanceof WP_Post ? $doclap_post : null;
$doclap_id          = $doclap_post ? (int) $doclap_post->ID : 0;
$doclap_title       = $doclap_post ? get_the_title( $doclap_post ) : __( 'Editorial note', 'doclap' );
$doclap_title       = '' !== trim( $doclap_title ) ? $doclap_title : __( 'Untitled note', 'doclap' );
$doclap_raw         = $doclap_post ? (string) $doclap_post->post_content : '';
$doclap_excerpt     = $doclap_post
	? get_the_excerpt( $doclap_post )
	: __( 'A perspective from the độc lập design practice.', 'doclap' );
$doclap_excerpt     = '' !== trim( $doclap_excerpt )
	? $doclap_excerpt
	: __( 'A perspective from the độc lập design practice.', 'doclap' );
$doclap_permalink   = $doclap_post ? get_permalink( $doclap_post ) : home_url( '/' );
$doclap_permalink   = is_string( $doclap_permalink ) ? $doclap_permalink : home_url( '/' );
$doclap_archive_url = doclap_resolve_url( (string) ( $attributes['archiveUrl'] ?? '@notes' ) );
$doclap_categories  = $doclap_id ? get_the_category( $doclap_id ) : array();
$doclap_category    = ! empty( $doclap_categories )
	? $doclap_categories[0]->name
	: __( 'Uncategorized', 'doclap' );
/*
 * The note body is the queried post's content, run through `the_content` so
 * shortcodes and nested blocks behave exactly as they do on the post itself.
 *
 * That filter runs `do_blocks()`, so a post whose own content contains this block
 * — the block placed on a page instead of on the single-note template, or two
 * copies composed into one page — resolves to itself and renders itself again
 * until PHP aborts. A self-referencing host has no note body to show: the body
 * falls back to the same empty-state paragraph used when no post resolves, and
 * the article shell, metadata, table of contents and related notes still render.
 * A real note's content never contains this block, so its body is unaffected.
 */
$doclap_is_self_reference = null !== $doclap_post && has_block( 'doclap/single-note', $doclap_post );

if ( '' === $doclap_raw || $doclap_is_self_reference ) {
	$doclap_content = '<p>' . esc_html__( 'This note has no published content yet.', 'doclap' ) . '</p>';
} else {
	$doclap_content = (string) apply_filters( 'the_content', $doclap_raw );
}
$doclap_headings    = array();
$doclap_uid         = wp_unique_id( 'doclap-note-' );

$doclap_heading_index = 0;
$doclap_content       = (string) preg_replace_callback(
	'/<h2\b([^>]*)>(.*?)<\/h2>/is',
	static function ( array $doclap_match ) use ( &$doclap_headings, &$doclap_heading_index, $doclap_uid ): string {
		$doclap_heading_text = trim( wp_strip_all_tags( $doclap_match[2] ) );

		if ( '' === $doclap_heading_text ) {
			return $doclap_match[0];
		}

		$doclap_heading_id = '';
		if ( preg_match( '/\bid=(?:"([^"]+)"|\'([^\']+)\')/i', $doclap_match[1], $doclap_id_match ) ) {
			$doclap_heading_id = html_entity_decode(
				(string) ( $doclap_id_match[1] ?: ( $doclap_id_match[2] ?? '' ) ),
				ENT_QUOTES,
				'UTF-8',
			);
		}

		if ( '' === $doclap_heading_id ) {
			$doclap_heading_id = $doclap_uid . '-part-' . $doclap_heading_index;
			$doclap_match[1]  .= ' id="' . esc_attr( $doclap_heading_id ) . '"';
		}

		$doclap_headings[] = array(
			'id'   => $doclap_heading_id,
			'text' => $doclap_heading_text,
		);
		++$doclap_heading_index;

		return '<h2' . $doclap_match[1] . '>' . $doclap_match[2] . '</h2>';
	},
	$doclap_content,
);

$doclap_related_count = max( 0, min( 6, (int) ( $attributes['relatedCount'] ?? 2 ) ) );
$doclap_related       = array();
$doclap_excluded      = $doclap_id ? array( $doclap_id ) : array();

if ( $doclap_id && $doclap_related_count > 0 ) {
	$doclap_category_ids = wp_list_pluck( (array) $doclap_categories, 'term_id' );

	if ( ! empty( $doclap_category_ids ) ) {
		$doclap_same_query = new WP_Query(
			array(
				'post_type'              => 'post',
				'post_status'            => 'publish',
				'posts_per_page'         => $doclap_related_count,
				'post__not_in'           => $doclap_excluded,
				'category__in'           => $doclap_category_ids,
				'ignore_sticky_posts'    => true,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
			),
		);
		$doclap_related = is_array( $doclap_same_query->posts ) ? $doclap_same_query->posts : array();
		$doclap_excluded = array_merge(
			$doclap_excluded,
			wp_list_pluck( $doclap_related, 'ID' ),
		);
	}

	$doclap_remaining = $doclap_related_count - count( $doclap_related );
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
		$doclap_latest = is_array( $doclap_latest_query->posts ) ? $doclap_latest_query->posts : array();
		$doclap_related = array_merge( $doclap_related, $doclap_latest );
	}

	wp_reset_postdata();
}

$doclap_wrapper = get_block_wrapper_attributes(
	array( 'class' => doclap_scope_class( 'doclap-single-note' ) ),
);
// Saved content can still carry `closingHeadingAccent`; the editor folds the pair
// into the merged heading and clears the legacy key on the block's first save.
$doclap_closing_heading = doclap_rich_accent(
	(string) ( $attributes['closingHeading'] ?? __( 'Your idea.<br><em>Make it different.</em>', 'doclap' ) ),
	(string) ( $attributes['closingHeadingAccent'] ?? '' ),
	'<br><em>',
);
?>
<div <?php echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped?>>
	<div class="reading-progress" data-doclap-progress aria-hidden="true"></div>
	<section class="section inner-hero article-hero">
		<div class="container">
			<nav class="breadcrumb" aria-label="<?php esc_attr_e( 'Page path', 'doclap' ); ?>">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>">
					<?php
					echo esc_html(
						(string) ( $attributes['breadcrumbHomeLabel'] ?? __( 'Home', 'doclap' ) ),
					);
					?>
				</a>
				<span aria-hidden="true">/</span>
				<a href="<?php echo esc_url( $doclap_archive_url ); ?>">
					<?php
					echo esc_html(
						(string) ( $attributes['archiveLabel'] ?? __( 'Archive', 'doclap' ) ),
					);
					?>
				</a>
				<span aria-hidden="true">/</span>
				<span aria-current="page"><?php esc_html_e( 'Article', 'doclap' ); ?></span>
			</nav>
			<h1><?php echo esc_html( $doclap_title ); ?></h1>
			<div class="hero-summary">
				<span class="hero-mark" aria-hidden="true">✳</span>
				<p class="lead"><?php echo esc_html( $doclap_excerpt ); ?></p>
			</div>
		</div>
	</section>
	<section class="section">
		<div class="container">
			<div class="article-meta">
				<span>
					<?php
					echo esc_html(
						(string) (
							$attributes['articleMetaPrefix']
							?? __( 'ĐỘC LẬP / EDITORIAL NOTES', 'doclap' )
						),
					);
					?>
				</span>
				<span><?php echo esc_html( $doclap_category ); ?></span>
				<span>
					<?php
					$doclap_reading_time = doclap_reading_time( $doclap_raw );
					echo esc_html(
						sprintf(
							_n( '%d min read', '%d min read', $doclap_reading_time, 'doclap' ),
							$doclap_reading_time,
						),
					);
					?>
				</span>
			</div>
			<div class="article-cover">
				<?php if ( $doclap_id && has_post_thumbnail( $doclap_id ) ) : ?>
					<?php
					echo get_the_post_thumbnail(
						$doclap_id,
						'full',
						array( 'class' => 'article-cover__image' ),
					); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- generated by core.
					?>
				<?php else : ?>
					<div
						class="artwork motion-art"
						role="img"
						aria-label="<?php esc_attr_e( 'Typography graphic: Slow.', 'doclap' ); ?>"
					>
						<span class="art-label"><?php esc_html_e( 'STUDY / MOTION', 'doclap' ); ?></span>
						<span class="art-word"><?php esc_html_e( 'Slow.', 'doclap' ); ?></span>
					</div>
				<?php endif; ?>
			</div>
		</div>
	</section>
	<section class="section">
		<div class="container grid-1-2 article-layout">
			<aside class="toc">
				<?php
				$doclap_show_toc = ! empty( $doclap_headings )
					|| 'message' === ( $attributes['tocEmptyBehaviour'] ?? 'hide' );
				?>
				<?php if ( $doclap_show_toc ) : ?>
					<span class="meta">
						<?php echo esc_html( (string) ( $attributes['tocLabel'] ?? __( 'IN THIS ARTICLE', 'doclap' ) ) ); ?>
					</span>
					<?php if ( empty( $doclap_headings ) ) : ?>
						<span class="form-note">
							<?php esc_html_e( 'No sections are listed for this article.', 'doclap' ); ?>
						</span>
					<?php endif; ?>
					<?php foreach ( $doclap_headings as $doclap_index => $doclap_heading ) : ?>
						<a href="#<?php echo esc_attr( $doclap_heading['id'] ); ?>">
							<?php
							echo esc_html(
								doclap_ordinal( $doclap_index ) . ' / ' . $doclap_heading['text'],
							);
							?>
						</a>
					<?php endforeach; ?>
				<?php endif; ?>
				<div class="article-tools">
					<button
						type="button"
						aria-pressed="false"
						data-doclap-save
						data-status-saved="<?php echo esc_attr__( 'Article saved.', 'doclap' ); ?>"
						data-status-removed="<?php echo esc_attr__( 'Article removed from saved items.', 'doclap' ); ?>"
					>
						<span><?php esc_html_e( 'Save article', 'doclap' ); ?></span>
						<?php
						echo doclap_icon( 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed SVG.
						?>
					</button>
					<button
						type="button"
						data-doclap-copy
						data-permalink="<?php echo esc_url( $doclap_permalink ); ?>"
						data-status-copied="<?php echo esc_attr__( 'Link copied.', 'doclap' ); ?>"
						data-status-failed="<?php echo esc_attr__( 'Unable to copy the link.', 'doclap' ); ?>"
					>
						<span><?php esc_html_e( 'Copy link', 'doclap' ); ?></span>
						<?php
						echo doclap_icon( 'arrow-up-right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						?>
					</button>
				</div>
				<span
					class="form-note"
					data-doclap-article-status
					role="status"
					aria-live="polite"
				></span>
			</aside>
			<article class="prose">
				<?php
				echo $doclap_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- the_content filters.
				?>
				<p class="form-note" data-doclap-rich="disclaimer">
					<?php echo doclap_rich( (string) ( $attributes['disclaimer'] ?? '' ) ); ?>
				</p>
				<a class="text-link" href="<?php echo esc_url( $doclap_archive_url ); ?>">
					<span>
						<?php
						echo esc_html(
							(string) (
								$attributes['backToArchiveLabel']
								?? __( 'Back to all notes', 'doclap' )
							),
						);
						?>
					</span>
					<?php
					echo doclap_icon( 'arrow-up-right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					?>
				</a>
			</article>
		</div>
	</section>
	<section class="section">
		<div class="container">
			<div class="section-head">
				<h2 data-doclap-rich="relatedHeading">
					<?php
					$doclap_related_heading = (string) ( $attributes['relatedHeading'] ?? '' );
					echo doclap_rich(
						'' !== trim( wp_strip_all_tags( $doclap_related_heading ) )
							? $doclap_related_heading
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
						echo doclap_icon( 'arrow-up-right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						?>
					</a>
				</article>
			<?php endforeach; ?>
		</div>
	</section>
	<section class="section closing">
		<div class="container row-between">
			<div>
				<p class="eyebrow">
					<?php echo esc_html( (string) ( $attributes['closingEyebrow'] ?? '' ) ); ?>
				</p>
				<h2 data-doclap-rich="closingHeading">
					<?php echo doclap_rich( $doclap_closing_heading ); ?>
				</h2>
			</div>
			<a
				class="circle-cta"
				href="<?php echo esc_url( doclap_resolve_url( (string) ( $attributes['closingCtaUrl'] ?? '/contact/' ) ) ); ?>"
			>
				<span data-doclap-rich="closingCtaLabel">
					<?php
					echo doclap_rich(
						(string) (
							$attributes['closingCtaLabel']
							?? __( 'Tell us about your idea', 'doclap' )
						),
					);
					?>
				</span>
				<?php
				echo doclap_icon( 'arrow-up-right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed SVG.
				?>
			</a>
		</div>
	</section>
</div>
