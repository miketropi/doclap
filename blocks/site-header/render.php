<?php
/**
 * Server render for doclap/site-header.
 *
 * Navigation is a WordPress menu: either the one the editor selected (`menuId`)
 * or the menu assigned to the parent theme's `primary` location. Structure,
 * labels and URLs live under Appearance → Menus, and rich panels are authored
 * with the Visual Mega Navigation plugin on top-level items.
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

/*
 * The brand is either the text mark or a media-library logo; the shared resolver
 * owns that fallback chain, and the text mark is what renders when it returns an
 * empty image.
 */
$doclap_brand_image    = doclap_brand_image( $attributes, 'logo-image', 'eager' );
$doclap_brand_is_image = '' !== $doclap_brand_image;
$doclap_nav_label  = (string) ( $attributes['navLabel'] ?? __( 'Main navigation', 'doclap' ) );
$doclap_skip_label = (string) ( $attributes['skipLabel'] ?? __( 'Skip to content', 'doclap' ) );
$doclap_menu_label = (string) ( $attributes['menuLabel'] ?? __( 'Menu', 'doclap' ) );
$doclap_cta_label  = (string) ( $attributes['ctaLabel'] ?? __( 'Start a conversation', 'doclap' ) );
$doclap_cta_url    = doclap_resolve_url( (string) ( $attributes['ctaUrl'] ?? '' ) );
$doclap_show_bar   = (bool) ( $attributes['showProgress'] ?? true );

$doclap_menu_id    = absint( $attributes['menuId'] ?? 0 );
$doclap_menu_depth = max( 1, min( 8, absint( $attributes['menuDepth'] ?? 4 ) ) );

/*
 * A selected menu always wins; `0` (or a menu that has since been deleted) falls
 * back to the parent theme's registered `primary` location. With neither
 * available the header still renders without navigation rather than showing a
 * page-list fallback that would misrepresent the site.
 */
$doclap_use_location = false;

if ( $doclap_menu_id > 0 && ! wp_get_nav_menu_object( $doclap_menu_id ) ) {
	$doclap_menu_id = 0;
}

if ( 0 === $doclap_menu_id ) {
	$doclap_use_location = has_nav_menu( 'primary' );
}

$doclap_has_menu = $doclap_use_location || $doclap_menu_id > 0;

$doclap_wrapper   = get_block_wrapper_attributes(
	array( 'class' => doclap_scope_class( 'doclap-site-header' ) ),
);
$doclap_uid       = wp_unique_id( 'doclap-header-' );
$doclap_header_id = $doclap_uid . '-site-header';
$doclap_nav_id    = $doclap_uid . '-navigation-links';
?>
<div <?php echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.?>>
	<a class="skip" href="#content"><?php echo esc_html( $doclap_skip_label ); ?></a>

	<?php if ( $doclap_show_bar ) : ?>
		<div class="reading-progress" data-doclap-progress aria-hidden="true"></div>
	<?php endif; ?>

	<header id="<?php echo esc_attr( $doclap_header_id ); ?>" class="topnav" data-doclap-header>
		<div class="container topnav-inner">
			<a class="<?php echo esc_attr( $doclap_brand_is_image ? 'logo logo--image' : 'logo' ); ?>" href="<?php echo esc_url( $doclap_brand_url ); ?>">
				<?php if ( $doclap_brand_is_image ) : ?>
					<?php echo $doclap_brand_image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by `wp_get_attachment_image()` or above.?>
				<?php else : ?>
					<?php echo esc_html( $doclap_brand ); ?><?php if ( '' !== $doclap_brand_mark ) : ?><sup><?php echo esc_html( $doclap_brand_mark ); ?></sup><?php endif; ?>
				<?php endif; ?>
			</a>

			<?php if ( $doclap_has_menu ) : ?>
				<?php
				$doclap_menu_args = array(
					'echo'         => false,
					'container'    => '',
					'fallback_cb'  => false,
					'depth'        => $doclap_menu_depth,
					'menu_class'   => 'doclap-menu',
					'menu_id'      => $doclap_uid . '-menu',
					'items_wrap'   => '<ul id="%1$s" class="%2$s">%3$s</ul>',
					'item_spacing' => 'discard',
					'walker'       => new Doclap_Site_Header_Menu_Walker( $doclap_uid ),
				);

				if ( $doclap_use_location ) {
					$doclap_menu_args['theme_location'] = 'primary';
				} else {
					$doclap_menu_args['menu'] = $doclap_menu_id;
				}

				$doclap_menu_html = wp_nav_menu( $doclap_menu_args );
				?>
				<?php
				/*
				 * `data-beplus-vmn-compact-mode` is the host contract for Visual Mega
				 * Navigation: below 1024px this drawer is the only compact surface, so
				 * the plugin keeps its mega panels inline inside it instead of opening a
				 * second, off-canvas one. The attribute is inert when the plugin is not
				 * active.
				 */
				?>
				<nav id="<?php echo esc_attr( $doclap_nav_id ); ?>" aria-label="<?php echo esc_attr( $doclap_nav_label ); ?>" data-doclap-nav data-beplus-vmn-compact-mode="accordion">
					<?php echo $doclap_menu_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- `wp_nav_menu()` output.?>
				</nav>
			<?php endif; ?>

			<?php if ( '' !== $doclap_cta_label ) : ?>
				<a class="nav-contact" href="<?php echo esc_url( $doclap_cta_url ); ?>">
					<?php echo esc_html( $doclap_cta_label ); ?>
					<?php echo doclap_icon( 'arrow-up-right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.?>
				</a>
			<?php endif; ?>

			<?php if ( $doclap_has_menu ) : ?>
				<button
					type="button"
					class="menu-toggle"
					aria-expanded="false"
					aria-controls="<?php echo esc_attr( $doclap_nav_id ); ?>"
					data-doclap-menu
					data-open-label="<?php echo esc_attr( $doclap_menu_label ); ?>"
					data-close-label="<?php echo esc_attr( (string) ( $attributes['menuCloseLabel'] ?? __( 'Close', 'doclap' ) ) ); ?>"
				>
					<span class="menu-toggle-label"><?php echo esc_html( $doclap_menu_label ); ?></span>
					<?php echo doclap_icon( 'menu' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.?>
				</button>
			<?php endif; ?>
		</div>
	</header>
</div>
