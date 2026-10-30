<?php
/** Plugin Name: AGM unavailable public links */
defined('ABSPATH') || exit;

/** Preserve labels, but do not send visitors to known closed sections. */
function agm_disable_unavailable_links($html) {
    $paths = array('/nashe-proizvodstvo', '/payment', '/warranty', '/faq',
        '/izdeliya/steklyannye-dveri', '/izdeliya/steklyannye-ograzhdeniya',
        '/product/steklyannye-dveri', '/product/steklyannye-lestnichnye-ograzhdeniya',
        '/catalog/steklyannye-dveri', '/bezopasnost-i-zashhita');
    return preg_replace_callback('~<a\b([^>]*?)\bhref\s*=\s*(["\x27])(.*?)\2([^>]*)>(.*?)</a\s*>~is', function($m) use ($paths) {
        $url = html_entity_decode($m[3], ENT_QUOTES, 'UTF-8');
        $parts = parse_url($url);
        if ($parts === false || isset($parts['scheme']) && !in_array(strtolower($parts['scheme']), array('http', 'https'), true)) return $m[0];
        if (isset($parts['host']) && !in_array(strtolower($parts['host']), array('alfaglass.ru', 'www.alfaglass.ru'), true)) return $m[0];
        $path = rtrim($parts['path'] ?? '', '/');
        if (!in_array($path, $paths, true)) return $m[0];
        if ($path === '/nashe-proizvodstvo') return '';
        return '<span class="agm-unavailable-link">' . $m[5] . '</span>';
    }, $html);
}
add_action('template_redirect', function() {
    if (is_admin() || is_feed() || is_robots() || is_trackback() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    ob_start('agm_disable_unavailable_links');
}, 1);
