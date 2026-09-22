<?php
/** Standalone layout assets only on the redesigned front page. */
defined('ABSPATH') || exit;
function agm_redesign_front_assets() {
    if (!(is_front_page() || is_page('kompleksnye-postavki') || is_page_template('page-agm-led.php') || is_page_template('page-agm-architects.php') || is_page_template('page-agm-furniture.php') || is_page_template('page-agm-private.php') || is_page_template('page-agm-processing.php') || is_page_template('page-agm-glass.php') || is_page_template('page-agm-production.php') || is_page_template('page-agm-designers.php') || is_page_template('page-agm-catalog.php') || is_page_template('page-agm-mirror.php') || is_page_template('page-agm-tinted.php')) || is_admin()) { return; }
    foreach (wp_styles()->queue as $handle) {
        if (!in_array($handle, ['admin-bar', 'dashicons', 'agm-company'], true)) { wp_dequeue_style($handle); }
    }
    foreach (wp_scripts()->queue as $handle) {
        if ($handle !== 'admin-bar') { wp_dequeue_script($handle); }
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
