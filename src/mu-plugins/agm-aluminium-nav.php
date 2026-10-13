<?php
/** Plugin Name: AGM Aluminium navigation */
defined('ABSPATH') || exit;
add_action('template_redirect',function(){
 $page=get_page_by_path('aluminium');
 if(!$page || get_post_status($page)==='publish' || current_user_can('read_post',$page->ID))return;
 $path=untrailingslashit(wp_parse_url($_SERVER['REQUEST_URI']??'',PHP_URL_PATH));
 $target=untrailingslashit(wp_parse_url(home_url('/aluminium/'),PHP_URL_PATH));
 if($path!==$target)return;
 nocache_headers();
 wp_safe_redirect(home_url('/'),302);
 exit;
},0);
add_action('template_redirect',function(){
 if(!is_front_page())return;
 $page=get_page_by_path('aluminium');
 if(!$page || get_post_status($page)!=='publish')return;
 ob_start(function($html){
  $link='<a class="agm-aluminium-link" href="'.esc_url(home_url('/aluminium/')).'"><span>ALUM</span><span>INIUM</span></a>';
  return preg_replace('~(<a\b[^>]*href="[^"]*/kompleksnye-postavki/[^"]*"[^>]*>Комплексные поставки</a>)~u',$link.'$1',$html);
 });
});
add_action('wp_head',function(){if(!is_front_page())return;?>
<style>.agm-aluminium-link{font-family:'Trebuchet MS',Arial,sans-serif!important;font-size:17px!important;font-weight:700!important;letter-spacing:.06em;white-space:nowrap}.agm-aluminium-link span:first-child{color:#20282c}.agm-aluminium-link span:last-child{color:#08799d}[data-theme=dark] .agm-aluminium-link span:first-child{color:#eef4f7}[data-theme=dark] .agm-aluminium-link span:last-child{color:#64c9e9}</style>
<?php });