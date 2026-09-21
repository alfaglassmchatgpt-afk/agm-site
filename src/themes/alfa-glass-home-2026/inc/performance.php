<?php
/**
 * Performance optimizations for PageSpeed / Core Web Vitals.
 *
 * @package Alfa-glass
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Disable Loading Page preloader (body{display:none}) on the frontend.
 */
add_filter(
	'option_loading_page_options',
	function ( $options ) {
		if ( is_admin() || ! is_array( $options ) ) {
			return $options;
		}

		$options['enabled_loading_screen'] = false;

		return $options;
	}
);

add_filter(
	'loading_page_settings',
	function ( $options ) {
		if ( is_admin() || ! is_array( $options ) ) {
			return $options;
		}

		$options['enabled_loading_screen'] = false;

		return $options;
	}
);

/**
 * Keep jQuery in the head: plugin/inline consumers run before the footer.
 */
add_action(
	'wp_enqueue_scripts',
	function () {
		if ( is_admin() ) {
			return;
		}

		wp_scripts()->add_data( 'jquery', 'group', 0 );
		wp_scripts()->add_data( 'jquery-core', 'group', 0 );
		wp_scripts()->add_data( 'jquery-migrate', 'group', 0 );
	},
	1
);

/**
 * Add defer to theme scripts (jQuery excluded — required by inline handlers).
 */
add_filter(
	'script_loader_tag',
	function ( $tag, $handle, $src ) {
		if ( is_admin() ) {
			return $tag;
		}

		if ( ! $src || str_starts_with( $src, 'data:' ) ) {
			return preg_replace( '/\sdefer(?:=(["\']).*?\1)?/i', '', $tag );
		}

		$defer_handles = array(
			'swiper',
			'fancybox',
			'maskedinput',
			'alfa-glass-navigation',
			'alfa-main-script',
			'alfa-ajax',
			'alfa-home-page-script',
			'alfa-product-script',
			'alfa-killbot',
		);

		if ( ! in_array( $handle, $defer_handles, true ) ) {
			return $tag;
		}

		if ( str_contains( $tag, ' defer' ) || str_contains( $tag, ' async' ) ) {
			return $tag;
		}

		return str_replace( ' src=', ' defer src=', $tag );
	},
	10,
	3
);

/**
 * Whether the current page needs Swiper assets.
 */
function alfa_needs_swiper() {
	return is_front_page()
		|| is_page_template( 'home-page.php' )
		|| is_singular( 'uslugi' )
		|| is_post_type_archive( 'uslugi' )
		|| is_singular( 'product' )
		|| is_tax( 'product_category' )
		|| is_search();
}

/**
 * Whether the current page needs Fancybox assets.
 */
function alfa_needs_fancybox() {
	return is_singular( 'uslugi' )
		|| is_post_type_archive( 'uslugi' )
		|| is_singular( 'product' )
		|| is_tax( 'product_category' )
		|| is_search();
}

/**
 * Restore lazy-load attributes broken by Autoptimize on critical image blocks.
 *
 * @param string $html HTML fragment.
 * @return string
 */
function alfa_fix_data_src_attrs( $html ) {
	$html = str_replace(
		array( 'data-srcset=', 'data-src=', ' data-sizes=' ),
		array( 'srcset=', 'src=', ' sizes=' ),
		$html
	);

	if ( function_exists( 'ag_w3c_fix_picture_src_attrs' ) ) {
		$html = ag_w3c_fix_picture_src_attrs( $html );
	}

	return $html;
}

/**
 * Whether CF7 assets should load on the initial request.
 */
function alfa_should_load_cf7_initially() {
	return ! is_front_page();
}

add_filter(
	'wpcf7_load_js',
	static function ( $load ) {
		if ( is_admin() || alfa_should_load_cf7_initially() ) {
			return $load;
		}

		return false;
	}
);

add_filter(
	'wpcf7_load_css',
	static function ( $load ) {
		if ( is_admin() || alfa_should_load_cf7_initially() ) {
			return $load;
		}

		return false;
	}
);

/**
 * Load CF7 on interaction (modal / footer form) to keep hooks+i18n off critical path.
 */
