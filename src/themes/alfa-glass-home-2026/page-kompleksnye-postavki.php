<?php
/** Template Name: Комплексные поставки — ALFAGLASS 2026 */
defined('ABSPATH') || exit;
$agm_html = file_get_contents(get_template_directory() . '/agm-supply/index.html');
add_filter('pre_get_document_title', static function () { return 'Зеркала оптом от производителя по вашим размерам — ALFAGLASS'; }, 99);
ob_start(); wp_head(); $agm_head = ob_get_clean();
if (!preg_match('/<title\b/i', $agm_head)) {
    $agm_head .= '<title>' . esc_html(wp_get_document_title()) . '</title>';
}
ob_start(); wp_body_open(); $agm_body = ob_get_clean();
ob_start(); wp_footer(); $agm_footer = ob_get_clean();
echo strtr($agm_html, [
    '__AGM_ASSETS__' => esc_url(get_template_directory_uri() . '/agm-supply'),
    '__AGM_HOME__' => esc_url(home_url('/')),
    '__AGM_WP_HEAD__' => $agm_head,
    '__AGM_WP_BODY__' => $agm_body,
    '__AGM_WP_FOOTER__' => $agm_footer,
]);
