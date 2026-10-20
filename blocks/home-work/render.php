<?php
/**
 * Server renderer for the Doclap home work block.
 *
 * Every project card shows one piece of media — an image or a video, from the
 * media library or from a stored URL — and, when it has media, the same piece
 * opens in a dialog. A project with no media yet renders as a plain card: no
 * dialog and no “open” affordance, so the block never advertises something it
 * cannot show.
 *
 * The dialogs are printed after `.grid-2.works` on purpose: a dialog sitting
 * between the work cards would become a grid sibling and break the
 * `#work .work-card:nth-child(2)` styling the reference layout uses for its
 * staggered second card.
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

$doclap_projects = is_array( $attributes['projects'] ?? null )
	? $attributes['projects']
	: array();
$doclap_anchor  = (string) ( $attributes['anchor'] ?? '' );
$doclap_uid     = wp_unique_id( 'doclap-project-' );
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
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'work',
		'class' => doclap_scope_class( 'doclap-home-work', array( 'section' ) ),
		'style' => $doclap_colour_style,
	),
);
$doclap_br   = static fn( string $value ): string => nl2br( esc_html( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );

/**
 * Media element for one project.
 *
 * The attachment is authoritative when one is still selected — `srcset`, the
 * intrinsic dimensions and a video's poster (its featured image) all come from
 * WordPress — and the stored URL is the fallback for media whose attachment was
 * deleted. The card copy of the media is decorative by contract, because it sits
 * inside the card button that already carries the accessible name; the dialog
 * copy is the one that speaks with the project's own alternative text.
 *
 * @param array<string, mixed> $project Project attributes.
 * @param string               $size    Image size for the attachment path.
 * @param string               $mode    `card` or `dialog`.
 *
 * @return string Media markup, or an empty string when the project has no media.
 */
