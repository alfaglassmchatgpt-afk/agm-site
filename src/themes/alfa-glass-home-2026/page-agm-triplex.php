<?php
/** Template Name: Декоративный триплекс — ALFAGLASS */
defined('ABSPATH') || exit;
require_once __DIR__ . '/inc/agm-configurator.php';
$home = agm_navigation_render(file_get_contents(__DIR__ . '/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s', $home, $header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s', $home, $sprite);
$html = file_get_contents(__DIR__ . '/agm-glass/dekorativnyy-triplex.html');
$html = agm_order_render($html, 'dekorativnyy-triplex', false);
// The landing supplies its own title; WordPress keeps the page's self canonical.
remove_action('wp_head', '_wp_render_title_tag', 1);
ob_start(); wp_head(); $head = ob_get_clean();
ob_start(); wp_body_open(); $body = ob_get_clean();
ob_start(); wp_footer(); $footer = ob_get_clean();
$html = strtr($html, [
    '__AGM_HEADER__' => preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s', '', preg_replace('/(<a\b[^>]*href=")#([^"]*)"/', '$1' . esc_url(home_url('/')) . '#$2"', $header[0] ?? '')),
    '__AGM_SPRITE__' => $sprite[0] ?? '',
]);
echo strtr($html, [
    '__AGM_ASSETS__' => esc_url(get_template_directory_uri() . '/agm-homepage'),
    '__AGM_GLASS__' => esc_url(get_template_directory_uri() . '/agm-glass'),
    '__AGM_CONFIG__' => esc_url(get_template_directory_uri() . '/agm-configurator'),
    '__AGM_HOME__' => esc_url(home_url('/')),
    '__AGM_WP_HEAD__' => $head, '__AGM_WP_BODY__' => $body, '__AGM_WP_FOOTER__' => $footer,
]);
