<?php
/** Template Name: ALFAGLASS Product Journal */
defined('ABSPATH') || exit;
$files = ['steklyannye-polki'=>'index.html', 'zerkala-na-zakaz'=>'mirrors.html', 'zerkalnaya-plitka'=>'mirror-tiles.html'];
$slug = get_post_field('post_name', get_queried_object_id());
if (!isset($files[$slug])) { status_header(404); return; }
$html = file_get_contents(get_template_directory().'/agm-product-journal/'.$files[$slug]);
// Let WordPress/Yoast own SEO output without duplicating the preview description.
if (preg_match('~<meta name="description" content="([^"]*)">~', $html, $match)) {
    $description = html_entity_decode($match[1], ENT_QUOTES, 'UTF-8');
    $html = str_replace($match[0], '', $html);
    add_filter('wpseo_metadesc', static function () use ($description) { return $description; });
    if (!defined('WPSEO_VERSION')) add_action('wp_head', static function () use ($description) {
        echo '<meta name="description" content="'.esc_attr($description).'">';
    }, 2);
}
// Match the existing standalone product templates and retain the shared hooks.
$cleanup = static function () {
    foreach (wp_styles()->queue as $handle) {
        if (!in_array($handle, ['admin-bar','dashicons','sm_theme_style','sm_style'], true)) wp_dequeue_style($handle);
    }
    foreach (wp_scripts()->queue as $handle) {
        if (!in_array($handle, ['admin-bar','sm_script'], true)) wp_dequeue_script($handle);
    }
};
add_action('wp_enqueue_scripts', $cleanup, PHP_INT_MAX);
add_action('wp_footer', $cleanup, 0);
// Version only local code assets; preserve the approved fonts and image crops.
$html = preg_replace_callback('~((?:src|href)=")((?:\.\./agm-configurator/)?[a-z0-9-]+\.(?:js|css))(")~i', static function ($m) {
    $path = get_template_directory().'/agm-product-journal/'.$m[2];
    return $m[1].$m[2].(is_file($path) ? '?v='.filemtime($path) : '').$m[3];
}, $html);
ob_start(); wp_head(); $head = ob_get_clean();
if (!current_theme_supports('title-tag') && !defined('WPSEO_VERSION')) $head .= '<title>'.esc_html(wp_get_document_title()).'</title>';
ob_start(); wp_body_open(); $body = ob_get_clean();
ob_start(); wp_footer(); $foot = ob_get_clean();
echo str_replace(['</head>','<body>','</body>'], [$head.'</head>','<body>'.$body,$foot.'</body>'], $html);
