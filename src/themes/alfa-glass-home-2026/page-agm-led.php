<?php
/** Template Name: Зеркала с подсветкой — ALFAGLASS 2026 */
defined('ABSPATH') || exit;
$home = agm_navigation_render(file_get_contents(get_template_directory() . '/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s', $home, $header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s', $home, $sprite);
$header = preg_replace('/(<a\b[^>]*href=")#([^"]*)"/', '$1' . esc_url(home_url('/')) . '#$2"', $header[0]);
$header = preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s', '', $header);
$header = str_replace('href="' . esc_url(home_url('/')) . '#request"', 'href="#project-brief"', $header);
$html = file_get_contents(get_template_directory() . '/agm-led/index.html');
ob_start(); wp_head(); $head = ob_get_clean();
ob_start(); wp_body_open(); $body = ob_get_clean();
ob_start(); wp_footer(); $footer = ob_get_clean();
echo strtr(strtr($html, ['__AGM_HEADER__'=>$header,'__AGM_SPRITE__'=>$sprite[0]]), [
    '__AGM_ASSETS__'=>esc_url(get_template_directory_uri() . '/agm-homepage'),
    '__AGM_LED__'=>esc_url(get_template_directory_uri() . '/agm-led'),
    '__AGM_DESIGNERS__'=>esc_url(get_template_directory_uri() . '/agm-designers'),
    '__AGM_HOME__'=>esc_url(home_url('/')),
    '__AGM_WP_HEAD__'=>$head,'__AGM_WP_BODY__'=>$body,'__AGM_WP_FOOTER__'=>$footer,
]);
