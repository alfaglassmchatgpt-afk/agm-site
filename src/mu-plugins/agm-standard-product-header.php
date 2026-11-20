<?php
/** Plugin Name: AGM standard product headers and direct product routes */
defined('ABSPATH') || exit;

function agm_standard_product_routes() {
    return [
        'product-partitions' => 'aluminium/peregorodki/',
        'product-railings' => 'lestnichnye-ograzhdeniya-iz-stekla/',
        'product-doors' => 'dveri-iz-stekla/',
        'product-shower' => 'dushevye-peregorodki-iz-stekla/',
        'product-facades' => 'aluminium/fasady/',
        'product-panels' => 'stenovye-paneli-iz-stekla/',
        'product-frame' => 'aluminium/zerkala/',
        'product-led' => 'zerkala-s-podsvetkoj/',
    ];
}

function agm_standard_direct_header($header) {
    $routes = agm_standard_product_routes();
    $header = preg_replace_callback('~<a\b[^>]*href="([^"]*)"[^>]*>.*?</a>~s', static function ($m) use ($routes) {
        $fragment = wp_parse_url(html_entity_decode($m[1], ENT_QUOTES, 'UTF-8'), PHP_URL_FRAGMENT);
        if (!isset($routes[$fragment ?? ''])) return $m[0];
        $link = str_replace('href="'.$m[1].'"', 'href="'.esc_url(home_url('/'.$routes[$fragment])).'"', $m[0]);
        return str_replace(' data-nav-product', '', $link);
    }, $header);
    // Keep the current dropdown design; only remove duplicate destinations.
    return preg_replace_callback('~(<div class="nav-panel" id="(?:desktop|mobile)-products"[^>]*>)(.*?)(</div>)~s', static function ($m) {
        $seen = [];
        $links = preg_replace_callback('~<a\b[^>]*href="([^"]+)"[^>]*>.*?</a>~s', static function ($link) use (&$seen) {
            if (isset($seen[$link[1]])) return '';
            $seen[$link[1]] = true;
            return $link[0];
        }, $m[2]);
        return $m[1].$links.$m[3];
    }, $header);
}

function agm_standard_header_markup($html) {
    $path = get_template_directory().'/agm-homepage/index.html';
    if (!is_readable($path) || !function_exists('agm_navigation_render')) return '';
    $source = file_get_contents($path);
    $home = agm_navigation_render($source);
    if (!preg_match('~<header class="site-header">.*?</header>~s', $home, $match)) return '';
    $header = agm_standard_direct_header($match[0]);
    // Resolve icon fragments locally, including pages with a <base> element.
    preg_match_all('~<symbol[^>]*id="([^"]+)"[^>]*viewBox="([^"]+)"[^>]*>(.*?)</symbol>~s', $source, $symbols, PREG_SET_ORDER);
    $icons = [];
    foreach ($symbols as $symbol) $icons[$symbol[1]] = '<svg width="100%" height="100%" viewBox="'.esc_attr($symbol[2]).'">'.$symbol[3].'</svg>';
    $header = preg_replace_callback('~<use[^>]*href="#([^"]+)"[^>]*(?:/>|></use>)~', static function ($m) use ($icons) { return $icons[$m[1]] ?? ''; }, $header);
    $header = strtr($header, ['__AGM_HOME__'=>esc_url(home_url('/')), '__AGM_ASSETS__'=>esc_url(get_template_directory_uri().'/agm-homepage')]);
    $header = preg_replace('~(<div class="header-location"><span>)(.*?)(</span>)~s', '$1<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13Z"/><circle cx="12" cy="8" r="2"/></svg> Московская область, г. Видное, Белокаменное ш. вл. 10/2$3', $header);
    $quote = strpos($html, 'quote-ui.js') !== false;
    $header = str_replace('href="#request"', $quote ? 'href="#request" data-open-quote' : 'href="'.esc_url(home_url('/#request')).'"', $header);
    if ($quote) $header = str_replace('Получить расчёт', 'Мой расчёт', $header);
    $header = preg_replace('~href="#(clients|products|about|contacts|top)"~', 'href="'.esc_url(home_url('/')).'#$1"', $header);
    $header = str_replace('href="'.esc_url(home_url('/#about')).'"', 'href="'.esc_url(home_url('/about/')).'"', $header);
    $al = '<a class="agm-aluminium-link" href="'.esc_url(home_url('/aluminium/')).'"><span>ALUM</span><span>INIUM</span></a>';
    if (strpos($header, 'agm-aluminium-link') === false) $header = preg_replace('~(<a[^>]+href="[^"]*/kompleksnye-postavki/"[^>]*>)~', $al.'$1', $header);
    // Distinct event selectors prevent older page scripts binding a second handler.
    $header = str_replace('class="site-header"', 'class="site-header agm-standard-header" data-agm-aluminium-link="existing"', $header);
    return strtr($header, ['nav-dropdown'=>'agm-nav-dropdown', 'nav-parent'=>'agm-nav-parent', 'nav-expand'=>'agm-nav-expand', 'nav-panel'=>'agm-nav-panel', 'menu-toggle'=>'agm-menu-toggle', 'mobile-nav'=>'agm-mobile-nav', 'desktop-materials'=>'agm-desktop-materials', 'desktop-products'=>'agm-desktop-products', 'mobile-materials'=>'agm-mobile-materials', 'mobile-products'=>'agm-mobile-products', 'search-toggle'=>'agm-search-toggle']);
}

