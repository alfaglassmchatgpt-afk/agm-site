<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
 *
 * @package Alfa-glass
 */

get_header();
?>

	<main id="primary" class="site-main">

		<?php
// Получаем содержимое страницы 404 по её ID
// A deleted or unconfigured Elementor page has no document.
$page_id = absint(get_theme_mod('alfa_selected_page_404'));
$document = null;
if ($page_id && did_action('elementor/loaded')) {
    $document = \Elementor\Plugin::instance()->documents->get($page_id);
}

if ($document && $document->is_built_with_elementor()) {
    // Если страница создана в Elementor, рендерим её
    echo \Elementor\Plugin::instance()->frontend->get_builder_content_for_display( $page_id );
} else {
    // Если Elementor не активен, выводим стандартный шаблон 404
    ?>
    <h1>404 - Страница не найдена</h1>
    <p>К сожалению, мы не можем найти запрашиваемую страницу.</p>
    <?php
}
?>

	</main><!-- #main -->

<?php
get_footer();
