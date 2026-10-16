<?php
/**
 * Server render for doclap/site-header.
 *
 * @var array<string, mixed> $attributes Block attributes.
 * @var string               $content    Unused.
 * @var WP_Block             $block      Block instance.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_brand      = (string) ( $attributes['brandText'] ?? __( 'độc lập', 'doclap' ) );
$doclap_brand_mark = (string) ( $attributes['brandSuffix'] ?? '®' );
$doclap_brand_url  = doclap_resolve_url( (string) ( $attributes['brandUrl'] ?? '' ) );
$doclap_nav_label  = (string) ( $attributes['navLabel'] ?? __( 'Main navigation', 'doclap' ) );
$doclap_skip_label = (string) ( $attributes['skipLabel'] ?? __( 'Skip to content', 'doclap' ) );
$doclap_menu_label = (string) ( $attributes['menuLabel'] ?? __( 'Menu', 'doclap' ) );
$doclap_cta_label  = (string) ( $attributes['ctaLabel'] ?? __( 'Start a conversation', 'doclap' ) );
$doclap_cta_url    = doclap_resolve_url( (string) ( $attributes['ctaUrl'] ?? '' ) );
$doclap_nav_items  = is_array( $attributes['navItems'] ?? null ) ? $attributes['navItems'] : array();
$doclap_quick      = is_array( $attributes['quickLinks'] ?? null ) ? $attributes['quickLinks'] : array();
$doclap_show_bar   = (bool) ( $attributes['showProgress'] ?? true );

$doclap_wrapper = get_block_wrapper_attributes(
	array( 'class' => doclap_scope_class( 'doclap-site-header' ) ),
);
?>
<div <?php echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.?>>
	<a class="skip" href="#content"><?php echo esc_html( $doclap_skip_label ); ?></a>

	<?php if ( $doclap_show_bar ) : ?>
		<div class="reading-progress" data-doclap-progress aria-hidden="true"></div>
	<?php endif; ?>

	<header id="site-header" class="topnav" data-doclap-header>
		<div class="container topnav-inner">
			<a class="logo" href="<?php echo esc_url( $doclap_brand_url ); ?>">
				<?php echo esc_html( $doclap_brand ); ?><?php if ( '' !== $doclap_brand_mark ) : ?><sup><?php echo esc_html( $doclap_brand_mark ); ?></sup><?php endif; ?>
			</a>

			<nav id="navigation-links" aria-label="<?php echo esc_attr( $doclap_nav_label ); ?>">
				<?php
				foreach ( $doclap_nav_items as $doclap_index => $doclap_item ) :
					if ( ! is_array( $doclap_item ) ) {
						continue;
					}

					$doclap_item_label = (string) ( $doclap_item['label'] ?? '' );

					if ( '' === $doclap_item_label ) {
						continue;
					}

					$doclap_layout   = (string) ( $doclap_item['panelLayout'] ?? 'list' );
					$doclap_panel_id = 'doclap-panel-' . sanitize_title( $doclap_item_label ) . '-' . (int) $doclap_index;
					$doclap_is_mega  = in_array( $doclap_layout, array( 'mega', 'pages' ), true );
					$doclap_links    = is_array( $doclap_item['links'] ?? null ) ? $doclap_item['links'] : array();
					$doclap_columns  = array();

					foreach ( $doclap_links as $doclap_link ) {
						if ( ! is_array( $doclap_link ) ) {
							continue;
						}

						$doclap_group = (string) ( $doclap_link['group'] ?? '' );

						if ( '' !== $doclap_group ) {
							$doclap_columns[ $doclap_group ][] = $doclap_link;
						}
					}
					?>
					<div class="nav-group<?php echo $doclap_is_mega ? ' nav-group-mega' : ''; ?>">
						<button
							type="button"
							class="nav-disclosure"
							aria-expanded="false"
							aria-controls="<?php echo esc_attr( $doclap_panel_id ); ?>"
						>
							<?php echo esc_html( $doclap_item_label ); ?>
							<?php echo doclap_icon( 'chevron-down' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.?>
						</button>

						<div
							id="<?php echo esc_attr( $doclap_panel_id ); ?>"
							class="nav-submenu<?php echo $doclap_is_mega ? ' nav-mega' : ''; ?><?php echo 'pages' === $doclap_layout ? ' nav-pages' : ''; ?>"
							aria-label="<?php echo esc_attr( (string) ( $doclap_item['panelLabel'] ?? $doclap_item_label ) ); ?>"
							hidden
						>
							<?php if ( ! $doclap_is_mega ) : ?>
								<span class="nav-submenu-label"><?php echo esc_html( (string) ( $doclap_item['panelLabel'] ?? '' ) ); ?></span>
								<?php foreach ( $doclap_links as $doclap_link ) : ?>
									<?php if ( ! is_array( $doclap_link ) ) : ?>
										<?php continue; ?>
									<?php endif; ?>
									<?php
									$doclap_href    = doclap_resolve_url( (string) ( $doclap_link['url'] ?? '' ) );
									$doclap_current = doclap_link_is_current( (string) ( $doclap_link['url'] ?? '' ) );
									?>
									<a href="<?php echo esc_url( $doclap_href ); ?>"<?php echo $doclap_current ? ' aria-current="page"' : ''; ?>>
										<span><?php echo esc_html( (string) ( $doclap_link['label'] ?? '' ) ); ?></span>
										<?php if ( '' !== (string) ( $doclap_link['description'] ?? '' ) ) : ?>
											<small><?php echo esc_html( (string) $doclap_link['description'] ); ?></small>
										<?php endif; ?>
										<?php echo doclap_icon( 'arrow-up-right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.?>
									</a>
								<?php endforeach; ?>
							<?php else : ?>
								<div class="mega-layout">
									<div class="mega-intro">
										<span class="nav-submenu-label"><?php echo esc_html( (string) ( $doclap_item['panelLabel'] ?? '' ) ); ?></span>
										<?php if ( '' !== (string) ( $doclap_item['panelTitle'] ?? '' ) ) : ?>
											<p class="mega-title"><?php echo nl2br( esc_html( (string) $doclap_item['panelTitle'] ) ); ?></p>
										<?php endif; ?>
										<?php if ( '' !== (string) ( $doclap_item['panelDescription'] ?? '' ) ) : ?>
											<p class="mega-description"><?php echo esc_html( (string) $doclap_item['panelDescription'] ); ?></p>
										<?php endif; ?>
										<?php if ( '' !== (string) ( $doclap_item['panelAllLabel'] ?? '' ) ) : ?>
											<a class="mega-all" href="<?php echo esc_url( doclap_resolve_url( (string) ( $doclap_item['panelAllUrl'] ?? '' ) ) ); ?>">
												<span><?php echo esc_html( (string) $doclap_item['panelAllLabel'] ); ?></span>
												<?php echo doclap_icon( 'arrow-up-right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.?>
											</a>
										<?php endif; ?>
									</div>

									<?php if ( 'pages' === $doclap_layout ) : ?>
										<?php foreach ( $doclap_columns as $doclap_group_label => $doclap_group_links ) : ?>
											<div class="pages-column">
												<span class="nav-submenu-label"><?php echo esc_html( (string) $doclap_group_label ); ?></span>
												<?php foreach ( $doclap_group_links as $doclap_link ) : ?>
													<?php
													$doclap_href    = doclap_resolve_url( (string) ( $doclap_link['url'] ?? '' ) );
													$doclap_current = doclap_link_is_current( (string) ( $doclap_link['url'] ?? '' ) );
													?>
													<a href="<?php echo esc_url( $doclap_href ); ?>"<?php echo $doclap_current ? ' aria-current="page"' : ''; ?>>
														<span><?php echo esc_html( (string) ( $doclap_link['label'] ?? '' ) ); ?></span>
														<?php if ( '' !== (string) ( $doclap_link['description'] ?? '' ) ) : ?>
															<small><?php echo esc_html( (string) $doclap_link['description'] ); ?></small>
														<?php endif; ?>
														<?php echo doclap_icon( 'arrow-up-right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.?>
													</a>
												<?php endforeach; ?>
											</div>
										<?php endforeach; ?>
									<?php else : ?>
										<?php foreach ( $doclap_links as $doclap_link ) : ?>
											<?php if ( ! is_array( $doclap_link ) ) : ?>
												<?php continue; ?>
											<?php endif; ?>
											<a class="mega-project" href="<?php echo esc_url( doclap_resolve_url( (string) ( $doclap_link['url'] ?? '' ) ) ); ?>">
												<?php if ( '' !== (string) ( $doclap_link['indexLabel'] ?? '' ) ) : ?>
													<span class="mega-index"><?php echo esc_html( (string) $doclap_link['indexLabel'] ); ?></span>
												<?php endif; ?>
												<span class="mega-project-title"><?php echo esc_html( (string) ( $doclap_link['label'] ?? '' ) ); ?></span>
												<?php if ( '' !== (string) ( $doclap_link['description'] ?? '' ) ) : ?>
													<small><?php echo nl2br( esc_html( (string) $doclap_link['description'] ) ); ?></small>
												<?php endif; ?>
												<span class="mega-project-foot">
													<span><?php echo esc_html( (string) ( $doclap_link['footLabel'] ?? '' ) ); ?></span>
													<?php echo doclap_icon( 'arrow-up-right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.?>
												</span>
											</a>
										<?php endforeach; ?>
									<?php endif; ?>
								</div>

								<div class="mega-bottom">
									<span><?php echo esc_html( (string) ( $doclap_item['panelFooterNote'] ?? '' ) ); ?></span>
									<button
										type="button"
										class="mega-close"
										aria-label="<?php echo esc_attr( sprintf( (string) ( $attributes['closePanelLabel'] ?? __( 'Close %s panel', 'doclap' ) ), $doclap_item_label ) ); ?>"
									>
										<?php esc_html_e( 'Close', 'doclap' ); ?>
										<?php echo doclap_icon( 'x' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.?>
									</button>
								</div>
							<?php endif; ?>
						</div>
					</div>
				<?php endforeach; ?>

				<?php foreach ( $doclap_quick as $doclap_quick_link ) : ?>
					<?php
					if ( ! is_array( $doclap_quick_link ) ) {
						continue;
					}

					$doclap_quick_label = (string) ( $doclap_quick_link['label'] ?? '' );

					if ( '' === $doclap_quick_label ) {
						continue;
					}

					$doclap_href    = doclap_resolve_url( (string) ( $doclap_quick_link['url'] ?? '' ) );
					$doclap_current = doclap_link_is_current( (string) ( $doclap_quick_link['url'] ?? '' ) );
					?>
					<a href="<?php echo esc_url( $doclap_href ); ?>"<?php echo $doclap_current ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $doclap_quick_label ); ?></a>
				<?php endforeach; ?>
			</nav>

			<?php if ( '' !== $doclap_cta_label ) : ?>
				<a class="nav-contact" href="<?php echo esc_url( $doclap_cta_url ); ?>">
					<?php echo esc_html( $doclap_cta_label ); ?>
					<?php echo doclap_icon( 'arrow-up-right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.?>
				</a>
			<?php endif; ?>

			<button
				type="button"
				class="menu-toggle"
				aria-expanded="false"
				aria-controls="navigation-links"
				data-doclap-menu
				data-open-label="<?php echo esc_attr( $doclap_menu_label ); ?>"
				data-close-label="<?php echo esc_attr( (string) ( $attributes['menuCloseLabel'] ?? __( 'Close', 'doclap' ) ) ); ?>"
			>
				<span class="menu-toggle-label"><?php echo esc_html( $doclap_menu_label ); ?></span>
				<?php echo doclap_icon( 'menu' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.?>
			</button>
		</div>
	</header>
</div>
