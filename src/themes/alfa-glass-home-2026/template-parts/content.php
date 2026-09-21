<?php
/**
 * Template part for displaying posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Alfa-glass
 */



if(is_single()):
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<div class="entry-content">
		<?php alfa_render_page_h1(); ?>
		<?php
		the_content(
			sprintf(
				wp_kses(
					/* translators: %s: Name of current post. Only visible to screen readers */
					__( 'Continue reading<span class="screen-reader-text"> "%s"</span>', 'alfa-glass' ),
					array(
						'span' => array(
							'class' => array(),
						),
					)
				),
				wp_kses_post( get_the_title() )
			)
		);		
		?>
	</div><!-- .entry-content -->
</article><!-- #post-<?php the_ID(); ?> -->

<?php else: ?>
<div class="item">
	<a href="<?= esc_url( get_permalink())?>" class="item__link">
		<div class="item__hover">
			<span class="read__more">
				<?= esc_html__( 'Читать больше', 'alfa-glass' ) ?>
				<?php get_template_part('template-blocks/icons/link-arrow'); ?>
			</span>
		</div>

        <div class="item__img">
        <?php 
            if ( has_post_thumbnail() ) {
            echo get_the_post_thumbnail( get_the_ID(), 'full' );
            } else {
            // Путь к изображению-заглушке, например, 'images/placeholder.png'
            $placeholder_image = get_template_directory_uri() . '/img/noimage.jpg';
            echo '<img src="' . esc_url( $placeholder_image ) . '" >';
            }
        ?>
        </div>

	</a>
	<h2 class="small__title"><?=get_the_title()?></h2>
	<a href="<?= esc_url( get_permalink())?>" class="read__more read__more_mobile">
		<?= esc_html__( 'Читать больше', 'alfa-glass' ) ?>
		<?php get_template_part('template-blocks/icons/link-arrow'); ?>
	</a>
</div>
<?php endif;
