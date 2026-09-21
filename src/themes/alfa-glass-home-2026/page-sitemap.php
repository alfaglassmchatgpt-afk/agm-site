<?php
/**
 * Template Name: HTML-карта сайта
 *
 * @package Alfa-glass
 */

get_header();
?>

<main id="primary" class="site-main">
	<section class="container-fluid mb__section">
		<div class="block__default block__light">
			<?php echo do_shortcode( '[alfa-breadcrumbs]' ); ?>
			<h1 class="page-title"><?php esc_html_e( 'Карта сайта', 'alfa-glass' ); ?></h1>
			<?php ag_render_html_sitemap(); ?>
		</div>
	</section>
</main>

<?php
get_footer();
