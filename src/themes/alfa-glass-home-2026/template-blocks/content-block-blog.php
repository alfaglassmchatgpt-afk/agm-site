<?php
/**
 * Template section
 * name: blog
 */
$btn_text = esc_html( get_sub_field('btn_more_text') );
$posts_list = get_sub_field('post_list');
?>
<section class="container-fluid blog mb__section">
	<div class="block__default block__light">
		<div class="row blog__header">
			<div class="col-9 col-lg-8 col-sm-6">
				<h2 class="title section__title"><?=wp_kses_post(get_sub_field('block_title'))?></h2>
			</div>
			<div class="col-3 col-lg-4 col-sm-6">
				<?= render_blog_link($btn_text, 'd-sm-none') ?>
				<?php render_slider_btn('d-none d-sm-flex')?>				
			</div>
		</div>
		<?php
		$args = array(
			'post_type'      	=> 'post',
			'posts_per_page' 	=> 4,
			'orderby'			=> 'menu_order',
      	'order'				=> 'ASC',
			'post_status'    	=> 'publish',
		);
		if($posts_list){
			$args['post__in'] = $posts_list;
			$args['orderby']	= 'post__in';
		}

		$posts = new WP_Query($args);
		if($posts->have_posts()):
			?>
			<div class="blog__slider">
			<div class="row blog__list swiper-wrapper">
				<?php
				while($posts->have_posts()):
					$posts->the_post();
					?>
					<div class="col-3 col-sm-12 swiper-slide blog__slide">
						<div class="item">
							<a href="<?=the_permalink()?>" class="item__link">
								<div class="item__hover">
									<span class="read__more">
										<?=$btn_text?>
										<?php get_template_part('template-blocks/icons/link-arrow'); ?>
									</span>
								</div>
								<div class="item__img">
									<?php  the_post_thumbnail( 'medium');?>
								</div>
							</a>
							<h3 class="small__title"><?php the_title(); ?></h3>
						</div>
					</div>	
					<?php
				endwhile;
				?>						
			</div>
		</div>
			<?php
		endif;
		wp_reset_postdata();
		?>
		<?= render_blog_link($btn_text, 'd-none d-sm-flex') ?>		
	</div>
</section>
<?php
function render_blog_link($btn_text, $classes) {
	return '<a href="'.get_permalink( get_option( 'page_for_posts' ) ).'" class="btn btn__uppercase btn__hover btn__border ' . esc_attr($classes) . '">
			<span>'.$btn_text.'</span>
			<div class="item__arrow">
				<span></span>
			</div>
		</a>';
	
}