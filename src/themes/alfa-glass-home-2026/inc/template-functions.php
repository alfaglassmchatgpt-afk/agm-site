<?php
/**
 * Functions which enhance the theme by hooking into WordPress
 *
 * @package Alfa-glass
 */

/**
 * Adds custom classes to the array of body classes.
 *
 * @param array $classes Classes for the body element.
 * @return array
 */
function alfa_glass_body_classes( $classes ) {
	// Adds a class of hfeed to non-singular pages.
	if ( ! is_singular() ) {
		$classes[] = 'hfeed';
	}

	// Adds a class of no-sidebar when there is no sidebar present.
	if ( ! is_active_sidebar( 'sidebar-1' ) ) {
		$classes[] = 'no-sidebar';
	}

	return $classes;
}
add_filter( 'body_class', 'alfa_glass_body_classes' );

/**
 * Add a pingback url auto-discovery header for single posts, pages, or attachments.
 */
function alfa_glass_pingback_header() {
	if ( is_singular() && pings_open() ) {
		printf( '<link rel="pingback" href="%s">', esc_url( get_bloginfo( 'pingback_url' ) ) );
	}
}
add_action( 'wp_head', 'alfa_glass_pingback_header' );


// Функция для генерации хлебных крошек
function alfa_breadcrumb_part( $url, $label, $is_html = false ) {
	if ( ! $is_html && alfa_is_current_nav_url( $url ) ) {
		return '<span aria-current="page">' . esc_html( $label ) . '</span>';
	}

	if ( $is_html ) {
		return $label;
	}

	return '<a href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a>';
}

