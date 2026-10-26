<?php
/** Plugin Name: ALFAGLASS public page search metadata */
defined('ABSPATH') || exit;

function agm_public_search_metadata() {
    if (is_admin()) { return null; }
    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/', PHP_URL_PATH);
    $pages = [
        '/aluminium/' => ['Изделия в алюминиевом профиле на заказ — ALFAGLASS', 'Фасады со стеклом, межкомнатные перегородки и зеркала в алюминиевых рамах по вашим размерам. Подбор профиля, заполнения и цвета. Москва и область.'],
        '/aluminium/fasady/' => ['Алюминиевые фасады со стеклом на заказ в Москве — ALFAGLASS', 'Рамочные фасады для кухни, шкафов и витрин. Профили MODUS MZ, MF-20 и MF-30, выбор стекла, ручек и петель. Подготовьте проект для расчёта.'],
        '/aluminium/peregorodki/' => ['Раздвижные стеклянные перегородки MODUS на заказ — ALFAGLASS', 'Межкомнатные перегородки в алюминиевом профиле MODUS Т-911 с синхронным открыванием 2+2. Укажите размеры проёма, выберите стекло и цвет профиля.'],
        '/aluminium/zerkala/' => ['Зеркала в алюминиевой раме на заказ в Москве — ALFAGLASS', 'Круглые, овальные, фигурные и прямоугольные зеркала в алюминиевых рамах. Ваши размеры, цвет и ширина профиля, подсветка. Заявка на изготовление.'],
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
    return $meta && (in_array($path, ['/blog/', '/service/'], true) || strpos($path, '/aluminium/') === 0) ? $meta[1] : $description;
}, 20);
