<?php
/**
 * Template section
 * name: partners
 */
?>
<section class="container-full partners mb__section">
	<div class="partners__row">
		<?php if (get_sub_field('block_title')): ?>
			<div>
				<h2 class="small__title"><?= wp_kses_post(get_sub_field('block_title')) ?></h2>
			</div>
		<?php endif; ?>
		
		<?php
		$gallery = get_sub_field('partners_gallary');
		if($gallery): ?>
			<div class="partners__slider">
				<div class="swiper-wrapper">
					<div class="swiper-slide">
						<?php foreach($gallery as $id): ?>
							<?= wp_get_attachment_image($id, 'full'); ?>
						<?php endforeach; ?>
					</div>
					
				</div>
			</div>
		<?php endif; ?>
	</div>
</section>