<?php
/** Run with WP-CLI eval-file on dev, with --skip-plugins --skip-themes. Read-only. */
require_once get_template_directory() . '/inc/agm-navigation.php';
function agm_check($condition, $message) {
    if (!$condition) { throw new RuntimeException($message); }
}
$groups = agm_material_grouped_pages();
$pages = agm_navigation_pages('materials');
$ids = [];
foreach ($groups as $group) {
    foreach ($group['pages'] as $page) {
        agm_check($page->post_status === 'publish', 'Unpublished material');
        $ids[] = $page->ID;
    }
}
agm_check(count($ids) === count(array_unique($ids)), 'Duplicate material');
agm_check(count($ids) === count($pages), 'Missing material');
$source = file_get_contents(get_template_directory() . '/agm-glass/catalog.html');
$_GET['group'] = 'unknown-category';
$html = agm_material_catalog_render($source);
agm_check(strpos($html, 'data-selected-group=""') !== false, 'Invalid group fallback');
agm_check(substr_count($html, 'data-material-card') === count($pages), 'Wrong card count');
foreach ($groups as $key => $group) {
    $_GET['group'] = $key;
    $html = agm_material_catalog_render($source);
    agm_check(strpos($html, 'data-group="' . $key . '"><h2>') !== false, 'Selected group hidden');
    agm_check(substr_count($html, 'data-groups="' . $key . '"') === count($group['pages']), 'Wrong group size');
}
echo 'PASS: ' . count($pages) . ' published materials, ' . count($groups) . " groups; unique coverage, selection and invalid-group fallback.\n";
