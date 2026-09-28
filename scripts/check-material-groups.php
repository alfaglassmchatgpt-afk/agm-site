<?php
/** Run with WP-CLI eval-file on dev, with --skip-plugins --skip-themes. Read-only. */
require_once get_template_directory() . '/inc/agm-navigation.php';
function agm_check($condition, $message) {
    if (!$condition) { throw new RuntimeException($message); }
}
$groups = agm_material_grouped_pages();
$pages = agm_navigation_pages('materials');
$held = ['raywall90', 'raywall', 'vison-sun', 'flutes-moru-bronze', 'flutes-moru-ultra', 'flutes-moru-grey', 'flutes-moru-grey-mat', 'flutes-moru-bronze-mat', 'tonirovannoe-v-masse-steklo-moru'];
$pages = array_filter($pages, function ($page) use ($held) { return !in_array($page->post_name, $held, true); });
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
    agm_check(strpos($html, 'data-group="' . $key . '">') !== false, 'Selected group hidden');
    agm_check(substr_count($html, 'data-groups="' . $key . '"') === ($key === 'okrashennoe-steklo' ? 2 : count($group['pages'])), 'Wrong group size');
}
agm_check(array_map(function ($page) { return $page->post_name; }, $groups['matovoe-steklo']['pages']) === ['steklo-matovoe-matelux', 'steklo-matovoe-osvetlyonnoe', 'moru-bronze-mat', 'moru-grey-mat', 'moru-dark-grey-mat'], 'Matte range order or membership');
agm_check(array_map(function ($page) { return $page->post_name; }, $groups['tonirovannoe-steklo']['pages']) === ['tonirovannoe-steklo-grey', 'moru-bronze', 'moru-dark-grey', 'tonirovannoe-steklo-blue'], 'Tinted range must contain four transparent colours');
agm_check(array_map(function ($page) { return $page->post_name; }, $groups['solncezashhitnoe-steklo']['pages']) === ['steklo-solnczezashhitnoe-stopsol', 'stopsol-phoenix-bronze', 'stopsol-phoenix-gray'], 'Phoenix range order and membership');
$lacobel = agm_material_catalog_render($source, 'steklo-lacobel');
$matelac = agm_material_catalog_render($source, 'steklo-matelak');
agm_check(substr_count($lacobel, 'data-material-card') === 13, 'Lacobel must show thirteen colours');
agm_check(strpos($lacobel, 'materialy/lacobel-8017/') === false, 'Discontinued colour shown');
agm_check(substr_count($matelac, 'data-material-card') === 10, 'Matelac must show ten products');
agm_check(strpos($matelac, 'materialy/lacobel-') === false, 'Matelac must not inherit Lacobel colours');
agm_check(strpos($matelac, 'materialy/matelac-1013-agc/') !== false && strpos($matelac, 'materialy/matelac-1013-poland/') !== false, 'Both 1013 suppliers must be present');
agm_check(strpos($lacobel, '← Окрашенное стекло') !== false, 'Missing subgroup parent link');
echo 'PASS: ' . count($pages) . ' published materials, ' . count($groups) . " groups; unique coverage, selection, painted subgroups and invalid-group fallback.\n";
