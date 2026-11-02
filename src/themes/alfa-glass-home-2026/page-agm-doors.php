<?php
/** Template Name: ALFAGLASS — двери из стекла */
defined('ABSPATH') || exit;
// Same isolated page shell as Aluminium; retain WordPress SEO and shared theme hooks.
$cleanup = function () {
    foreach (wp_styles()->queue as $handle) {
        if (!in_array($handle, ['admin-bar', 'dashicons', 'sm_theme_style', 'sm_style'], true)) wp_dequeue_style($handle);
    }
    foreach (wp_scripts()->queue as $handle) {
        if (!in_array($handle, ['admin-bar', 'sm_script'], true)) wp_dequeue_script($handle);
    }
};
add_action('wp_enqueue_scripts', $cleanup, PHP_INT_MAX);
add_action('wp_footer', $cleanup, 0);
require_once get_template_directory() . '/inc/agm-aluminium-header.php';
require_once get_template_directory() . '/inc/agm-quote.php';
$url = get_template_directory_uri();
$asset = function ($path) use ($url) {
    return esc_url($url . '/' . $path . '?v=' . filemtime(get_template_directory() . '/' . $path));
};
ob_start();
?><!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
<link rel="stylesheet" href="<?php echo $asset('agm-doors/style.css'); ?>">
<link rel="stylesheet" href="<?php echo $asset('agm-aluminium-catalog/shared-header.css'); ?>">
<script src="<?php echo $asset('agm-aluminium-catalog/shared-header.js'); ?>" defer></script>
<script src="<?php echo $asset('agm-doors/model.js'); ?>" defer></script>
<script src="<?php echo $asset('agm-doors/app.js'); ?>" defer></script>
</head><body id="top">
<?php echo agm_aluminium_header('dveri-iz-stekla', [
    '/#products' => 'Изделия', '/dveri-iz-stekla/' => 'Двери из стекла',
    '/aluminium/peregorodki/' => 'Перегородки', '/materialy/' => 'Материалы', '/#contacts' => 'Контакты'
], '/dveri-iz-stekla/#door-configurator'); ?>
<?php echo file_get_contents(get_template_directory() . '/agm-doors/content.html'); ?>
<footer class="agd-footer"><div class="agd"><span>© ALFAGLASS · Стекольная компания с 2003 года</span><nav aria-label="Навигация в подвале"><a href="/#products">Все изделия</a><a href="/#contacts">Контакты</a><a href="#door-configurator" data-open-quote>Мой расчёт</a><a href="/privacy-policy/">Обработка данных</a></nav></div></footer>
<?php wp_footer(); ?>
</body></html><?php
echo agm_quote_assets(ob_get_clean());
