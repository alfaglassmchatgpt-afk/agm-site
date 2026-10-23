<?php
/** Template Name: Зеркало серебро — ALFAGLASS 2026 */
defined('ABSPATH') || exit;
require_once __DIR__ . '/inc/agm-configurator.php';
$agm_html = file_get_contents(get_template_directory() . '/agm-materials/mirror.html');
{ $agm_html = agm_order_render($agm_html, 'zerkalo-serebro', true); }

// Use the same navigation markup and behaviour as the other material cards.
$home = agm_navigation_render(file_get_contents(get_template_directory() . '/agm-homepage/index.html'));
preg_match('~<header class="site-header">.*?</header>~s', $home, $header);
preg_match('~<svg[^>]*class="svg-library".*?</svg>~s', $home, $sprite);
$shared_header = preg_replace('~(href=")#([^" ]*)"~', '$1' . esc_url(home_url('/')) . '#$2"', $header[0]);
$shared_header = preg_replace('~<button class="icon-button search-toggle".*?</button>~s', '', $shared_header);
$shared_header = strtr($shared_header, ['__AGM_HOME__'=>esc_url(home_url('/')), '__AGM_ASSETS__'=>esc_url(get_template_directory_uri().'/agm-homepage')]);
$agm_html = preg_replace_callback('~<header class="material-header">.*?</header>~s', function() use ($shared_header, $sprite) { return $sprite[0] . $shared_header; }, $agm_html, 1);
// Scope homepage styles to the shared header so the legacy product layout stays intact.
$header_css = file_get_contents(get_template_directory().'/agm-homepage/css/style.css');
$header_css = str_replace([':root', '.site-header'], ':scope', $header_css);
$header_css = str_replace('html[data-theme="dark"] {', ':scope:where(html[data-theme="dark"] *) {', $header_css);
$agm_html = str_replace('</head>', '<style>@scope (.site-header) {' . $header_css . '}.site-header .mobile-actions{height:auto;min-height:49px;flex-wrap:wrap}.site-header .brand img{width:100%;height:auto}</style></head>', $agm_html);
$agm_html = str_replace('</body>', '<script src="'.esc_url(get_template_directory_uri().'/agm-glass/app.js').'" defer></script></body>', $agm_html);

ob_start(); wp_head(); $agm_head = ob_get_clean();
ob_start(); wp_body_open(); $agm_body = ob_get_clean();
ob_start(); wp_footer(); $agm_footer = ob_get_clean();
echo strtr($agm_html, [
    '__AGM_ASSETS__' => esc_url(get_template_directory_uri() . '/agm-materials'),
    '__AGM_HOME__' => esc_url(home_url('/')),
    '__AGM_WP_HEAD__' => $agm_head,
    '__AGM_WP_BODY__' => $agm_body,
    '__AGM_WP_FOOTER__' => $agm_footer,
]);
