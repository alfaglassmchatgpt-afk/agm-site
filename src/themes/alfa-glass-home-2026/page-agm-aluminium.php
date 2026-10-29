<?php
/** Template Name: ALFAGLASS Aluminium */
defined('ABSPATH') || exit;
// Isolate the approved layout from legacy Elementor assets, as other custom pages do.
$cleanup=function(){foreach(wp_styles()->queue as $h){if(!in_array($h,['admin-bar','dashicons','sm_theme_style','sm_style'],true))wp_dequeue_style($h);}foreach(wp_scripts()->queue as $h){if(!in_array($h,['admin-bar','sm_script'],true))wp_dequeue_script($h);}};
add_action('wp_enqueue_scripts',$cleanup,PHP_INT_MAX);
add_action('wp_footer',$cleanup,0);
$slug=get_post_field('post_name',get_queried_object_id());
$file=['aluminium'=>'index.html','fasady'=>'facades.html','peregorodki'=>'partitions.html','zerkala'=>'mirrors.html'][$slug]??'index.html';
$html=file_get_contents(get_template_directory().'/agm-aluminium-catalog/'.$file);
if($slug==='aluminium'){
 $home=agm_navigation_render(file_get_contents(get_template_directory().'/agm-homepage/index.html'));
 preg_match('~<header class="site-header">.*?</header>~s',$home,$header);
 preg_match('~<svg[^>]*class="svg-library".*?</svg>~s',$home,$sprite);
 $shell=strtr(($sprite[0]??'').($header[0]??''),['__AGM_HOME__'=>esc_url(home_url('/')),'__AGM_ASSETS__'=>esc_url(get_template_directory_uri().'/agm-homepage')]);
 $shell=preg_replace('~(href=")#([^" ]*)"~','$1'.esc_url(home_url('/')).'#$2"',$shell);
 $shell=str_replace(esc_url(home_url('/')).'#i-',esc_url(home_url('/aluminium/')).'#i-',$shell);
 preg_match_all('~<symbol[^>]*id="([^"]+)"[^>]*>(.*?)</symbol>~s',$sprite[0]??'',$symbols,PREG_SET_ORDER);
 // Preserve each symbol's coordinate system when embedding it in a smaller icon.
 $icons=[];foreach($symbols as $symbol){
  preg_match('~\bviewBox="([^"]+)"~',$symbol[0],$viewBox);
  $icons[$symbol[1]]=isset($viewBox[1])?'<svg width="100%" height="100%" viewBox="'.esc_attr($viewBox[1]).'">'.$symbol[2].'</svg>':$symbol[2];
 }
 $shell=preg_replace_callback('~<use[^>]*href="[^"]*#([^"]+)"[^>]*(?:/>|></use>)~',function($m)use($icons){return $icons[$m[1]]??$m[0];},$shell);
 $links='<a class="al-link" href="/aluminium/">ALUM<span>INIUM</span></a><a href="/aluminium/fasady/">Фасады</a><a href="/aluminium/peregorodki/">Перегородки</a><a href="/aluminium/zerkala/">Зеркала в раме</a><a href="/aluminium/#al-request" data-al-request>Получить расчёт</a>';
 $shell=preg_replace_callback('~<nav\b[^>]*>.*?</nav>~s',function($m)use($links){preg_match('~<nav\b[^>]*>~',$m[0],$opening);return $opening[0].$links.'</nav>';},$shell);
 $shell=preg_replace('~<button[^>]*class="[^"]*asr-trigger[^" ]*"[^>]*>.*?</button>~s','',$shell);
 $shell=str_replace('href="'.esc_url(home_url('/')).'#request"','href="/aluminium/#al-request" data-al-request',$shell);
 $html=preg_replace_callback('~<header class="site-header">.*?</header>~s',function()use($shell){return $shell;},$html,1);
 $form=file_get_contents(get_template_directory().'/agm-aluminium-catalog/al-request.html');
 $html=str_replace('</body>',$form.'</body>',$html);
 $html=str_replace('</body>','<dialog id="al-search-dialog"><form action="/" method="get"><label>Поиск по сайту <input name="s" type="search" required></label><button class="button" type="submit">Найти</button><button id="al-search-close" type="button">Закрыть</button></form></dialog></body>',$html);
}
if(in_array($slug,['fasady','peregorodki','zerkala'],true)){
 require_once get_template_directory().'/inc/agm-aluminium-header.php';
 $shared=agm_aluminium_header($slug);
 if($shared){
  $html=preg_replace_callback('~<header class="site-header">.*?</header>~s',function()use($shared){return $shared;},$html,1);
  $html=preg_replace('~<nav\b[^>]*class="[^"]*section-nav[^"]*"[^>]*>.*?</nav>~s','',$html);
  $html=preg_replace('~<script src="site-shell.js[^" ]*" defer></script>~','',$html);
  $html=str_replace('</head>','<link rel="stylesheet" href="shared-header.css?v=20261029"><script src="shared-header.js?v=20261029" defer></script></head>',$html);
 }
}
require_once get_template_directory().'/inc/agm-quote.php';
$html=agm_quote_assets($html);
ob_start();wp_head();$head=ob_get_clean();
ob_start();wp_footer();$foot=ob_get_clean();
$pos=strpos($html,'<link rel="stylesheet"');$html=substr_replace($html,$head,$pos,0);
$html=str_replace('</body>',$foot.'</body>',$html);
echo $html;
