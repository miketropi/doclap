<?php
/**
 * Server renderer for the Doclap home work block.
 *
 * The experiment dialogs are printed after `.grid-2.works` on purpose: a dialog
 * sitting between the work cards would become a grid sibling and break the
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

$doclap_experiments = is_array( $attributes['experiments'] ?? null )
	? $attributes['experiments']
	: array();
$doclap_anchor  = (string) ( $attributes['anchor'] ?? '' );
$doclap_uid     = wp_unique_id( 'doclap-experiment-' );
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
$doclap_used_anchors = array();
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<div class="section-head"><h2 data-doclap-rich="worksHeading"><?php echo doclap_rich( (string) ( $attributes['worksHeading'] ?? '' ) ); ?></h2><span class="meta"><?php echo esc_html( (string) ( $attributes['worksMeta'] ?? '' ) ); ?></span></div>
		<div class="grid-2 works"><?php
		foreach ( $doclap_experiments as $doclap_index => $doclap_work ) :
			$doclap_work   = is_array( $doclap_work ) ? $doclap_work : array();
			$doclap_dialog = $doclap_uid . '-experiment-' . (int) $doclap_index;
			$doclap_title  = (string) ( $doclap_work['title'] ?? '' );
			$doclap_anchor_slug = sanitize_title( (string) ( $doclap_work['anchor'] ?? '' ) );

			if ( '' !== $doclap_anchor_slug ) {
				$doclap_suffix = 2;
				$doclap_base   = $doclap_anchor_slug;

				while ( in_array( $doclap_anchor_slug, $doclap_used_anchors, true ) ) {
					$doclap_anchor_slug = $doclap_base . '-' . $doclap_suffix;
					++$doclap_suffix;
				}

				$doclap_used_anchors[] = $doclap_anchor_slug;
			}
			?><button type="button" class="card-flat work-card"<?php echo '' !== $doclap_anchor_slug ? ' id="' . esc_attr( $doclap_anchor_slug ) . '"' : ''; ?> data-dialog="<?php echo esc_attr( $doclap_dialog ); ?>" aria-label="<?php
				echo esc_attr(
				sprintf(
						/* translators: %s: experiment title. */
						__( 'Open the %s experiment', 'doclap' ),
					wp_strip_all_tags( $doclap_title ),
				),
			);
			?>"><div class="work-image"><canvas class="experiment-preview" role="img" data-canvas="<?php echo esc_attr( (string) ( $doclap_work['canvas'] ?? '' ) ); ?>" aria-label="<?php echo esc_attr( wp_strip_all_tags( $doclap_title ) ); ?>"></canvas><span class="work-edition"><span><?php
				echo esc_html( (string) ( $doclap_work['editionPrimary'] ?? '' ) );
			?></span><span><?php
				echo esc_html( (string) ( $doclap_work['editionSecondary'] ?? '' ) );
			?></span></span><span class="work-view"><?php esc_html_e( 'Explore motion', 'doclap' ); ?></span><span class="project-open"><?php
				echo $doclap_icon( 'arrow-up-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></span></div><div class="work-info"><h3><?php echo doclap_rich( $doclap_title ); ?></h3><span class="meta"><?php
				echo $doclap_br( (string) ( $doclap_work['metaLines'] ?? '' ) );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
			?></span></div><p class="work-sub"><?php
				echo doclap_rich( (string) ( $doclap_work['summary'] ?? '' ) );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
			?></p><div class="work-detail"><span><?php
				echo esc_html( (string) ( $doclap_work['detailLabel'] ?? '' ) );
			?></span><?php
				echo $doclap_icon( 'arrow-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></div></button><?php
		endforeach;
		?></div>
		<?php foreach ( $doclap_experiments as $doclap_index => $doclap_work ) : ?>
			<?php
			$doclap_work   = is_array( $doclap_work ) ? $doclap_work : array();
			$doclap_dialog = $doclap_uid . '-experiment-' . (int) $doclap_index;
			?>
			<dialog class="dialog experiment-dialog" id="<?php echo esc_attr( $doclap_dialog ); ?>" aria-labelledby="<?php echo esc_attr( $doclap_dialog . '-title' ); ?>"><div class="dialog-inner"><div class="dialog-head"><h2 id="<?php echo esc_attr( $doclap_dialog . '-title' ); ?>"><?php
				echo doclap_rich( (string) ( $doclap_work['title'] ?? '' ) );
			?></h2><button type="button" class="close" aria-label="<?php echo esc_attr__( 'Close experiment', 'doclap' ); ?>"><?php
				echo $doclap_icon( 'x' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></button></div><canvas class="dialog-preview" data-canvas="<?php echo esc_attr( (string) ( $doclap_work['canvas'] ?? '' ) ); ?>" aria-hidden="true"></canvas><p class="dialog-copy"><?php
				echo doclap_rich( (string) ( $doclap_work['summary'] ?? '' ) );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
			?></p><div class="control-row"><label><?php esc_html_e( 'Tempo', 'doclap' ); ?><input class="tempo" type="range" min="0.5" max="2" step="0.1" value="1"></label><output class="tempo-value">1.0×</output><button type="button" class="btn btn-ghost experiment-pause" aria-pressed="false" data-pause-label="<?php esc_attr_e( 'Pause', 'doclap' ); ?>" data-resume-label="<?php esc_attr_e( 'Resume', 'doclap' ); ?>"><?php
				esc_html_e( 'Pause', 'doclap' );
			?></button></div></div></dialog>
		<?php endforeach; ?>
		<p class="caption" data-doclap-rich="worksCaption"><?php echo doclap_rich( (string) ( $attributes['worksCaption'] ?? '' ) ); ?></p>
	</div>
</section>
