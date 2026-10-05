<?php
/** Template Name: О компании — ALFAGLASS 2026 (черновик) */
defined('ABSPATH') || exit;
$dir = get_template_directory();
$uri = get_template_directory_uri();
$home = agm_navigation_render(file_get_contents($dir . '/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s', $home, $header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s', $home, $sprite);
$header = preg_replace('/(<a\b[^>]*href=")#([^"]*)"/', '$1' . esc_url(home_url('/')) . '#$2"', $header[0] ?? '');
$header = preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s', '', $header);
$body = file_get_contents($dir . '/agm-company/about-2026.html');
$extra = is_readable($dir . '/agm-company/about-extra.html') ? file_get_contents($dir . '/agm-company/about-extra.html') : '';
$replace = ['__AGM_HOME__'=>esc_url(home_url('/')), '__AGM_ASSETS__'=>esc_url($uri . '/agm-homepage'), '__COMPANY_ASSETS__'=>esc_url($uri . '/agm-company')];
?><!doctype html><html lang="ru" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script>try{document.documentElement.dataset.theme=localStorage.getItem('alfaglass-home-theme')==='dark'?'dark':'light'}catch(e){}</script>
<link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-homepage/css/style.css">
<link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-company/company.css">
<link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-company/about-2026.css">
<?php wp_head(); ?></head><body id="top" class="agm-about-page"><?php wp_body_open(); ?>
<a class="skip-link" href="#main">Перейти к содержанию</a>
<?php echo strtr(($sprite[0] ?? '') . $header, $replace); ?>
<main id="main"><?php echo strtr($body, $replace); ?>
<section class="container about-existing"><?php echo strtr($extra, $replace); ?></section>
<?php if (current_user_can('edit_pages')) : ?><aside class="container about-editor"><h2>Черновик: что дополним</h2><p>Этот список виден редакторам. До публикации нужны реальные фото производства и 3–4 выполненных проекта с описанием задачи и материала. Проверить год основания, актуальные направления витражей и фьюзинга, условия посещения, географию доставки, документы и роли команды. Показатели мощности, число клиентов и партнёрские логотипы пока не заявлены.</p></aside><?php endif; ?>
</main><footer class="container about-footer"><a href="<?php echo esc_url(home_url('/')); ?>">ALFAGLASS — на главную</a><a href="#top">Наверх ↑</a></footer>
<script src="<?php echo esc_url($uri); ?>/agm-glass/app.js" defer></script><?php wp_footer(); ?></body></html>
