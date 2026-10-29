<?php
/** Shared homepage header with Aluminium navigation; no duplicated contact data. */
defined('ABSPATH') || exit;
function agm_aluminium_header($slug) {
    $home = file_get_contents(get_template_directory() . '/agm-homepage/index.html');
    if (!preg_match('~<header class="site-header">.*?</header>~s', $home, $match)) return '';
    $header = str_replace('class="site-header"', 'class="site-header aluminium-header"', $match[0]);
    $header = strtr($header, ['__AGM_HOME__' => esc_url(home_url('/')), '__AGM_ASSETS__' => esc_url(get_template_directory_uri() . '/agm-homepage')]);
    // Embed icons directly: fragment URLs otherwise resolve against the catalogue base URL.
    preg_match_all('~<symbol[^>]*id="([^"]+)"[^>]*viewBox="([^"]+)"[^>]*>(.*?)</symbol>~s', $home, $symbols, PREG_SET_ORDER);
    $icons = [];
    foreach ($symbols as $symbol) $icons[$symbol[1]] = '<svg width="100%" height="100%" viewBox="' . esc_attr($symbol[2]) . '">' . $symbol[3] . '</svg>';
    $header = preg_replace_callback('~<use[^>]*href="#([^"]+)"[^>]*(?:/>|></use>)~', function($m) use ($icons) { return $icons[$m[1]] ?? ''; }, $header);
    $header = str_replace('href="#top"', 'href="' . esc_url(home_url('/')) . '"', $header);
    $links = '';
    foreach (['aluminium' => 'ALUMINIUM', 'fasady' => 'Фасады', 'peregorodki' => 'Перегородки', 'zerkala' => 'Зеркала в рамах'] as $key => $label) {
        $url = '/aluminium/' . ($key === 'aluminium' ? '' : $key . '/');
        $links .= '<a href="' . esc_url(home_url($url)) . '"' . ($key === $slug ? ' aria-current="page"' : '') . ($key === 'aluminium' ? ' class="aluminium-home"' : '') . '>' . $label . '</a>';
    }
    $links .= '<a href="' . esc_url(home_url('/materialy/')) . '">Стекло и зеркала</a>';
    $header = preg_replace_callback('~(<nav\b[^>]*>).*?</nav>~s', function($m) use ($links) { return $m[1] . $links . '</nav>'; }, $header);
    $header = preg_replace('~<button[^>]*class="[^"]*(?:asr-trigger|search-toggle)[^"]*"[^>]*>.*?</button>~s', '', $header);
    $target = $slug === 'fasady' ? '/wp-content/themes/alfa-glass-home-2026/agm-aluminium-configurator/index.html' : '/aluminium/' . $slug . '/#' . ($slug === 'zerkala' ? 'calculation' : 'partition-scene');
    $attribute = ' data-open-quote';
    $header = str_replace('href="#request"', 'href="' . esc_url(home_url($target)) . '"' . $attribute, $header);
    return str_replace('Получить расчёт', 'Мой расчёт', $header);
}