function alfa_custom_breadcrumbs() {
    $home_link = home_url('/');
    $home_text = 'Главная';
    
    // Получаем ID страницы блога (страницы записей)
    $blog_page_id = get_option('page_for_posts');
    $blog_title = get_the_title($blog_page_id); // Заголовок страницы блога
    $blog_link = get_permalink($blog_page_id); // URL страницы блога
    
    // SVG разделитель
    $svg_separator = '<svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.3" fill-rule="evenodd" clip-rule="evenodd" d="M5.54057 0.657227L8.3641 3.65723C8.5453 3.84975 8.5453 4.15007 8.3641 4.34259L5.54057 7.34259L4.81237 6.65723L6.84279 4.49991H0V3.49991H6.84279L4.81237 1.34259L5.54057 0.657227Z" fill="#0E0F0F"/></svg>';

    global $post;
    $output = ''; // Переменная для хранения HTML

    $output .= '<nav class="breadcrumbs">';

	if ( is_front_page() ) {
		$output .= '<span aria-current="page">' . esc_html( $home_text ) . '</span>';
	} else {
		$output .= alfa_breadcrumb_part( $home_link, $home_text ) . $svg_separator;
	}

    // Если это страница блога
    if (is_home()) {
        $output .= '<span aria-current="page">' . esc_html( $blog_title ) . '</span>';
    }
    if (is_post_type_archive('blog')) {
        $output .= '<span aria-current="page">' . esc_html( $blog_title ) . '</span>';
    }
    // Если это запись (single post)
    elseif (is_single() && !is_singular('product') && !is_singular('uslugi')) {
        $output .= alfa_breadcrumb_part( $blog_link, $blog_title ) . $svg_separator;
        $output .= '<span aria-current="page">' . esc_html( get_the_title() ) . '</span>';
    }
    // Если это страница
    elseif (is_page()) {
        if ($post->post_parent) {
            $parent_id  = $post->post_parent;
            $breadcrumbs = array();
            while ($parent_id) {
                $page = get_page($parent_id);
                $breadcrumbs[] = alfa_breadcrumb_part( get_permalink( $page->ID ), get_the_title( $page->ID ) );
                $parent_id  = $page->post_parent;
            }
            $breadcrumbs = array_reverse($breadcrumbs);
            foreach ($breadcrumbs as $crumb) {
                $output .= $crumb . $svg_separator;
            }
        }
        $output .= '<span aria-current="page">' . esc_html( get_the_title() ) . '</span>';
    }

	// Если это архивная страница таксономии product_category
    elseif (is_tax('product_category')) {
        $term = get_queried_object(); // Получаем текущий термин таксономии

        // Проверяем, если у термина есть родительская категория
        if ($term->parent != 0) {
				$parent_term = get_term( $term->parent, 'product_category');
				$parent_name = get_term_meta( $parent_term->term_id, 'product_category_title', true ) ? get_term_meta( $parent_term->term_id, 'product_category_title', true ) : $parent_term->name;
            $parent_term = get_term($term->parent, 'product_category'); // Родительский термин
            $output .= alfa_breadcrumb_part( get_term_link( $parent_term ), $parent_name ) . $svg_separator;
        }

        // Выводим название текущего термина (категории)
		  $name = get_term_meta( $term->term_id, 'product_category_title', true ) ? get_term_meta( $term->term_id, 'product_category_title', true ) : $term->name;
        $output .= '<span aria-current="page">' . esc_html( $name ) . '</span>';
    }


    // Если это произвольная запись uslugi
    elseif (is_singular('uslugi')) {
        $uslugi_url = home_url( '/uslugi/' );
        $output .= alfa_breadcrumb_part( $uslugi_url, 'Услуги' ) . $svg_separator;
        $output .= '<span aria-current="page">' . esc_html( get_the_title() ) . '</span>';
    }
    // Если это произвольная запись uslugi
    elseif (is_post_type_archive( 'uslugi' )) {
        $output .= '<span aria-current="page">Услуги</span>';
    }

    

    // Если это произвольная запись product
    elseif (is_singular('product')) {

        // Получаем термины таксономии product_category, связанные с продуктом
        $terms = get_the_terms($post->ID, 'product_category');

        if ($terms && !is_wp_error($terms)) {
            $parent_term = null;
            $child_term = null;
				$child_term_name = '';
            // Проходим по терминам и определяем родительские и дочерние категории
            foreach ($terms as $term) {
                if ($term->parent == 0) {
                    $parent_term = $term; // Родительская категория
                } else {
                    $child_term = $term; // Дочерняя категория
                }
            }

            if ($parent_term) {
                $parent_label = get_term_meta($parent_term->term_id, 'product_category_title', true) ?: $parent_term->name;
                $output .= alfa_breadcrumb_part( get_term_link( $parent_term ), $parent_label );
            }

            $output .= $svg_separator . '<span aria-current="page">' . esc_html( get_the_title() ) . '</span>';
        }
    } elseif(is_search()) {
		 $output .= '<span aria-current="page">' . esc_html__( 'Результаты поиска', 'alfa-glass' ) . '</span>';
	}




    $output .= '</nav>'; // Закрываем навигацию

    return $output; // Возвращаем строку HTML
}
add_shortcode('alfa-breadcrumbs', 'alfa_custom_breadcrumbs');

if(!function_exists('alfa_format_phone')){
	//функция форматирования телефона
	function alfa_format_phone($tel) {
		$tel = str_replace(array(" ", ")", "(", "-"), "", $tel);
		return $tel;
	}
}
if(!function_exists('get_menu_name_by_location')){
	function get_menu_name_by_location( $location_id ) {
		// Получаем все области меню
		$locations = get_nav_menu_locations();

		// Проверяем, существует ли указанная область
		if ( isset( $locations[ $location_id ] ) ) {
			// Получаем ID меню, прикрепленного к области
			$menu_id = $locations[ $location_id ];

			// Получаем объект меню по ID
			$menu_object = wp_get_nav_menu_object( $menu_id );

			// Если меню существует, возвращаем его название
			if ( $menu_object ) {
					return $menu_object->name;
			}
		}

		// Возвращаем null, если меню не найдено
		return null;
	}
}

function alfa_custom_archive_sorting( $query ) {
    // Проверяем, что это главный запрос на архивной странице
    if ( $query->is_main_query() && !is_admin() && $query->is_home() ) {
        $query->set( 'orderby', 'menu_order' );
        $query->set( 'order', 'ASC' ); 
    }
}
add_action( 'pre_get_posts', 'alfa_custom_archive_sorting' );

