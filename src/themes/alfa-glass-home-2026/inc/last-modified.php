<?php
/**
 * Last-Modified header and 304 Not Modified support.
 *
 * @package Alfa-glass
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/ag-lm-debug.php';

add_action( 'template_redirect', 'ag_lm_template_redirect_pagespeed_strip', 0 );

/**
 * Fallback 301 from ?PageSpeed=off when supercache phase1 did not run.
 */
function ag_lm_template_redirect_pagespeed_strip() {
	if ( function_exists( 'ag_lm_redirect_strip_pagespeed_if_needed' ) ) {
		ag_lm_redirect_strip_pagespeed_if_needed();
	}
}

/**
 * Whether Last-Modified handling should run for the current request.
 *
 * @return bool
 */
function ag_should_send_last_modified() {
	if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || is_user_logged_in() ) {
		ag_lm_debug_log( 'should_skip', array( 'reason' => 'admin_ajax_cron_logged_in' ) );
		return false;
	}

	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		ag_lm_debug_log( 'should_skip', array( 'reason' => 'rest' ) );
		return false;
	}

	if ( is_404() || is_search() || is_feed() ) {
		ag_lm_debug_log(
			'should_skip',
			array(
				'reason' => '404_search_feed',
				'404'    => is_404(),
				'search' => is_search(),
				'feed'   => is_feed(),
			)
		);
		return false;
	}

	if ( ! ag_lm_is_head_or_get_request() ) {
		ag_lm_debug_log( 'should_skip', array( 'reason' => 'not_get_or_head', 'method' => $_SERVER['REQUEST_METHOD'] ?? '-' ) );
		return false;
	}

	return true;
}

/**
 * Resolve unix timestamp for the current front-end view.
 *
 * @return int
 */
function ag_get_page_last_modified_timestamp() {
	$timestamp = 0;

	if ( is_front_page() ) {
		$page_id = (int) get_option( 'page_on_front' );
		if ( $page_id ) {
			$post = get_post( $page_id );
			if ( $post instanceof WP_Post ) {
				$timestamp = strtotime( $post->post_modified_gmt . ' GMT' );
			}
		}
	}

	if ( ! $timestamp && is_home() && get_option( 'page_for_posts' ) ) {
		$post = get_post( (int) get_option( 'page_for_posts' ) );
		if ( $post instanceof WP_Post ) {
			$timestamp = strtotime( $post->post_modified_gmt . ' GMT' );
		}
	}

	if ( ! $timestamp && is_singular() ) {
		$post = get_queried_object();
		if ( $post instanceof WP_Post ) {
			$timestamp = strtotime( $post->post_modified_gmt . ' GMT' );
		}
	} elseif ( ! $timestamp && ( is_tax() || is_category() || is_tag() ) ) {
		$term = get_queried_object();
		if ( $term instanceof WP_Term ) {
			$posts = get_posts(
				array(
					'post_type'              => 'any',
					'post_status'            => 'publish',
					'posts_per_page'         => 1,
					'orderby'                => 'modified',
					'order'                  => 'DESC',
					'no_found_rows'          => true,
					'update_post_meta_cache' => false,
					'update_post_term_cache' => false,
					'tax_query'              => array(
						array(
							'taxonomy' => $term->taxonomy,
							'field'    => 'term_id',
							'terms'    => $term->term_id,
						),
					),
				)
			);
			if ( ! empty( $posts[0] ) ) {
				$timestamp = strtotime( $posts[0]->post_modified_gmt . ' GMT' );
			}
		}
	} elseif ( is_post_type_archive() ) {
		$post_type = get_query_var( 'post_type' );
		if ( is_array( $post_type ) ) {
			$post_type = reset( $post_type );
		}
		if ( $post_type ) {
			$modified = get_lastpostmodified( 'GMT', $post_type );
			if ( $modified ) {
				$timestamp = strtotime( $modified . ' GMT' );
			}
		}
	}

	if ( ! $timestamp ) {
		$modified = get_lastpostmodified( 'GMT' );
		if ( $modified ) {
			$timestamp = strtotime( $modified . ' GMT' );
		}
	}

	return max( 0, (int) $timestamp );
}

/**
 * Add Last-Modified via WordPress header API (before headers are sent).
 *
 * @param string[] $headers Response headers.
 * @param WP       $wp      WordPress environment.
 * @return string[]
 */
