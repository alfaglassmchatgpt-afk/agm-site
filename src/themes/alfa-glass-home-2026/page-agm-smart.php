<?php
/** Template Name: Smart Mirror — ALFAGLASS 2026 */
defined('ABSPATH') || exit;
$home = agm_navigation_render(file_get_contents(__DIR__ . '/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s', $home, $header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s', $home, $sprite);
$header = preg_replace('/(<a\b[^>]*href=")#([^"]*)"/', '$1' . esc_url(home_url('/')) . '#$2"', $header[0]);
$header = preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s', '', $header);
$html = file_get_contents(__DIR__ . '/agm-smart/index.html');
add_filter('pre_get_document_title', function () { return 'Умные зеркала Smart Mirror на заказ для бизнеса — ALFAGLASS'; }, 100);
ob_start(); wp_head(); $head = ob_get_clean();
ob_start(); wp_body_open(); $body = ob_get_clean();
ob_start(); wp_footer(); $footer = ob_get_clean();
echo strtr(strtr($html, ['__AGM_HEADER__'=>$header, '__AGM_SPRITE__'=>$sprite[0]]), [
 '__AGM_HEADER__'=>$header, '__AGM_SPRITE__'=>$sprite[0],
 '__AGM_ASSETS__'=>esc_url(get_template_directory_uri().'/agm-homepage'),
 '__AGM_GLASS__'=>esc_url(get_template_directory_uri().'/agm-glass'),
 '__AGM_SMART__'=>esc_url(get_template_directory_uri().'/agm-smart'),
 '__AGM_HOME__'=>esc_url(home_url('/')),
 '__AGM_WP_HEAD__'=>$head, '__AGM_WP_BODY__'=>$body, '__AGM_WP_FOOTER__'=>$footer,
]);
