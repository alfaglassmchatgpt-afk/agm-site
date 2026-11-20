<?php
/** Plugin Name: AGM wall panels standard layout */
defined('ABSPATH') || exit;
add_action('wp_enqueue_scripts', static function () {
    if (trim(wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/') !== 'stenovye-paneli-iz-stekla') return;
    wp_dequeue_script('sliders');
    wp_dequeue_script('main-script');
}, 100);
add_action('template_redirect', static function () {
    if (is_admin() || is_feed() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    if (trim(wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/') !== 'stenovye-paneli-iz-stekla') return;
    ob_start(static function ($html) {
        if (strpos($html, 'id="wall-panel-project"') === false) return $html;
        $html = preg_replace('~(<body\b[^>]*class=")~', '$1agm-panels-standard ', $html, 1);
        // Reuse the approved railing layout without changing either editor's controls.
        $css = strtr(file_get_contents(__DIR__.'/agm-railing-layout.css'), [
            'agm-railing-standard'=>'agm-panels-standard', '#railing-project'=>'#wall-panel-project',
            '#railing-configurator'=>'#panel-configurator', '#agr-result-section'=>'#agp-result-section'
        ]);
        $html = preg_replace_callback('~(<section class="agd-hero">)(.*?)(</section>)~s', static function ($m) {
            if (!preg_match('~^(<div class="agd-crumb">.*?</div>)(.*?)(<div class="agp-gallery">.*?</figure></div>)(<p class="agd-help">.*?</p>)(<a class="agd-hero-cta".*?</a>)$~s', $m[2], $p)) return $m[0];
            return $m[1].$p[1].'<div class="agd-page-hero"><div class="agd-hero-copy">'.$p[2].$p[5].'</div><div class="agp-hero-media">'.$p[3].$p[4].'</div></div>'.$m[3];
        }, $html, 1);
        $assets = '<style id="agm-panels-layout">'.$css.file_get_contents(__DIR__.'/agm-panels-layout.css').'</style>';
        $assets .= '<script data-pagespeed-no-defer>'.file_get_contents(__DIR__.'/agm-railing-layout.js').'</script>';
        return str_replace('</body>', $assets.'</body>', $html);
    });
}, -90);
