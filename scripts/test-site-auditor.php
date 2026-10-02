<?php
const ABSPATH = '/mock/';
function add_action(...$args) {}
function home_url($p='/') { return 'https://example.test/'; }
function wp_json_encode($v) { return json_encode($v); }
function wp_parse_url($s,$c=-1) { return parse_url($s,$c); }
function get_post_meta(...$args) { return ''; }
function register_rest_route($n,$p,$a) { $GLOBALS['route']=$a; }
function current_user_can($c) { return $GLOBALS['admin'] ?? false; }
require $argv[1];
function call_private($name,...$args) { $r=new ReflectionMethod('AlfaGlass_Site_Auditor',$name); $r->setAccessible(true); return $r->invoke(null,...$args); }
function check($ok,$name) { if(!$ok) throw new RuntimeException($name); echo "PASS $name\n"; }
check(call_private('seo_meta_for_post',1)===[], 'SEO array return type');
check(call_private('safe_url','https://site.test/path/?token=secret#private')==='https://site.test/path/', 'URL query and fragment removed');
check(call_private('safe_url','https://user:pass@site.test/path')==='[redacted-url]', 'URL credentials removed');
check(call_private('fingerprint',['b'=>2,'a'=>1])===call_private('fingerprint',['a'=>1,'b'=>2]), 'Stable object key order');
check(call_private('fingerprint','https://example.test/path')===call_private('fingerprint','{{SITE}}/path'), 'Site origin normalization');
check(call_private('fingerprint','before')!==call_private('fingerprint','after'), 'Content change detected');
$c=new ReflectionClass('AlfaGlass_Site_Auditor'); $types=$c->getConstant('CONTENT_TYPES');
check(!array_intersect($types,['request','teams','reviews','attachment','wpcf7_contact_form']), 'Private types excluded');
check(call_private('mask_if_sensitive','smtp_password','secret')==='[masked]', 'Secret key masking');
AlfaGlass_Site_Auditor::register_rest_routes();
$GLOBALS['admin']=false;
check(!($GLOBALS['route']['permission_callback'])(), 'Anonymous REST access denied');
$GLOBALS['admin']=true;
check(($GLOBALS['route']['permission_callback'])(), 'Administrator REST access allowed');
check($GLOBALS['route']['methods']==='GET', 'Read-only REST method');