function agm_standard_product_html($html, $replace) {
    if (stripos($html, '</head>') === false || strpos($html, '<header') === false) return $html;
    if ($replace) {
        $header = agm_standard_header_markup($html);
        if (!$header) return $html;
        $html = preg_replace_callback('~<header\b[^>]*>.*?</header>~s', static function () use ($header) { return $header; }, $html, 1);
        // These scripts only control the old header. All product editors remain intact.
        $html = preg_replace('~<script\b[^>]*src="[^"]*(?:shared-header|brand)\.js(?:\?[^"]*)?"[^>]*>\s*</script>~s', '', $html);
        $assets = '<style id="agm-standard-header-css">'.file_get_contents(__DIR__.'/agm-standard-product-header.css').'</style>';
        // Old standalone pages do not call wp_head; reuse the existing theme preference implementation.
        if (strpos($html, 'id="agm-system-theme"') === false && is_readable(__DIR__.'/agm-system-theme.js')) {
            $assets .= '<script id="agm-system-theme" data-pagespeed-no-defer>'.file_get_contents(__DIR__.'/agm-system-theme.js').'</script>';
        }
        $html = str_replace('</head>', $assets.'</head>', $html);
        $script = '<script data-pagespeed-no-defer data-pagespeed-no-transform>'.file_get_contents(__DIR__.'/agm-standard-product-header.js').'</script>';
        $html = str_replace('</body>', $script.'</body>', $html);
    }
    return preg_replace_callback('~<header\b[^>]*>.*?</header>~s', static function ($m) { return agm_standard_direct_header($m[0]); }, $html);
}

function agm_standard_facade_hero_link($html) {
    // Version the homepage slider after adding the mirror-tile slide.
    $html = preg_replace('~(agm-homepage/js/app\.js)(?:\?[^"\s]*)?~', '$1?v=20261120-mirror-tiles', $html);
    return preg_replace_callback('~<section\b[^>]*class="[^"]*\bhero\b[^"]*"[^>]*>.*?</section>~s', static function ($section) {
        $content = preg_replace_callback('~<a\b[^>]*href="#request"[^>]*>Получить расчёт\s*(.*?)</a>~s', static function ($a) {
            return '<a class="button" href="'.esc_url(get_template_directory_uri().'/agm-aluminium-configurator/index.html').'">3D конфигуратор фасадов '.$a[1].'</a>';
        }, $section[0], 1);
        $content = preg_replace('~<a\b[^>]*>Смотреть изделия</a>~u', '', $content);
        return $content.'<style id="agm-hero-compact-buttons">.hero-buttons{grid-template-columns:1fr;grid-auto-rows:auto}.hero-buttons .button{height:48px;min-height:48px;box-sizing:border-box}.hero-buttons .icon{flex-shrink:0}@media(max-width:700px){.hero-buttons .button{height:44px;min-height:44px}}</style>';
    }, $html, 1);
}

