<?php
/** Template Name: Изделие — закрытый макет ALFAGLASS */
defined('ABSPATH') || exit;
if (!current_user_can('edit_pages')) { auth_redirect(); exit; }
require_once __DIR__ . '/inc/agm-configurator.php';
$home = agm_navigation_render(file_get_contents(__DIR__ . '/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s', $home, $header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s', $home, $sprite);
$header = preg_replace('/(<a\b[^>]*href=")#([^"]*)"/', '$1' . esc_url(home_url('/')) . '#$2"', $header[0] ?? '');
$header = preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s', '', $header);
ob_start(); ?><!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="<?php echo esc_url(get_template_directory_uri().'/agm-homepage/css/style.css'); ?>"><link rel="stylesheet" href="<?php echo esc_url(get_template_directory_uri().'/agm-glass/style.css'); ?>"><?php wp_head(); ?></head><body id="top"><?php wp_body_open(); echo ($sprite[0] ?? '').$header; ?><main class="container" style="padding-block:48px"><div class="ds-breadcrumb">Изделия · закрытый макет</div><section class="gc-product"><div class="agm-material-diagram"><p>Изображения будут добавлены после согласования.</p></div><div><h1><?php echo esc_html(get_the_title()); ?></h1></div></section><?php echo apply_filters('the_content',get_post_field('post_content',get_queried_object_id())); ?><p>Исходный текст старой страницы сохранён для переноса. Профиль материала и обработки нужно согласовать до публикации.</p><section class="container gc-section" id="material-request"></section></main><footer class="ds-footer"><div class="container"><a href="<?php echo esc_url(home_url('/')); ?>">ALFAGLASS</a><a href="<?php echo esc_url(home_url('/#products')); ?>">Изделия</a></div></footer><script src="<?php echo esc_url(get_template_directory_uri().'/agm-glass/app.js'); ?>" defer></script><?php wp_footer(); ?></body></html><?php
$html=agm_order_render(ob_get_clean(),get_post_field('post_name',get_queried_object_id()),false);
echo strtr($html,['__AGM_HOME__'=>esc_url(home_url('/')),'__AGM_ASSETS__'=>esc_url(get_template_directory_uri().'/agm-homepage')]);
