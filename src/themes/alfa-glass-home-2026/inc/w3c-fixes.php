<?php
/**
 * W3C HTML validation fixes (theme-level).
 *
 * @package Alfa-glass
 */

defined( 'ABSPATH' ) || exit;

/**
 * CF7: hidden inputs must not have aria-* attributes.
 *
 * @param string $content Form HTML.
 * @return string
 */
function ag_w3c_fix_cf7_hidden_aria( $content ) {
	if ( empty( $content ) || ! is_string( $content ) ) {
		return $content;
	}

	return preg_replace_callback(
		'/<input\b[^>]*\btype=(["\'])hidden\1[^>]*>/i',
		static function ( $matches ) {
			return preg_replace( '/\saria-[a-z0-9_-]+=(["\']).*?\1/i', '', $matches[0] );
		},
		$content
	);
}
add_filter( 'wpcf7_form_elements', 'ag_w3c_fix_cf7_hidden_aria', 99 );

/**
 * Keep only the first loading attribute on img tags.
 *
 * @param string $html Page HTML.
 * @return string
 */
function ag_w3c_dedupe_img_loading( $html ) {
	if ( empty( $html ) || ! is_string( $html ) ) {
		return $html;
	}

	return preg_replace_callback(
		'/<img\b[^>]*>/i',
		static function ( $matches ) {
			$tag = $matches[0];
			if ( ! preg_match_all( '/\sloading=(["\']).*?\1/i', $tag, $found ) || count( $found[0] ) < 2 ) {
				return $tag;
			}

			$first = true;
			return preg_replace_callback(
				'/\sloading=(["\']).*?\1/i',
				static function ( $loading_match ) use ( &$first ) {
					if ( $first ) {
						$first = false;
						return $loading_match[0];
					}

					return '';
				},
				$tag
			);
		},
		$html
	);
}

/**
 * Restore srcset/sizes on picture sources broken by lazy-load plugins.
 *
 * @param string $html Page HTML.
 * @return string
 */
function ag_w3c_fix_picture_src_attrs( $html ) {
	if ( empty( $html ) || ! is_string( $html ) ) {
		return $html;
	}

	return preg_replace_callback(
		'/<picture\b[^>]*>[\s\S]*?<\/picture>/i',
		static function ( $matches ) {
			return str_replace(
				array( ' data-srcset=', ' data-sizes=' ),
				array( ' srcset=', ' sizes=' ),
				$matches[0]
			);
		},
		$html
	);
}

/**
 * Apply all W3C HTML post-process fixes to optimized page output.
 *
 * @param string $html Page HTML.
 * @return string
 */
function ag_w3c_fix_html_output( $html ) {
	if ( empty( $html ) || ! is_string( $html ) ) {
		return $html;
	}

	$html = ag_w3c_fix_picture_src_attrs( $html );
	$html = ag_w3c_dedupe_img_loading( $html );
	$html = preg_replace( '/(<a\b[^>]*)\stype=(["\'])button\2/i', '$1', $html );
	$html = preg_replace( '/<img\b([^>]*)\ssizes=(["\'])[^"\']*\2((?![^>]*\ssrcset=)[^>]*)>/i', '<img$1$3>', $html );
	$html = ag_w3c_unlazyload_images( $html );
	$html = ag_w3c_unlazyload_backgrounds( $html );

	return $html;
}
add_filter( 'autoptimize_html_after_minify', 'ag_w3c_fix_html_output', 99 );

/**
 * Restore Autoptimize lazyload placeholders to real image URLs.
 *
 * @param string $html Page HTML.
 * @return string
 */
