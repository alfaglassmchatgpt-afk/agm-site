<?php
/** Template Name: Каталог материалов — ALFAGLASS 2026 */
defined('ABSPATH') || exit;
require_once __DIR__ . '/inc/agm-configurator.php';
$home = agm_navigation_render(file_get_contents(get_template_directory() . '/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s', $home, $header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s', $home, $sprite);
$header = preg_replace('/(<a\b[^>]*href=")#([^"]*)"/', '$1' . esc_url(home_url('/')) . '#$2"', $header[0]);
$header = preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s', '', $header);

$slug = is_page('materialy') ? 'catalog' : get_post_field('post_name', get_queried_object_id());
$allowed = ['catalog', 'tonirovannoe-steklo-green', 'tonirovannoe-steklo-black', 'stopsol-phoenix-bronze', 'stopsol-phoenix-gray', 'matelac-1013-agc', 'matelac-8815-agc', 'matelac-9005-agc', 'matelac-9006-agc', 'matelac-9010-agc', 'matelac-1236-agc', 'matelac-7000-agc', 'matelac-7013-agc', 'matelac-1013-poland', 'matelac-9003', 'lacobel-1013', 'lacobel-1014', 'lacobel-1015', 'lacobel-1236', 'lacobel-5001', 'lacobel-7000', 'lacobel-7013', 'lacobel-7016', 'lacobel-7035', 'lacobel-8815', 'lacobel-9003', 'lacobel-9005', 'lacobel-9010', 'tonirovannoe-steklo-blue', 'tonirovannoe-steklo-grey', 'steklo-matovoe-osvetlyonnoe', 'craft-moru-bronze-mat', 'craft-moru-grey-mat', 'craft-moru-dark-grey-mat', 'moru-bronze-toned', 'moru-ultra', 'moru-crystal', 'riflenoe-steklo-flutes', 'sostarennye-zerkala-k1', 'float-steklo-clear-m1', 'raywall90', 'raywall', 'vison-sun', 'flutes-moru-bronze', 'flutes-moru-ultra', 'flutes-moru-grey', 'flutes-moru-grey-mat', 'flutes-moru-bronze-mat', 'flutes-moru-ultra-mat', 'moru-bronze-mat', 'moru-grey-mat', 'moru-dark-grey-mat', 'steklo-matovoe-matelux', 'moru-grey', 'moru-dark-grey', 'moru-bronze', 'tonirovannoe-v-masse-steklo-moru', 'diamant', 'hithicross', 'gothic', 'silvit', 'kathedral-klein', 'monumental-atlantic', 'krepi', 'kathedralaqualite', 'steklo-solnczezashhitnoe-stopsol', 'steklo-lacobel', 'steklo-matelak', 'dihroichnoe-steklo', 'steklo-osvetlyonnoe-clearvision', 'steklo-kristalvizhn-crystalvision', 'zerkalo-osvetlyonnoe', 'sostarennye-zerkala', 'zerkalo-gezella'];
if (!in_array($slug, $allowed, true)) { status_header(404); exit; }
$html = file_get_contents(get_template_directory() . '/agm-glass/' . $slug . '.html');
if ($slug === 'catalog') { $html = agm_material_catalog_render($html); }
if (in_array($slug, ['steklo-lacobel', 'steklo-matelak'], true)) {
    $html = agm_material_catalog_render(file_get_contents(get_template_directory() . '/agm-glass/catalog.html'), $slug);
} elseif ($slug !== 'catalog') { $html = agm_order_render($html, $slug, false); }
ob_start(); wp_head(); $head = ob_get_clean();
ob_start(); wp_body_open(); $body = ob_get_clean();
ob_start(); wp_footer(); $footer = ob_get_clean();
echo strtr(strtr($html, ['__AGM_HEADER__'=>$header,'__AGM_SPRITE__'=>$sprite[0]]), [
    '__AGM_ASSETS__'=>esc_url(get_template_directory_uri() . '/agm-homepage'),
    '__AGM_GLASS__'=>esc_url(get_template_directory_uri() . '/agm-glass'),
    '__AGM_HOME__'=>esc_url(home_url('/')),
    '__AGM_WP_HEAD__'=>$head,'__AGM_WP_BODY__'=>$body,'__AGM_WP_FOOTER__'=>$footer,
]);
