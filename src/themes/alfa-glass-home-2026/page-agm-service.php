<?php
/** Template Name: Сервис — ALFAGLASS 2026 */
defined('ABSPATH') || exit;
$dir = get_template_directory();
$uri = get_template_directory_uri();
$home = agm_navigation_render(file_get_contents($dir . '/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s', $home, $header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s', $home, $sprite);
$header = preg_replace('/(<a\b[^>]*href=")#([^"]*)"/', '$1' . esc_url(home_url('/')) . '#$2"', $header[0] ?? '');
$header = preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s', '', $header);
$replace = ['__AGM_HOME__' => esc_url(home_url('/')), '__AGM_ASSETS__' => esc_url($uri . '/agm-homepage')];
// Approved service content.
$body = is_readable($dir . '/agm-service/content.html') ? file_get_contents($dir . '/agm-service/content.html') : '';
$body = str_replace('<div class="logo">ALFA<span>GLASS</span></div>', '<a href="' . esc_url(home_url('/')) . '" aria-label="ALFAGLASS — на главную"><img src="' . esc_url($uri . '/agm-homepage/assets/logo-dark.svg') . '" alt="ALFAGLASS — стекольная компания с 2003 года" width="330" height="87" style="display:block;width:260px;max-width:100%;height:auto"></a>', $body);
?><!doctype html><html lang="ru" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script>try{document.documentElement.dataset.theme=localStorage.getItem('alfaglass-home-theme')==='dark'?'dark':'light'}catch(e){}</script>
<?php wp_head(); ?>
<link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-homepage/css/style.css">
<link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-service/service.css?v=20261007">
</head><body id="top" class="agm-service-page"><?php wp_body_open(); ?>
<a class="skip-link" href="#agm-service">Перейти к содержанию</a>
<?php echo strtr(($sprite[0] ?? '') . $header, $replace); ?>
<main id="agm-service"><?php echo str_replace('__SERVICE_ASSETS__', esc_url($uri . '/agm-service'), $body); ?></main>
<script src="<?php echo esc_url($uri); ?>/agm-glass/app.js" defer></script>
<script src="<?php echo esc_url($uri); ?>/agm-service/service.js?v=20261006" defer></script>
<?php wp_footer(); ?></body></html>
