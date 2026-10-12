<?php
/** Template Name: AGM Privacy Policy */
defined('ABSPATH') || exit;
$dir=get_template_directory(); $uri=get_template_directory_uri();
$home=agm_navigation_render(file_get_contents($dir.'/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s',$home,$header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s',$home,$sprite);
$header=preg_replace('/(<a\b[^>]*href=")#([^"]*)"/','$1'.esc_url(home_url('/')).'#$2"',$header[0]??'');
$header=preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s','',$header);

$content=get_post_field('post_content',get_queried_object_id());
$content=wpautop($content);
$content=str_replace('[alfa-breadcrumbs]','',$content);
$content=preg_replace('~<style\b[^>]*>.*?</style>~is','',$content);
$sections=[];
$content=preg_replace_callback('~<h5\b[^>]*>(.*?)</h5>~is',function($m)use(&$sections){
 $label=trim(html_entity_decode(wp_strip_all_tags($m[1]),ENT_QUOTES,'UTF-8'));
 if(!preg_match('/^\d+\./u',$label))return $m[0];
 $id='policy-section-'.(count($sections)+1);$sections[$id]=$label;
 return '<h2 id="'.$id.'">'.$m[1].'</h2>';
},$content);
?><!doctype html><html lang="ru" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-homepage/css/style.css"><link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-privacy.css?v=20261012"><?php wp_head(); ?></head><body id="top" class="agm-about-page agm-privacy-page"><?php wp_body_open(); echo ($sprite[0]??'').strtr($header,['__AGM_HOME__'=>esc_url(home_url('/')),'__AGM_ASSETS__'=>esc_url($uri.'/agm-homepage')]); ?>
<main class="privacy-wrap" id="main"><nav class="privacy-crumb" aria-label="Хлебные крошки"><a href="<?php echo esc_url(home_url('/')); ?>">Главная</a><span> / Политика конфиденциальности</span></nav><div class="privacy-layout"><aside><details class="privacy-toc" open><summary>Содержание документа</summary><nav aria-label="Разделы политики"><?php foreach($sections as $id=>$label): ?><a href="#<?php echo esc_attr($id); ?>"><?php echo esc_html($label); ?></a><?php endforeach; ?></nav></details></aside><article class="privacy-document"><?php echo $content; ?></article></div></main><footer class="privacy-footer"><a href="<?php echo esc_url(home_url('/')); ?>"><strong>ALFAGLASS</strong></a><a href="<?php echo esc_url(home_url('/blog/')); ?>">Блог</a><span>© 2003–<?php echo esc_html(date('Y')); ?> ALFAGLASS</span></footer><script src="<?php echo esc_url($uri); ?>/agm-glass/app.js" defer></script><?php wp_footer(); ?></body></html>
