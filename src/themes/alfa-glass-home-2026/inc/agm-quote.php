<?php
/** Shared basket assets for material cards and Aluminium. */
defined('ABSPATH') || exit;
function agm_quote_assets($html) {
    if (strpos($html, 'agm-configurator/quote-ui.js') !== false) return $html;
    $dir = get_template_directory() . '/agm-configurator/';
    $url = get_template_directory_uri() . '/agm-configurator/';
    $assets = '<link rel="stylesheet" href="' . esc_url($url . 'quote.css?v=' . filemtime($dir . 'quote.css')) . '">';
    foreach (['model.js','quote-store.js','quote-model.js','quote-ui.js'] as $file) {
        $assets .= '<script src="' . esc_url($url . $file . '?v=' . filemtime($dir . $file)) . '" defer></script>';
    }
    // Before existing deferred editors, including mirror-panel.js.
    return preg_replace_callback('~<head\b[^>]*>~', function($m) use ($assets) { return $m[0] . $assets; }, $html, 1);
}
