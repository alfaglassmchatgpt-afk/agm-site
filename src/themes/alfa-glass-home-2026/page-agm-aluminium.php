<?php
/** Template Name: ALFAGLASS Aluminium */
defined('ABSPATH') || exit;
$dir=get_template_directory();$uri=get_template_directory_uri();
$home=agm_navigation_render(file_get_contents($dir.'/agm-homepage/index.html'));
preg_match('~<header class="site-header">.*?</header>~s',$home,$header);
preg_match('~<svg[^>]*class="svg-library".*?</svg>~s',$home,$sprite);
preg_match('~<footer\b.*?</footer>~s',$home,$footer);
$header=preg_replace('~<nav\b.*?</nav>~s','',$header[0]??'');
$replace=['__AGM_HOME__'=>esc_url(home_url('/')),'__AGM_ASSETS__'=>esc_url($uri.'/agm-homepage')];
$header=preg_replace('~(<a\b[^>]*href=")#([^" ]*)"~','$1'.esc_url(home_url('/')).'#$2"',$header);
$foot=$footer[0]??'';
$foot=preg_replace('~(<a\b[^>]*href=")#([^" ]*)"~','$1'.esc_url(home_url('/')).'#$2"',$foot);
$foot=str_replace('</nav>','<a href="/obrabotka-stekla-i-zerkal/">Обработка стекла и зеркал</a><a href="/blog/">Блог</a></nav>',$foot);
?><!doctype html><html lang="ru" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?><link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-homepage/css/style.css"><link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-aluminium/style.css?v=20261013c"></head><body id="top" class="agm-about-page agm-aluminium-page"><?php wp_body_open();echo strtr(($sprite[0]??'').$header,$replace);echo file_get_contents($dir.'/agm-aluminium/content.html');echo strtr($foot,$replace);?><dialog id="al-search"><form action="/" method="get"><label>Поиск по сайту <input name="s" type="search" required></label><button class="button" type="submit">Найти</button><button type="button" onclick="this.closest('dialog').close()">Закрыть</button></form></dialog><script src="<?php echo esc_url($uri); ?>/agm-aluminium/app.js?v=20261013c" defer></script><?php wp_footer(); ?></body></html>