function alfa_print_cf7_deferred_loader() {
	if ( is_admin() || ! is_front_page() || ! defined( 'WPCF7_VERSION' ) || ! function_exists( 'wpcf7_plugin_url' ) ) {
		return;
	}

	$wpcf7_obj = array(
		'api' => array(
			'root'      => sanitize_url( get_rest_url() ),
			'namespace' => 'contact-form-7/v1',
		),
	);

	if ( defined( 'WP_CACHE' ) && WP_CACHE ) {
		$wpcf7_obj['cached'] = 1;
	}

	$assets = array(
		'hooks' => includes_url( 'js/dist/hooks.min.js' ),
		'i18n'  => includes_url( 'js/dist/i18n.min.js' ),
		'swv'   => wpcf7_plugin_url( 'includes/swv/js/index.js' ),
		'cf7'   => wpcf7_plugin_url( 'includes/js/index.js' ),
		'css'   => wpcf7_plugin_url( 'includes/css/styles.css' ),
	);
	?>
	<script>
	(function () {
		var loaded = false;
		var pending = null;
		var assets = <?php echo wp_json_encode( $assets ); ?>;
		var wpcf7Config = <?php echo wp_json_encode( $wpcf7_obj ); ?>;

		function loadScript(src) {
			return new Promise(function (resolve, reject) {
				if (document.querySelector('script[src="' + src + '"]')) {
					resolve();
					return;
				}
				var node = document.createElement('script');
				node.src = src;
				node.onload = resolve;
				node.onerror = reject;
				document.body.appendChild(node);
			});
		}

		function loadCss(href) {
			if (document.querySelector('link[rel="stylesheet"][href^="' + href + '"]')) {
				return;
			}
			var node = document.createElement('link');
			node.rel = 'stylesheet';
			node.href = href + '?ver=<?php echo esc_js( WPCF7_VERSION ); ?>';
			document.head.appendChild(node);
		}

		function loadCf7() {
			if (loaded) {
				return pending || Promise.resolve();
			}
			loaded = true;
			window.wpcf7 = wpcf7Config;
			loadCss(assets.css);
			pending = loadScript(assets.hooks + '?ver=<?php echo esc_js( WPCF7_VERSION ); ?>')
				.then(function () {
					return loadScript(assets.i18n + '?ver=<?php echo esc_js( WPCF7_VERSION ); ?>');
				})
				.then(function () {
					return loadScript(assets.swv + '?ver=<?php echo esc_js( WPCF7_VERSION ); ?>');
				})
				.then(function () {
					return loadScript(assets.cf7 + '?ver=<?php echo esc_js( WPCF7_VERSION ); ?>');
				});
			return pending;
		}

		function maybeLoadCf7(event) {
			var target = event.target;
			if (!target || !target.closest) {
				return;
			}
			if (
				target.closest('[data-toggle="popup-open"]') ||
				target.closest('[data-modal-target*="form"]') ||
				target.closest('.wpcf7-form-control') ||
				target.closest('.wpcf7')
			) {
				loadCf7();
			}
		}

		document.addEventListener('click', maybeLoadCf7, true);
		document.addEventListener('focusin', maybeLoadCf7, true);

		if ('IntersectionObserver' in window) {
			document.querySelectorAll('.wpcf7').forEach(function (form) {
				var io = new IntersectionObserver(function (entries) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) {
							loadCf7();
							io.disconnect();
						}
					});
				}, { rootMargin: '200px 0px' });
				io.observe(form);
			});
		}
	})();
	</script>
	<?php
}
add_action( 'wp_footer', 'alfa_print_cf7_deferred_loader', 5 );


add_filter(
	'get_custom_logo_image_attributes',
	function ( $attr ) {
		$attr['loading']  = 'eager';
		$attr['decoding'] = 'async';
		$attr['sizes']    = '(max-width: 576px) 130px, (max-width: 1440px) 164px, 174px';

		if ( ! is_front_page() ) {
			$attr['fetchpriority'] = 'high';
		}

		return $attr;
	}
);

