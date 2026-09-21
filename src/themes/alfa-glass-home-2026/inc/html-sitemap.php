<?php
/**
 * HTML sitemap for alfaglass.ru
 *
 * @package Alfa-glass
 */

defined( 'ABSPATH' ) || exit;

/**
 * @return WP_Post|null
 */
function ag_get_html_sitemap_page() {
	static $page = null;

	if ( null !== $page ) {
		return $page;
	}

	$page = get_page_by_path( 'sitemap' );

	if ( ! $page ) {
		$pages = get_pages(
			array(
				'meta_key'   => '_wp_page_template',
				'meta_value' => 'page-sitemap.php',
				'number'     => 1,
			)
		);

		if ( ! empty( $pages ) ) {
			$page = $pages[0];
		}
	}

	return $page instanceof WP_Post ? $page : null;
}

/**
 * @return string
 */
function ag_get_html_sitemap_url() {
	$page = ag_get_html_sitemap_page();

	return $page ? get_permalink( $page ) : '';
}

/**
 * @return int[]
 */
function ag_html_sitemap_excluded_page_ids() {
	$excluded = array();

	$sitemap_page = ag_get_html_sitemap_page();
	if ( $sitemap_page ) {
		$excluded[] = (int) $sitemap_page->ID;
	}

	$notfound = get_page_by_path( 'notfound' );
	if ( $notfound ) {
		$excluded[] = (int) $notfound->ID;
	}

	return array_unique( $excluded );
}

/**
 * @param string $url
 * @param string $label
 * @return string
 */
function ag_html_sitemap_link( $url, $label ) {
	if ( alfa_is_current_nav_url( $url ) ) {
		return '<span aria-current="page">' . esc_html( $label ) . '</span>';
	}

	return '<a href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a>';
}

/**
 * @param string $title
 * @param string $content
 * @return string
 */
function ag_html_sitemap_section( $title, $content ) {
	if ( '' === trim( $content ) ) {
		return '';
	}

	return '<section class="html-sitemap__group">'
		. '<h2 class="html-sitemap__title">' . esc_html( $title ) . '</h2>'
		. $content
		. '</section>';
}

/**
 * @param WP_Post[] $posts
 * @param string    $class
 * @return string
 */
function ag_html_sitemap_posts_list( $posts, $class = 'html-sitemap__list' ) {
	if ( empty( $posts ) ) {
		return '';
	}

	$html = '<ul class="' . esc_attr( $class ) . '">';

	foreach ( $posts as $post ) {
		$html .= '<li>' . ag_html_sitemap_link( get_permalink( $post ), get_the_title( $post ) ) . '</li>';
	}

	$html .= '</ul>';

	return $html;
}

/**
 * @return string
 */
function ag_html_sitemap_home_section() {
	return ag_html_sitemap_section(
		__( 'Главная', 'alfa-glass' ),
		'<ul class="html-sitemap__list"><li>' . ag_html_sitemap_link( home_url( '/' ), __( 'Главная страница', 'alfa-glass' ) ) . '</li></ul>'
	);
}

/**
 * @return string
 */
function ag_html_sitemap_pages_section() {
	$pages = get_pages(
		array(
			'sort_column' => 'menu_order,post_title',
			'post_status' => 'publish',
			'exclude'     => ag_html_sitemap_excluded_page_ids(),
		)
	);

	return ag_html_sitemap_section(
		__( 'Страницы', 'alfa-glass' ),
		ag_html_sitemap_posts_list( $pages )
	);
}

/**
 * @param int $term_id
 * @return WP_Post[]
 */
function ag_html_sitemap_products_in_term( $term_id ) {
	return get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
			'tax_query'      => array(
				array(
					'taxonomy' => 'product_category',
					'field'    => 'term_id',
					'terms'    => (int) $term_id,
				),
			),
		)
	);
}

/**
 * @param WP_Term $term
 * @return string
 */
