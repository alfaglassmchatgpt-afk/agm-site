<?php
/**
 * Plugin Name: Elementor Addon by Screpter
 * Description: A custom Elementor addon that adds a block for displaying article cards.
 * Version: 1.0
 * Author: Screpter
 * Text Domain: elementor-screpter
 * Elementor tested up to: 3.24.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

function elementor_screpter_addon() {

	require_once( __DIR__ . '/includes/widgets-manager.php' );

	Elementor_Screpter_Addon::instance();

}
add_action( 'plugins_loaded', 'elementor_screpter_addon' );

function add_elementor_widget_categories( $elements_manager ) {

	$elements_manager->add_category(
		'screpter-addon',
		[
			'title' => esc_html__( 'By screpter', 'elementor-screpter' ),
			'icon' => 'fa fa-plug',
		]
	);
	

}
add_action( 'elementor/elements/categories_registered', 'add_elementor_widget_categories' );


add_action( 'elementor/frontend/after_enqueue_styles', function() {
    wp_enqueue_style( 'article-cards-style', plugins_url( '/css/article-cards.min.css', __FILE__ ) );
});


// new Elementor_Addon_by_Screpter();