add_filter(
	'get_custom_logo',
	function ( $html ) {
		$logo_id = get_theme_mod( 'custom_logo' );
		if ( ! $logo_id || ! $html ) {
			return $html;
		}

		$logo_attrs = array(
			'class'    => 'custom-logo',
			'loading'  => 'eager',
			'decoding' => 'async',
			'sizes'    => '(max-width: 576px) 130px, (max-width: 1440px) 164px, 174px',
		);

		if ( ! is_front_page() ) {
			$logo_attrs['fetchpriority'] = 'high';
		}

		$image = wp_get_attachment_image( $logo_id, 'medium', false, $logo_attrs );

		if ( ! $image ) {
			return $html;
		}

		$home = esc_url( home_url( '/' ) );

		if ( is_front_page() && ! is_paged() ) {
			return sprintf(
				'<span class="custom-logo-link" aria-current="page">%s</span>',
				$image
			);
		}

		return sprintf(
			'<a href="%1$s" class="custom-logo-link" rel="home">%2$s</a>',
			$home,
			$image
		);
	},
	20
);

/**
 * Lazy-load third-party widget scripts embedded in ACF HTML (smartwidgets.ru).
 */
function alfa_lazy_external_scripts( $html ) {
	if ( empty( $html ) || ! is_string( $html ) ) {
		return $html;
	}

	return preg_replace_callback(
		'/<script(\s[^>]*\ssrc=["\'])(https?:\/\/[^"\']+)(["\'][^>]*)><\/script>/i',
		function ( $matches ) {
			$src = $matches[2];
			if ( str_contains( $src, home_url() ) ) {
				return $matches[0];
			}

			$no_lazy_hosts = array(
				'yandex.ru',
				'yastatic.net',
				'api-maps.yandex.ru',
				'maps.yandex.ru',
			);

			foreach ( $no_lazy_hosts as $host ) {
				if ( str_contains( $src, $host ) ) {
					return $matches[0];
				}
			}

			return '<script data-lazy-script="' . esc_attr( $src ) . '"' . $matches[3] . '></script>';
		},
		$html
	);
}

/**
 * Intersection Observer loader for deferred third-party scripts.
 */
function alfa_print_lazy_script_loader() {
	if ( is_admin() ) {
		return;
	}
	?>
	<script>
	(function () {
		var placeholders = document.querySelectorAll('script[data-lazy-script]');
		if (!placeholders.length) return;

		function loadScript(node) {
			var s = document.createElement('script');
			s.src = node.getAttribute('data-lazy-script');
			s.defer = true;
			node.parentNode.replaceChild(s, node);
		}

		if ('IntersectionObserver' in window) {
			var io = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) return;
					loadScript(entry.target);
					io.unobserve(entry.target);
				});
			}, { rootMargin: '200px 0px' });

			placeholders.forEach(function (node) {
				io.observe(node.closest('section') || node);
			});
		} else {
			window.addEventListener('load', function () {
				placeholders.forEach(loadScript);
			});
		}
	})();
	</script>
	<?php
}
add_action( 'wp_footer', 'alfa_print_lazy_script_loader', 99 );

/**
 * Autoptimize: defer non-jQuery JS, keep critical CSS pipeline.
 */
add_filter( 'autoptimize_filter_js_defer', '__return_true' );
add_filter( 'autoptimize_js_filter_defer_inline', '__return_false' );
add_filter(
	'autoptimize_filter_css_replacetag',
	function ( $replace_tag ) {
		return array( '</title>', 'after' );
	}
);
add_filter(
	'autoptimize_css_after_minify',
	function ( $css ) {
		if ( ! is_string( $css ) || '' === $css ) {
			return $css;
		}

		$css = preg_replace( '/@charset\s+[^;]+;\s*/i', '', $css );
		$css = preg_replace( '/[^;{}]*gradieintplate\([^)]*\)[^;]*;/i', '', $css );
		$css = preg_replace( '/[^}]*\\:met_[^{}]*\{[^}]*\}/i', '', $css );
		$css = preg_replace( '/clip:rect\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/i', 'clip:rect(0px,0px,0px,0px)', $css );

		return $css;
	}
);
add_filter(
	'autoptimize_html_after_minify',
	function ( $html ) {
		if ( ! is_string( $html ) || '' === $html ) {
			return $html;
		}

		$html = preg_replace( '/(<script\b(?![^>]*\ssrc=)[^>]*)\sdefer(?:=(["\']).*?\2)?/i', '$1', $html );
		$html = preg_replace( '/(<script\b[^>]*\ssrc=(["\'])data:[^>]*)\sdefer(?:=(["\']).*?\3)?/i', '$1', $html );

		$patterns = array();

		if ( is_front_page() || is_page_template( 'home-page.php' ) ) {
			$patterns[] = '/(<section class="container main-screen mb__section hero-slider-container">[\s\S]*?<\/section>)/';
			$patterns[] = '/(<section class="container-fluid configurator[^>]*>[\s\S]*?<\/section>)/';
		}

		if ( is_singular( 'product' ) || is_tax( 'product_category' ) || is_singular( 'uslugi' ) ) {
			$patterns[] = '/(<section class="container-fluid mb__section product__first-screen[^>]*>[\s\S]*?<\/section>)/';
		}

		foreach ( $patterns as $pattern ) {
			$html = preg_replace_callback(
				$pattern,
				static function ( $matches ) {
					return alfa_fix_data_src_attrs( $matches[0] );
				},
				$html
			);
		}

		return $html;
	}
);
add_filter(
	'autoptimize_js_exclude',
	function ( $exclude ) {
		$extra = 'jquery.js, jquery.min.js, jquery-core, jquery-migrate, codepeople-loading-page, killbot.js';

		return trim( $exclude . ', ' . $extra, ', ' );
	}
);

