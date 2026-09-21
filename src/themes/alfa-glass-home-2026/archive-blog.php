<?php
/**
 * The template for displaying archive pages
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Alfa-glass
 */

get_header();
$args = array(
    'numberposts' => -1,
    'post_type'   => 'post',
    'post_status' => 'publish',
);
$items = get_posts($args);
$i = 1;
?>
<?php if(!empty($items)) { ?>
<main id="primary" class="site-main blog">
    <div class="container-fluid mb__section">
		<div class="block__default block__light">
            <?= do_shortcode( '[alfa-breadcrumbs]');?>
			<?php
			$blog_page_id = get_option('page_for_posts');
			if ($blog_page_id) {
				$blog_page_title = get_the_title($blog_page_id);
				echo '<h1>' . esc_html($blog_page_title) . '</h1>';
			}
            ?>
			<div class="row blog__list">
                <?php foreach($items as $item) {
                    $img = get_the_post_thumbnail_url($item);
                    $title = $item->post_title;
                    $link = get_the_permalink($item);
                    $class = ($i === 1 || $i === 10) ? 'col-6 item__wide' : 'col-3';
                ?>
                    <div class="<?=$class?>">
                        <div class="item">
                            <a href="<?= esc_url( $link)?>" class="item__link">
                                <div class="item__hover">
                                    <span class="read__more">
                                        <?= esc_html__( 'Читать больше', 'alfa-glass' ) ?>
                                        <?php get_template_part('template-blocks/icons/link-arrow'); ?>
                                    </span>
                                </div>
                                <?php if(!empty($img)) { ?>
                                <div class="item__img"><img src="<?=$img?>" alt=""></div>
                                <?php } ?>
    
                            </a>
                            <h2 class="small__title"><?=$title?></h2>
                            <a href="<?= esc_url( $link)?>" class="read__more read__more_mobile">
                                <?= esc_html__( 'Читать больше', 'alfa-glass' ) ?>
                                <?php get_template_part('template-blocks/icons/link-arrow'); ?>
                            </a>
                        </div>
                    </div>
                <?php $i++; } ?>
			</div>
		</div>			
	</div>
</main>
<?php } ?>
<?php
get_footer();