function ag_w3c_unlazyload_images( $html ) {
	if ( empty( $html ) || ! is_string( $html ) ) {
		return $html;
	}

	return preg_replace_callback(
		'/<img\b[^>]*>/i',
		static function ( $matches ) {
			$tag = $matches[0];

			if ( ! preg_match( '/\bclass=(["\'])[^"\']*\blazyload\b/i', $tag ) ) {
				return $tag;
			}

			if ( ! preg_match( '/\bdata-src=(["\'])([^"\']+)\1/i', $tag, $data_src ) ) {
				return $tag;
			}

			$quote = $data_src[1];
			$url   = $data_src[2];

			if ( preg_match( '/\bsrc=(["\']).*?\1/i', $tag ) ) {
				$tag = preg_replace( '/\bsrc=(["\']).*?\1/i', 'src=' . $quote . $url . $quote, $tag, 1 );
			} else {
				$tag = preg_replace( '/<img\b/i', '<img src=' . $quote . $url . $quote, $tag, 1 );
			}

			$tag = str_replace(
				array( ' data-srcset=', ' data-sizes=', ' data-src=' ),
				array( ' srcset=', ' sizes=', ' src=' ),
				$tag
			);
			$tag = preg_replace( '/\sdata-src=(["\']).*?\1/i', '', $tag );
			$tag = preg_replace( '/\blazyload\b/', 'lazyloaded', $tag );

			return $tag;
		},
		$html
	);
}

/**
 * Restore Autoptimize lazyload background placeholders from data-bg.
 *
 * @param string $html Page HTML.
 * @return string
 */
function ag_w3c_unlazyload_backgrounds( $html ) {
	if ( empty( $html ) || ! is_string( $html ) ) {
		return $html;
	}

	return preg_replace_callback(
		'/<(?:div|section|article|header|footer|span|p)\b[^>]*\bdata-bg=(["\'])([^"\']+)\1[^>]*>/i',
		static function ( $matches ) {
			$tag = $matches[0];
			$url = $matches[2];

			if ( preg_match( '/\bstyle=(["\'])([^"\']*)\1/i', $tag, $style_match ) ) {
				$style = $style_match[2];
				if ( preg_match( '/background-image:\s*url\([^)]*\)/i', $style ) ) {
					$style = preg_replace( '/background-image:\s*url\([^)]*\)/i', 'background-image: url(' . $url . ')', $style );
				} else {
					$style = rtrim( $style, '; ' ) . '; background-image: url(' . $url . ')';
				}
				$tag = preg_replace( '/\bstyle=(["\'])[^"\']*\1/i', 'style=' . $style_match[1] . $style . $style_match[1], $tag, 1 );
			} else {
				$tag = preg_replace( '/^<(\w+)\b/i', '<$1 style="background-image: url(' . $url . ');"', $tag, 1 );
			}

			$tag = preg_replace( '/\sdata-bg=(["\']).*?\1/i', '', $tag );
			$tag = preg_replace( '/\blazyload\b/', 'lazyloaded', $tag );

			return $tag;
		},
		$html
	);
}

/**
 * Autoptimize lazyload: do not inject style into body/footer.
 *
 * @param string $markup Default lazyload CSS markup.
 * @return string
 */
function ag_w3c_fix_lazyload_cssoutput( $markup ) {
	return '';
}
add_filter( 'autoptimize_filter_imgopt_lazyload_cssoutput', 'ag_w3c_fix_lazyload_cssoutput' );

/**
 * Fix lazyload markup in HTML stored/served via WP Super Cache.
 *
 * @param string $buffer Page HTML.
 * @return string
 */
function ag_w3c_fix_cached_html_output( $buffer ) {
	if ( ! is_string( $buffer ) || '' === $buffer ) {
		return $buffer;
	}

	$buffer = ag_w3c_unlazyload_images( $buffer );
	$buffer = ag_w3c_unlazyload_backgrounds( $buffer );
	$buffer = str_replace( '<style>.lazyload{display:none}</style>', '', $buffer );

	return $buffer;
}
add_filter( 'wp_cache_ob_callback_filter', 'ag_w3c_fix_cached_html_output', 20 );

/**
 * One-time supercache flush after lazyload image fix.
 */
function ag_w3c_maybe_flush_supercache_for_lazyload_fix() {
	$version = 2;

	if ( (int) get_option( 'ag_w3c_lazyload_fix_version', 0 ) >= $version ) {
		return;
	}

	if ( function_exists( 'wp_cache_clear_cache' ) ) {
		wp_cache_clear_cache();
	}

	update_option( 'ag_w3c_lazyload_fix_version', $version, false );
}
add_action( 'init', 'ag_w3c_maybe_flush_supercache_for_lazyload_fix', 1 );
