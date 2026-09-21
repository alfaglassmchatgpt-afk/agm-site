<?php
/**
 * Template section
 * name: advantages
 */

$items = get_sub_field('advantages_list');
$foto_1 = wp_get_attachment_image(get_sub_field('foto_1'), 'medium');
$foto_2 = wp_get_attachment_image(get_sub_field('foto_2'), 'medium');
?>

<section class="container-full advantages mb__section">
	<div class="row">
		<div class="col-12 d-none d-sm-block swiper__navigation">
			<?= $foto_1 ?>
			<?php render_slider_btn(); ?>
		</div>
	</div>
	<div class="row swiper-wrapper advantages__grid">
		<?php
		

		if (!empty($items)):
			foreach ($items as $index => $item):
				// Пропускаем итерацию, если данные отсутствуют
				if (empty($item['item_title']) || empty($item['item_text'])) {
					continue;
				}

				// Нумерация начинается с 1
				$count = str_pad($index + 1, 2, '0', STR_PAD_LEFT);
				?>
				<div class="swiper-slide advantages__item advantages__item_text">
					<div class="item__count">(<?= $count ?>)</div>
					<div class="item__name small__title"><?= esc_html($item['item_title']) ?></div>
					<div class="item__desc"><?= wp_kses_post($item['item_text']) ?></div>
				</div>
				<?php
				// Вставка фото между слайдами
				if ($index === 1): // После второго элемента выводим фото 1 для мобильных
					?>
					<div class="d-sm-none  advantages__item advantages__item_img">
						<?= $foto_1 ?>
					</div>
					<?php
				elseif ($index === 2): // После третьего элемента выводим фото 2 для мобильных
					?>
					<div class="d-sm-none advantages__item advantages__item_img">
						<?= $foto_2 ?>
					</div>
					<?php
				endif;
			endforeach;
		endif;
		?>
	</div>
</section>