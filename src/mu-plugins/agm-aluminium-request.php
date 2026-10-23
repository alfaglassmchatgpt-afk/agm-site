<?php
/** Plugin Name: AGM Aluminium enquiries */
defined('ABSPATH') || exit;

function agm_al_request_disabled() {
    return (defined('AGM_STAGING') && AGM_STAGING);
}
function agm_al_request_token($id, $time) {
    return hash_hmac('sha256', $id . '|' . $time, wp_salt('nonce'));
}
function agm_al_request_send($request) {
    if (agm_al_request_disabled()) return new WP_Error('disabled', 'Отправка в тестовой среде отключена.', ['status'=>503]);
    $p=$request->get_json_params();
    if (!is_array($p)) return new WP_Error('fields', 'Проверьте поля формы.', ['status'=>400]);
    foreach (['id','time','token','product','name','phone','email','dimensions','comment','consent','website'] as $key) {
        if (!isset($p[$key]) || !is_string($p[$key]) || strlen($p[$key])>12000) return new WP_Error('fields', 'Проверьте поля формы.', ['status'=>400]);
    }
    $id=$p['id'];$time=(int)$p['time'];
    // Optional complete mirror specification; keep the existing enquiry transport.
    if (isset($p['mirror_details']) && (!is_string($p['mirror_details']) || strlen($p['mirror_details'])>1048576 || $p['product']!=='mirrors')) return new WP_Error('fields','Проверьте список зеркал.',['status'=>400]);
    if (!preg_match('/^[a-f0-9]{32}$/D',$id) || $time>time()-2 || $time<time()-3600 || !hash_equals(agm_al_request_token($id,$time),$p['token'])) return new WP_Error('token','Обновите форму и повторите попытку.',['status'=>403]);
    $origin=$request->get_header('origin');
    if ($origin && wp_parse_url($origin,PHP_URL_HOST)!==wp_parse_url(home_url(),PHP_URL_HOST)) return new WP_Error('origin','Запрос отклонён.',['status'=>403]);
    $types=['facades'=>'Фасады в алюминиевом профиле','partitions'=>'Перегородки в алюминиевом профиле','mirrors'=>'Зеркала в алюминиевой раме'];
    $phone=preg_replace('/\D/','',$p['phone']);
    if ($p['website']!=='' || $p['consent']!=='1' || !isset($types[$p['product']]) || !trim($p['name']) || strlen($p['name'])>400 || !preg_match('/^[78]\d{10}$/D',$phone) || ($p['email']!==''&&!is_email($p['email'])) || strlen($p['dimensions'])>1200) return new WP_Error('fields','Укажите изделие, имя, полный телефон и согласие. Проверьте email.',['status'=>400]);
    if (get_transient('agm_al_sent_'.$id)) return ['ok'=>true,'message'=>'Ваш запрос уже передан. Мы свяжемся с вами.'];
    $rate='agm_al_rate_'.hash_hmac('sha256',$_SERVER['REMOTE_ADDR']??'',wp_salt('auth'));
    if ((int)get_transient($rate)>=5) return new WP_Error('rate','Слишком много запросов. Попробуйте позже.',['status'=>429]);
    // Atomic lock prevents simultaneous retries from creating duplicate mail.
    $lock='agm_al_lock_'.$id;
    if (!add_option($lock,time(),'','no')) return new WP_Error('busy','Запрос уже обрабатывается. Подождите.',['status'=>409]);
    wp_schedule_single_event(time()+3600,'agm_al_clear_lock',[$lock]);
    set_transient($rate,(int)get_transient($rate)+1,HOUR_IN_SECONDS);
    $body="ALFAGLASS / ALUMINIUM\nИзделие: ".$types[$p['product']]."\n";
    foreach (['name'=>'Имя','phone'=>'Телефон','email'=>'Email','dimensions'=>'Размеры и количество','comment'=>'Комментарий'] as $key=>$label) $body.=$label.': '.sanitize_textarea_field($p[$key])."\n";
    $body.="Согласие на обработку персональных данных: получено.\n";
    if (!empty($p['mirror_details'])) $body.="\nЗеркала в заявке:\n".sanitize_textarea_field($p['mirror_details'])."\n";
    // Reuse the site's public enquiry mailbox rather than a new delivery integration.
    $home=file_get_contents(get_template_directory().'/agm-homepage/index.html');
    preg_match('/href="mailto:([^"?]+)(?:[^"]*)"/',$home,$mail);
    $to=sanitize_email($mail[1]??'');
    $ok=is_email($to)&&wp_mail($to,'ALFAGLASS — Aluminium — '.$types[$p['product']],$body);
    delete_option($lock);
    if (!$ok) return new WP_Error('mail','Не удалось передать запрос. Позвоните нам или попробуйте позже.',['status'=>503]);
    set_transient('agm_al_sent_'.$id,1,DAY_IN_SECONDS);
    return ['ok'=>true,'message'=>'Запрос передан. Мы свяжемся с вами для уточнения деталей.'];
}
add_action('agm_al_clear_lock',function($lock){if(strpos($lock,'agm_al_lock_')===0)delete_option($lock);});
add_action('rest_api_init',function(){
    register_rest_route('agm-aluminium/v1','/request',[
        ['methods'=>'GET','permission_callback'=>'__return_true','callback'=>function(){
            $id=bin2hex(random_bytes(16));$time=time();
            $r=new WP_REST_Response(['enabled'=>!agm_al_request_disabled(),'id'=>$id,'time'=>(string)$time,'token'=>agm_al_request_token($id,$time)]);
            $r->header('Cache-Control','no-store, private');return $r;
        }],
        ['methods'=>'POST','permission_callback'=>'__return_true','callback'=>'agm_al_request_send']
    ]);
});
