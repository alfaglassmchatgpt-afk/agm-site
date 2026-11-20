<?php
/** Plugin Name: AGM railing page standard layout */
defined('ABSPATH') || exit;
// The standalone editor does not use the old theme's Swiper/Lenis sections.
add_action('wp_enqueue_scripts', static function () {
    if (trim(wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/') !== 'lestnichnye-ograzhdeniya-iz-stekla') return;
    wp_dequeue_script('sliders');
    wp_dequeue_script('main-script');
}, 100);
add_action('template_redirect', static function () {
    if (is_admin() || is_feed() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    if (trim(wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/') !== 'lestnichnye-ograzhdeniya-iz-stekla') return;
    ob_start(static function ($html) {
        if (strpos($html, 'id="railing-project"') === false) return $html;
        $html = preg_replace('~(<body\b[^>]*class=")~', '$1agm-railing-standard ', $html, 1);
        $assets = '<style id="agm-railing-layout">'.file_get_contents(__DIR__.'/agm-railing-layout.css').'</style>';
        $assets .= '<script data-pagespeed-no-defer>'.file_get_contents(__DIR__.'/agm-railing-layout.js').'</script>';
        return str_replace('</body>', $assets.'</body>', $html);
    });
}, -90);
