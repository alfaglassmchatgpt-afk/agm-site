<?php
/**
 * Template section
 * name: configurator
 */
$taxonomy = 'product_category';
$taxonomy_list = get_sub_field('category_select');
$title = wp_kses_post(get_sub_field('block_title'));
?>
<section class="container-fluid configurator mb__section">
	<div class="block__default block__light configurator__wrapper">
		<h2 class="title section__title d-none d-sm-block"><?= $title ?></h2>
		<?php	if ($taxonomy_list):	?>
			<div class="configurator__panes block__default">
				<?php
				foreach ($taxonomy_list as $i => $term_id):
					$term = get_term($term_id, $taxonomy);
					$class = $i === 0 ? '_active' : '';
					$args = array(
						'tax_query' => array(
							array(
								'taxonomy' => $taxonomy,
								'field'    => 'id',
								'terms'    => $term_id,
							),
						),
						'posts_per_page' => 7,
						'orderby' => 'menu_order',
						'order' => 'ASC',
					);
					$products = new WP_Query($args);
					if ($products->have_posts()):
						echo '<div class="tab_pane ' . $class . '" data-id="' . esc_attr($term->slug) . '">';
						foreach ($products->posts as $k => $post):
							setup_postdata($post);
							$class_item = $k === 0 ? '_active' : '';
							$id = get_the_ID();
							$is_active_tab    = ( 0 === $i );
							$is_first_product = ( 0 === $k );
							$is_lcp_candidate = $is_active_tab && $is_first_product;
							$items_loading    = $is_lcp_candidate ? 'eager' : 'lazy';
							$items_class      = $is_lcp_candidate ? '_active' : '';
							$icon_class       = $is_lcp_candidate ? '_active' : '';
							?>
							<div class="gallary <?= esc_attr($class_item) ?>" data-id="<?= esc_attr($id) ?>">
								<div class="items">
									<?= wp_get_attachment_image(get_field('second_img', $id), 'large', false, array(
										'class'    => $items_class,
										'loading'  => 'lazy',
										'decoding' => 'async',
									)) ?>
									<?= get_the_post_thumbnail($id, 'large', array(
										'class'    => '',
										'loading'  => 'lazy',
										'decoding' => 'async',
									)) ?>
								</div>
								<div class="icons">
									<?= wp_get_attachment_image(get_field('second_img', $id), 'thumbnail', false, array(
										'class'    => $icon_class,
										'loading'  => 'lazy',
										'decoding' => 'async',
									)) ?>
									<?= get_the_post_thumbnail($id, 'thumbnail', array(
										'class'    => '',
										'loading'  => 'lazy',
										'decoding' => 'async',
									)) ?>
								</div>
							</div>
							<?php
						endforeach;
						echo '</div>';
					endif;
					wp_reset_postdata();
				endforeach;

				render_slider_btn('d-sm-none');
				?>
			</div>
			<div class="configurator__tabs">
				<p class="title section__title d-sm-none"><?= $title ?></p>
				<div class="configurator__menu">
					<?php
					foreach ($taxonomy_list as $i => $term_id):
						$term = get_term($term_id, $taxonomy);
						$class = $i === 0 ? '_active' : '';
						$args = array(
							'tax_query' => array(
								array(
									'taxonomy' => $taxonomy,
									'field'    => 'id',
									'terms'    => $term_id,
								),
							),
							'posts_per_page' => 7,
							'orderby' => 'menu_order',
							'order' => 'ASC',
						);
						$products = new WP_Query($args);
						if ($products->have_posts()):
							?>
							<div class="category__tab <?= esc_attr($class) ?>" data-target="<?= esc_attr($term->slug) ?>">
								<div class="small__title tab__title"><?= esc_html($term->name) ?></div>
								<div class="tab__content">
									<div class="wrapper">
										<?php
										foreach ($products->posts as $k => $post):
											setup_postdata($post);
											$class_item = $k === 0 ? '_active' : '';
											$id = get_the_ID();
											?>
											<a href="javascript:void(0)" class="tab__link <?= esc_attr($class_item) ?>" data-target="<?= esc_attr($id) ?>">
												<?= get_the_post_thumbnail($id, 'thumbnail') ?>
												<div class="item__name"><?= esc_html(get_the_title()) ?></div>
											</a>
										<?php
										endforeach;
										if ($products->max_num_pages > 1): ?>
											<a href="javascript:void(0)" class="load__more tab__link" data-page="1" data-term="<?= esc_attr($term->slug) ?>">
												<?= wp_get_attachment_image(get_term_meta($term_id, 'product_category_img', true), 'thumbnail') ?>
												<?php get_template_part('template-blocks/icons/link-arrow'); ?>
											</a>
										<?php endif; ?>
									</div>
								</div>
							</div>
						<?php
						endif;
						wp_reset_postdata();
					endforeach;
					?>
				</div>
				<button class="btn btn__full btn__uppercase btn__border btn__hover" data-toggle="popup-open" data-modal-target="configurator-form-modal">
					<span><?= esc_html(get_sub_field('btn_text')) ?></span>
					<span class="item__arrow">
						<span></span>
					</span>
				</button>
			</div>
		<?php
		endif;
		?>
	</div>
	<?= alfa_modal('configurator-form-modal', get_sub_field('form_select')); ?>
</section>
