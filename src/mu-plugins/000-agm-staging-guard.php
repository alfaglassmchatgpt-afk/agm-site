<?php
/** Plugin Name: AGM Staging Guard (never deploy to production) */
if (!defined('AGM_STAGING') || !AGM_STAGING) { return; }
unset($_SERVER['HTTP_IF_MODIFIED_SINCE'], $_SERVER['HTTP_IF_NONE_MATCH']);
// Replace only a curated map of static presentation dependencies, not external services.
if (PHP_SAPI !== 'cli') {
    $agm_map_path = WP_CONTENT_DIR . '/agm-vendor/mapping.json';
    $agm_map = is_readable($agm_map_path) ? json_decode(file_get_contents($agm_map_path), true) : [];
    if (is_array($agm_map) && $agm_map) {
        $agm_replacements = [];
        foreach ($agm_map as $remote => $local) {
            $agm_replacements[$remote] = $local;
            $agm_replacements[htmlspecialchars($remote, ENT_QUOTES, 'UTF-8')] = $local;
            $agm_replacements[str_replace('&', '&#038;', $remote)] = $local;
        }
        ob_start(function ($body) use ($agm_replacements) { return strtr($body, $agm_replacements); });
    }
}
add_filter('pre_http_request', function () { return new WP_Error('agm_blocked', 'External HTTP is disabled on staging.'); }, PHP_INT_MAX);
add_filter('pre_wp_mail', '__return_false', PHP_INT_MAX);
add_filter('wpcf7_skip_mail', '__return_true', PHP_INT_MAX);
add_filter('pre_option_blog_public', function () { return '0'; });
add_filter('automatic_updater_disabled', '__return_true');
add_filter('wp_robots', function ($r) { $r['noindex'] = true; $r['nofollow'] = true; return $r; });
add_action('init', function () {
    if (defined('DOING_CRON') && DOING_CRON) { exit('Cron disabled on staging'); }
    if (PHP_SAPI !== 'cli' && ($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET' && ($_SERVER['REQUEST_METHOD'] ?? '') !== 'HEAD') {
        // Native WordPress authentication, capabilities and nonces still apply.
        global $pagenow;
        if ($pagenow === 'wp-login.php' && ($_REQUEST['action'] ?? 'login') === 'login') { return; }
        // REST cookie authentication runs later; gate writes in rest_pre_dispatch below.
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
        if (isset($_GET['rest_route']) || strpos($path ?: '', '/wp-json/') === 0) { return; }
        if (is_admin() && is_user_logged_in() && current_user_can('edit_posts')) { return; }
        status_header(403); exit('Public form submissions are disabled on staging.');
    }
}, -9999);
add_filter('rest_pre_dispatch', function ($result, $server, $request) {
    if (in_array($request->get_method(), ['GET', 'HEAD', 'OPTIONS'], true)) { return $result; }
    $route = $request->get_route();
    $editor_route = strpos($route, '/wp/v2/') === 0 || strpos($route, '/elementor/v1/') === 0;
    if (!$editor_route || !is_user_logged_in() || !current_user_can('edit_posts')) {
        return new WP_Error('agm_write_blocked', 'Only authenticated editor REST writes are enabled on staging.', ['status' => 403]);
    }
    return $result;
}, PHP_INT_MAX, 3);
