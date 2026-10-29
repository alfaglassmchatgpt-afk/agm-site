<?php
// Exercise the real enquiry handler with fake WordPress/mail adapters. Never sends email.
define('ABSPATH',__DIR__);define('HOUR_IN_SECONDS',3600);define('DAY_IN_SECONDS',86400);
if (in_array('--staging',$argv,true)) define('AGM_STAGING',true);
class WP_Error {public $code;function __construct($c,...$args){$this->code=$c;}}
function is_wp_error($v){return $v instanceof WP_Error;}
function add_action(...$args){}
function wp_salt($v){return 'isolated-test-only';}
function home_url(){return 'https://example.invalid/';}
function wp_parse_url(...$args){return parse_url(...$args);}
function wp_json_encode($v){return json_encode($v);}
function sanitize_text_field($v){return strip_tags($v);}
function sanitize_textarea_field($v){return strip_tags($v);}
function sanitize_email($v){return $v;}
function is_email($v){return filter_var($v,FILTER_VALIDATE_EMAIL);}
function get_template_directory(){return dirname(__DIR__).'/src/themes/alfa-glass-home-2026';}
$transients=[];$options=[];$mails=[];
function get_transient($k){global $transients;return $transients[$k]??false;}
function set_transient($k,$v,...$args){global $transients;$transients[$k]=$v;}
function add_option($k,$v,...$args){global $options;if(isset($options[$k]))return false;$options[$k]=$v;return true;}
function delete_option($k){global $options;unset($options[$k]);}
function wp_schedule_single_event(...$args){}
function wp_mail($to,$subject,$body){global $mails;$mails[]=$body;return true;}
class Request {public $data;function __construct($d){$this->data=$d;}function get_json_params(){return $this->data;}function get_header($n){return 'https://example.invalid';}}
require dirname(__DIR__).'/src/mu-plugins/agm-aluminium-request.php';
function check($condition,$label){if(!$condition)throw new Exception($label);}
$items=[['type'=>'material','title'=>'Обычное зеркало','summary'=>"600 × 900 мм\n4 мм; 2 шт."],['type'=>'mirror','title'=>'Зеркало в раме','summary'=>"Диаметр 800 мм\nПодсветка: Да"],['type'=>'facade','title'=>'Фасад','summary'=>"350 × 600 мм\nMODUS MZ 01; Серебро"]];
$id=str_repeat('a',32);$time=(string)(time()-5);
$data=['id'=>$id,'time'=>$time,'token'=>agm_al_request_token($id,$time),'product'=>'mixed','name'=>'Локальная проверка','phone'=>'+70000000000','email'=>'','dimensions'=>'Позиций: 3','comment'=>'','consent'=>'1','website'=>'','items'=>$items];
$result=agm_al_request_send(new Request($data));
if(defined('AGM_STAGING')){check(is_wp_error($result)&&$result->code==='disabled','staging blocked');check(!$mails,'No staging mail');echo "PASS staging remains disabled\n";exit;}
check(!is_wp_error($result)&&$result['ok'],'Mixed handler succeeds');check(count($mails)===1,'Exactly one mail');
foreach($items as $item){check(strpos($mails[0],$item['title'])!==false,'All titles included');check(strpos($mails[0],$item['summary'])!==false,'All details included');}
agm_al_request_send(new Request($data));check(count($mails)===1,'Retry deduplicated');
check(is_wp_error(agm_quote_items_text([])),'Empty rejected');check(is_wp_error(agm_quote_items_text([['type'=>'bogus','title'=>'x','summary'=>'x']])),'Unknown type rejected');
check(is_wp_error(agm_quote_items_text([['type'=>'mirror','title'=>'x','summary'=>str_repeat('x',1048577)]])),'Oversize rejected');
$bad=$data;$bad['consent']='0';check(is_wp_error(agm_al_request_send(new Request($bad))),'Consent required');
foreach(['facades','mirrors','partitions'] as $kind){$d=$data;$d['id']=md5($kind);$d['token']=agm_al_request_token($d['id'],$time);$d['product']=$kind;unset($d['items']);check(!is_wp_error(agm_al_request_send(new Request($d))),'Legacy request preserved');}
echo "PASS mixed payload/mail composition, retry deduplication, validation and legacy types; wp_mail stub only\n";
