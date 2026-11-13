<?php
defined('ABSPATH') || exit;

function agm_mirror_card_header($agm_html) {
    // Use the same navigation markup and behaviour as the other material cards.
    $home = agm_navigation_render(file_get_contents(get_template_directory() . '/agm-homepage/index.html'));
    preg_match('~<header class="site-header">.*?</header>~s', $home, $header);
    preg_match('~<svg[^>]*class="svg-library".*?</svg>~s', $home, $sprite);
    $shared_header = preg_replace('~(<a\b[^>]*href=")#([^" ]*)"~', '$1' . esc_url(home_url('/')) . '#$2"', $header[0]);
    $shared_header = preg_replace('~<button class="icon-button search-toggle".*?</button>~s', '', $shared_header);
    $shared_header = strtr($shared_header, ['__AGM_HOME__'=>esc_url(home_url('/')), '__AGM_ASSETS__'=>esc_url(get_template_directory_uri().'/agm-homepage')]);
    $agm_html = preg_replace_callback('~<header class="material-header">.*?</header>~s', function() use ($shared_header, $sprite) { return $sprite[0] . $shared_header; }, $agm_html, 1);
    // Load the shared header stylesheet normally, as on the other material cards.
    // Older browsers ignore @scope blocks entirely, leaving both logos unstyled.
    $shared_css = '<link rel="stylesheet" href="' . esc_url(get_template_directory_uri().'/agm-homepage/css/style.css') . '">';
    $agm_html = str_replace('<link rel="stylesheet" href="__AGM_ASSETS__/style.css">', $shared_css . '<link rel="stylesheet" href="__AGM_ASSETS__/style.css">', $agm_html);
    $agm_html = str_replace('</head>', '<style>.site-header .mobile-actions{height:auto;min-height:49px;flex-wrap:wrap}.site-header .brand img{width:100%;height:auto}</style></head>', $agm_html);
    $agm_html = str_replace('</body>', '<script src="'.esc_url(get_template_directory_uri().'/agm-glass/app.js').'" defer></script></body>', $agm_html);
    return $agm_html;
}
