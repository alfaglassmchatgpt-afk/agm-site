<?php
defined('ABSPATH') || exit;
add_action('wp_enqueue_scripts', function () {
    if (is_front_page() || is_page(5)) {
        wp_enqueue_style('agm-company', get_template_directory_uri() . '/agm-company/company.css', [], filemtime(get_template_directory() . '/agm-company/company.css'));
    }
}, PHP_INT_MAX);
add_filter('the_content', function ($content) {
    if (!is_admin() && is_page(5) && strpos($content, 'AGM-COMPANY-START') === false) {
        $extra = file_get_contents(get_template_directory() . '/agm-company/about-extra.html');
        $content .= strtr($extra, ['__COMPANY_ASSETS__' => esc_url(get_template_directory_uri() . '/agm-company')]);
    }
    return $content;
}, 99);

