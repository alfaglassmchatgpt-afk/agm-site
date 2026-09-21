<?php
/**
 * Broken internal links: content URL replacements.
 *
 * @package Alfa-glass
 */

defined( 'ABSPATH' ) || exit;

/**
 * MODX [[~ID]] → WordPress paths (миграция со старого сайта).
 *
 * @return array<string, string>
 */
function ag_get_modx_link_map() {
	$map = array(
		'64' => '/catalog/',
		'79' => '/uslugi/peskostujnaya-gravirovka/',
		'80' => '/uslugi/peskostujnaya-gravirovka/',
		'81' => '/uslugi/peskostujnaya-gravirovka/',
		'82' => '/uslugi/peskostujnaya-gravirovka/',
		'83' => '/uslugi/peskostujnaya-gravirovka/',
	);

	return apply_filters( 'ag_modx_link_map', $map );
}

/**
 * @param string $content HTML content.
 * @return string
 */
function ag_fix_modx_internal_links( $content ) {
	$map = ag_get_modx_link_map();

	foreach ( $map as $id => $path ) {
		$url = str_starts_with( $path, 'http' ) ? $path : home_url( $path );

		$tokens = array(
			'%5B%5B~' . $id . '%5D%5D',
			'[[~' . $id . ']]',
		);

		foreach ( $tokens as $token ) {
			$content = str_replace(
				array(
					'href="' . $token . '"',
					"href='" . $token . "'",
					'src="' . $token . '"',
					"src='" . $token . "'",
				),
				array(
					'href="' . esc_url( $url ) . '"',
					"href='" . esc_url( $url ) . "'",
					'src="' . esc_url( $url ) . '"',
					"src='" . esc_url( $url ) . "'",
				),
				$content
			);
		}
	}

	return $content;
}

/**
 * @param string $content HTML content.
 * @return string
 */
function ag_fix_legacy_asset_paths( $content ) {
	$replacements = array(
		'/assets/img/uslugi/rezka-stekla/rezka_stekla_4.jpg'      => '/assets/img/uslugi/rezka-stekla/rezka-stekla-alfaglass-4_s.jpg',
		'assets/img/uslugi/rezka-stekla/rezka_stekla_4.jpg'       => '/assets/img/uslugi/rezka-stekla/rezka-stekla-alfaglass-4_s.jpg',
		'glass-cutting-process.jpg'                                 => '/wp-content/uploads/2025/04/rezka_stekla_1.jpg',
		'measuring-service.jpg'                                   => '/wp-content/uploads/2024/10/img_12.jpg',
	);

	foreach ( $replacements as $from => $to ) {
		if ( ! str_starts_with( $to, 'http' ) && '/' === $to[0] ) {
			$to = home_url( $to );
		}
		$content = str_replace( $from, $to, $content );
	}

	return $content;
}

/**
 * ACF/Elementor: незаполненное поле url в галерее.
 *
 * @param string $content HTML content.
 * @return string
 */
function ag_fix_unfilled_url_placeholders( $content ) {
	if ( false === strpos( $content, 'url' ) ) {
		return $content;
	}

	global $post;

	$fallback = '';
	if ( $post instanceof WP_Post && has_post_thumbnail( $post ) ) {
		$fallback = get_the_post_thumbnail_url( $post, 'large' );
	}
	if ( ! $fallback ) {
		$fallback = home_url( '/wp-content/uploads/2024/10/img_11.jpg' );
	}

	$search  = array( 'href="url"', "href='url'", 'src="url"', "src='url'", 'data-src="url"', "data-src='url'" );
	$replace = array_fill( 0, count( $search ), null );

	foreach ( $search as $index => $needle ) {
		$attr = str_contains( $needle, 'href' ) ? 'href' : ( str_contains( $needle, 'data-src' ) ? 'data-src' : 'src' );
		$quote = str_contains( $needle, '"' ) ? '"' : "'";
		$replace[ $index ] = $attr . '=' . $quote . esc_url( $fallback ) . $quote;
	}

	return str_replace( $search, $replace, $content );
}

/**
 * Replace known obsolete internal URLs in post content and widgets.
 *
 * @param string $content HTML content.
 * @return string
 */
function ag_fix_obsolete_internal_links( $content ) {
	if ( empty( $content ) || ! is_string( $content ) || is_admin() ) {
		return $content;
	}

	$replacements = array(
		'https://alfaglass.ru/product/izgotovlenie-zerkal-na-zakaz/' => home_url( '/product/zerkalo-na-zakaz/' ),
		'https://alfaglass.ru/catalog/steklyannye-dveri/'            => home_url( '/product/steklyannye-dveri/' ),
		'/product/izgotovlenie-zerkal-na-zakaz/'                     => '/product/zerkalo-na-zakaz/',
		'/catalog/steklyannye-dveri/'                                => '/product/steklyannye-dveri/',
		'https://alfaglass.ru/product/mnogoslojnoe-steklo-tripleks/'         => home_url( '/uslugi/tripleksovanie-stekla/' ),
		'https://alfaglass.ru/svetovyie-i-energeticheskie-harakteristiki/'   => home_url( '/blog/' ),
		'https://alfaglass.ru/product/uzorchatoe-steklo/'                    => home_url( '/catalog/uzorchatoe-steklo/' ),
		'https://alfaglass.ru/about-agc/'                                    => home_url( '/blog/' ),
		'https://alfaglass.ru/product/atlantic/'                             => home_url( '/product/kathedralaqualite/' ),
		'https://alfaglass.ru/ogneupornye-harakteristiki-stekla/'            => home_url( '/blog/' ),
		'https://alfaglass.ru/bezopasnost-i-zashhita/'                       => home_url( '/warranty/' ),
		'https://alfaglass.ru/uslugi/hudozhestvennoe-mollirovanie/'          => home_url( '/uslugi/' ),
	);

	$content = str_replace( array_keys( $replacements ), array_values( $replacements ), $content );
	$content = ag_fix_modx_internal_links( $content );
	$content = ag_fix_legacy_asset_paths( $content );
	$content = ag_fix_unfilled_url_placeholders( $content );

	return $content;
}

/**
 * @param string $content Widget/Elementor HTML.
 * @return string
 */
function ag_fix_rendered_html_links( $content ) {
	return ag_fix_obsolete_internal_links( $content );
}

add_filter( 'the_content', 'ag_fix_obsolete_internal_links', 20 );
add_filter( 'widget_text', 'ag_fix_obsolete_internal_links', 20 );
add_filter( 'widget_text_content', 'ag_fix_obsolete_internal_links', 20 );
add_filter( 'elementor/frontend/the_content', 'ag_fix_rendered_html_links', 20 );