// отключаем гутенберг для услуг и продуктов
function alfa_disable_gutenberg_for_custom_post_type($can_edit, $post_type) {
    if ($post_type === 'product') {
        return false; // Отключить Гутенберг для этого типа записей
    }
    if ($post_type === 'uslugi') {
        return false; // Отключить Гутенберг для этого типа записей
    }    
	if ( 'home-page.php' === get_page_template_slug() ) {
        return false;
    }
    return $can_edit; // Оставить поведение для других типов записей
}
add_filter('use_block_editor_for_post_type', 'alfa_disable_gutenberg_for_custom_post_type', 10, 2);

// Добавляет классы в body от товаров, т.к. css писались под них.
function add_body_class_for_type_uslugi($classes) {
    //if (is_post_type_archive('uslugi') || is_singular('uslugi')) {
    if (is_singular('uslugi')) {
        $classes[] = 'single-product';
    }
    if (is_post_type_archive( 'uslugi' )) {
        $classes[] = 'tax-product_category';
    }
    return $classes;
}
add_filter('body_class', 'add_body_class_for_type_uslugi');



function custom_archive_posts_per_page($query) {
    if (is_post_type_archive('uslugi') && $query->is_main_query()) {
        $query->set('posts_per_page', 30);
    }
}
add_action('pre_get_posts', 'custom_archive_posts_per_page');

if ( ! function_exists( 'get_pr' ) ) {
	/**
	 * Debug function print_r
	 *
	 * @param mixed $var
	 * @param boolean $die
	 */
	function get_pr( $var, $die = true ) {
		echo '<pre>';
		print_r( $var );
		echo '</pre>';
		if ( $die ) {
			die();
		}
	}
}




