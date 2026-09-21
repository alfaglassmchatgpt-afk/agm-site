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
$page_id = get_theme_mod('alfa_selected_page_404'); // Замените 123 на ID вашей страницы 404, созданной в Elementor
$page = get_post($page_id);

if ( did_action( 'elementor/loaded' ) && \Elementor\Plugin::instance()->documents->get( $page_id )->is_built_with_elementor() ) {
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
