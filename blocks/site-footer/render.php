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

$doclap_wrapper = get_block_wrapper_attributes(
	array( 'class' => doclap_scope_class( 'doclap-site-footer' ) ),
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
					<h2>
						<?php echo nl2br( esc_html( (string) ( $attributes['heading'] ?? '' ) ) ); ?>
					</h2>
					<p>
						<?php echo nl2br( esc_html( (string) ( $attributes['intro'] ?? '' ) ) ); ?>
					</p>
					<a
						href="<?php echo esc_url( doclap_resolve_url( (string) ( $attributes['ctaUrl'] ?? '' ) ) ); ?>"
					>
						<span><?php echo esc_html( (string) ( $attributes['ctaLabel'] ?? '' ) ); ?></span>
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
				class="sf-wordmark"
				href="<?php echo esc_url( $brand_url ); ?>"
				aria-label="<?php echo esc_attr( sprintf( __( '%s — back to home', 'doclap' ), $brand_text ) ); ?>"
			>
				<span><?php echo esc_html( $brand_text ); ?></span>
				<sup><?php echo esc_html( (string) ( $attributes['brandMark'] ?? '' ) ); ?></sup>
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
