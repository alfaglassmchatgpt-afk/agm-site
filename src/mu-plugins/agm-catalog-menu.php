<?php
/** Plugin Name: AGM grouped product catalogue menu */
defined('ABSPATH') || exit;
function agm_catalog_menu_groups() {
    return [
        'Зеркала и декор' => [
            'izdeliya/zerkala-na-zakaz' => 'Зеркала на заказ',
            'zerkala-s-podsvetkoj' => 'Зеркала с подсветкой',
            'aluminium/zerkala' => 'Зеркала в раме',
            'izdeliya/zerkalnaya-plitka' => 'Зеркальная плитка',
            'izdeliya/zerkalnye-panno' => 'Зеркальные панно',
            'smart-mirror' => 'Smart Mirror',
        ],
        'Изделия из стекла' => [
            'izdeliya/steklyannye-polki' => 'Стеклянные полки',
            'dushevye-peregorodki-iz-stekla' => 'Душевые кабины и перегородки',
            'dveri-iz-stekla' => 'Стеклянные двери',
            'aluminium/peregorodki' => 'Стеклянные перегородки',
            'lestnichnye-ograzhdeniya-iz-stekla' => 'Лестничные ограждения',
        ],
        'Мебель и отделка' => [
            'aluminium/fasady' => 'Алюминиевые фасады',
            'stenovye-paneli-iz-stekla' => 'Стеновые панели',
            'izdeliya/kuhonnye-fartuki' => 'Кухонные фартуки',
        ],
    ];
}

function agm_catalog_menu_links() {
    $html = '';
    foreach (agm_catalog_menu_groups() as $title => $items) {
        $links = '';
        foreach ($items as $path => $label) {
            $page = get_page_by_path($path);
            if (!$page || $page->post_status !== 'publish') continue;
            $links .= '<a href="'.esc_url(get_permalink($page)).'">'.esc_html($label).'</a>';
        }
        if ($links) $html .= '<section class="agm-catalog-group"><h2>'.esc_html($title).'</h2>'.$links.'</section>';
    }
    return $html.'<a class="nav-view-all" href="'.esc_url(home_url('/#products')).'">Все изделия →</a>';
}
function agm_catalog_menu_html($html) {
    if (strpos($html, '</head>') === false || strpos($html, '-products"') === false) return $html;
    $links = agm_catalog_menu_links();
    $html = preg_replace_callback('~<header\b[^>]*>.*?</header>~s', static function ($header) use ($links) {
        $h = preg_replace_callback('~(<div class="(?:agm-)?nav-panel" id="(?:agm-)?(?:desktop|mobile)-products"[^>]*>).*?(</div>)~s', static function ($m) use ($links) { return $m[1].$links.$m[2]; }, $header[0]);
        $h = preg_replace('~(<div class="(?:agm-)?nav-parent"><a[^>]*>)Изделия(</a>)~u', '$1Каталог изделий$2', $h);
        return str_replace('Раздел Изделия: показать список', 'Раздел Каталог изделий: показать список', $h);
    }, $html);
    $html = str_replace('</head>', '<style id="agm-catalog-menu-style">'.file_get_contents(__DIR__.'/agm-catalog-menu.css').'</style></head>', $html);
    return str_replace('</body>', '<script data-pagespeed-no-defer data-pagespeed-no-transform>'.file_get_contents(__DIR__.'/agm-catalog-menu.js').'</script></body>', $html);
}
// Transform after the common-header module and page-specific output filters.
add_action('template_redirect', static function () {
    if (is_admin() || is_feed() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    ob_start('agm_catalog_menu_html');
}, -110);
