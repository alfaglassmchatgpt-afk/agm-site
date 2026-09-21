<?php
/**
 * Template section
 * name: cooperation
 */
?>
<section id="cooperation" class="container-full cooperation mb__section">
	<div class="cooperation__grid">
		<div class="grid__item cooperation__link">
			<?php
			$cooperation_link = get_sub_field('cooperation_link');
			$cooperation_link_img = wp_get_attachment_image_url(get_sub_field('cooperation_link_img'), 'full');
			?>
			<a href="<?= esc_url($cooperation_link['url']) ?>" class="wrapper" style="background-image: url(<?= esc_url($cooperation_link_img) ?>);">
				<div class="icon">
					<?= wp_get_attachment_image(get_sub_field('cooperation_link_icon'), 'full') ?>
				</div>
				<div class="small__title"><?= esc_html($cooperation_link['title']) ?></div>
				<div class="decor__vector"></div>
			</a>
		</div>
		<div class="grid__item cooperation__content">
			<h2 class="title section__title"><?= wp_kses_post(get_sub_field('block_title')) ?></h2>
			<div class="description">
				<?= wp_kses_post(get_sub_field('description')) ?>
				<?= render_cooperation_button(get_sub_field('cooperation_btn_modal_text'), 'd-sm-none') ?>
			</div>
		</div>
		<?php
		if (have_rows('cooperation_list')) :
			while (have_rows('cooperation_list')) : the_row();
				$item_icon = wp_get_attachment_image(get_sub_field('item_icon'), 'full');
				$item_title = esc_html(get_sub_field('item_title'));
				?>
				<div class="grid__item cooperation__item">
					<div class="item__icon"><?= $item_icon ?></div>
					<div class="small__title"><?= $item_title ?></div>
				</div>
				<?php
			endwhile;
		endif;
		?>
		<?= render_cooperation_button(get_sub_field('cooperation_btn_modal_text'), 'd-none d-sm-flex') ?>
	</div>
	<?= alfa_modal('cooperation-form-modal', get_sub_field('cooperation_form_select')); ?>
</section>

<?php
function render_cooperation_button($button_text, $classes) {
	return '<button class="btn btn__full btn__light btn__uppercase btn__hover btn__border ' . esc_attr($classes) . '" data-toggle="popup-open" data-modal-target="cooperation-form-modal">
		<span>' . esc_html($button_text) . '</span>
		<span class="item__arrow"><span></span></span>
	</button>';
}