<?php
/** Plugin Name: AGM Aluminium navigation */
defined('ABSPATH') || exit;
add_action('template_redirect',function(){
 if(!is_front_page())return;
 ob_start(function($html){
  $link='<a class="agm-aluminium-link" href="'.esc_url(home_url('/aluminium/')).'"><span>ALUM</span><span>INIUM</span></a>';
  return preg_replace('~(<a\b[^>]*href="[^"]*/kompleksnye-postavki/[^"]*"[^>]*>Комплексные поставки</a>)~u',$link.'$1',$html);
 });
});
add_action('wp_head',function(){if(!is_front_page())return;?>
<style>.agm-aluminium-link{font-family:'Trebuchet MS',Arial,sans-serif!important;font-size:17px!important;font-weight:700!important;letter-spacing:.06em;white-space:nowrap}.agm-aluminium-link span:first-child{color:#20282c}.agm-aluminium-link span:last-child{color:#08799d}[data-theme=dark] .agm-aluminium-link span:first-child{color:#eef4f7}[data-theme=dark] .agm-aluminium-link span:last-child{color:#64c9e9}</style>
<?php });