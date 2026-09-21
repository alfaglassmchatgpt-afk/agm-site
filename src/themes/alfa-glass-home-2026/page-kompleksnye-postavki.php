<?php
/** Template Name: Комплексные поставки — ALFAGLASS 2026 */
defined('ABSPATH') || exit;
$agm_html = file_get_contents(get_template_directory() . '/agm-supply/index.html');
ob_start(); wp_head(); $agm_head = ob_get_clean();
ob_start(); wp_body_open(); $agm_body = ob_get_clean();
ob_start(); wp_footer(); $agm_footer = ob_get_clean();
echo strtr($agm_html, [
    '__AGM_ASSETS__' => esc_url(get_template_directory_uri() . '/agm-supply'),
    '__AGM_HOME__' => esc_url(home_url('/')),
    '__AGM_WP_HEAD__' => $agm_head,
    '__AGM_WP_BODY__' => $agm_body,
    '__AGM_WP_FOOTER__' => $agm_footer,
]);