add_action('template_redirect', static function () {
    if (is_admin() || is_feed() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    $path = trim(wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
    $targets = ['kompleksnye-postavki','dveri-iz-stekla','dushevye-peregorodki-iz-stekla','lestnichnye-ograzhdeniya-iz-stekla','stenovye-paneli-iz-stekla','aluminium','aluminium/fasady','aluminium/peregorodki','aluminium/zerkala','izdeliya/steklyannye-polki','izdeliya/zerkala-na-zakaz','izdeliya/zerkalnaya-plitka'];
    $targets = array_merge($targets, ['smart-mirror','zerkala-s-podsvetkoj','izdeliya/zerkalnye-panno','contacts','about','service','izdeliya/kuhonnye-fartuki']);
    $replace = in_array($path, $targets, true) || $path === 'materialy' || strpos($path, 'materialy/') === 0 || $path === 'obrabotka-stekla-i-zerkal' || strpos($path, 'obrabotka-stekla-i-zerkal/') === 0;
    $front = is_front_page();
    ob_start(static function ($html) use ($replace, $front, $path) {
        $html = agm_standard_product_html($html, $replace);
        if ($replace) $html = preg_replace('~(agm-(?:glass|led)/app\.js)(?:\?[^"\s]*)?~', '$1?v=20261120-standard-header', $html);
        if ($path === 'kompleksnye-postavki') $html = preg_replace('~(agm-supply/js/app\.js)(?:\?[^"\s]*)?~', '$1?v=20261120-shared-menu', $html);
        $journals = ['izdeliya/steklyannye-polki'=>'Стеклянные полки', 'izdeliya/zerkala-na-zakaz'=>'Зеркала на заказ', 'izdeliya/zerkalnaya-plitka'=>'Зеркальная плитка'];
        if (isset($journals[$path])) {
            $nav = '<nav class="catalog-pages" aria-label="Страницы каталога">';
            foreach ($journals as $route => $label) $nav .= '<a href="'.esc_url(home_url('/'.$route.'/')).'"'.($route === $path ? ' aria-current="page"' : '').'>'.$label.'</a>';
            $nav .= '</nav>';
            $html = preg_replace('~<nav class="catalog-pages"[^>]*>.*?</nav>~s', $nav, $html, 1);
            if (strpos($html, 'class="catalog-breadcrumb"') === false) {
                $crumb = '<div class="catalog-breadcrumb"><a href="'.esc_url(home_url('/')).'">Главная</a><span>/</span>Изделия на заказ<span>/</span>'.$journals[$path].'</div>';
                $html = str_replace('<main id="top">', '<main id="top">'.$crumb, $html);
            }
            $html = str_replace('</head>', '<style id="agm-journal-layout">'.file_get_contents(__DIR__.'/agm-journal-layout.css').'</style></head>', $html);
        }
        if ($path === 'aluminium' && strpos($html, 'id="agm-al-home-back"') === false) {
            $back = '<nav id="agm-al-home-back" aria-label="Возврат на главную"><a href="'.esc_url(home_url('/')).'">← Назад на главную</a></nav>';
            $html = preg_replace('~</header>~', '</header>'.$back, $html, 1);
            $html = str_replace('</head>', '<style>#agm-al-home-back{width:calc(100% - 48px);max-width:1344px;margin:16px auto}#agm-al-home-back a{display:inline-flex;align-items:center;min-height:42px;padding:9px 16px;box-sizing:border-box;border:1px solid var(--line,#365260);border-radius:8px;background:var(--surface,#132b38);color:var(--blue,#6acafa);font:600 13px/1.5 Arial,sans-serif;text-decoration:none}#agm-al-home-back a:hover{border-color:currentColor}#agm-al-home-back a:focus-visible{outline:2px solid currentColor;outline-offset:3px}</style></head>', $html);
        }
        return $front ? agm_standard_facade_hero_link($html) : $html;
    });
}, -100);