function ag_html_sitemap_category_branch( $term ) {
	$children = get_terms(
		array(
			'taxonomy'   => 'product_category',
			'parent'     => (int) $term->term_id,
			'hide_empty' => true,
			'orderby'    => 'name',
			'order'      => 'ASC',
		)
	);

	$products = ag_html_sitemap_products_in_term( $term->term_id );

	$html = '<li>' . ag_html_sitemap_link( get_term_link( $term ), $term->name );

	$nested = '';

	if ( ! empty( $children ) && ! is_wp_error( $children ) ) {
		$nested .= '<ul class="html-sitemap__list html-sitemap__list_nested">';
		foreach ( $children as $child ) {
			$nested .= ag_html_sitemap_category_branch( $child );
		}
		$nested .= '</ul>';
	}

	if ( ! empty( $products ) ) {
		$nested .= ag_html_sitemap_posts_list( $products, 'html-sitemap__list html-sitemap__list_nested html-sitemap__list_products' );
	}

	if ( '' !== $nested ) {
		$html .= $nested;
	}

	$html .= '</li>';

	return $html;
}

/**
 * @return string
 */
function ag_html_sitemap_catalog_section() {
	$parents = get_terms(
		array(
			'taxonomy'   => 'product_category',
			'parent'     => 0,
			'hide_empty' => true,
			'orderby'    => 'name',
			'order'      => 'ASC',
		)
	);

	if ( empty( $parents ) || is_wp_error( $parents ) ) {
		return '';
	}

	$html = '<ul class="html-sitemap__list">';

	foreach ( $parents as $term ) {
		$html .= ag_html_sitemap_category_branch( $term );
	}

	$html .= '</ul>';

	return ag_html_sitemap_section( __( 'Каталог', 'alfa-glass' ), $html );
}

/**
 * @param string $post_type
 * @param string $title
 * @param string $archive_label
 * @return string
 */
function ag_html_sitemap_post_type_section( $post_type, $title, $archive_label ) {
	$posts = get_posts(
		array(
			'post_type'      => $post_type,
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
		)
	);

	$html = '';

	$archive_url = get_post_type_archive_link( $post_type );
	if ( $archive_url ) {
		$html .= '<ul class="html-sitemap__list"><li>' . ag_html_sitemap_link( $archive_url, $archive_label ) . '</li></ul>';
	}

	$html .= ag_html_sitemap_posts_list( $posts );

	return ag_html_sitemap_section( $title, $html );
}

/**
 * @return string
 */
function ag_html_sitemap_uslugi_section() {
	if ( ! post_type_exists( 'uslugi' ) ) {
		return '';
	}

	return ag_html_sitemap_post_type_section(
		'uslugi',
		__( 'Услуги', 'alfa-glass' ),
		__( 'Все услуги', 'alfa-glass' )
	);
}

/**
 * @return string
 */
function ag_html_sitemap_blog_section() {
	$page_for_posts = (int) get_option( 'page_for_posts' );
	$archive_label  = $page_for_posts ? get_the_title( $page_for_posts ) : __( 'Все статьи', 'alfa-glass' );

	return ag_html_sitemap_post_type_section(
		'post',
		__( 'Блог', 'alfa-glass' ),
		$archive_label
	);
}

/**
 * @return void
 */
function ag_render_html_sitemap() {
	$sections = array(
		ag_html_sitemap_home_section(),
		ag_html_sitemap_pages_section(),
		ag_html_sitemap_catalog_section(),
		ag_html_sitemap_uslugi_section(),
		ag_html_sitemap_blog_section(),
	);

	$sections = array_filter( $sections );

	echo '<nav class="html-sitemap" aria-label="' . esc_attr__( 'Карта сайта', 'alfa-glass' ) . '">';
	echo '<div class="html-sitemap__grid">';
	echo implode( '', $sections );
	echo '</div>';
	echo '</nav>';
}

/**
 * Ensure sitemap page exists on theme switch.
 */
function ag_maybe_create_html_sitemap_page() {
	if ( ag_get_html_sitemap_page() ) {
		return;
	}

	wp_insert_post(
		array(
			'post_title'  => __( 'Карта сайта', 'alfa-glass' ),
			'post_name'   => 'sitemap',
			'post_status' => 'publish',
			'post_type'   => 'page',
			'post_content'=> '',
			'meta_input'  => array(
				'_wp_page_template' => 'page-sitemap.php',
			),
		)
	);
}
add_action( 'after_switch_theme', 'ag_maybe_create_html_sitemap_page' );