function ag_filter_last_modified_wp_headers( $headers, $wp ) {
	unset( $wp );

	if ( ! ag_should_send_last_modified() ) {
		ag_lm_debug_log( 'wp_headers_skip', array( 'reason' => 'should_false' ) );
		return $headers;
	}

	$last_modified = ag_get_page_last_modified_timestamp();
	if ( ! $last_modified ) {
		ag_lm_debug_log(
			'wp_headers_skip',
			array(
				'reason'      => 'no_ts',
				'front'       => is_front_page(),
				'singular'    => is_singular(),
				'page_on_front' => (int) get_option( 'page_on_front' ),
			)
		);
		return $headers;
	}

	$if_modified_since = 0;
	if ( ! empty( $_SERVER['HTTP_IF_MODIFIED_SINCE'] ) ) {
		$if_modified_since = strtotime( substr( sanitize_text_field( wp_unslash( $_SERVER['HTTP_IF_MODIFIED_SINCE'] ) ), 5 ) );
	}

	if ( $if_modified_since && $if_modified_since >= $last_modified ) {
		status_header( 304 );
		$headers['Last-Modified'] = gmdate( 'D, d M Y H:i:s', $last_modified ) . ' GMT';
		ag_lm_debug_log( 'wp_headers_304', array( 'ts' => $last_modified, 'ims' => $if_modified_since ) );
		ag_lm_debug_header( 'wp_304 ts=' . $last_modified );

		add_action(
			'send_headers',
			static function () {
				exit;
			},
			9999
		);

		return $headers;
	}

	$headers['Last-Modified'] = gmdate( 'D, d M Y H:i:s', $last_modified ) . ' GMT';
	ag_lm_debug_log( 'wp_headers_lm', array( 'ts' => $last_modified ) );
	ag_lm_debug_header( 'wp_lm ts=' . $last_modified );

	if ( ! headers_sent() ) {
		header( 'Last-Modified: ' . $headers['Last-Modified'] );
	}

	return $headers;
}
add_filter( 'wp_headers', 'ag_filter_last_modified_wp_headers', 20, 2 );

/**
 * One-time supercache flush after Last-Modified logic changes.
 */
function ag_maybe_flush_supercache_for_last_modified() {
	$version = 5;

	if ( (int) get_option( 'ag_last_modified_cache_version', 0 ) >= $version ) {
		return;
	}

	if ( function_exists( 'wp_cache_clear_cache' ) ) {
		wp_cache_clear_cache();
	}

	update_option( 'ag_last_modified_cache_version', $version, false );
}
add_action( 'init', 'ag_maybe_flush_supercache_for_last_modified', 1 );

/**
 * Write unix timestamp sidecar for supercache (read in phase1 on cache hit).
 *
 * @param int $timestamp Unix timestamp.
 */
function ag_write_last_modified_sidecar( $timestamp ) {
	if ( ! $timestamp || ! function_exists( 'get_current_url_supercache_dir' ) || ! function_exists( 'supercache_filename' ) ) {
		return;
	}

	$dir = get_current_url_supercache_dir();
	if ( ! $dir || ! is_dir( $dir ) ) {
		return;
	}

	$file = $dir . supercache_filename();
	file_put_contents( $file . '.lm', (string) (int) $timestamp );
}

/**
 * Schedule sidecar write after supercache file is created.
 *
 * @param int $timestamp Unix timestamp.
 */
function ag_schedule_last_modified_sidecar( $timestamp ) {
	static $scheduled_timestamp = 0;

	$timestamp = (int) $timestamp;
	if ( ! $timestamp || $scheduled_timestamp === $timestamp ) {
		return;
	}

	$scheduled_timestamp = $timestamp;

	add_action(
		'shutdown',
		static function () use ( $timestamp ) {
			ag_write_last_modified_sidecar( $timestamp );
		},
		0
	);
}

/**
 * HTML marker embedded in supercache for Last-Modified on cache hits.
 *
 * @param int $timestamp Unix timestamp.
 * @return string
 */
function ag_get_last_modified_marker( $timestamp ) {
	return '<!-- ag-lm:' . (int) $timestamp . ' -->';
}

/**
 * Embed Last-Modified marker before cache write (WP Super Cache).
 *
 * @param string $buffer Page HTML.
 * @return string
 */
function ag_embed_last_modified_marker( $buffer ) {
	if ( ! ag_should_send_last_modified() ) {
		ag_lm_debug_log( 'embed_skip', array( 'reason' => 'should_false' ) );
		return $buffer;
	}

	$pos = strripos( $buffer, '</html>' );
	if ( false === $pos ) {
		ag_lm_debug_log( 'embed_skip', array( 'reason' => 'no_html_close' ) );
		return $buffer;
	}

	if ( strpos( $buffer, '<!-- ag-lm:' ) !== false ) {
		ag_lm_debug_log( 'embed_skip', array( 'reason' => 'marker_exists' ) );
		return $buffer;
	}

	$timestamp = ag_get_page_last_modified_timestamp();
	if ( ! $timestamp ) {
		ag_lm_debug_log( 'embed_skip', array( 'reason' => 'no_ts' ) );
		return $buffer;
	}

	ag_schedule_last_modified_sidecar( $timestamp );
	ag_lm_debug_log( 'embed_ok', array( 'ts' => $timestamp ) );

	return substr_replace( $buffer, ag_get_last_modified_marker( $timestamp ), $pos, 0 );
}
add_filter( 'wp_cache_ob_callback_filter', 'ag_embed_last_modified_marker' );
