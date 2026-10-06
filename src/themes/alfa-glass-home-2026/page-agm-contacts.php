<?php
/** Template Name: Контакты — ALFAGLASS 2026 */
defined('ABSPATH') || exit;
$dir = get_template_directory();
$uri = get_template_directory_uri();
$home = agm_navigation_render(file_get_contents($dir . '/agm-homepage/index.html'));
preg_match('/<header class="site-header">.*?<\/header>/s', $home, $header);
preg_match('/<svg[^>]*class="svg-library".*?<\/svg>/s', $home, $sprite);
$header = preg_replace('/(<a\b[^>]*href=")#([^"]*)"/', '$1' . esc_url(home_url('/')) . '#$2"', $header[0] ?? '');
$header = preg_replace('/<button class="icon-button search-toggle".*?<\/button>/s', '', $header);
$replace = ['__AGM_HOME__' => esc_url(home_url('/')), '__AGM_ASSETS__' => esc_url($uri . '/agm-homepage')];
// Approved business contact content is maintained privately, outside the public repository.
$body = is_readable($dir . '/agm-contacts/content.html') ? file_get_contents($dir . '/agm-contacts/content.html') : '';
?><!doctype html><html lang="ru" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script>try{document.documentElement.dataset.theme=localStorage.getItem('alfaglass-home-theme')==='dark'?'dark':'light'}catch(e){}</script>
<?php wp_head(); ?>
<link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-homepage/css/style.css">
<link rel="stylesheet" href="<?php echo esc_url($uri); ?>/agm-contacts/contacts.css?v=20261006">
</head><body id="top" class="agm-contacts-page"><?php wp_body_open(); ?>
<a class="skip-link" href="#agm-contacts">Перейти к содержанию</a>
<?php echo strtr(($sprite[0] ?? '') . $header, $replace); ?>
<main id="agm-contacts"><?php echo $body; ?></main>
<script src="<?php echo esc_url($uri); ?>/agm-glass/app.js" defer></script>
<script src="<?php echo esc_url($uri); ?>/agm-contacts/contacts.js?v=20261006" defer></script>
<?php wp_footer(); ?></body></html>
