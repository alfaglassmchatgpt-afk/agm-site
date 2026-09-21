<?php
// namespace Elementor_Screpter;

/**
 * Plugin class.
 *
 * The main class that initiates and runs the addon.
 *
 * @since 1.0.0
 */
final class Elementor_Screpter_Addon {

	/**
	 * Addon Version
	 *
	 * @since 1.0.0
	 * @var string The addon version.
	 */
	const VERSION = '1.0.0';

	/**
	 * Minimum Elementor Version
	 *
	 * @since 1.0.0
	 * @var string Minimum Elementor version required to run the addon.
	 */
	const MINIMUM_ELEMENTOR_VERSION = '3.24.0';

	/**
	 * Minimum PHP Version
	 *
	 * @since 1.0.0
	 * @var string Minimum PHP version required to run the addon.
	 */
	const MINIMUM_PHP_VERSION = '7.4';

	/**
	 * Instance
	 *
	 * @since 1.0.0
	 * @access private
	 * @static
	 * @var \Elementor_Test_Addon\Plugin The single instance of the class.
	 */
	private static $_instance = null;

	/**
	 * Instance
	 *
	 * Ensures only one instance of the class is loaded or can be loaded.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 * @return \Elementor_Test_Addon\Plugin An instance of the class.
	 */
	public static function instance() {

		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self();
		}
		return self::$_instance;

	}

	/**
	 * Constructor
	 *
	 * Perform some compatibility checks to make sure basic requirements are meet.
	 * If all compatibility checks pass, initialize the functionality.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		if ( $this->is_compatible() ) {
			add_action( 'elementor/init', [ $this, 'init' ] );
		}

		add_action('init',[$this, 'i18n']);
		
	}
	
		/**
	 * Load Textdomain
	 * Load plagin localization filez.
	 * Fired by 'init' action hook.
	 * @since 1.0.0
	 * @access public
	 */

	public function i18n() {
		load_plugin_textdomain('elementor-screpter');
	}

	/**
	 * Compatibility Checks
	 *
	 * Checks whether the site meets the addon requirement.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function is_compatible() {

		// Check if Elementor installed and activated
		if ( ! did_action( 'elementor/loaded' ) ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_missing_main_plugin' ] );
			return false;
		}

		// Check for required Elementor version
		if ( ! version_compare( ELEMENTOR_VERSION, self::MINIMUM_ELEMENTOR_VERSION, '>=' ) ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_minimum_elementor_version' ] );
			return false;
		}

		// Check for required PHP version
		if ( version_compare( PHP_VERSION, self::MINIMUM_PHP_VERSION, '<' ) ) {
			add_action( 'admin_notices', [ $this, 'admin_notice_minimum_php_version' ] );
			return false;
		}

		return true;

	}

	/**
	 * Admin notice
	 *
	 * Warning when the site doesn't have Elementor installed or activated.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function admin_notice_missing_main_plugin() {

		if ( isset( $_GET['activate'] ) ) unset( $_GET['activate'] );

		$message = sprintf(
			/* translators: 1: Plugin name 2: Elementor */
			esc_html__( '"%1$s" requires "%2$s" to be installed and activated.', 'elementor-screpter' ),
			'<strong>' . esc_html__( 'Elementor Screpter Addon', 'elementor-screpter' ) . '</strong>',
			'<strong>' . esc_html__( 'Elementor', 'elementor-screpter' ) . '</strong>'
		);

		printf( '<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message );

	}

	/**
	 * Admin notice
	 *
	 * Warning when the site doesn't have a minimum required Elementor version.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function admin_notice_minimum_elementor_version() {

		if ( isset( $_GET['activate'] ) ) unset( $_GET['activate'] );

		$message = sprintf(
			/* translators: 1: Plugin name 2: Elementor 3: Required Elementor version */
			esc_html__( '"%1$s" requires "%2$s" version %3$s or greater.', 'elementor-screpter' ),
			'<strong>' . esc_html__( 'Elementor Screpter Addon', 'elementor-screpter' ) . '</strong>',
			'<strong>' . esc_html__( 'Elementor', 'elementor-screpter' ) . '</strong>',
			 self::MINIMUM_ELEMENTOR_VERSION
		);

		printf( '<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message );

	}

	/**
	 * Admin notice
	 *
	 * Warning when the site doesn't have a minimum required PHP version.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function admin_notice_minimum_php_version() {

		if ( isset( $_GET['activate'] ) ) unset( $_GET['activate'] );

		$message = sprintf(
			/* translators: 1: Plugin name 2: PHP 3: Required PHP version */
			esc_html__( '"%1$s" requires "%2$s" version %3$s or greater.', 'elementor-screpter' ),
			'<strong>' . esc_html__( 'Elementor Screpter Addon', 'elementor-screpter' ) . '</strong>',
			'<strong>' . esc_html__( 'PHP', 'elementor-screpter' ) . '</strong>',
			 self::MINIMUM_PHP_VERSION
		);

		printf( '<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message );

	}
	/**
	 * Initialize
	 *
	 * Load the addons functionality only after Elementor is initialized.
	 *
	 * Fired by `elementor/init` action hook.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function init() {
		add_action( 'elementor/widgets/register', [ $this, 'register_widgets' ] );
		add_action( 'elementor/frontend/before_register_scripts', [ $this, 'widget_scripts' ] );

	}

	public function widget_scripts() {
		if ( ! wp_script_is( 'swiper' ) ) {
			wp_register_script( 'swiper', plugins_url( '../assets/js/swiper.min.js', __FILE__ ), [ 'jquery' ], self::VERSION, true );		
		}
		wp_register_script( 'article-cards-script', plugins_url( '../assets/js/article-cards.js', __FILE__ ), [ 'jquery' ], '1.0', true );
	}
	/**
	 * Register Widgets
	 *
	 * Load widgets files and register new Elementor widgets.
	 *
	 * Fired by `elementor/widgets/register` action hook.
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Elementor widgets manager.
	 */
	public function register_widgets( $widgets_manager ) {

		require_once( __DIR__ . '/widgets/class-article-cards-widget.php' );

		$widgets_manager->register( new Elementor_Article_Cards_Widget() );

	}
	private function is_improved_assets_loading() {
		return Plugin::$instance->experiments->is_feature_active( 'e_optimized_assets_loading' );
	}
	private function get_elementor_frontend_dependencies() {
		$dependencies = [
			'elementor-frontend-modules',
			'elementor-waypoints',
			'jquery-ui-position',
		];

		if ( ! $this->is_improved_assets_loading() ) {
			wp_register_script(
				'swiper',
				$this->get_js_assets_url( 'swiper', $this->e_swiper_asset_path ),
				[],
				$this->e_swiper_version,
				true
			);

			$dependencies[] = 'swiper';
			$dependencies[] = 'share-link';
			$dependencies[] = 'elementor-dialog';
		}

		return $dependencies;
	}
}
