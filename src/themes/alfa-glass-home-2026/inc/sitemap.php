<?php
/**
 * Yoast SEO sitemap customization for alfaglass.ru
 *
 * @package Alfa-glass
 */

defined( 'ABSPATH' ) || exit;

/**
 * Post types excluded from XML sitemap.
 *
 * @return string[]
 */
function ag_sitemap_excluded_post_types() {
	return array(
		'request',
		'elementor_library',
		'elementskit_template',
		'elementskit_content',
		'elementskit_widget',
		'e-floating-buttons',
		'e-landing-page',
	);
}

add_filter(
	'wpseo_sitemap_exclude_post_type',
	function ( $exclude, $post_type ) {
		return in_array( $post_type, ag_sitemap_excluded_post_types(), true );
	},
	10,
	2
);

add_filter(
	'wpseo_exclude_from_sitemap_by_post_ids',
	function ( $excluded_ids ) {
		$page = get_page_by_path( 'notfound' );
		if ( $page ) {
			$excluded_ids[] = (int) $page->ID;
		}

		$sitemap_page = function_exists( 'ag_get_html_sitemap_page' ) ? ag_get_html_sitemap_page() : null;
		if ( $sitemap_page ) {
			$excluded_ids[] = (int) $sitemap_page->ID;
		}

		return $excluded_ids;
	}
);

add_filter(
	'wpseo_sitemap_exclude_author',
	static function ( $users ) {
		return array();
	}
);

add_filter(
	'wpseo_sitemap_exclude_taxonomy',
	function ( $exclude, $taxonomy ) {
		$excluded = array( 'post_tag', 'post_format' );
		return in_array( $taxonomy, $excluded, true ) ? true : $exclude;
	},
	10,
	2
);

/**
 * @param array  $url    Sitemap URL entry.
 * @param string $type   Entry type: post, term, user.
 * @param object $object Source object.
 * @return array
 */
function ag_sitemap_entry_attrs( $url, $type, $object ) {
	if ( empty( $url['loc'] ) ) {
		return $url;
	}

	$attrs = array(
		'changefreq' => 'monthly',
		'priority'   => '0.5',
	);

	if ( 'post' === $type && $object instanceof WP_Post ) {
		switch ( $object->post_type ) {
			case 'product':
			case 'uslugi':
				$attrs = array(
					'changefreq' => 'weekly',
					'priority'   => '0.8',
				);
				break;
			case 'post':
				$attrs = array(
					'changefreq' => 'daily',
					'priority'   => '0.5',
				);
				break;
			case 'page':
				$attrs = array(
					'changefreq' => 'monthly',
					'priority'   => '0.5',
				);
				break;
		}
	} elseif ( 'term' === $type && $object instanceof WP_Term ) {
		if ( 'product_category' === $object->taxonomy ) {
			$attrs = array(
				'changefreq' => 'weekly',
				'priority'   => '0.8',
			);
		} elseif ( 'category' === $object->taxonomy ) {
			$attrs = array(
				'changefreq' => 'weekly',
				'priority'   => '0.5',
			);
		}
	}

	$url['changefreq'] = $attrs['changefreq'];
	$url['priority']   = $attrs['priority'];

	return $url;
}
add_filter( 'wpseo_sitemap_entry', 'ag_sitemap_entry_attrs', 10, 3 );

/**
 * Homepage and post type archive links (not passed through wpseo_sitemap_entry).
 *
 * @param array  $links     First links for sitemap type.
 * @param string $post_type Post type name.
 * @return array
 */
function ag_sitemap_post_type_first_links( $links, $post_type ) {
	foreach ( $links as $index => $link ) {
		if ( 'page' === $post_type ) {
			$links[ $index ]['changefreq'] = 'weekly';
			$links[ $index ]['priority']   = '1.0';
		} elseif ( 'uslugi' === $post_type ) {
			$links[ $index ]['changefreq'] = 'weekly';
			$links[ $index ]['priority']   = '0.8';
		} elseif ( 'post' === $post_type ) {
			$links[ $index ]['changefreq'] = 'daily';
			$links[ $index ]['priority']   = '0.5';
		}
	}

	return $links;
}
add_filter( 'wpseo_sitemap_post_type_first_links', 'ag_sitemap_post_type_first_links', 10, 2 );

/**
 * Inject changefreq and priority into rendered URL XML.
 *
 * @param string $output Rendered URL block.
 * @param array  $url    URL entry data.
 * @return string
 */
function ag_sitemap_url_output( $output, $url ) {
	if ( empty( $url['changefreq'] ) && empty( $url['priority'] ) ) {
		return $output;
	}

	$extra = '';

	if ( ! empty( $url['changefreq'] ) ) {
		$extra .= "\t\t<changefreq>" . esc_html( $url['changefreq'] ) . "</changefreq>\n";
	}

	if ( ! empty( $url['priority'] ) ) {
		$extra .= "\t\t<priority>" . esc_html( $url['priority'] ) . "</priority>\n";
	}

	if ( '' === $extra ) {
		return $output;
	}

	return str_replace( "\t</url>\n", $extra . "\t</url>\n", $output );
}
add_filter( 'wpseo_sitemap_url', 'ag_sitemap_url_output', 10, 2 );

/**
 * Clear Yoast sitemap cache after content changes.
 */
function ag_clear_yoast_sitemap_cache() {
	if ( class_exists( 'WPSEO_Sitemaps_Cache' ) ) {
		WPSEO_Sitemaps_Cache::clear();
	}
}
add_action( 'save_post', 'ag_clear_yoast_sitemap_cache' );
add_action( 'delete_post', 'ag_clear_yoast_sitemap_cache' );
add_action( 'edited_term', 'ag_clear_yoast_sitemap_cache' );
add_action( 'delete_term', 'ag_clear_yoast_sitemap_cache' );
