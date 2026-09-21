<?php

function alfa_glass_menu_setup () {
	// This theme uses wp_nav_menu() in one location.
	register_nav_menus(
		array(
			'main-menu' => esc_html__( 'Основное меню', 'alfa-glass' ),
			'sub-menu-1'	=> esc_html__( 'Дублирующее меню 1', 'alfa-glass' ),
			'sub-menu-2'	=> esc_html__( 'Дублирующее меню 2', 'alfa-glass' ),
		)
	);
}

add_action( 'after_setup_theme', 'alfa_glass_menu_setup' );

// Добавляем поле для кастомного атрибута "data-modal-target" в пункты меню
function custom_menu_item_fields( $item_id, $item, $depth, $args, $id ) {
    // Получаем сохраненное значение поля
    $custom_modal_target = get_post_meta( $item_id, '_menu_item_custom_modal_target', true );
    ?>
    <p class="description description-wide">
        <label for="edit-menu-item-custom-modal-target-<?php echo $item_id; ?>">
            <?php _e( 'Custom Modal Target', 'your-textdomain' ); ?><br />
            <input type="text" id="edit-menu-item-custom-modal-target-<?php echo $item_id; ?>" class="widefat code edit-menu-item-custom-modal-target" name="menu-item-custom-modal-target[<?php echo $item_id; ?>]" value="<?php echo esc_attr( $custom_modal_target ); ?>" />
            <span class="description"><?php _e( 'Enter the modal target ID (e.g., #popup-menu-main).', 'your-textdomain' ); ?></span>
        </label>
    </p>
    <?php
}
add_action( 'wp_nav_menu_item_custom_fields', 'custom_menu_item_fields', 10, 5 );
// Сохраняем значение поля для data-modal-target
function save_custom_menu_item_fields( $menu_id, $menu_item_db_id ) {
    if ( isset( $_POST['menu-item-custom-modal-target'][$menu_item_db_id] ) ) {
        update_post_meta( $menu_item_db_id, '_menu_item_custom_modal_target', sanitize_text_field( $_POST['menu-item-custom-modal-target'][$menu_item_db_id] ) );
    } else {
        delete_post_meta( $menu_item_db_id, '_menu_item_custom_modal_target' );
    }
}
add_action( 'wp_update_nav_menu_item', 'save_custom_menu_item_fields', 10, 2 );

function alfa_normalize_nav_path( $url ) {
	if ( empty( $url ) ) {
		return '';
	}

	$path = wp_parse_url( $url, PHP_URL_PATH );
	if ( null === $path || false === $path ) {
		return '';
	}

	$path = urldecode( strtolower( untrailingslashit( $path ) ) );

	return ( '' === $path ) ? '/' : $path;
}

function alfa_get_current_nav_path() {
	if ( is_front_page() && ! is_paged() ) {
		return '/';
	}

	global $wp;

	$path = isset( $wp->request ) ? $wp->request : '';
	$path = urldecode( strtolower( untrailingslashit( $path ) ) );

	return ( '' === $path ) ? '/' : '/' . $path;
}

function alfa_is_current_nav_url( $url ) {
	if ( empty( $url ) || '#' === $url || str_starts_with( $url, 'javascript:' ) ) {
		return false;
	}

	$fragment = wp_parse_url( $url, PHP_URL_FRAGMENT );
	if ( ! empty( $fragment ) ) {
		return false;
	}

	return alfa_normalize_nav_path( $url ) === alfa_get_current_nav_path();
}

function alfa_is_current_term( $term ) {
	if ( ! $term instanceof WP_Term ) {
		return false;
	}

	return is_tax( $term->taxonomy, (int) $term->term_id );
}

function alfa_render_nav_link( $url, $inner_html, $attrs = array() ) {
	$is_current = alfa_is_current_nav_url( $url );

	unset( $attrs['href'] );

	$attr_string = '';
	foreach ( $attrs as $attr => $value ) {
		if ( ! empty( $value ) ) {
			$attr_string .= ' ' . esc_attr( $attr ) . '="' . esc_attr( $value ) . '"';
		}
	}

	if ( $is_current ) {
		return '<span aria-current="page"' . $attr_string . '>' . $inner_html . '</span>';
	}

	return '<a href="' . esc_url( $url ) . '"' . $attr_string . '>' . $inner_html . '</a>';
}

function alfa_nav_menu_href( $url ) {
	if ( empty( $url ) || '#' === $url ) {
		return '';
	}

	return esc_url( $url );
}

