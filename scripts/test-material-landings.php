<?php
// Isolated hook tests: no WordPress, network, database or real redirects.
define('ABSPATH', __DIR__);
$hooks = []; $published = false; $pageSlug = 'iz-chego-delayut-zerkalo';
function add_filter($name, $callback, ...$args) { global $hooks; $hooks[$name][] = $callback; }
function add_action($name, $callback, ...$args) { add_filter($name, $callback); }
function get_page_by_path($slug) { global $published; return $published ? (object)['ID'=>1, 'post_status'=>'publish'] : null; }
function get_post_meta(...$args) { return 'page-agm-material-landing.php'; }
function home_url($path) { return 'https://example.test' . $path; }
function esc_url($s) { return htmlspecialchars($s, ENT_QUOTES); }
function esc_html($s) { return htmlspecialchars($s, ENT_QUOTES); }
function is_admin() { return false; }
function is_preview() { return false; }
function is_singular() { return true; }
function in_the_loop() { return true; }
function is_main_query() { return true; }
function get_queried_object_id() { return 1; }
function get_post_field(...$args) { global $pageSlug; return $pageSlug; }
function wp_parse_url($s, $part) { return parse_url($s, $part); }
function wp_unslash($s) { return $s; }
function sanitize_key($s) { return preg_replace('/[^a-z0-9_-]/', '', $s); }
function add_query_arg($args, $url) { return $url . '?' . http_build_query($args); }
function wp_safe_redirect($url, $status) { throw new RuntimeException($status . ' ' . $url); }
function check($value, $message) { if (!$value) throw new RuntimeException($message); }
require __DIR__ . '/../src/mu-plugins/agm-material-landings.php';
$groupLink = $hooks['agm_material_group_link'][0];
check($groupLink('/materialy/?group=craft-triplex','craft-triplex') === '/materialy/?group=craft-triplex', 'Unpublished landing must not receive navigation');
$published = true;
check($groupLink('/old','craft-triplex') === 'https://example.test/triplex/', 'Published triplex navigation');
check($groupLink('/untouched','zerkala') === '/untouched', 'Other groups unchanged');
$redirect = $hooks['template_redirect'][0];
foreach ([['/materialy/?group=craft-triplex','craft-triplex','triplex'], ['/catalog/riflenoe-steklo/','','riflenoe-steklo'], ['/dekorativnyy-triplex/','','triplex']] as $case) {
    $_SERVER['REQUEST_URI']=$case[0]; $_GET=['utm_source'=>'test']; if ($case[1]) $_GET['group']=$case[1];
    try { $redirect(); throw new LogicException('Missing redirect'); }
    catch (RuntimeException $e) { check($e->getMessage()==='301 https://example.test/'.$case[2].'/?utm_source=test', 'Redirect or campaign preservation failed'); }
}
$_SERVER['REQUEST_URI']='/triplex/'; $_GET=[]; $redirect(); // no loop
$content = '<p><span>Обсудить на странице «Зеркало на заказ».</span></p><h2>Вопросы</h2>';
$filter = $hooks['the_content'][0]; $result=$filter($content);
check(substr_count($result,'id="mirror-choice"')===1, 'One selection block');
check(strpos($result,'id="mirror-choice"')<strpos($result,'<h2>Вопросы'), 'Block before following article sections');
check(strpos($result,'/zerkala-s-podsvetkoj/#project-brief')!==false, 'Actual illuminated-mirror target');
check($filter($result)===$result,'Idempotent block');
$pageSlug='other-article'; check($filter($content)===$content,'Other articles unchanged');
echo "Material landing routes and article: passed\n";
