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
 if(is_user_logged_in()){
  wp_die('Доступ к странице доступен только редакторам сайта.','Доступ ограничен',array('response'=>403));
 }
 wp_safe_redirect(wp_login_url(home_url('/aluminium/')),302);
 exit;
},0);
add_action('template_redirect',function(){
 if(!is_front_page())return;
 $page=get_page_by_path('aluminium');

 ob_start(function($html){
  $label='<span class="agm-aluminium-link" aria-disabled="true"><span>ALUM</span><span>INIUM</span></span>';
  $html=preg_replace('~(<a\b[^>]*href="[^"]*/kompleksnye-postavki/[^"]*"[^>]*>Комплексные поставки</a>)~u',$label.'$1',$html);
  $footer='<a href="'.esc_url(home_url('/aluminium/')).'" data-agm-aluminium-footer="1">ALUMINIUM</a>';
  return preg_replace('~(<nav\b[^>]*aria-label="Навигация в подвале"[^>]*>)(.*?)(</nav>)~s','$1$2'.$footer.'$3',$html,1);
 });
});
add_action('wp_head',function(){if(!is_front_page())return;?>
<style>.desktop-nav>.agm-aluminium-link{display:flex;align-items:center;justify-content:center;min-height:51px;margin-bottom:-1px;border-bottom:2px solid transparent}.mobile-nav>.agm-aluminium-link{display:flex;align-items:center;min-height:48px;border-bottom:1px solid var(--line)}.agm-aluminium-link{cursor:default;font-family:'Trebuchet MS',Arial,sans-serif!important;font-size:17px!important;font-weight:700!important;letter-spacing:.06em;white-space:nowrap}.agm-aluminium-link span:first-child{color:#20282c}.agm-aluminium-link span:last-child{color:#08799d}[data-theme=dark] .agm-aluminium-link span:first-child{color:#eef4f7}[data-theme=dark] .agm-aluminium-link span:last-child{color:#64c9e9}
/* Approved option 3: animated blue/turquoise outline, no navigation action. */
.agm-aluminium-link{position:relative;isolation:isolate;padding-inline:14px}
.agm-aluminium-link::before{content:"";position:absolute;inset:7px 0;border-radius:12px;padding:1.5px;background:linear-gradient(110deg,#2263c5,#2cc9bc,#63b9e9,#2263c5,#2cc9bc);background-size:300% 100%;animation:agm-aluminium-flow 5s ease-in-out infinite;-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.mobile-nav>.agm-aluminium-link{width:max-content;max-width:100%;border-bottom:0}
@keyframes agm-aluminium-flow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@media(prefers-reduced-motion:reduce){.agm-aluminium-link::before{animation:none}}
</style>
<?php });