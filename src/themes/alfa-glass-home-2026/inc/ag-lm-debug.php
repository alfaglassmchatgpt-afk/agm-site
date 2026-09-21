<?php
/**
 * Last-Modified debug logging (works in phase1 and WordPress).
 *
 * Enable: ?ag_lm_debug=alfaglass on URL, or define( 'AG_LM_DEBUG', true ) in wp-config.php
 *
 * @package Alfa-glass
 */

/**
 * @return bool
 */
function ag_lm_debug_enabled() {
	if ( defined( 'AG_LM_DEBUG' ) && AG_LM_DEBUG ) {
		return true;
	}

	if ( empty( $_GET['ag_lm_debug'] ) ) {
		return false;
	}

	return 'alfaglass' === (string) $_GET['ag_lm_debug'];
}

/**
 * @return bool
 */
function ag_lm_is_head_or_get_request() {
	if ( empty( $_SERVER['REQUEST_METHOD'] ) ) {
		return false;
	}

	$method = strtoupper( (string) $_SERVER['REQUEST_METHOD'] );

	return in_array( $method, array( 'GET', 'HEAD' ), true );
}

/**
 * @param string $uri Request URI or query string.
 * @return bool
 */
function ag_lm_uri_has_pagespeed_off( $uri ) {
	return (bool) preg_match( '/(?:^|[?&])PageSpeed=off(?:&|$)/i', (string) $uri );
}

/**
 * True if the original request had PageSpeed=off.
 *
 * WPSC with $wpsc_ignore_tracking_parameters strips PageSpeed from REQUEST_URI
 * and $_GET when it is the only query arg — QUERY_STRING still has it.
 *
 * @return bool
 */
function ag_lm_request_has_pagespeed_off() {
	if ( isset( $_GET['PageSpeed'] ) && 'off' === strtolower( (string) $_GET['PageSpeed'] ) ) {
		return true;
	}

	if ( ag_lm_uri_has_pagespeed_off( $_SERVER['REQUEST_URI'] ?? '' ) ) {
		return true;
	}

	// QUERY_STRING has no leading "?".
	$qs = (string) ( $_SERVER['QUERY_STRING'] ?? '' );
	return (bool) preg_match( '/(?:^|&)PageSpeed=off(?:&|$)/i', $qs );
}

/**
 * Whether GET/HEAD has ?PageSpeed=off and should 301 to a clean URL.
 *
 * @return bool
 */
function ag_lm_pagespeed_strip_redirect_allowed() {
	if ( ! ag_lm_is_head_or_get_request() ) {
		return false;
	}

	return ag_lm_request_has_pagespeed_off();
}

/**
 * Current path + query without PageSpeed parameter.
 *
 * @return string
 */
function ag_lm_build_url_without_pagespeed() {
	$uri    = $_SERVER['REQUEST_URI'] ?? '/';
	$parsed = parse_url( $uri );
	$path   = $parsed['path'] ?? '/';
	$query  = array();

	if ( ! empty( $parsed['query'] ) ) {
		parse_str( $parsed['query'], $query );
	} elseif ( ! empty( $_SERVER['QUERY_STRING'] ) ) {
		// WPSC may have stripped query from REQUEST_URI but left QUERY_STRING.
		parse_str( (string) $_SERVER['QUERY_STRING'], $query );
	}

	foreach ( array_keys( $query ) as $key ) {
		if ( 0 === strcasecmp( (string) $key, 'PageSpeed' ) ) {
			unset( $query[ $key ] );
		}
	}

	$qs = http_build_query( $query );

	return $path . ( $qs ? '?' . $qs : '' );
}

/**
 * @return int
 */
function ag_lm_try_get_supercache_timestamp() {
	if ( ! function_exists( 'get_current_url_supercache_dir' ) || ! function_exists( 'supercache_filename' ) ) {
		return 0;
	}

	$file = get_current_url_supercache_dir() . supercache_filename();
	if ( function_exists( 'ag_wpsc_read_lm_from_cache_file' ) ) {
		return (int) ag_wpsc_read_lm_from_cache_file( $file );
	}

	$lm_file = $file . '.lm';
	if ( is_readable( $lm_file ) ) {
		return (int) trim( (string) file_get_contents( $lm_file ) );
	}

	return 0;
}

/**
 * Send 301 from ?PageSpeed=off to the clean URL (SEO: drop param from index).
 */
function ag_lm_send_pagespeed_strip_redirect() {
	$path = parse_url( $_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH ) ?: '/';
	if ( preg_match( '#/(wp-admin|wp-login\.php)#', $path ) ) {
		return;
	}
	if ( preg_match( '/\.(css|js|jpe?g|png|gif|webp|svg|ico|woff2?|ttf|otf|eot|xml|pdf)$/i', $path ) ) {
		return;
	}

	if ( ! ag_lm_request_has_pagespeed_off() ) {
		return;
	}

	$url = ag_lm_build_url_without_pagespeed();

	ag_lm_debug_log(
		'pagespeed_strip_redirect',
		array(
			'to' => $url,
		)
	);

	if ( headers_sent() ) {
		return;
	}

	header( 'X-AG-LM-Strip-PageSpeed: 1' );
	header( 'Location: ' . $url, true, 301 );
	exit;
}

/**
 * 301 away from ?PageSpeed=off so crawlers index clean URLs.
 */
function ag_lm_redirect_strip_pagespeed_if_needed() {
	if ( ! ag_lm_pagespeed_strip_redirect_allowed() ) {
		return;
	}

	ag_lm_send_pagespeed_strip_redirect();
}

/**
 * @return string
 */
function ag_lm_debug_log_path() {
	if ( defined( 'WPCACHECONFIGPATH' ) ) {
		return WPCACHECONFIGPATH . '/ag-last-modified.log';
	}

	if ( defined( 'WP_CONTENT_DIR' ) ) {
		return WP_CONTENT_DIR . '/ag-last-modified.log';
	}

	return sys_get_temp_dir() . '/ag-last-modified.log';
}

/**
 * @param string               $event Event name.
 * @param array<string, mixed> $data  Context.
 */
function ag_lm_debug_log( $event, $data = array() ) {
	if ( ! ag_lm_debug_enabled() ) {
		return;
	}

	$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '-';

	$line = gmdate( 'c' ) . ' [' . $event . '] uri=' . $uri;
	if ( ! empty( $data ) ) {
		$line .= ' ' . json_encode( $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
	}
	$line .= PHP_EOL;

	file_put_contents( ag_lm_debug_log_path(), $line, FILE_APPEND | LOCK_EX );
}

/**
 * @param string $message Debug message for response header.
 */
function ag_lm_debug_header( $message ) {
	if ( ! ag_lm_debug_enabled() || headers_sent() ) {
		return;
	}

	header( 'X-AG-LM-Debug: ' . substr( preg_replace( '/[^\x20-\x7E]/', '', $message ), 0, 240 ) );
}
