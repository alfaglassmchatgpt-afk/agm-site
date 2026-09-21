<?php
/**
 * WP Super Cache plugin: Last-Modified on cache hits (phase1, before WordPress).
 *
 * @package Alfa-glass
 */

if ( defined( 'AG_WPSC_LAST_MODIFIED_LOADED' ) ) {
	return;
}

define( 'AG_WPSC_LAST_MODIFIED_LOADED', true );

$ag_lm_debug = __DIR__ . '/ag-lm-debug.php';
if ( is_readable( $ag_lm_debug ) ) {
	require_once $ag_lm_debug;
}

ag_lm_debug_log(
	'wpsc_loaded',
	array(
		'file' => __FILE__,
	)
);

/**
 * 301 from ?PageSpeed=off to clean URL (SEO; former bypass polluted Yandex index).
 */
function ag_wpsc_pagespeed_strip_redirect() {
	if ( function_exists( 'ag_lm_redirect_strip_pagespeed_if_needed' ) ) {
		ag_lm_redirect_strip_pagespeed_if_needed();
	}
}
add_cacheaction( 'cache_init', 'ag_wpsc_pagespeed_strip_redirect' );

/**
 * Parse If-Modified-Since without WordPress.
 *
 * @return int Unix timestamp or 0.
 */
function ag_wpsc_get_if_modified_since() {
	if ( empty( $_SERVER['HTTP_IF_MODIFIED_SINCE'] ) ) {
		return 0;
	}

	return (int) strtotime( substr( $_SERVER['HTTP_IF_MODIFIED_SINCE'], 5 ) );
}

/**
 * Read Last-Modified timestamp from sidecar or HTML marker.
 *
 * @param string $cache_file Supercache file path.
 * @return int
 */
function ag_wpsc_read_lm_from_cache_file( $cache_file ) {
	$lm_file = $cache_file . '.lm';

	if ( is_readable( $lm_file ) ) {
		return (int) trim( (string) file_get_contents( $lm_file ) );
	}

	if ( ! is_readable( $cache_file ) ) {
		return 0;
	}

	$size = filesize( $cache_file );
	if ( ! $size ) {
		return 0;
	}

	$chunk = (string) file_get_contents( $cache_file, false, null, max( 0, $size - 2048 ) );
	if ( preg_match( '/<!-- ag-lm:(\d+) -->/', $chunk, $matches ) ) {
		return (int) $matches[1];
	}

	return 0;
}

/**
 * Send Last-Modified and optionally exit with 304.
 *
 * @param int $last_modified Unix timestamp.
 */
function ag_wpsc_emit_last_modified_headers( $last_modified ) {
	static $sent = false;

	$last_modified = (int) $last_modified;
	if ( ! $last_modified || $sent ) {
		ag_lm_debug_log(
			'wpsc_emit_skip',
			array(
				'ts'   => $last_modified,
				'sent' => $sent,
			)
		);
		return;
	}

	$sent = true;

	$if_modified_since = ag_wpsc_get_if_modified_since();

	if ( $if_modified_since && $if_modified_since >= $last_modified ) {
		$protocol = ! empty( $_SERVER['SERVER_PROTOCOL'] ) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.1';
		ag_lm_debug_log( 'wpsc_emit_304', array( 'ts' => $last_modified, 'ims' => $if_modified_since ) );
		ag_lm_debug_header( 'wpsc_304 ts=' . $last_modified );
		header( $protocol . ' 304 Not Modified' );
		header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s', $last_modified ) . ' GMT' );
		exit;
	}

	ag_lm_debug_log( 'wpsc_emit_lm', array( 'ts' => $last_modified ) );
	ag_lm_debug_header( 'wpsc_lm ts=' . $last_modified );
	header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s', $last_modified ) . ' GMT' );
}

/**
 * Whether phase1 is about to serve an existing supercache file.
 *
 * @return bool
 */
function ag_wpsc_will_serve_supercache() {
	global $cache_enabled, $wpsc_save_headers, $cache_max_time;

	if ( empty( $cache_enabled ) ) {
		return false;
	}

	if ( function_exists( 'wpsc_is_get_query' ) && wpsc_is_get_query() ) {
		return false;
	}

	if ( function_exists( 'wp_cache_get_cookies_values' ) && '' !== wp_cache_get_cookies_values() ) {
		return false;
	}

	if ( isset( $wpsc_save_headers ) && $wpsc_save_headers ) {
		return false;
	}

	if ( ! function_exists( 'get_current_url_supercache_dir' ) || ! function_exists( 'supercache_filename' ) ) {
		return false;
	}

	$file = get_current_url_supercache_dir() . supercache_filename();
	if ( ! is_readable( $file ) ) {
		return false;
	}

	if ( ! empty( $cache_max_time ) && ( filemtime( $file ) + (int) $cache_max_time ) < time() ) {
		return false;
	}

	return true;
}

/**
 * Send Last-Modified before supercache body on cache hit (mfunc static path included).
 */
function ag_wpsc_cache_init_last_modified() {
	if ( ! ag_lm_is_head_or_get_request() ) {
		ag_lm_debug_log( 'cache_init_skip', array( 'reason' => 'not_get_or_head', 'method' => $_SERVER['REQUEST_METHOD'] ?? '-' ) );
		return;
	}

	if ( ! ag_wpsc_will_serve_supercache() ) {
		ag_lm_debug_log( 'cache_init_skip', array( 'reason' => 'no_supercache_serve' ) );
		return;
	}

	$file = get_current_url_supercache_dir() . supercache_filename();
	$last_modified = ag_wpsc_read_lm_from_cache_file( $file );
	if ( ! $last_modified ) {
		ag_lm_debug_log(
			'cache_init_skip',
			array(
				'reason' => 'no_ts',
				'file'   => $file,
				'lm'     => is_readable( $file . '.lm' ),
			)
		);
		return;
	}

	ag_lm_debug_log( 'cache_init_emit', array( 'ts' => $last_modified, 'file' => $file ) );
	ag_wpsc_emit_last_modified_headers( $last_modified );
}
add_cacheaction( 'cache_init', 'ag_wpsc_cache_init_last_modified' );

/**
 * Send Last-Modified / 304 and strip marker from cached HTML.
 *
 * @param string $cachedata Cached page HTML.
 * @return string
 */
function ag_wpsc_send_last_modified_from_marker( $cachedata ) {
	if ( ! is_string( $cachedata ) || '' === $cachedata ) {
		return $cachedata;
	}

	$last_modified = 0;
	if ( preg_match( '/<!-- ag-lm:(\d+) -->/', $cachedata, $matches ) ) {
		$last_modified = (int) $matches[1];
	} elseif ( function_exists( 'get_current_url_supercache_dir' ) && function_exists( 'supercache_filename' ) ) {
		$file = get_current_url_supercache_dir() . supercache_filename();
		$last_modified = ag_wpsc_read_lm_from_cache_file( $file );
	}

	if ( ! $last_modified ) {
		ag_lm_debug_log( 'wpsc_cachedata_skip', array( 'reason' => 'no_ts' ) );
		return $cachedata;
	}

	ag_lm_debug_log( 'wpsc_cachedata_emit', array( 'ts' => $last_modified ) );
	ag_wpsc_emit_last_modified_headers( $last_modified );

	if ( preg_match( '/<!-- ag-lm:\d+ -->/', $cachedata ) ) {
		$cachedata = preg_replace( '/<!-- ag-lm:\d+ -->/', '', $cachedata, 1 );
	}

	return $cachedata;
}
add_cacheaction( 'wpsc_cachedata', 'ag_wpsc_send_last_modified_from_marker' );
