<?php
/** Plugin Name: AGM private product preparation */
defined('ABSPATH') || exit;
add_action('init', function () {
    $path = wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $paths = ['/izdeliya/', '/izdeliya/steklyannye-dveri/', '/izdeliya/steklyannye-ograzhdeniya/'];
    if (!in_array(trailingslashit($path), $paths, true)) return;
    nocache_headers();
    header('X-Robots-Tag: noindex, nofollow', true);
    if (!current_user_can('edit_pages')) {
        wp_safe_redirect(wp_login_url(home_url($path)), 302, 'AGM private product preparation');
        exit;
    }
}, 1);
