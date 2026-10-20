<?php

/**
 * Markup adapter that renders a WordPress menu as Doclap header navigation.
 *
 * WordPress owns the menu tree, so the walker only translates the standard
 * `wp_nav_menu()` element stream into the Doclap header classes and adds one
 * disclosure control per nested level. Links stay real anchors, and WordPress's
 * own item classes, ids and link attributes are kept intact so the current-item
 * state and third-party filters keep working.
 *
 * @package Doclap
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders `<li>`/`<a>` pairs plus a disclosure `<button>` for every nested level.
 */
final class Doclap_Site_Header_Menu_Walker extends Walker_Nav_Menu {

	/**
	 * DOM id prefix of the header instance being rendered.
	 *
	 * @var string
	 */
	private string $uid;

	/**
	 * Depths whose opening `<ul>` has been written and not yet closed.
	 *
	 * @var int[]
	 */
	private array $open_levels = array();

	/**
	 * Depth of the first list item that arrived without an enclosing list.
	 *
	 * @var int|null
	 */
	private ?int $orphan_depth = null;

	/**
	 * Item that owns the submenu `start_lvl()` is about to open.
	 *
	 * `mega` says the plugin replaced this item's submenu with a panel, which is
	 * why its indicator is already written by `start_el()`.
	 *
	 * @var array{id: int, title: string, mega: bool}|null
	 */
	private ?array $submenu_owner = null;

	/**
	 * Constructor.
	 *
	 * @param string $uid Instance prefix, e.g. the value of `wp_unique_id()`.
	 */
	public function __construct( string $uid = '' ) {
		$this->uid = $uid;
	}

	/**
	 * Starts a sub-menu level: the parent affordances, then the list.
	 *
	 * Two affordances are written here rather than in {@see self::start_el()}
	 * because this method runs only when WordPress is about to render real
	 * children, so a truncated depth or a suppressed submenu can never leave an
	 * orphan control:
	 *
	 * - `doclap-submenu-indicator`, a decorative chevron shown next to parent
	 *   links on hover-capable pointers, where the submenu opens on hover/focus;
	 * - `doclap-submenu-toggle`, the real control for touch and compact layouts,
	 *   where there is nothing to hover.
	 *
	 * The list itself carries no `hidden` attribute: visibility is CSS state read
	 * from the toggle's `aria-expanded` (or from `:hover`/`:focus-within` on
	 * pointer devices), so the submenu opens on hover even if this script never
	 * runs.
	 *
	 * @param string        $output Used to append additional content (passed by reference).
	 * @param int           $depth  Depth of the parent menu item.
	 * @param stdClass|null $args   An object of `wp_nav_menu()` arguments.
	 */
	public function start_lvl( &$output, $depth = 0, $args = null ): void {
		if ( null !== $this->orphan_depth ) {
			return;
		}

		$depth = (int) $depth;
		$owner = $this->submenu_owner;

		if ( null === $owner ) {
			return;
		}

		$classes = (array) apply_filters( 'nav_menu_submenu_css_class', array( 'sub-menu', 'nav-submenu' ), $args, $depth );
		$classes = array_values( array_filter( array_map( 'strval', $classes ) ) );

		if ( array() === $classes ) {
			$classes = array( 'sub-menu', 'nav-submenu' );
		}

		$label  = sprintf(
			/* translators: %s: navigation menu item label. */
			__( 'Toggle submenu for %s', 'doclap' ),
			$owner['title'],
		);
		$indent = "\n" . str_repeat( "\t", $depth + 1 );
		$id     = $this->submenu_id( $owner['id'] );

		$output .= $indent;

		if ( empty( $owner['mega'] ) ) {
			$output .= '<span class="doclap-submenu-indicator" aria-hidden="true">' . doclap_icon( 'chevron-down' ) . '</span>';
			$output .= $indent;
		}

		$output .= '<button type="button" class="doclap-submenu-toggle" aria-expanded="false"';
		$output .= ' aria-controls="' . esc_attr( $id ) . '"';
		$output .= ' aria-label="' . esc_attr( $label ) . '">';
		$output .= doclap_icon( 'chevron-down' );
		$output .= '</button>';
		$output .= $indent;
		$output .= '<ul id="' . esc_attr( $id ) . '" class="' . esc_attr( implode( ' ', $classes ) ) . '">';

		$this->open_levels[] = $depth;
	}

	/**
	 * Ends a sub-menu level.
	 *
	 * @param string        $output Used to append additional content (passed by reference).
	 * @param int           $depth  Depth of the parent menu item.
	 * @param stdClass|null $args   An object of `wp_nav_menu()` arguments.
	 */
	public function end_lvl( &$output, $depth = 0, $args = null ): void {
		if ( null !== $this->orphan_depth ) {
			return;
		}

		$depth = (int) $depth;

		if ( array() === $this->open_levels || end( $this->open_levels ) !== $depth ) {
			return;
		}

		array_pop( $this->open_levels );

		$output .= "\n" . str_repeat( "\t", $depth ) . '</ul>';
	}

