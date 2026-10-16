<?php
const ABSPATH = __DIR__;
$filters = [];
function is_admin() { return !empty($GLOBALS['admin']); }
function wp_parse_url($url, $component) { return parse_url($url, $component); }
function add_filter($name, $callback, $priority) { $GLOBALS['filters'][$name] = $callback; }
require __DIR__ . '/../src/mu-plugins/agm-seo-metadata.php';
foreach (['/', '/materialy/', '/blog/', '/service/'] as $path) {
 $_SERVER['REQUEST_URI'] = $path . '?check=test';
 if ($filters['wpseo_title']('original') === 'original') { throw new Exception('Missing title'); }
 $description = $filters['wpseo_metadesc']('original');
 if (in_array($path, ['/blog/', '/service/'], true) ? $description === 'original' : $description !== 'original') { throw new Exception('Description routing'); }
}
foreach (['/aluminium/', '/materialy/krezet/', '/other/'] as $path) {
 $_SERVER['REQUEST_URI'] = $path;
 foreach ($filters as $filter) { if ($filter('original') !== 'original') { throw new Exception('Unexpected override'); } }
}
$GLOBALS['admin'] = true; $_SERVER['REQUEST_URI'] = '/';
foreach ($filters as $filter) { if ($filter('original') !== 'original') { throw new Exception('Admin changed'); } }
echo "Metadata routing: OK\n";
