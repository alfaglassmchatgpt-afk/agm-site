<?php
/** Read-only WP-CLI eval-file check after dev deployment. */
require_once get_template_directory() . '/inc/agm-configurator.php';
$registry = agm_order_registry();
foreach ($registry as $slug => $profile) {
    $legacy = in_array($slug, ['zerkalo-serebro', 'tonirovannye-zerkala'], true);
    $file = $legacy ? '/agm-materials/' . ($slug === 'zerkalo-serebro' ? 'mirror' : 'tinted') . '.html' : '/agm-glass/' . $slug . '.html';
    $html = agm_order_render(file_get_contents(get_template_directory() . $file), $slug, $legacy);
    foreach (['id="cart-panel"', 'id="agm-order-data"', 'id="request-dialog"', 'id="add-material"'] as $marker) {
        if (substr_count($html, $marker) !== 1) { throw new RuntimeException($slug . ': wrong count of ' . $marker); }
    }
    if (strpos($html, 'id="glass-brief"') !== false) { throw new RuntimeException($slug . ': old form remains'); }
    if (!$legacy) {
        $document = new DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="UTF-8">' . $html);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        $xpath = new DOMXPath($document);
        if ($xpath->query('//section[contains(@class,"product-head")]//div[@class="product-info"]//button[@id="add-material"]')->length !== 1) {
            throw new RuntimeException($slug . ': choices must be beside the gallery');
        }
        if ($xpath->query('//div[@class="workspace"]/aside[@id="cart-panel"]')->length !== 1) {
            throw new RuntimeException($slug . ': calculation sidebar is missing');
        }
        preg_match_all('/<img\b[^>]*src="([^"]+)"/', file_get_contents(get_template_directory() . $file), $images);
        foreach ($images[1] as $source) {
            if (strpos($html, $source) === false) { throw new RuntimeException($slug . ': original image lost'); }
        }
    }
    if (in_array($profile['policy'], ['mirror', 'painted'], true) && in_array('temper', $profile['operations'], true)) {
        throw new RuntimeException($slug . ': forbidden heat treatment');
    }
}
echo 'PASS: shared configurator renders exactly once on ' . count($registry) . " material cards; old forms replaced.\n";
