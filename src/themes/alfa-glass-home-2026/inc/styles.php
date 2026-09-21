<?php
/**
 * Alfa-glass Enqueue styles and scripts
 *
 * @package Alfa-glass
 */

if ( ! defined( '_S_VERSION' ) ) {
	// Replace the version number of the theme on each release.
	define( '_S_VERSION', '1.2.31' );
	//define( '_S_VERSION', date('YmdHis') );
}

global $loaded_blocks;
$loaded_blocks = array();
 /**
 * Enqueue scripts and styles.
 */
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

function enqueue_elementor_globals() {
    // Проверяем, активен ли Elementor и загружаем стили
    if ( defined( 'ELEMENTOR_VERSION' ) ) {
        \Elementor\Plugin::$instance->frontend->enqueue_styles();
    }
}
add_action( 'wp_enqueue_scripts', 'enqueue_elementor_globals', 10 );
function alfa_glass_scripts() {
	wp_enqueue_style( 'alfa-glass-main-style', get_template_directory_uri() . '/css/style.min.css', array(), _S_VERSION );

	if ( alfa_needs_swiper() ) {
		wp_enqueue_style( 'swiper', get_template_directory_uri() . '/css/swiper.min.css', array(), _S_VERSION );
	}

	if ( is_page_template( 'home-page.php' ) || is_front_page() ) {
		wp_enqueue_style( 'alfa_home_page', get_template_directory_uri() . '/css/home-page.min.css', array( 'alfa-glass-main-style' ), _S_VERSION );
		wp_enqueue_script( 'alfa-home-page-script', get_template_directory_uri() . '/js/home-page.min.js', array( 'jquery', 'swiper', 'alfa-main-script' ), _S_VERSION, true );
	}

	if ( is_singular( 'uslugi' ) || is_post_type_archive( 'uslugi' ) || is_singular( 'product' ) || is_tax( 'product_category' ) || is_search() ) {
		wp_enqueue_style( 'alfa-product-styles', get_template_directory_uri() . '/css/alfa-product.min.css', array( 'alfa-glass-main-style' ), _S_VERSION );
		wp_enqueue_script( 'alfa-product-script', get_template_directory_uri() . '/js/product.min.js', array( 'jquery', 'swiper', 'alfa-main-script' ), _S_VERSION, true );
	}

	if ( alfa_needs_fancybox() ) {
		wp_enqueue_style( 'alfa-product-fancybox', get_template_directory_uri() . '/css/jquery.fancybox.css', array( 'alfa-glass-main-style' ), _S_VERSION );
		wp_enqueue_script( 'fancybox', get_template_directory_uri() . '/js/fancybox.js', array( 'jquery' ), _S_VERSION, true );
	}

	if ( alfa_needs_swiper() ) {
		wp_enqueue_script( 'swiper', get_template_directory_uri() . '/js/swiper.min.js', array(), _S_VERSION, true );
	}

	wp_enqueue_script( 'alfa-glass-navigation', get_template_directory_uri() . '/js/navigation.js', array(), _S_VERSION, true );
	wp_enqueue_script( 'maskedinput', get_template_directory_uri() . '/js/jquery.maskedinput.min.js', array( 'jquery' ), _S_VERSION, true );
	wp_enqueue_script( 'alfa-main-script', get_template_directory_uri() . '/js/app.min.js', array( 'jquery' ), _S_VERSION, true );
	wp_enqueue_script( 'alfa-ajax', get_template_directory_uri() . '/js/alfa-ajax.min.js', array( 'jquery' ), _S_VERSION, true );
	wp_localize_script( 'alfa-ajax', 'alfa', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) );
}
add_action( 'wp_enqueue_scripts', 'alfa_glass_scripts', 20 );



function alfa_admin_enqueue_scripts() {
    wp_enqueue_script('acf-custom-js', get_template_directory_uri() . '/js/acf-custom.js', array('jquery'), null, true);
}
add_action('acf/input/admin_enqueue_scripts', 'alfa_admin_enqueue_scripts');

