<?php
/**
 * 301 redirects per alfaglass.ru technical spec.
 *
 * @package Alfa-glass
 */

defined( 'ABSPATH' ) || exit;

/**
 * @return array<string, string> Request path => destination path.
 */
function ag_get_redirect_map() {
	$map = array(
		// Дубли главной.
		'/index.html'                              => '/',
		'/index.php'                               => '/',
		// Дубли product/catalog (ТЗ).
		'/product/izgotovlenie-zerkal-na-zakaz'    => '/product/zerkalo-na-zakaz/',
		'/product/izgotovlenie-zerkal-na-zakaz/'   => '/product/zerkalo-na-zakaz/',
		'/catalog/steklyannye-dveri'               => '/product/steklyannye-dveri/',
		'/catalog/steklyannye-dveri/'              => '/product/steklyannye-dveri/',
		// Удалённые страницы с трафиком → актуальные URL.
		'/product/mnogoslojnoe-steklo-tripleks'       => '/uslugi/tripleksovanie-stekla/',
		'/product/mnogoslojnoe-steklo-tripleks/'      => '/uslugi/tripleksovanie-stekla/',
		'/svetovyie-i-energeticheskie-harakteristiki'  => '/blog/',
		'/svetovyie-i-energeticheskie-harakteristiki/' => '/blog/',
		'/product/uzorchatoe-steklo'                   => '/catalog/uzorchatoe-steklo/',
		'/product/uzorchatoe-steklo/'                  => '/catalog/uzorchatoe-steklo/',
		'/about-agc'                                   => '/blog/',
		'/about-agc/'                                  => '/blog/',
		'/product/atlantic'                            => '/product/kathedralaqualite/',
		'/product/atlantic/'                           => '/product/kathedralaqualite/',
		'/ogneupornye-harakteristiki-stekla'           => '/blog/',
		'/ogneupornye-harakteristiki-stekla/'          => '/blog/',
		'/bezopasnost-i-zashhita'                      => '/warranty/',
		'/bezopasnost-i-zashhita/'                     => '/warranty/',
		'/uslugi/hudozhestvennoe-mollirovanie'         => '/uslugi/',
		'/uslugi/hudozhestvennoe-mollirovanie/'        => '/uslugi/',
        '/peskostrujnaya-obrabotka-dlya-chego-nuzhna/' => '/',
	);

	return apply_filters( 'ag_redirect_map', $map );
}

/**
 * Normalize request path for redirect lookup.
 *
 * @param string $uri Request URI.
 * @return string
 */
function ag_normalize_redirect_path( $uri ) {
	$path = wp_parse_url( $uri, PHP_URL_PATH );
	if ( null === $path || false === $path ) {
		return '/';
	}

	$path = urldecode( $path );
	$path = '/' . trim( $path, '/' );

	if ( '/' === $path || '' === trim( $path, '/' ) ) {
		return '/';
	}

	if ( preg_match( '/\.[a-z0-9]+$/i', $path ) ) {
		return $path;
	}

	return user_trailingslashit( $path );
}

/**
 * Run theme-level 301 redirects before template load.
 */
function ag_handle_redirects() {
	if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return;
	}

	$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
	$path        = ag_normalize_redirect_path( $request_uri );
	$map         = ag_get_redirect_map();
	$target      = null;

	foreach ( array_unique( array( $path, untrailingslashit( $path ), trailingslashit( untrailingslashit( $path ) ) ) ) as $candidate ) {
		if ( isset( $map[ $candidate ] ) ) {
			$target = $map[ $candidate ];
			break;
		}
	}

	if ( null === $target ) {
		return;
	}
	if ( ! str_starts_with( $target, 'http' ) ) {
		$target = home_url( $target );
	}

	$current = home_url( $path );
	if ( trailingslashit( $current ) === trailingslashit( $target ) ) {
		return;
	}

	wp_safe_redirect( $target, 301 );
	exit;
}
add_action( 'template_redirect', 'ag_handle_redirects', 1 );

/**
 * Register redirects in Redirection plugin when available (wp-admin only).
 */
function ag_sync_redirection_rules() {
	if ( ! is_admin() || ! class_exists( 'Red_Item' ) || ! class_exists( 'Red_Group' ) ) {
		return;
	}

	$groups = Red_Group::get_all();
	if ( empty( $groups ) ) {
		return;
	}

	$group_id   = (int) $groups[0]['id'];
	$option_key = 'ag_redirection_rules_synced';
	$synced     = get_option( $option_key, array() );
	$map        = ag_get_redirect_map();
	$changed    = false;

	foreach ( $map as $from => $to ) {
		$from_url = home_url( $from );
		$to_url   = str_starts_with( $to, 'http' ) ? $to : home_url( $to );
		$hash     = md5( $from_url . '->' . $to_url );

		if ( isset( $synced[ $hash ] ) ) {
			continue;
		}

		$existing = Red_Item::get_for_url( $from_url );
		if ( ! empty( $existing ) ) {
			$synced[ $hash ] = true;
			continue;
		}

		$result = Red_Item::create(
			array(
				'url'         => $from_url,
				'action_data' => array( 'url' => $to_url ),
				'action_type' => 'url',
				'action_code' => 301,
				'match_type'  => 'url',
				'group_id'    => $group_id,
				'title'       => 'TZ alfaglass.ru',
				'enabled'     => true,
			)
		);

		if ( is_wp_error( $result ) ) {
			continue;
		}

		$synced[ $hash ] = true;
		$changed         = true;
	}

	if ( $changed ) {
		update_option( $option_key, $synced, false );
	}
}

// Синхронизация с Redirection отключена: на части хостингов admin_init + Red_Item::create
// давала HTTP 500 в wp-admin. Редиректы работают через ag_handle_redirects() и nginx.
// add_action( 'admin_init', 'ag_sync_redirection_rules' );