/**
 * Autoptimize lazyload breaks when ngx_pagespeed rewrites lazysizes URL.
 * Keep native loading="lazy" only.
 */
// add_filter( 'autoptimize_filter_imgopt_should_lazyload', '__return_false' );
// add_filter( 'autoptimize_filter_imgopt_lazyload_backgroundimages', '__return_false' );

/**
 * Yandex Metrika: one counter, webvisor off (handled by wp-yandex-metrika plugin).
 */
add_filter(
	'option_yam_options',
	function ( $options ) {
		if ( is_admin() || ! is_array( $options ) || empty( $options['counters'] ) ) {
			return $options;
		}

		$options['counters'] = array_values( array_slice( $options['counters'], 0, 1 ) );

		foreach ( $options['counters'] as $index => $counter ) {
			$options['counters'][ $index ]['webvisor'] = 0;
		}

		return $options;
	}
);

/**
 * Hero slider: desktop layout + mobile LCP image.
 * Styles live in theme style.css but the site loads css/style.min.css — inject critical rules here.
 */
add_action(
	'wp_head',
	function () {
		if ( ! is_front_page() && ! is_page_template( 'home-page.php' ) ) {
			return;
		}
		?>
<style>
@media screen and (max-width:576px){.hero-slider-container{display:none!important}}
@media screen and (min-width:577px){
.hero-static{display:none!important}
.main-screen .block__main{width:100%!important;border-radius:var(--border-radius);height:0;position:relative;padding-bottom:calc(9/21*100%);background-position:50% 50%!important}
.main-screen .block__main picture{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0}
.main-screen .block__main picture img{width:100%;height:100%;object-fit:cover}
.main-screen .block__main .col__right{margin-left:auto}
.main-screen .col__right .btn{margin-top:auto;margin-left:auto}
.main-screen .col__right,.main-screen .col__left{position:absolute!important;top:0!important;height:100%!important}
.main-screen .col__left{left:0!important}
.main-screen .col__right{right:0!important}
.main-screen .swiper-pagination-bullet-active{background:#9b9b9b}
}
.main-screen .block__main img.mobile__bgr{width:100%;height:38rem;border-radius:2rem;object-fit:cover;display:block}
.configurator__panes{overflow:hidden;width:116.7rem;height:98.4rem;flex-shrink:0;position:relative}
.configurator__panes .tab_pane{position:absolute;top:0;left:0;width:100%;height:100%}
.configurator__panes .gallary .items{aspect-ratio:2/3;background-color:rgba(14,15,15,.06);contain-intrinsic-size:1167px 1750px}
</style>
		<?php
	},
	99
);

/**
 * Remove wp-block-library CSS on frontend when blocks are not used in theme templates.
 */
add_action(
	'wp_enqueue_scripts',
	function () {
		if ( is_admin() ) {
			return;
		}

		wp_dequeue_style( 'wp-block-library' );
		wp_dequeue_style( 'wp-block-library-theme' );
		wp_dequeue_style( 'classic-theme-styles' );
		wp_dequeue_style( 'global-styles' );
	},
	100
);
