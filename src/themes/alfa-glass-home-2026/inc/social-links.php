<?php
/**
 * Social links and inline SVG helpers.
 *
 * @package Alfa-glass
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'alfa_sanitize_inline_svg' ) ) {
	/**
	 * @param string $svg_content Raw SVG markup.
	 * @return string
	 */
	function alfa_sanitize_inline_svg( $svg_content ) {
		if ( empty( $svg_content ) || ! is_string( $svg_content ) ) {
			return '';
		}

		$svg_content = preg_replace( '/<\?xml[^>]*\?>/i', '', $svg_content );
		$svg_content = preg_replace( '/\sxmlns:(?:inkscape|sodipodi|svg)="[^"]*"/i', '', $svg_content );
		$svg_content = preg_replace( '/\s(?:inkscape|sodipodi):[a-z0-9_-]+="[^"]*"/i', '', $svg_content );
		$svg_content = preg_replace( '/<(sodipodi:[^>]+|inkscape:[^>]+)>/i', '', $svg_content );
		$svg_content = preg_replace( '/<\/(?:sodipodi|inkscape):[^>]+>/i', '', $svg_content );

		static $svg_instance = 0;
		++$svg_instance;
		$suffix = 'svg-' . $svg_instance;
		$svg_content = preg_replace_callback(
			'/\sid=(["\'])([^"\']+)\1/i',
			static function ( $matches ) use ( $suffix ) {
				return ' id=' . $matches[1] . $matches[2] . '-' . $suffix . $matches[1];
			},
			$svg_content
		);

		if ( ! preg_match( '/\saria-hidden=/i', $svg_content ) ) {
			$svg_content = preg_replace( '/<svg\b/i', '<svg aria-hidden="true" focusable="false"', $svg_content, 1 );
		}

		return trim( $svg_content );
	}
}

if ( ! function_exists( 'get_svg_content' ) ) {
	/**
	 * @param string $icon_url SVG URL.
	 * @return string
	 */
	function get_svg_content( $icon_url ) {
		static $svg_cache = array();

		if ( isset( $svg_cache[ $icon_url ] ) ) {
			return alfa_sanitize_inline_svg( $svg_cache[ $icon_url ] );
		}

		$response = wp_remote_get( $icon_url );
		if ( is_wp_error( $response ) ) {
			return '';
		}

		$svg_content = wp_remote_retrieve_body( $response );
		if ( ! empty( $svg_content ) ) {
			$svg_cache[ $icon_url ] = $svg_content;
			return alfa_sanitize_inline_svg( $svg_content );
		}

		return '';
	}
}

if ( ! function_exists( 'alfa_icon_address_point' ) ) {
	/**
	 * @return string
	 */
	function alfa_icon_address_point() {
		$clip_id = 'clip_' . wp_unique_id( 'address-point-' );

		return '<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'
			. '<g clip-path="url(#' . esc_attr( $clip_id ) . ')">'
			. '<path d="M8.00037 0.5C4.90839 0.5 2.40039 3.008 2.40039 6.09998C2.40039 10.3 8.00037 16.5 8.00037 16.5C8.00037 16.5 13.6004 10.3 13.6004 6.09998C13.6004 3.008 11.0924 0.5 8.00037 0.5ZM8.00037 8.10001C6.89637 8.10001 6.00039 7.20402 6.00039 6.10002C6.00039 4.99602 6.89637 4.1 8.00037 4.1C9.10437 4.1 10.0004 4.99598 10.0004 6.09998C10.0004 7.20398 9.10437 8.10001 8.00037 8.10001Z" fill="white" fill-opacity="0.7" />'
			. '</g>'
			. '<defs>'
			. '<clipPath id="' . esc_attr( $clip_id ) . '">'
			. '<rect width="16" height="16" fill="white" transform="translate(0 0.5)" />'
			. '</clipPath>'
			. '</defs>'
			. '</svg>';
	}
}

if ( ! function_exists( 'get_social_links_content' ) ) {
	/**
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

			$link         = esc_url( $social['link'] );
			$svg_content  = get_svg_content( $social['icon'] );

			if ( ! $svg_content ) {
				continue;
			}

			$output .= '<div class="item"><a href="' . $link . '" target="_blank" rel="noopener noreferrer">' . $svg_content . '</a></div>';
		}

		$output .= '</div>';

		return $output;
	}
}