function new_wpcf7_submit_button_shortcode_handler( $tag ) {
   $class = wpcf7_form_controls_class( $tag->type, 'has-spinner' );

	$atts = array();

	$atts['class'] = $tag->get_class_option( $class );
	$atts['id'] = $tag->get_id_option();
	$atts['tabindex'] = $tag->get_option( 'tabindex', 'signed_int', true );

	$value = isset( $tag->values[0] ) ? $tag->values[0] : '';

	if ( empty( $value ) ) {
		$value = '';
	}

	$atts['type'] = 'submit';

	$atts = wpcf7_format_atts( $atts );

	$html = sprintf( '<button %1$s><span>%2$s</span><span class="item__arrow"><span class="decor">
					</span></span></button>', $atts, $value );

	return $html;
}
function new_wpcf7_add_shortcode_submit_button() {
    wpcf7_add_form_tag( 'submit', 'new_wpcf7_submit_button_shortcode_handler' );
}

remove_action( 'wpcf7_init', 'wpcf7_add_form_tag_submit' );
add_action( 'wpcf7_init', 'new_wpcf7_add_shortcode_submit_button',20 );


add_filter('wpcf7_autop_or_not', '__return_false');

add_filter('wpcf7_form_elements', function($content) {
    $content = preg_replace(
        '/<input(.*?type="tel".*?)>/', 
        '<span class="input-icon tel-icon"></span><input$1>', 
        $content
    );
	  $content = preg_replace(
        '/<input(.*?type="email".*?)>/', 
        '<span class="input-icon email-icon"></span><input$1>', 
        $content
    );
    return $content;
});

function alfa_modal($id_modal, $id_form) {
	$output = '
	<div class="modal" id="'.$id_modal.'">
		<div class="modal__dialog">
			<span class="close">
				<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
					<path d="M1 1L11 11M21 21L11 11M11 11L21 1L1 21" stroke="black" stroke-width="1.6" />
				</svg>
			</span>
			<div class="modal__content">
				'. do_shortcode( '[contact-form-7 id="' . $id_form . '"]' ).'
			</div>
		</div>
	</div>';

	return $output;
}
function render_nav_menu($theme_location, $menu_class = 'menu', $container = ['container'=>'','container_id'=>'', 'container_class'=> '' ], $walker = null) {
    wp_nav_menu(array(
        'theme_location' => $theme_location,
        'menu_class'     => $menu_class,
        'container'      => $container['container'],
		  'container_id'   => $container['container_id'],
			'container_class'=> $container['container_class'],
        'walker'         => $walker ?: new Custom_Walker_Nav_Menu()
    ));
}

function render_slider_btn($class = '') {
	?>
	<div class="btn__group btn__group_slider <?=$class?>">
		<div class="btn btn__slider btn__prev">
			<?php get_template_part('template-blocks/icons/slider-btn-prev'); ?>
		</div>
		<div class="btn btn__slider btn__next">
			<?php get_template_part('template-blocks/icons/slider-btn-next'); ?>
		</div>
	</div>
	<?php
}

function get_product_category($post_id) {
	$terms = get_the_terms($post_id, 'product_category');
	$terms_name = '';
	if($terms) {
		$lowest_term = null;
		if (!is_wp_error($terms) && !empty($terms)) {
			foreach ($terms as $term) {
				$children = get_term_children($term->term_id, 'product_category');
				if (empty($children)) {
						$lowest_term = $term;
						break;
				}
			}
		}
		$terms_name = '<div class="product__category">'.esc_html( $lowest_term->name ).'</div>';
	}
	return $terms_name;
}

function alfa_is_elementor_page( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	if ( ! $post_id ) {
		return false;
	}
	return get_post_meta( $post_id, '_elementor_edit_mode', true ) === 'builder';
}

function alfa_should_render_template_h1() {
	if ( is_front_page() || is_home() || is_search() || is_404() || is_tax() ) {
		return false;
	}
	if ( is_singular( array( 'product', 'uslugi' ) ) ) {
		return false;
	}
	if ( is_page() && 'home-page.php' === get_page_template_slug() ) {
		return false;
	}
	if ( is_singular() && alfa_is_elementor_page() ) {
		return false;
	}
	return is_singular( array( 'post', 'page' ) );
}

function alfa_render_page_h1( $class = '' ) {
	if ( ! alfa_should_render_template_h1() ) {
		return;
	}
	$title = get_the_title();
	if ( ! $title ) {
		return;
	}
	$class_attr = $class ? ' class="' . esc_attr( $class ) . '"' : '';
	echo '<h1' . $class_attr . '>' . esc_html( $title ) . '</h1>';
}

function alfa_normalize_elementor_headings( $content ) {
	$last_level = 0;
	$h1_count   = 0;

	return preg_replace_callback(
		'/<(h[1-6])\b([^>]*)>(.*?)<\/\1>/is',
		function ( $matches ) use ( &$last_level, &$h1_count ) {
			$level = (int) substr( strtolower( $matches[1] ), 1 );

			if ( 1 === $level ) {
				++$h1_count;
				if ( $h1_count > 1 ) {
					$level = 2;
				}
			}

			if ( $last_level > 0 && $level > $last_level + 1 ) {
				$level = $last_level + 1;
			}

			$last_level = $level;
			$tag        = 'h' . $level;

			return '<' . $tag . $matches[2] . '>' . $matches[3] . '</' . $tag . '>';
		},
		$content
	);
}

function alfa_sanitize_headings_in_content( $content ) {
	if ( empty( trim( $content ) ) ) {
		return $content;
	}

	global $post;

	if ( $post && alfa_is_elementor_page( $post->ID ) ) {
		return alfa_normalize_elementor_headings( $content );
	}

	if ( alfa_should_render_template_h1() ) {
		return preg_replace( '/<h1\b[^>]*>.*?<\/h1>/is', '', $content );
	}

	if ( is_singular( array( 'product', 'uslugi' ) ) ) {
		return preg_replace( '/<h1\b[^>]*>.*?<\/h1>/is', '', $content );
	}

	return $content;
}
add_filter( 'the_content', 'alfa_sanitize_headings_in_content', 5 );