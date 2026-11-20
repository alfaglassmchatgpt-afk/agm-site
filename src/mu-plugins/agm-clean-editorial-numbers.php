<?php
/** Plugin Name: AGM remove decorative editorial numbering */
defined('ABSPATH') || exit;

function agm_clean_editorial_numbers($html) {
    if (stripos($html, '</head>') === false) return $html;
    // Keep executable data, styles, forms and genuinely ordered instructions intact.
    $protected = [];
    $html = preg_replace_callback('~<(script|style|form|ol)\b[^>]*>.*?</\1>~is', static function ($m) use (&$protected) {
        $key = '<!--AGM-PRESERVED-'.count($protected).'-->';
        $protected[$key] = $m[0];
        return $key;
    }, $html);
    // Eyebrows and category captions such as "01 / Интерьер".
    $html = preg_replace('~(<(?:p|span|h[1-6]|div)\b[^>]*>)\s*0[1-9]\s*/\s*(?=[^<])~u', '$1', $html);
    // Empty decorative badges and first-child card numbers (not dimensions).
    $html = preg_replace('~<span\b[^>]*class="ds-number"[^>]*>\s*0[1-9]\s*</span>~', '', $html);
    $html = preg_replace('~(<article\b[^>]*>\s*)<(span|b)>\s*0[1-9]\s*</\2>(?=\s*<h[2-6]\b)~', '$1', $html);
    return strtr($html, $protected);
}
add_action('template_redirect', static function () {
    if (is_admin() || is_feed() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    ob_start('agm_clean_editorial_numbers');
}, -120);