function alfa_nav_menu_is_placeholder_url( $url ) {
	return empty( $url ) || '#' === $url;
}

function alfa_nav_menu_is_anchor_url( $url ) {
	if ( empty( $url ) || ! is_string( $url ) ) {
		return false;
	}

	$fragment = wp_parse_url( $url, PHP_URL_FRAGMENT );

	return ! empty( $fragment );
}

class Custom_Walker_Nav_Menu extends Walker_Nav_Menu {

	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';
					// Получаем кастомное поле для modal target
		$modal_target = get_post_meta( $item->ID, '_menu_item_custom_modal_target', true );

		$classes = empty( $item->classes ) ? array() : (array) $item->classes;
		$classes[] = 'menu-item-' . $item->ID;
		if ( !empty( $modal_target ) ) {
			$classes[] = 'menu-item_modal';
		}
		$class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args, $depth ) );
		$class_names = $class_names ? ' class="' . esc_attr( $class_names ) . '"' : '';

		$id = apply_filters( 'nav_menu_item_id', 'menu-item-'. $item->ID, $item, $args, $depth );
		$id = $id ? ' id="' . esc_attr( $id ) . '"' : '';

		$output .= $indent . '<li' . $id . $class_names .'>';

		$atts = array();
		$atts['title']  = ! empty( $item->attr_title ) ? $item->attr_title : '';
		$atts['target'] = ! empty( $item->target )     ? $item->target     : '';
		$atts['rel']    = ! empty( $item->xfn )        ? $item->xfn        : '';
		$atts['href']   = ! empty( $item->url )        ? $item->url        : '';



		// Если поле заполнено, добавляем атрибуты для модального окна
		if ( !empty( $modal_target ) ) {
			$atts['data-toggle'] = 'popup-menu';
			$atts['data-modal-target'] = esc_attr( $modal_target );
			$atts['href'] = '#';
			$atts['role'] = 'button';
		}

		$atts = apply_filters( 'nav_menu_link_attributes', $atts, $item, $args, $depth );

		$is_current = empty( $modal_target )
			&& ! alfa_nav_menu_is_anchor_url( $atts['href'] ?? '' )
			&& (
				in_array( 'current-menu-item', $classes, true )
				|| in_array( 'current_page_item', $classes, true )
			);
		$has_children = in_array( 'menu-item-has-children', $classes, true );
		$is_toggle_parent = $has_children && alfa_nav_menu_is_placeholder_url( $atts['href'] ?? '' ) && empty( $modal_target );

		$attributes = '';
		foreach ( $atts as $attr => $value ) {
			if ( 'href' === $attr ) {
				if ( ! empty( $modal_target ) ) {
					$attributes .= ' href="#"';
					continue;
				}

				$safe_href = alfa_nav_menu_href( $value );
				if ( '' !== $safe_href ) {
					$attributes .= ' href="' . $safe_href . '"';
				}
				continue;
			}

			if ( ! empty( $value ) ) {
				$attributes .= ' ' . $attr . '="' . esc_attr( $value ) . '"';
			}
		}

		if ( $is_toggle_parent ) {
			$attributes .= ' aria-haspopup="true"';
		}

		// Проверка, является ли $args объектом или массивом
		$before = is_object( $args ) ? $args->before : '';
		$link_before = is_object( $args ) ? $args->link_before : '';
		$link_after = is_object( $args ) ? $args->link_after : '';
		$after = is_object( $args ) ? $args->after : '';

		$title_html = '<span data-text="' . esc_attr( $item->title ) . '">' . $link_before . apply_filters( 'the_title', $item->title, $item->ID ) . $link_after . '</span>';

		$item_output = $before;
		if ( $is_current ) {
			$item_output .= '<span class="menu-item__link" aria-current="page">';
			$item_output .= $title_html;
			$item_output .= '</span>';
		} elseif ( $is_toggle_parent ) {
			$item_output .= '<span class="menu-item__link menu-item__toggle"' . $attributes . '>';
			$item_output .= $title_html;
			$item_output .= '</span>';
		} else {
			$item_output .= '<a class="menu-item__link"' . $attributes . '>';
			$item_output .= $title_html;
			$item_output .= '</a>';
		}
		$item_output .= $after;

		$output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
	}

	public function end_el( &$output, $item, $depth = 0, $args = null ) {
		$output .= "</li>\n";
	}
}