	/**
	 * Starts the element output.
	 *
	 * @param string        $output            Used to append additional content (passed by reference).
	 * @param WP_Post|mixed $data_object       Menu item data object.
	 * @param int           $depth             Depth of menu item.
	 * @param stdClass|null $args              An object of `wp_nav_menu()` arguments.
	 * @param int           $current_object_id Optional. ID of the current menu item.
	 */
	public function start_el( &$output, $data_object, $depth = 0, $args = null, $current_object_id = 0 ): void {
		$depth = (int) $depth;

		if ( null !== $this->orphan_depth || ! $data_object instanceof WP_Post ) {
			return;
		}

		/*
		 * A list item only makes sense inside a list. Plugins that replace a
		 * submenu — Beplus Visual Mega Navigation does this for top-level items
		 * with a Gutenberg panel — suppress `start_lvl()` while still streaming
		 * the children, which would otherwise nest raw `<li>` elements inside the
		 * parent `<li>`. Skip that whole subtree and let the plugin own the panel.
		 */
		if ( 0 !== $depth && ! in_array( $depth - 1, $this->open_levels, true ) ) {
			$this->orphan_depth = $depth;

			return;
		}

		/*
		 * Menu item objects are `WP_Post` rows decorated by `wp_setup_nav_menu_item()`,
		 * so the navigation fields only exist at runtime and are read through `isset()`.
		 */
		$item = $data_object;
		$args = is_object( $args ) ? $args : new stdClass();

		$raw_title  = isset( $item->title ) ? (string) $item->title : '';
		$attr_title = isset( $item->attr_title ) ? (string) $item->attr_title : '';

		$classes   = isset( $item->classes ) ? array_map( 'strval', (array) $item->classes ) : array();
		$classes[] = 'menu-item-' . (string) $item->ID;

		if ( 0 === $depth ) {
			$classes[] = 'nav-group';
		}

		$classes = array_filter( $classes );

		/** @var string[] $classes */
		$classes = (array) apply_filters( 'nav_menu_css_class', $classes, $item, $args, $depth );

		if ( in_array( 'has-mega-menu', $classes, true ) ) {
			$classes[] = 'nav-group-mega';
		}

		$class_names = implode( ' ', array_filter( $classes ) );

		$item_id = (string) apply_filters( 'nav_menu_item_id', 'menu-item-' . (string) $item->ID, $item, $args, $depth );

		$output .= str_repeat( "\t", $depth );
		$output .= '<li' . ( '' === $item_id ? '' : ' id="' . esc_attr( $item_id ) . '"' );
		$output .= ( '' === $class_names ? '' : ' class="' . esc_attr( $class_names ) . '"' ) . '>';

		$title = (string) apply_filters( 'nav_menu_item_title', $raw_title, $item, $args, $depth );

		/*
		 * A mega item never reaches {@see self::start_lvl()}: the panel plugin
		 * suppresses the ordinary submenu and streams the panel instead, so the
		 * decorative indicator has to be written here or the item has no affordance
		 * at all on a desktop row, where the plugin's own control is hidden.
		 * `start_lvl()` skips the indicator for the same item, so the two paths can
		 * never both write one.
		 */
		$is_mega = 0 === $depth && (
			in_array( 'has-mega-menu', $classes, true )
			|| in_array( 'nav-group-mega', $classes, true )
		);

		$this->submenu_owner = array(
			'id'    => (int) $item->ID,
			'title' => wp_strip_all_tags( $title ),
			'mega'  => $is_mega,
		);

		$atts = array(
			'target'       => isset( $item->target ) ? (string) $item->target : '',
			'rel'          => isset( $item->xfn ) ? (string) $item->xfn : '',
			'href'         => isset( $item->url ) ? (string) $item->url : '',
			'aria-current' => isset( $item->current ) && $item->current ? 'page' : '',
			'title'        => $attr_title,
		);

		if ( '' === trim( $attr_title ) || trim( strtolower( $attr_title ) ) === trim( strtolower( $raw_title ) ) ) {
			$atts['title'] = '';
		}

		/** @var array<string, string> $atts */
		$atts = (array) apply_filters( 'nav_menu_link_attributes', $atts, $item, $args, $depth );

		$attributes = '';

		foreach ( $atts as $attr => $value ) {
			if ( is_scalar( $value ) && '' !== $value && false !== $value ) {
				$value       = 'href' === $attr ? esc_url( (string) $value ) : esc_attr( (string) $value );
				$attributes .= ' ' . $attr . '="' . $value . '"';
			}
		}

		$link_before = isset( $args->link_before ) ? (string) $args->link_before : '';
		$link_after  = isset( $args->link_after ) ? (string) $args->link_after : '';
		$before      = isset( $args->before ) ? (string) $args->before : '';
		$after       = isset( $args->after ) ? (string) $args->after : '';

		$output .= $before . '<a' . $attributes . '>' . $link_before . $title . $link_after . '</a>' . $after;

		if ( $is_mega ) {
			$output .= "\n" . str_repeat( "\t", $depth + 1 );
			$output .= '<span class="doclap-submenu-indicator" aria-hidden="true">' . doclap_icon( 'chevron-down' ) . '</span>';
		}
	}

	/**
	 * Ends the element output.
	 *
	 * @param string        $output      Used to append additional content (passed by reference).
	 * @param WP_Post|mixed $data_object Menu item data object.
	 * @param int           $depth       Depth of menu item.
	 * @param stdClass|null $args        An object of `wp_nav_menu()` arguments.
	 */
	public function end_el( &$output, $data_object, $depth = 0, $args = null ): void {
		$depth = (int) $depth;

		if ( null !== $this->orphan_depth ) {
			if ( $depth === $this->orphan_depth ) {
				$this->orphan_depth = null;
			}

			return;
		}

		$output .= "</li>\n";
	}

	/**
	 * Instance-safe DOM id of the submenu owned by one menu item.
	 *
	 * @param int $item_id Menu item ID.
	 *
	 * @return string DOM id shared by the toggle's `aria-controls` and the list.
	 */
	private function submenu_id( int $item_id ): string {
		return $this->uid . '-submenu-' . $item_id;
	}
}
