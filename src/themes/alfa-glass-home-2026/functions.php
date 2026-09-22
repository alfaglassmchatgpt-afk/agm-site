<?php require_once __DIR__ . '/inc/agm-homepage.php'; ?>
<?php
/**
 * Alfa-glass functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Alfa-glass
 */

if ( ! function_exists( 'alfa_load_social_links' ) ) {
	/**
	 * Load social link helpers as early as possible.
	 */
	function alfa_load_social_links() {
		static $loaded = false;

		if ( $loaded || function_exists( 'get_social_links_content' ) ) {
			$loaded = true;
			return;
		}

		$social_file = get_template_directory() . '/inc/social-links.php';

		if ( is_readable( $social_file ) ) {
			require_once $social_file;
		}

		$loaded = true;
	}
}

alfa_load_social_links();

//add_action('init', 'clear_acf_field_except_category_once');
function clear_acf_field_except_category_once() {
    if (get_option('acf_field_cleared')) return;

    $args = [
        'post_type' => 'product',
        'posts_per_page' => -1,
        'post_status' => 'any',
    ];
    
    $products = get_posts($args);
    foreach ($products as $product) {
        // Проверяем, принадлежит ли товар категории 38
        if (!has_term(38, 'product_category', $product->ID)) {
            // Если НЕ принадлежит - очищаем поле
            update_field('main_gallary', [], $product->ID);
        }
    }
    
    update_option('acf_field_cleared', 1);
}
//add_action('init', 'copy_acf_field_values_once');
function copy_acf_field_values_once() {
    if (get_option('acf_field_copied')) return; // чтобы не запускалось повторно

    $args = [
        'post_type' => 'product',
        'posts_per_page' => -1,
        'post_status' => 'any',
    ];
    $products = get_posts($args);
    foreach ($products as $product) {
        $old = get_field('gallary', $product->ID);
        if ($old) {
            update_field('main_gallary', $old, $product->ID);
        }
    }
    update_option('acf_field_copied', 1);
}


