<?php
/**
 * Server renderer for the Note content block.
 *
 * The table of contents is extracted from the filtered note body, and the save
 * and copy tools report through the live status region the block's view script
 * drives. A post-less render keeps the table of contents, the tools and the
 * archive link next to the same deterministic copy, so the block is previewable
 * and never queries a post of its own.
 *
 * @var array<string, mixed> $attributes Block attributes.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_post        = doclap_note_queried_post();
$doclap_id          = $doclap_post ? (int) $doclap_post->ID : 0;
$doclap_raw         = $doclap_post ? (string) $doclap_post->post_content : '';
$doclap_permalink   = $doclap_post ? get_permalink( $doclap_post ) : home_url( '/' );
$doclap_permalink   = is_string( $doclap_permalink ) ? $doclap_permalink : home_url( '/' );
$doclap_archive_url = doclap_resolve_url( (string) ( $attributes['archiveUrl'] ?? '@notes' ) );
/*
 * The note body is the queried post's content, run through `the_content` so
 * shortcodes and nested blocks behave exactly as they do on the post itself.
 *
 * That filter runs `do_blocks()`, so a post whose own content contains this block
 * — the block placed on a page instead of the note-detail template, or two
 * copies composed into one page — resolves to itself and renders itself again
 * until PHP aborts. A self-referencing host has no note body to show: the body
 * falls back to the same empty-state paragraph used when no post resolves, and
 * the table of contents, the tools and the archive link still render.
 * A real note's content never contains this block, so its body is unaffected.
 */
$doclap_is_self_reference = null !== $doclap_post && has_block( 'doclap/note-content', $doclap_post );

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
	array( 'class' => doclap_scope_class( 'doclap-note-content', array( 'section' ) ), 'style' => $doclap_colour_style ),
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
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
					echo doclap_icon( 'check' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
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
					echo doclap_icon( 'arrow-up-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
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
				echo doclap_icon( 'arrow-up-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
				?>
			</a>
		</article>
	</div>
</section>
