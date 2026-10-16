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
$doclap_wrapper = get_block_wrapper_attributes(
	array(
		'id'    => '' !== $doclap_anchor ? $doclap_anchor : 'work',
		'class' => doclap_scope_class( 'doclap-home-work', array( 'section' ) ),
	),
);
$doclap_br   = static fn( string $value ): string => nl2br( esc_html( $value ) );
$doclap_icon = static fn( string $name ): string => doclap_icon( $name );
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?>>
	<div class="container">
		<div class="section-head"><h2><?php echo esc_html( (string) ( $attributes['worksHeading'] ?? '' ) ); ?></h2><span class="meta"><?php echo esc_html( (string) ( $attributes['worksMeta'] ?? '' ) ); ?></span></div>
		<div class="grid-2 works"><?php
		foreach ( $doclap_experiments as $doclap_index => $doclap_work ) :
			$doclap_work   = is_array( $doclap_work ) ? $doclap_work : array();
			$doclap_dialog = 'doclap-experiment-' . (int) $doclap_index;
			$doclap_title  = (string) ( $doclap_work['title'] ?? '' );
			?><button type="button" class="card-flat work-card" id="<?php echo esc_attr( (string) ( $doclap_work['anchor'] ?? '' ) ); ?>" data-dialog="<?php echo esc_attr( $doclap_dialog ); ?>" aria-label="<?php
				echo esc_attr(
				sprintf(
						/* translators: %s: experiment title. */
						__( 'Open the %s experiment', 'doclap' ),
					$doclap_title,
				),
			);
			?>"><div class="work-image"><canvas class="experiment-preview" data-canvas="<?php echo esc_attr( (string) ( $doclap_work['canvas'] ?? '' ) ); ?>" aria-label="<?php echo esc_attr( $doclap_title ); ?>"></canvas><span class="work-edition"><span><?php
				echo esc_html( (string) ( $doclap_work['editionPrimary'] ?? '' ) );
			?></span><span><?php
				echo esc_html( (string) ( $doclap_work['editionSecondary'] ?? '' ) );
			?></span></span><span class="work-view">Explore motion</span><span class="project-open"><?php
				echo $doclap_icon( 'arrow-up-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></span></div><div class="work-info"><h3><?php echo esc_html( $doclap_title ); ?></h3><span class="meta"><?php
				echo $doclap_br( (string) ( $doclap_work['metaLines'] ?? '' ) );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
			?></span></div><p class="work-sub"><?php
				echo $doclap_br( (string) ( $doclap_work['summary'] ?? '' ) );
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
			$doclap_dialog = 'doclap-experiment-' . (int) $doclap_index;
			?>
			<dialog class="dialog experiment-dialog" id="<?php echo esc_attr( $doclap_dialog ); ?>" aria-labelledby="<?php echo esc_attr( $doclap_dialog . '-title' ); ?>"><div class="dialog-inner"><div class="dialog-head"><h2 id="<?php echo esc_attr( $doclap_dialog . '-title' ); ?>"><?php
				echo esc_html( (string) ( $doclap_work['title'] ?? '' ) );
			?></h2><button type="button" class="close" aria-label="<?php echo esc_attr__( 'Close experiment', 'doclap' ); ?>"><?php
				echo $doclap_icon( 'x' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?></button></div><canvas class="dialog-preview" data-canvas="<?php echo esc_attr( (string) ( $doclap_work['canvas'] ?? '' ) ); ?>"></canvas><p class="dialog-copy"><?php
				echo $doclap_br( (string) ( $doclap_work['summary'] ?? '' ) );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
			?></p><div class="control-row"><label><?php esc_html_e( 'Tempo', 'doclap' ); ?><input class="tempo" type="range" min="0.5" max="2" step="0.1" value="1"></label><output class="tempo-value">1.0×</output><button type="button" class="btn btn-ghost experiment-pause" aria-pressed="false"><?php
				esc_html_e( 'Pause', 'doclap' );
			?></button></div></div></dialog>
		<?php endforeach; ?>
		<p class="caption"><?php echo esc_html( (string) ( $attributes['worksCaption'] ?? '' ) ); ?></p>
	</div>
</section>
