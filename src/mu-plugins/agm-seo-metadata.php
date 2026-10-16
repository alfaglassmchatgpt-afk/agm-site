<?php
/** Plugin Name: ALFAGLASS public page search metadata */
defined('ABSPATH') || exit;

function agm_public_search_metadata() {
    if (is_admin()) { return null; }
    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/', PHP_URL_PATH);
    $pages = [
        '/' => ['Стекло и зеркала на заказ в Москве и области — ALFAGLASS', 'Изготовление изделий из стекла и зеркал по вашим размерам. Подбор материала, обработка, замер, доставка и монтаж в Москве и области. ALFAGLASS — с 2003 года.'],
        '/materialy/' => ['Стекло и зеркала: каталог материалов — ALFAGLASS', 'Каталог стекла и зеркал ALFAGLASS: прозрачное, матовое, рифлёное, узорчатое и окрашенное стекло, тонированные и состаренные зеркала. Характеристики и применение.'],
        '/blog/' => ['Блог о стекле и зеркалах: материалы и применение — ALFAGLASS', 'Статьи ALFAGLASS о стекле и зеркалах: выбор материалов, обработка, свойства и идеи применения в интерьере.'],
        '/service/' => ['Замер, доставка и монтаж стекла и зеркал — ALFAGLASS', 'Замер своими специалистами, доставка специальным транспортом и монтаж изделий ALFAGLASS в Москве и области. Гарантия на услуги монтажа — 1 год.'],
    ];
    return isset($pages[$path]) ? $pages[$path] : null;
}
add_filter('wpseo_title', function ($title) {
    $meta = agm_public_search_metadata();
    return $meta ? $meta[0] : $title;
}, 20);
add_filter('wpseo_metadesc', function ($description) {
    $meta = agm_public_search_metadata();
    // Home and catalogue templates already supply their own description.
    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/', PHP_URL_PATH);
    return $meta && in_array($path, ['/blog/', '/service/'], true) ? $meta[1] : $description;
}, 20);
