<?php
/**
 * Template section
 * name: catalog-links
 */
?>

<section class="catalog-links container mb__section">
	<div class="row">
		<?php
		$terms = get_terms(array(
			'taxonomy'   => 'product_category',
			'parent'     => 0,
			'hide_empty' => true, // true вместо 'true' для корректной работы
		));

		if (!empty($terms)): // проверяем наличие терминов
			foreach ($terms as $term):
				// Получаем изображение только если оно есть
				$term_image_id = get_term_meta($term->term_id, 'product_category_img', true);
				$term_image_url = $term_image_id ? wp_get_attachment_image_url($term_image_id, 'full') : ''; 
				$term_link = esc_url(get_term_link($term->term_id));
				?>
				<div class="col-4 col-sm-12">
					<div class="item" style="<?= $term_image_url ? 'background-image: url(' . esc_url($term_image_url) . ');' : ''; ?>">
						<div class="item__inner">
							<h2 class="section__title title">
								<?= esc_html($term->name) ?>
								<span class="small__title">(<?= absint($term->count) ?>)</span>
							</h2>
							<div class="btn__wrapper">
								<a href="<?= $term_link ?>" class="btn btn__full btn__light btn__uppercase">
									<span><?= esc_html__('Перейти в каталог', 'alfa-glass') ?></span>
									<span class="item__arrow"><span></span></span>
								</a>
							</div>
						</div>
					</div>
				</div>
				<?php
			endforeach;
		endif;
		?>
	</div>
</section>