$doclap_media = static function ( array $project, string $size, string $mode ): string {
	$doclap_id        = absint( $project['mediaId'] ?? 0 );
	$doclap_url       = trim( (string) ( $project['mediaUrl'] ?? '' ) );
	$doclap_alt       = trim( (string) ( $project['mediaAlt'] ?? '' ) );
	$doclap_dialog    = 'dialog' === $mode;
	$doclap_class     = $doclap_dialog ? 'dialog-media' : 'work-media';
	$doclap_is_video  = 'video' === ( $project['mediaType'] ?? 'image' );

	if ( $doclap_is_video ) {
		$doclap_src = $doclap_id > 0 ? (string) wp_get_attachment_url( $doclap_id ) : $doclap_url;

		if ( '' === $doclap_src ) {
			return '';
		}

		$doclap_poster = $doclap_id > 0 ? (string) get_the_post_thumbnail_url( $doclap_id, 'large' ) : '';

		if ( $doclap_dialog ) {
			$doclap_state = '' !== $doclap_alt
				? ' controls aria-label="' . esc_attr( $doclap_alt ) . '"'
				: ' controls';
		} else {
			// Ambient preview: silenced, looping and hidden from assistive
			// technology, because the card button already names the project.
			$doclap_state = ' muted loop playsinline aria-hidden="true"';
		}

		return sprintf(
			'<video class="%1$s" src="%2$s"%3$s preload="metadata"%4$s></video>',
			esc_attr( $doclap_class ),
			esc_url( $doclap_src ),
			'' !== $doclap_poster ? ' poster="' . esc_url( $doclap_poster ) . '"' : '',
			$doclap_state,
		);
	}

	if ( $doclap_id > 0 ) {
		$doclap_attrs = array(
			'class'    => $doclap_class,
			'decoding' => 'async',
		);

		if ( $doclap_dialog ) {
			// The dialog carries the text alternative; leaving it unset hands the
			// fallback to the media library's own alt through core.
			if ( '' !== $doclap_alt ) {
				$doclap_attrs['alt'] = $doclap_alt;
			}
		} else {
			// Decorative: the card button already names the project, and the card
			// is roughly half the content width above the compact shell.
			$doclap_attrs['alt']   = '';
			$doclap_attrs['sizes'] = '(max-width:920px) 100vw, 46vw';
		}

		return (string) wp_get_attachment_image( $doclap_id, $size, false, $doclap_attrs );
	}

	if ( '' === $doclap_url ) {
		return '';
	}

	return sprintf(
		'<img class="%1$s" src="%2$s" alt="%3$s" loading="lazy" decoding="async">',
		esc_attr( $doclap_class ),
		esc_url( $doclap_url ),
		esc_attr( $doclap_dialog ? $doclap_alt : '' ),
	);
};
$doclap_view_label  = trim( (string) ( $attributes['viewLabel'] ?? '' ) );
$doclap_used_anchors = array();
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<div class="section-head"><h2 data-doclap-rich="worksHeading"><?php echo doclap_rich( (string) ( $attributes['worksHeading'] ?? '' ) ); ?></h2><span class="meta"><?php echo esc_html( (string) ( $attributes['worksMeta'] ?? '' ) ); ?></span></div>
		<div class="grid-2 works"><?php
		foreach ( $doclap_projects as $doclap_index => $doclap_project ) :
			$doclap_project     = is_array( $doclap_project ) ? $doclap_project : array();
			$doclap_dialog      = $doclap_uid . '-' . (int) $doclap_index;
			$doclap_title       = (string) ( $doclap_project['title'] ?? '' );
			$doclap_card_media  = $doclap_media( $doclap_project, 'large', 'card' );
			$doclap_is_openable = '' !== $doclap_card_media;
			$doclap_tag         = $doclap_is_openable ? 'button' : 'article';
			$doclap_anchor_slug = sanitize_title( (string) ( $doclap_project['anchor'] ?? '' ) );

			if ( '' !== $doclap_anchor_slug ) {
				$doclap_suffix = 2;
				$doclap_base   = $doclap_anchor_slug;

				while ( in_array( $doclap_anchor_slug, $doclap_used_anchors, true ) ) {
					$doclap_anchor_slug = $doclap_base . '-' . $doclap_suffix;
					++$doclap_suffix;
				}

				$doclap_used_anchors[] = $doclap_anchor_slug;
			}

			$doclap_tag_attrs = '' !== $doclap_anchor_slug ? ' id="' . esc_attr( $doclap_anchor_slug ) . '"' : '';

			if ( $doclap_is_openable ) {
				$doclap_tag_attrs .= ' type="button" data-dialog="' . esc_attr( $doclap_dialog ) . '" aria-label="' . esc_attr(
					sprintf(
						/* translators: %s: project title. */
						__( 'Open the %s project', 'doclap' ),
						wp_strip_all_tags( $doclap_title ),
					),
				) . '"';
			}
			?><<?php echo $doclap_tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- `button` or `article`.?> class="card-flat work-card"<?php echo $doclap_tag_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.?>><div class="work-image"><?php
				echo $doclap_card_media;
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the media helper.
			?><span class="work-edition"><span><?php
				echo esc_html( (string) ( $doclap_project['editionPrimary'] ?? '' ) );
			?></span><span><?php
				echo esc_html( (string) ( $doclap_project['editionSecondary'] ?? '' ) );
			?></span></span><?php if ( $doclap_is_openable ) : ?><span class="work-view"><?php echo esc_html( $doclap_view_label ); ?></span><span class="project-open"><?php
				echo $doclap_icon( 'arrow-up-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></span><?php endif; ?></div><div class="work-info"><h3><?php echo doclap_rich( $doclap_title ); ?></h3><span class="meta"><?php
				echo $doclap_br( (string) ( $doclap_project['metaLines'] ?? '' ) );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
			?></span></div><p class="work-sub"><?php
				echo doclap_rich( (string) ( $doclap_project['summary'] ?? '' ) );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
			?></p><div class="work-detail"><span><?php
				echo esc_html( (string) ( $doclap_project['detailLabel'] ?? '' ) );
			?></span><?php
				echo $doclap_icon( 'arrow-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></div><?php echo '</' . $doclap_tag . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- `button` or `article`.?>
			<?php
		endforeach;
		?></div>
		<?php foreach ( $doclap_projects as $doclap_index => $doclap_project ) : ?>
			<?php
			$doclap_project      = is_array( $doclap_project ) ? $doclap_project : array();
			$doclap_dialog       = $doclap_uid . '-' . (int) $doclap_index;
			$doclap_dialog_media = $doclap_media( $doclap_project, 'full', 'dialog' );

			if ( '' === $doclap_dialog_media ) {
				continue;
			}
			?>
			<dialog class="dialog work-dialog" id="<?php echo esc_attr( $doclap_dialog ); ?>" aria-labelledby="<?php echo esc_attr( $doclap_dialog . '-title' ); ?>"><div class="dialog-inner"><div class="dialog-head"><h2 id="<?php echo esc_attr( $doclap_dialog . '-title' ); ?>"><?php
				echo doclap_rich( (string) ( $doclap_project['title'] ?? '' ) );
			?></h2><button type="button" class="close" aria-label="<?php echo esc_attr__( 'Close project', 'doclap' ); ?>"><?php
				echo $doclap_icon( 'x' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></button></div><?php
				echo $doclap_dialog_media;
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the media helper.
			?></div></dialog>
		<?php endforeach; ?>
		<p class="caption" data-doclap-rich="worksCaption"><?php echo doclap_rich( (string) ( $attributes['worksCaption'] ?? '' ) ); ?></p>
	</div>
</section>
