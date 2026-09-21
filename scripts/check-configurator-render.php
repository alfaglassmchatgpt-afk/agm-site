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
    if (in_array($profile['policy'], ['mirror', 'painted'], true) && in_array('temper', $profile['operations'], true)) {
        throw new RuntimeException($slug . ': forbidden heat treatment');
    }
}
echo 'PASS: shared configurator renders exactly once on ' . count($registry) . " material cards; old forms replaced.\n";
