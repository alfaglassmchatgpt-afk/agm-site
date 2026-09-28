<?php
/** Template Name: Smart Mirror — ALFAGLASS 2026 */
defined('ABSPATH') || exit;
require_once __DIR__ . '/inc/agm-configurator.php';
$home = agm_navigation_render(file_get_contents(__DIR__ . '/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s', $home, $header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s', $home, $sprite);
$header = preg_replace('/(<a\b[^>]*href=")#([^"]*)"/', '$1' . esc_url(home_url('/')) . '#$2"', $header[0]);
$header = preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s', '', $header);
$html = agm_order_render(file_get_contents(__DIR__ . '/agm-smart/index.html'), 'smart-mirror', false);
$html = preg_replace('~<nav class="container agm-card-back".*?</nav>~s', '<nav class="container agm-card-back" aria-label="Возврат к изделиям"><a href="' . esc_url(home_url('/#products')) . '">← Все изделия</a></nav>', $html, 1);
$html = str_replace('Доступная обработка', 'Комплектация под ваш проект', $html);
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
