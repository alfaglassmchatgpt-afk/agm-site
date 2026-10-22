<?php
/** Template Name: ALFAGLASS Aluminium */
defined('ABSPATH') || exit;
// Isolate the approved layout from legacy Elementor assets, as other custom pages do.
$cleanup=function(){foreach(wp_styles()->queue as $h){if(!in_array($h,['admin-bar','dashicons','sm_theme_style','sm_style'],true))wp_dequeue_style($h);}foreach(wp_scripts()->queue as $h){if(!in_array($h,['admin-bar','sm_script'],true))wp_dequeue_script($h);}};
add_action('wp_enqueue_scripts',$cleanup,PHP_INT_MAX);
add_action('wp_footer',$cleanup,0);
$slug=get_post_field('post_name',get_queried_object_id());
$file=['aluminium'=>'index.html','fasady'=>'facades.html','peregorodki'=>'partitions.html'][$slug]??'index.html';
$html=file_get_contents(get_template_directory().'/agm-aluminium-catalog/'.$file);
if($slug==='aluminium'){
 $home=agm_navigation_render(file_get_contents(get_template_directory().'/agm-homepage/index.html'));
 preg_match('~<header class="site-header">.*?</header>~s',$home,$header);
 preg_match('~<svg[^>]*class="svg-library".*?</svg>~s',$home,$sprite);
 $shell=strtr(($sprite[0]??'').($header[0]??''),['__AGM_HOME__'=>esc_url(home_url('/')),'__AGM_ASSETS__'=>esc_url(get_template_directory_uri().'/agm-homepage')]);
 $shell=preg_replace('~(href=")#([^" ]*)"~','$1'.esc_url(home_url('/')).'#$2"',$shell);
 $shell=str_replace(esc_url(home_url('/')).'#i-',esc_url(home_url('/aluminium/')).'#i-',$shell);
 preg_match_all('~<symbol[^>]*id="([^"]+)"[^>]*>(.*?)</symbol>~s',$sprite[0]??'',$symbols,PREG_SET_ORDER);
 $icons=[];foreach($symbols as $symbol)$icons[$symbol[1]]=$symbol[2];
 $shell=preg_replace_callback('~<use[^>]*href="[^"]*#([^"]+)"[^>]*(?:/>|></use>)~',function($m)use($icons){return $icons[$m[1]]??$m[0];},$shell);
 $html=preg_replace_callback('~<header class="site-header">.*?</header>~s',function()use($shell){return $shell;},$html,1);
 $html=str_replace('</body>','<dialog id="al-search-dialog"><form action="/" method="get"><label>Поиск по сайту <input name="s" type="search" required></label><button class="button" type="submit">Найти</button><button id="al-search-close" type="button">Закрыть</button></form></dialog></body>',$html);
}
ob_start();wp_head();$head=ob_get_clean();
ob_start();wp_footer();$foot=ob_get_clean();
$pos=strpos($html,'<link rel="stylesheet"');$html=substr_replace($html,$head,$pos,0);
$html=str_replace('</body>',$foot.'</body>',$html);
echo $html;