function alfa_glass_setup() {
	load_theme_textdomain( 'alfa-glass', get_template_directory() . '/languages' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);
	add_theme_support( 'customize-selective-refresh-widgets' );
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 250,
			'width'       => 250,
			'flex-width'  => true,
			'flex-height' => true,
		)
	);
}
add_action( 'after_setup_theme', 'alfa_glass_setup' );
function alfa_glass_widgets_init() {
	register_sidebar(
		array(
			'name'          => esc_html__( 'Sidebar', 'alfa-glass' ),
			'id'            => 'sidebar-1',
			'description'   => esc_html__( 'Add widgets here.', 'alfa-glass' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'alfa_glass_widgets_init' );



/**
 * Performance optimizations (PageSpeed).
 */
require get_template_directory() . '/inc/performance.php';

/**
 * Enqueue stiles and scripts
 */
require get_template_directory() . '/inc/styles.php';

/**
 * Custom menu functions
 */
require get_template_directory() . '/inc/menu.php';

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Social links / inline SVG helpers (loaded early for header/footer).
 */
alfa_load_social_links();

if ( ! function_exists( 'get_social_links_content' ) ) {
	/**
	 * Fallback when inc/social-links.php is missing on the server.
	 *
	 * @return string
	 */
	function get_social_links_content() {
		$social_links = get_theme_mod( 'contacts_links' );
		$output       = '';

		if ( empty( $social_links ) || ! is_array( $social_links ) ) {
			return $output;
		}

		$output .= '<div class="socials__links">';

		foreach ( $social_links as $social ) {
			if ( empty( $social['link'] ) || empty( $social['icon'] ) ) {
				continue;
			}

			$output .= '<div class="item"><a href="' . esc_url( $social['link'] ) . '" target="_blank" rel="noopener noreferrer">';

			if ( function_exists( 'get_svg_content' ) ) {
				$output .= get_svg_content( $social['icon'] );
			} else {
				$output .= '<img src="' . esc_url( $social['icon'] ) . '" alt="" />';
			}

			$output .= '</a></div>';
		}

		$output .= '</div>';

		return $output;
	}
}

/**
 * Functions which enhance the theme by hooking into WordPress.
 */
require get_template_directory() . '/inc/template-functions.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';


/**
 * Ajax function.
 */
require get_template_directory() . '/inc/ajax-functions.php';

/**
 * Contact Form 7 → Google Sheets.
 */
$ag_google_sheets = get_template_directory() . '/google-sheets.php';
if ( is_readable( $ag_google_sheets ) ) {
	require $ag_google_sheets;
}

/**
 * Search function.
 */
require get_template_directory() . '/inc/search-functions.php';

/**
 * Yoast SEO sitemap customization.
 */
require get_template_directory() . '/inc/sitemap.php';

/**
 * HTML sitemap page.
 */
require get_template_directory() . '/inc/html-sitemap.php';

/**
 * 301 redirects (technical spec).
 */
$ag_inc_files = array(
	'/inc/redirects.php',
	'/inc/last-modified.php',
	'/inc/w3c-fixes.php',
	'/inc/broken-links.php',
);

foreach ( $ag_inc_files as $ag_inc_file ) {
	$ag_inc_path = get_template_directory() . $ag_inc_file;
	if ( is_readable( $ag_inc_path ) ) {
		require $ag_inc_path;
	}
}

/**
 * Load Jetpack compatibility file.
 */
if ( defined( 'JETPACK__VERSION' ) ) {
	require get_template_directory() . '/inc/jetpack.php';
}

/**
 * конфигуратор
 */
require get_template_directory() . '/inc/configurator/configurator.php';

/**
 * ACF fields for reviews section.
 */
require get_template_directory() . '/inc/acf-reviews.php';



function wrap_images_with_fancybox($content) {
    global $post;

    if (!$post || $post->post_type === 'post' || is_front_page() || is_single(2301)) {
        // Если нет поста или тип 'post' — возвращаем контент без изменений
        return $content;
    }

    // Проверяем, был ли пост создан или отредактирован через Elementor
    if ( get_post_meta($post->ID, '_elementor_edit_mode', true) === 'builder' ) {
        // Если Elementor — возвращаем контент как есть
        return $content;
    }

    // Проверка, что контент существует и не пустой
    if (empty(trim($content))) {
        return $content;
    }

    libxml_use_internal_errors(true);

    $dom = new DOMDocument();
    $dom->loadHTML('<?xml encoding="UTF-8">' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $xpath = new DOMXPath($dom);

    $images = $xpath->query('//img');

    foreach ($images as $img) {
        $parent = $img->parentNode;

        if ($parent->nodeName !== 'a') {
            $src = $img->getAttribute('src');

            $link = $dom->createElement('a');
            $link->setAttribute('href', $src);
            $link->setAttribute('data-fancybox', 'gallery');

            $clonedImg = $img->cloneNode(true);
            $link->appendChild($clonedImg);

            $parent->replaceChild($link, $img);
        }
    }

    libxml_clear_errors();

    return $dom->saveHTML();
}

add_filter('the_content', 'wrap_images_with_fancybox');


/**
 * Отключаем ненужный функционал WP
 */
$clean_config = array(
    'emoji'              => 1,
    'w3_errors'          => 1, // исправляет ошибки валидации, нарпример, атрибуты type больше не нужны при подключении стилей и скриптов и т.д. 
    'link_dns-prefetch'  => 1, // link dns-prefetch
    'meta_generator'     => 1, // meta generator c версией wp
    'wp_oembed_add_host' => 1, // отвечает за вставку постов из чужих сайтов в контент своего. Возможно тут не только посты, но и видео с youtube и т.д. надо бы это проверить.
    'wp_oembed_links'    => 1, // выводит ссылки своего сайта, чтобы чужие могли по ним вставлять наши записи в свои сайты.
);


/** убирает emoji из загрузки */
if($clean_config['emoji']) add_action( 'init', 'plug_disable_emoji', 1 );

function plug_disable_emoji() {
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_action( 'admin_print_styles', 'print_emoji_styles' );
    remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
    remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
    remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
    add_filter( 'tiny_mce_plugins', 'plug_disable_tinymce_emoji' );
}

// Очистить emoji в tinymce
function plug_disable_tinymce_emoji( $plugins ) {
    return array_diff( $plugins, array( 'wpemoji' ) );
}

/** мета теги и подобное */
if($clean_config['link_dns-prefetch']) remove_action( 'wp_head', 'wp_resource_hints', 2); // удаляет link dns-prefetch
if($clean_config['meta_generator']) add_filter('the_generator', '__return_empty_string'); // удаляет meta generator

/** oembed */
if($clean_config['wp_oembed_add_host']) remove_action( 'wp_head', 'wp_oembed_add_host_js' );
if($clean_config['wp_oembed_links']) remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );


/** Убирает ошибки валидации */
// удаляем устаревший атрибут type при подключении стилей (5.3+)
if($clean_config['w3_errors']) add_theme_support( 'html5', array(  'script', 'style' ) ); 




add_filter( 'the_privacy_policy_link', 'add_target_blank_to_privacy_link' );
function add_target_blank_to_privacy_link( $link ) {
    // Ищем в ссылке атрибут 'href' и добавляем target="_blank" перед закрывающей скобкой >
    return str_replace( '<a ', '<a target="_blank" rel="noopener" ', $link );
}

/**
 * Шорткод
 * Универсальный заголовок страницы для всех типов страниц
 */
add_shortcode('universal_page_title', function() {
    // Для главной страницы
    if (is_front_page() || is_home()) {
        return 'Главная страница';
    }
    
    // Для страниц/записей/товаров
    if (is_singular()) {
        return get_the_title();
    }
    
    // Для архивов категорий
    if (is_category()) {
        return single_cat_title('', false);
    }
    
    // Для архивов меток
    if (is_tag()) {
        return single_tag_title('', false);
    }
    
    // Для архивов таксономий WooCommerce
    if (is_tax()) {
        return single_term_title('', false);
    }
    
    // Для архивов дат, авторов и других
    if (is_archive()) {
        return get_the_archive_title();
    }
    
    // Для страницы поиска
    if (is_search()) {
        return 'Результаты поиска: ' . get_search_query();
    }
    
    // Для страницы 404
    if (is_404()) {
        return 'Страница не найдена';
    }
    
    // Запасной вариант
    return wp_title('', false) ?: get_bloginfo('name');
});









# Редактирование порядка в админ-меню
function custom_menu_order($menu_ord) {
    if (!$menu_ord) return true;
  
    return array(
        'index.php', // Консоль

        'separator1', // Первый разделитель

        'edit.php?post_type=page',      
        'edit.php',                      
	    'edit.php?post_type=uslugi',    
	    'edit.php?post_type=product',    
        
        'separator2', // Второй разделитель
        'wpcf7',
	    'edit.php?post_type=request',  
        'alfa-options',  
        'upload.php',
        

        'themes.php',

        'separator-last', // последний разделитель
        
        'users.php',
        'edit-comments.php',

    );
}
add_filter('custom_menu_order', 'custom_menu_order'); 
add_filter('menu_order', 'custom_menu_order');






add_action('rest_api_init', function(){
  register_rest_route('custom/v1', '/recent', array(
    'methods' => 'POST',
    'callback' => 'ag_render_recent_products',
    'permission_callback' => '__return_true',
  ));
});

function ag_render_recent_products(WP_REST_Request $request){
  $ids = $request->get_param('ids');
  if (empty($ids) || !is_array($ids)) {
    return rest_ensure_response(['html' => '']);
  }
  $ids = array_map('absint', $ids);
  $ids = array_filter($ids);

  $args = [
    'post_type' => 'product',
    'post__in' => $ids,
    'orderby' => 'post__in',
    'posts_per_page' => 20,
  ];
  $q = new WP_Query($args);
  ob_start();
  if ($q->have_posts()){
    while($q->have_posts()){ $q->the_post();
      ?>
      <div class="swiper-slide">
        <div class="advice__item item">
          <div class="item__img"><?php echo get_the_post_thumbnail(get_the_ID(), 'medium'); ?></div>
          <?php
          $terms = get_the_terms(get_the_ID(), 'product_category');
          if ($terms && !is_wp_error($terms)) {
              foreach ($terms as $term) {
                if ($term->parent != 0) {
                  echo '<div class="item__category">'.esc_html($term->name).'</div>';
                  break;
                }
              }
          }
          ?>
          <div class="item__title">
            <h3 class="small__title"><?php echo get_the_title(); ?></h3>
            <div class="item__arrow"><span></span></div>
          </div>
          <a href="<?php echo get_the_permalink(); ?>" class="item__link"></a>
        </div>
      </div>
      <?php
    }
  }
  wp_reset_postdata();
  $html = ob_get_clean();
  return rest_ensure_response(['html' => $html]);
}



add_action('admin_head', function() {
    echo '<style>
/* Чётные ряды — тёмный хендл */
.acf-row:nth-child(even) td:first-child {
    background-color: #f0f0f0 !important;  /* светло-серый */
}

/* Нечётные ряды — светлый хендл */
.acf-row:nth-child(odd) td:first-child {
    background-color: #ffffff !important;  /* белый */
}

/* Можно добавить небольшой эффект при наведении */
.acf-row td:first-child:hover {
    background-color: #e6e6e6 !important;
}
    </style>';
});


// === НАСТРОЙКА YANDEX SMTP ===
add_action('phpmailer_init', function($phpmailer) {
    // Только для фронтенда (не для админки)
    if (!is_admin()) {
        $phpmailer->isSMTP();
        $phpmailer->Host = '';
        $phpmailer->SMTPAuth = true;
        $phpmailer->Username = '';
        $phpmailer->Password = '';
        $phpmailer->Port = 465;
        $phpmailer->SMTPSecure = 'ssl';
        $phpmailer->From = 'contact@example.invalid';
        $phpmailer->FromName = 'Альфа Гласс М';
        $phpmailer->CharSet = 'UTF-8';
    }
});

// Принудительно устанавливаем отправителя
add_filter('wp_mail_from', function($email) {
    return 'contact@example.invalid';
});

add_filter('wp_mail_from_name', function($name) {
    return 'Альфа Гласс М';
});






function theme_menus() {
    register_nav_menus([
		'header_menu' => 'Главное меню',
		'mobile_catalog_menu' => 'Мобильное меню',
        'footer_first' => 'Подвал "Разделы"',
        'footer_second' => 'Подвал "Услуги"',
    ]);
}
add_action('after_setup_theme', 'theme_menus');
function format($phone) {
	$phone = trim($phone);
	$res = preg_replace('/[^0-9+]/','',$phone);
    $formated = 'tel:'. $res;
	return $formated;
}


add_action( 'wp_enqueue_scripts', 'add_themes_assets' );
function add_themes_assets(){
    wp_enqueue_style('style', get_template_directory_uri().'/assets/css/style.css', null, filemtime( get_theme_file_path().'/assets/css/style.css'));
    wp_enqueue_style('min', get_template_directory_uri().'/assets/css/min.css', null, filemtime( get_theme_file_path().'/assets/css/min.css'));

    wp_enqueue_style('fonts', get_template_directory_uri() . '/assets/fonts/fonts.css');
    wp_enqueue_style('fancyboxCss', get_template_directory_uri() . '/assets/css/static/fancybox.min.css');

    /******* SCRIPTS ********/
    wp_enqueue_script('sliders', get_template_directory_uri().'/assets/js/sliders.js',array('jquery'),'',true);
    wp_enqueue_script('modal-js', get_template_directory_uri().'/assets/js/modal.js',array('jquery'),'',true);
	wp_enqueue_script('jquery');
    wp_enqueue_script('fancyboxJs', get_template_directory_uri().'/assets/js/static/fancybox.min.js',array('jquery'),'',true);
    wp_enqueue_script('mobileMenu', get_template_directory_uri() . '/assets/js/static/mobileMenu.js', array('jquery-core'), '' , true );
	wp_enqueue_script('main-script', get_template_directory_uri() . '/assets/js/app.js', array('jquery-core','fancyboxJs'), filemtime( get_theme_file_path() . '/assets/js/app.js' ), true);

	wp_localize_script( 'main-script', 'wp',
		array(
			'url' => admin_url('admin-ajax.php'),
            'themeUrl' => get_template_directory_uri(),
		)
	);
}


/*--------- Регистрация блоков --------*/
add_filter('block_categories_all', 'add_blocks_category', 10 );

function add_blocks_category($categories) {
    $categories[] = array(
        'slug'  => 'theme-blocks',
        'title' => 'Блоки темы',
        'icon'  => null,
    );
    return $categories;
}
function add_blocks(){
    $ignore = array('.','..');
    $bpath = __DIR__.'/blocks/';
    $blocks = scandir($bpath);
    foreach ($blocks as $folder) {
        if(!in_array($folder, $ignore)) {
            require_once $bpath.$folder.'/index.php';
        }
    }
}
add_blocks();
function wide_Setup() {
    add_theme_support( 'align-wide' );
}
add_action( 'after_setup_theme', 'wide_Setup' );



function slider_nav() { ?>
		<div class="nav">
            <div class="swiper-button-prev">
                <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.67103 0.305097C7.08497 -0.101699 7.75609 -0.101699 8.17002 0.305097C8.58395 0.711893 8.58395 1.37144 8.17002 1.77824L2.55986 7.29166L8.17002 12.8051C8.58395 13.2119 8.58395 13.8714 8.17002 14.2782C7.75609 14.685 7.08497 14.685 6.67103 14.2782L0.311388 8.02823C-0.10254 7.62143 -0.10254 6.96189 0.311388 6.55509L6.67103 0.305097Z" fill="url(#paint0_linear_2010_12539)" />
                <defs>
                    <linearGradient id="paint0_linear_2010_12539" x1="6.0193" y1="6.87296e-08" x2="11.4888" y2="12.2061" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#43ABFF" />
                    <stop offset="0.325248" stop-color="#077CDB" />
                    <stop offset="1" stop-color="#005397" />
                    </linearGradient>
                </defs>
                </svg>
            </div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-next">
                <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.80944 0.305097C1.3955 -0.101699 0.724383 -0.101699 0.310449 0.305097C-0.103483 0.711893 -0.103483 1.37144 0.310449 1.77824L5.92061 7.29166L0.310449 12.8051C-0.103483 13.2119 -0.103483 13.8714 0.310449 14.2782C0.724383 14.685 1.3955 14.685 1.80944 14.2782L8.16908 8.02823C8.58301 7.62143 8.58301 6.96189 8.16908 6.55509L1.80944 0.305097Z" fill="url(#paint0_linear_2010_8551)" />
                <defs>
                    <linearGradient id="paint0_linear_2010_8551" x1="2.46117" y1="6.87296e-08" x2="-3.00829" y2="12.2061" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#43ABFF" />
                    <stop offset="0.325248" stop-color="#077CDB" />
                    <stop offset="1" stop-color="#005397" />
                    </linearGradient>
                </defs>
                </svg>
            </div>
		</div>
	<?php
};


function render_breads() {
	if(function_exists('bcn_display')) { ?>
		<div class="breadcrumbs" typeof="BreadcrumbList" vocab="https://schema.org/">
			<?php bcn_display(); ?>
		</div>
	<?php }
}
require_once __DIR__ . '/inc/agm-processing.php';
