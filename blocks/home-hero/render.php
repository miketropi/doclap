<?php
/**
 * Server renderer for the Doclap home hero block.
 *
 * Rendering is one of the nine sections the former single landing block was split
 * into: the markup, copy, icon names, escaping and asset fallbacks are unchanged.
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

$doclap_panels = is_array( $attributes['heroPanels'] ?? null )
	? $attributes['heroPanels']
	: array();
$doclap_total  = count( $doclap_panels );
$doclap_poster = ! empty( $attributes['posterUrl'] )
	? (string) $attributes['posterUrl']
	: DOCLAP_URI . '/assets/images/david-head-poster.png';
$doclap_wrapper = get_block_wrapper_attributes(
	array(
		'class' => doclap_scope_class(
			'doclap-home-hero',
			array( 'section', 'hero', 'gallery-hero' ),
		),
	),
);
$doclap_br         = static fn( string $value ): string => nl2br( esc_html( $value ) );
$doclap_url        = static fn( string $value ): string => esc_url( doclap_resolve_url( $value ) );
$doclap_icon       = static fn( string $name ): string => doclap_icon( $name );
$doclap_kicker     = (string) ( $attributes['heroKicker'] ?? '' );
$doclap_edition    = (string) ( $attributes['heroEdition'] ?? '' );
$doclap_poster_alt = (string) ( $attributes['posterAlt'] ?? '' );
$doclap_credit     = (string) ( $attributes['creditText'] ?? '' );
$doclap_credit_url = (string) ( $attributes['creditUrl'] ?? '' );
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
?> aria-roledescription="slideshow" aria-label="<?php echo esc_attr__( 'Two creative views', 'doclap' ); ?>" tabindex="0" data-doclap-mesh="<?php echo esc_url( DOCLAP_URI . '/assets/models/david-head.bin' ); ?>">
	<div class="container">
		<div class="hero-top">
			<span><?php echo esc_html( $doclap_kicker ); ?></span>
			<span class="hero-edition"><?php echo esc_html( $doclap_edition ); ?></span>
		</div>
		<div class="gallery-stage">
			<div class="gallery-word" aria-hidden="true">Emotion.</div>
			<div class="gallery-orbit" aria-hidden="true"></div>
			<div class="hero-visual">
				<img class="doclap-sculpture-poster" src="<?php echo esc_url( $doclap_poster ); ?>" width="946" height="950" alt="<?php echo esc_attr( $doclap_poster_alt ); ?>">
				<canvas class="doclap-sculpture" tabindex="0" aria-label="<?php echo esc_attr__( 'The David head by Michelangelo, a 3D scan. Drag to rotate; use the arrow keys or Home to reset.', 'doclap' ); ?>"></canvas>
			</div>
			<div class="gallery-caption">
				<span class="gallery-dot" aria-hidden="true"></span>
				<span>DAVID — A STUDY IN FORM<br>
					<span class="gallery-caption-sub">Michelangelo / A legacy in digital space</span>
				</span>
			</div>
			<div class="gallery-panels">
				<?php foreach ( $doclap_panels as $doclap_index => $doclap_panel ) : ?>
					<?php
					$doclap_panel   = is_array( $doclap_panel ) ? $doclap_panel : array();
					$doclap_number  = (int) $doclap_index + 1;
					$doclap_current = 0 === (int) $doclap_index;
					?>
					<article class="gallery-panel<?php echo $doclap_current ? ' is-current' : ''; ?>" id="hero-panel-<?php echo esc_attr( (string) $doclap_number ); ?>" role="group" aria-roledescription="slide" aria-label="<?php echo esc_attr( sprintf( '%1$d of %2$d', $doclap_number, $doclap_total ) ); ?>" <?php echo $doclap_current ? '' : 'hidden inert'; ?>><p class="eyebrow"><?php echo esc_html( (string) ( $doclap_panel['eyebrow'] ?? '' ) ); ?></p><?php
						echo $doclap_current ? '<h1>' : '<h2>';
						echo esc_html( (string) ( $doclap_panel['heading'] ?? '' ) );
						?><br><em><?php echo esc_html( (string) ( $doclap_panel['headingAccent'] ?? '' ) ); ?></em><?php
						echo $doclap_current ? '</h1>' : '</h2>';
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- literal tags.
						?><p class="gallery-lead"><?php
							echo $doclap_br( (string) ( $doclap_panel['lead'] ?? '' ) );
							// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper.
						?></p><a class="gallery-link" href="<?php echo $doclap_url( (string) ( $doclap_panel['linkUrl'] ?? '' ) ); ?>"><span><?php echo esc_html( (string) ( $doclap_panel['linkLabel'] ?? '' ) ); ?></span><span class="gallery-arrow"><?php
							echo $doclap_icon( 'arrow-up-right' );
							// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
						?></span></a></article>
				<?php endforeach; ?>
			</div>
			<span class="gallery-vertical" aria-hidden="true">FORM × LIGHT × MOTION</span>
			<div class="gallery-interact"><?php
				echo $doclap_icon( 'move-horizontal' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
			?><span><?php esc_html_e( 'Drag the sculpture to change the view', 'doclap' ); ?></span></div>
		</div>
		<div class="gallery-footer">
			<p>Ten years in the craft.<br><span>Still curious as on day one.</span></p>
			<div class="gallery-pagination" aria-label="<?php echo esc_attr__( 'Choose a view', 'doclap' ); ?>">
				<?php foreach ( $doclap_panels as $doclap_index => $doclap_panel ) : ?>
					<?php
					$doclap_panel   = is_array( $doclap_panel ) ? $doclap_panel : array();
					$doclap_number  = (int) $doclap_index + 1;
					$doclap_current = 0 === (int) $doclap_index;
					?>
					<button type="button" class="slide-tab<?php echo $doclap_current ? ' is-active' : ''; ?>" data-slide="<?php echo esc_attr( (string) $doclap_index ); ?>" aria-pressed="<?php echo $doclap_current ? 'true' : 'false'; ?>" aria-controls="hero-panel-<?php echo esc_attr( (string) $doclap_number ); ?>"><span><?php echo esc_html( str_pad( (string) $doclap_number, 2, '0', STR_PAD_LEFT ) ); ?></span><span class="slide-track"></span><span class="tab-name"><?php echo esc_html( (string) ( $doclap_panel['headingAccent'] ?? '' ) ); ?></span></button>
				<?php endforeach; ?>
			</div>
			<div class="gallery-controls">
				<button type="button" class="icon-button hero-prev" aria-label="<?php echo esc_attr__( 'Previous view', 'doclap' ); ?>"><?php
					echo $doclap_icon( 'arrow-left' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
				?></button>
				<button type="button" class="icon-button hero-next" aria-label="<?php echo esc_attr__( 'Next view', 'doclap' ); ?>"><?php
					echo $doclap_icon( 'arrow-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
				?></button>
				<button type="button" class="icon-button motion-toggle" aria-label="<?php echo esc_attr__( 'Pause motion', 'doclap' ); ?>" aria-pressed="false"><?php
					echo $doclap_icon( 'pause' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
				?></button>
			</div>
		</div>
		<span class="hero-status sr-only" aria-live="polite"></span>
		<p class="david-credit"><?php echo esc_html( $doclap_credit ); ?> <a href="<?php echo esc_url( $doclap_credit_url ); ?>" target="_blank" rel="noopener">Thomas Flynn / CC BY 4.0 <?php
			echo $doclap_icon( 'arrow-up-right' );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
		?></a></p>
	</div>
</section>
