<?php
/**
 * Server-side render for the editorial site footer.
 *
 * @var array<string, mixed> $attributes Block attributes.
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

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
	array( 'class' => doclap_scope_class( 'doclap-site-footer' ), 'style' => $doclap_colour_style ),
);
$nav_groups     = is_array( $attributes['navGroups'] ?? null )
	? $attributes['navGroups']
	: array();
$brand_url      = (string) ( $attributes['brandUrl'] ?? '' );
$brand_url      = '' === trim( $brand_url )
	? home_url( '/' )
	: doclap_resolve_url( $brand_url );
$brand_text     = (string) ( $attributes['brandText'] ?? '' );
$privacy_url    = trim( (string) ( $attributes['privacyUrl'] ?? '' ) );

/*
 * The wordmark is either the text mark or a media-library logo; the shared
 * resolver owns that fallback chain, so an image mode with nothing selected still
 * renders the text mark rather than an empty link.
 */
$brand_image = doclap_brand_image( $attributes, 'sf-wordmark-image', 'lazy' );
$brand_name  = '' !== $brand_image
	? doclap_brand_alt( $attributes, absint( $attributes['brandMediaId'] ?? 0 ) )
	: $brand_text;

if ( '' === $brand_name ) {
	$brand_name = $brand_text;
}
?>
<div <?php echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped?>>
	<footer
		class="pagefoot studio-footer"
		aria-label="<?php echo esc_attr( (string) ( $attributes['footerAriaLabel'] ?? '' ) ); ?>"
	>
		<div class="container">
			<div class="sf-top">
				<div class="sf-intro">
					<p class="sf-kicker">
						<?php echo esc_html( (string) ( $attributes['kicker'] ?? '' ) ); ?>
					</p>
					<h2 data-doclap-rich="heading">
						<?php echo doclap_rich( (string) ( $attributes['heading'] ?? '' ) ); ?>
					</h2>
					<p data-doclap-rich="intro">
						<?php echo doclap_rich( (string) ( $attributes['intro'] ?? '' ) ); ?>
					</p>
					<a
						href="<?php echo esc_url( doclap_resolve_url( (string) ( $attributes['ctaUrl'] ?? '' ) ) ); ?>"
					>
						<span data-doclap-rich="ctaLabel"><?php echo doclap_rich( (string) ( $attributes['ctaLabel'] ?? '' ) ); ?></span>
						<?php
						echo doclap_icon( 'arrow-up-right' );
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted local SVG.
						?>
					</a>
				</div>
				<div class="sf-navigation">
					<?php foreach ( $nav_groups as $group ) : ?>
						<?php
						if ( ! is_array( $group ) ) {
							continue;
						}
						$links = is_array( $group['links'] ?? null )
							? $group['links']
							: array();
						?>
						<nav
							class="sf-column"
							aria-label="<?php echo esc_attr( (string) ( $group['ariaLabel'] ?? '' ) ); ?>"
						>
							<p class="sf-kicker">
								<?php echo esc_html( (string) ( $group['kicker'] ?? '' ) ); ?>
							</p>
							<?php foreach ( $links as $link ) : ?>
								<?php
								if ( ! is_array( $link ) ) {
									continue;
								}
								$link_url = (string) ( $link['url'] ?? '' );
								$resolved = doclap_resolve_url( $link_url );
								$current  = doclap_link_is_current( $link_url );
								?>
								<a
									href="<?php echo esc_url( $resolved ); ?>"
									<?php echo $current ? 'aria-current="page"' : ''; ?>
								>
									<span><?php echo esc_html( (string) ( $link['label'] ?? '' ) ); ?></span>
									<?php
									echo doclap_icon( 'arrow-up-right' );
									// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted local SVG.
									?>
								</a>
							<?php endforeach; ?>
						</nav>
					<?php endforeach; ?>
				</div>
			</div>

			<a
				class="<?php echo esc_attr( '' === $brand_image ? 'sf-wordmark' : 'sf-wordmark sf-wordmark--image' ); ?>"
				href="<?php echo esc_url( $brand_url ); ?>"
				aria-label="<?php echo esc_attr( sprintf( __( '%s — back to home', 'doclap' ), $brand_name ) ); ?>"
			>
				<?php if ( '' !== $brand_image ) : ?>
					<?php echo $brand_image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- `wp_get_attachment_image()` or escaped above.?>
				<?php else : ?>
					<span><?php echo esc_html( $brand_text ); ?></span>
					<sup><?php echo esc_html( (string) ( $attributes['brandMark'] ?? '' ) ); ?></sup>
				<?php endif; ?>
				<span class="sf-sign" aria-hidden="true">
					<?php
					echo doclap_icon( 'arrow-up-right' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted local SVG.
					?>
				</span>
			</a>

			<div class="sf-bottom">
				<span>
					<?php
					echo esc_html(
						trim(
							(string) ( $attributes['copyrightPrefix'] ?? '' )
							. ' ' . wp_date( 'Y' ) . ' '
							. (string) ( $attributes['copyrightText'] ?? '' ),
						),
					);
					?>
				</span>
				<span class="sf-signature">
					<?php echo esc_html( (string) ( $attributes['signature'] ?? '' ) ); ?>
				</span>
				<?php if ( '' !== $privacy_url ) : ?>
					<a href="<?php echo esc_url( doclap_resolve_url( $privacy_url ) ); ?>">
						<?php echo esc_html( (string) ( $attributes['privacyLabel'] ?? '' ) ); ?>
					</a>
				<?php endif; ?>
				<button type="button" class="sf-back" data-doclap-back-to-top>
					<?php echo esc_html( (string) ( $attributes['backToTopLabel'] ?? '' ) ); ?>
					<?php
					echo doclap_icon( 'arrow-up' );
					// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted local SVG.
					?>
				</button>
			</div>
		</div>
	</footer>
</div>
