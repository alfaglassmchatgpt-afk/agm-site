<?php
/** Standalone layout assets only on the redesigned front page. */
defined('ABSPATH') || exit;
require_once __DIR__ . '/agm-requests.php';
function agm_redesign_front_assets() {
    if (!(is_front_page() || is_page('kompleksnye-postavki') || is_page_template('page-agm-led.php') || is_page_template('page-agm-architects.php') || is_page_template('page-agm-furniture.php') || is_page_template('page-agm-private.php') || is_page_template('page-agm-processing.php') || is_page_template('page-agm-glass.php') || is_page_template('page-agm-production.php') || is_page_template('page-agm-designers.php') || is_page_template('page-agm-catalog.php') || is_page_template('page-agm-mirror.php') || is_page_template('page-agm-tinted.php')) || is_admin()) { return; }
    foreach (wp_styles()->queue as $handle) {
        if (!in_array($handle, ['admin-bar', 'dashicons', 'agm-company', 'sm_theme_style', 'sm_style'], true)) { wp_dequeue_style($handle); }
    }
    foreach (wp_scripts()->queue as $handle) {
        if (!in_array($handle, ['admin-bar', 'sm_script'], true)) { wp_dequeue_script($handle); }
    }
}
add_action('wp_enqueue_scripts', 'agm_redesign_front_assets', PHP_INT_MAX);
add_action('wp_print_styles', 'agm_redesign_front_assets', PHP_INT_MAX);
add_action('wp_print_scripts', 'agm_redesign_front_assets', PHP_INT_MAX);
add_action('wp_footer', 'agm_redesign_front_assets', 0);
add_action('wp_head', function () {
    if ((is_front_page() || is_page('kompleksnye-postavki') || is_page_template('page-agm-led.php') || is_page_template('page-agm-architects.php') || is_page_template('page-agm-furniture.php') || is_page_template('page-agm-private.php') || is_page_template('page-agm-processing.php') || is_page_template('page-agm-glass.php') || is_page_template('page-agm-production.php') || is_page_template('page-agm-designers.php') || is_page_template('page-agm-catalog.php') || is_page_template('page-agm-mirror.php') || is_page_template('page-agm-tinted.php')) && is_admin_bar_showing()) {
        echo '<style id="agm-admin-toolbar-offset">:root{--top:32px}@media(max-width:782px){:root{--top:46px}}.site-header,.header{top:32px}@media(max-width:782px){.site-header,.header{top:46px}}@media(max-width:600px){#wpadminbar{position:fixed}}</style>';
    }
}, 99);
/* Keep consent controls native even when a browser retains the older shared stylesheet. */
add_action('wp_head', function () {
    if (is_admin()) { return; }
    echo '<style id="agm-consent-controls">.sm-setting-item input[type="checkbox"],.sm-setting-item input[type="radio"]{width:auto;min-width:0;min-height:0;padding:0}</style>';
}, 100);
add_filter('pre_get_document_title', function ($title) {
    if (is_page_template('page-agm-production.php')) { return 'Наше производство — ALFAGLASS'; }
    if (is_page_template('page-agm-private.php')) { return 'Частным клиентам — ALFAGLASS'; }
    if (is_page_template('page-agm-furniture.php')) { return 'Мебельным и дверным компаниям — ALFAGLASS'; }
    if (is_page_template('page-agm-architects.php')) { return 'Архитекторам и строительным компаниям — ALFAGLASS'; }
    if (is_page_template('page-agm-designers.php')) { return 'Дизайнерам и дизайн-студиям — ALFAGLASS'; }
    if (is_page_template('page-agm-tinted.php')) { return 'Тонированные зеркала — ALFAGLASS'; }
    if (is_page_template('page-agm-catalog.php')) { return 'Материалы — ALFAGLASS'; }
    if (is_page_template('page-agm-mirror.php') || is_page_template('page-agm-tinted.php')) { return 'Зеркало серебро 4 и 6 мм — ALFAGLASS'; }
    if (is_page('kompleksnye-postavki')) { return 'Комплексные поставки зеркал от 100 изделий — ALFAGLASS'; }
    return is_front_page() ? 'Стекло и зеркала на заказ в Москве и МО — ALFAGLASS' : $title;
});

require_once get_template_directory() . '/inc/agm-company.php';

require_once get_template_directory() . '/inc/agm-navigation.php';


/** Consistent public office address across legacy and redesigned HTML templates. */
function agm_public_address_html($html) {
    $address = 'Московская область, г. Видное, Белокаменное ш. вл. 10/2';
    $space = '(?:\s|&nbsp;|<br\s*/?>)*';
    $prefix = '(?:(?:Московская область|М\.О\.),?' . $space . '(?:г\.?\s*Видное,?' . $space . ')?)?';
    $pattern = '~' . $prefix . 'Белокаменное\s+(?:шоссе|ш\.),?' . $space . '(?:владение|вл\.)\s*10/2~u';
    // Keep scripts (including SEO JSON-LD), styles and editable form values intact.
    $parts = preg_split('~(<script\b[^>]*>.*?</script\s*>|<style\b[^>]*>.*?</style\s*>|<textarea\b[^>]*>.*?</textarea\s*>)~is', $html, -1, PREG_SPLIT_DELIM_CAPTURE);
    foreach ($parts as $i => $part) {
        if ($i % 2 === 0) { $parts[$i] = preg_replace($pattern, $address, $part); }
    }
    return implode('', $parts);
}
add_action('template_redirect', function () {
    if (is_admin() || is_feed() || is_trackback() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST)) { return; }
    ob_start('agm_public_address_html');
}, 0);
