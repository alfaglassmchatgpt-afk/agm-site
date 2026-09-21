<?php
/**
 * Template section
 * name: projects
 */
?>

<section class="container projects mb__section">
	<h2 class="title section__title"><?= wp_kses_post(get_sub_field('block_title')) ?></h2>
	<div class="block__default">
		<div class="row">
			<div class="col-10 col-sm-12">
				<div class="projects__slider">
					<div class="swiper-wrapper">
						<?php
						$projects = [];
						if (have_rows('projects_dshye')):
							while (have_rows('projects_dshye')): the_row();
								$projects[] = [
									'img' => wp_get_attachment_image(get_sub_field('item_img'), 'full'),
									'address' => esc_html(get_sub_field('item_address')),
									'title' => esc_html(get_sub_field('item_title')),
								];
							endwhile;

							foreach ($projects as $project):
								?>
								<div class="swiper-slide projects__item">
									<div class="item__img">
										<?= $project['img'] ?>
									</div>
									<div class="item__cover"></div>
									<div class="item__address">
										<?php get_template_part('template-blocks/icons/address-point'); ?>
										<span><?= $project['address'] ?></span>
									</div>
									<div class="item__name title middle__title"><?= $project['title'] ?></div>
								</div>
								<?php
							endforeach;
						endif;
						?>
					</div>
				</div>
			</div>
			<div class="col-2 col-sm-12">
				<div class="projects__slider_thumb">
					<div class="swiper-wrapper">
						<?php
						// Ротация массива: перемещаем первый элемент в конец
						if (!empty($projects)) {
							$first_project = array_shift($projects);
							array_push($projects, $first_project);

							foreach ($projects as $project):
								?>
								<div class="swiper-slide projects__item">
									<div class="item__img">
										<?= $project['img'] ?>
									</div>
								</div>
								<?php
							endforeach;
						}
						?>
					</div>
					<div class="slider__btn_next">
						<span class="small__title"><?= esc_html(get_sub_field('btn_text')) ?></span>
						<?php get_template_part('template-blocks/icons/link-arrow'); ?>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>