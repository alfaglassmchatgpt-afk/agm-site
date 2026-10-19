<?php
/** Template Name: Кухонные фартуки — ALFAGLASS */
defined('ABSPATH') || exit;
require_once __DIR__.'/inc/agm-configurator.php';
$dir=get_template_directory(); $uri=get_template_directory_uri();
$pid=get_queried_object_id();
$description=get_post_meta($pid,'_yoast_wpseo_metadesc',true);
add_filter('pre_get_document_title',function()use($pid){return get_the_title($pid).' — ALFAGLASS';},999);
add_filter('wpseo_title',function()use($pid){return get_the_title($pid).' — ALFAGLASS';},999);
add_filter('wpseo_metadesc',function()use($description){return $description;},999);
$cleanup=function(){foreach(wp_styles()->queue as $h){if(!in_array($h,['admin-bar','dashicons','agm-company'],true))wp_dequeue_style($h);}foreach(wp_scripts()->queue as $h){if($h!=='admin-bar')wp_dequeue_script($h);}};
add_action('wp_enqueue_scripts',$cleanup,PHP_INT_MAX);
add_action('wp_footer',$cleanup,0);
$home=agm_navigation_render(file_get_contents($dir.'/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s',$home,$header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s',$home,$sprite);
preg_match('/<footer\b.*?<\/footer>/s',$home,$footer);
$nav=preg_replace('/(<a\b[^>]*href=")#([^"]*)"/','$1'.esc_url(home_url('/')).'#$2"',$header[0]??'');
$nav=preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s','',$nav);
$foot=preg_replace('/(<a\b[^>]*href=")#([^"]*)"/','$1'.esc_url(home_url('/')).'#$2"',$footer[0]??'');
$foot=preg_replace('/<button[^>]*data-privacy-button[^>]*>.*?<\/button>/s','<a href="'.esc_url(home_url('/privacy-policy/')).'">Обработка данных</a>',$foot);
$replace=['__AGM_HOME__'=>esc_url(home_url('/')),'__AGM_ASSETS__'=>esc_url($uri.'/agm-homepage'),'__BP_ASSETS__'=>esc_url($uri.'/agm-backsplash')];
ob_start();
?><!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<?php if(!defined('WPSEO_VERSION')): ?><meta name="description" content="<?php echo esc_attr($description); ?>"><?php endif; ?>
<?php wp_head(); ?>
<link rel="stylesheet" href="<?php echo esc_url($uri.'/agm-homepage/css/style.css'); ?>">
<link rel="stylesheet" href="<?php echo esc_url($uri.'/agm-backsplash/style.css?v=20261019-2'); ?>">
</head><body class="designers-page backsplash-page" id="top"><?php wp_body_open(); ?><a class="skip-link" href="#main">Перейти к содержанию</a>
<?php echo strtr(($sprite[0]??'').$nav,$replace); ?>
<?php echo strtr(get_post_field('post_content',$pid),$replace); ?>
<?php echo strtr($foot,$replace); ?>
<script src="<?php echo esc_url($uri.'/agm-glass/app.js'); ?>" defer></script>
<?php wp_footer(); ?></body></html>

<?php
$html=agm_order_render(ob_get_clean(),'kuhonnye-fartuki',false);
$html=preg_replace('~<nav\b[^>]*class="container agm-card-back"[^>]*>.*?</nav>~s','',$html,1);
$html=preg_replace('~<nav\b[^>]*aria-label="Полезная информация"[^>]*>.*?</nav>~s','',$html);
$html=preg_replace('~(<nav\b[^>]*aria-label="Навигация в подвале"[^>]*>)(.*?)(</nav>)~s','$1$2<a href="/obrabotka-stekla-i-zerkal/">Обработка стекла и зеркал</a><a href="/blog/">Блог</a>$3',$html,1);
echo $html;
?>
