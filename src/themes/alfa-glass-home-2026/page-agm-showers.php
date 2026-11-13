<?php
/** Template Name: ALFAGLASS — душевые перегородки */
defined('ABSPATH') || exit;
$description = 'Душевые перегородки из стекла на заказ: для ниши и угловой душевой, без двери, с распашной или раздвижной створкой. Выберите стекло и рассчитайте проект по своим размерам.';
add_filter('wpseo_metadesc', static function () use ($description) { return $description; });
if (!defined('WPSEO_VERSION')) {
    add_action('wp_head', static function () use ($description) {
        echo '<meta name="description" content="' . esc_attr($description) . '">';
    }, 2);
}
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
<link rel="stylesheet" href="<?php echo $asset('agm-showers/style.css'); ?>">
<script src="<?php echo $asset('agm-showers/app.js'); ?>" defer></script>
</head><body id="top">
<?php echo agm_aluminium_header('dushevye-peregorodki-iz-stekla', [
    '/#products' => 'Изделия', '/dushevye-peregorodki-iz-stekla/' => 'Душевые перегородки', '/dveri-iz-stekla/' => 'Двери из стекла',
    '/aluminium/peregorodki/' => 'Перегородки', '/materialy/' => 'Материалы', '/#contacts' => 'Контакты'
], '/dushevye-peregorodki-iz-stekla/#shower-configurator'); ?>
<?php echo file_get_contents(get_template_directory() . '/agm-showers/content.html'); ?>
<footer class="agd-footer"><div class="agd"><span>© ALFAGLASS · Стекольная компания с 2003 года</span><nav aria-label="Навигация в подвале"><a href="/#products">Все изделия</a><a href="/#contacts">Контакты</a><a href="#shower-configurator" data-open-quote>Мой расчёт</a><a href="/privacy-policy/">Обработка данных</a></nav></div></footer>
<?php wp_footer(); ?>
</body></html><?php
echo agm_quote_assets(ob_get_clean());
