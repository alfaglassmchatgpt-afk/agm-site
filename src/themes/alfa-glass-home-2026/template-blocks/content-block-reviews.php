<?php
/**
 * Template section
 * name: reviews
 */
$title = wp_kses_post(get_sub_field('block_title'));
$reviews_type = get_sub_field('ruchnaya_nastrojka_yandeks_vidzhet');

if($reviews_type == 1):
	$group = get_sub_field('ruchnaya_nastrojka_otzyvov');
	$load_more_text = esc_html( $group['reviews_load_more_text'] );
	$link = $group['reviews_link'];
	$reviews = $group['reviews_list'];
	?>
<section id="reviews" class="reviews mb__section">
	<div class="reviews__header">
		<?php if($title): ?>
			<h2 class="section__title"><?=$title?></h2>
		<?php endif;?>

		<button class="btn__load d-sm-none" data-toggle="popup-open" data-modal-target="modal-reviews">
			<?php get_template_part('template-blocks/icons/load-more')?>
			<span data-text="<?=$load_more_text?>"><?=$load_more_text?></span>
		</button>

		<a href="<?=esc_url( $link['url'])?>" class="btn btn__uppercase btn__small btn__hover btn__border d-sm-none" target="<?=esc_attr( $link['target'] )?>"><span><?=esc_html( $link['title'] )?></span><div class="item__arrow"><span></span></div></a>

	</div>
	<div class="reviews__body">
		<?php
		function get_item_review($item, $i) {
			$type = $item['acf_fc_layout'];
			if($type === 'video'):
				?>
				<div class="reviews__item reviews__item_video">
					<div class="reviews__item_video-wrapper">
						<video poster="<?=esc_url($item['item_poster'])?>">
							<source src="<?=esc_url($item['item_video'])?>" type="video/mp4">
						</video>
						<div class="reviews__item_video-elements">
							<button class="btn__video">
								<?php get_template_part('template-blocks/icons/btn-video')?>
							</button>
							<div class="item__date"><?=esc_html( $item['item_date'] )?></div>
							<div class="item__name small__title"><?=esc_html( $item['item_title'] )?></div>
						</div>
					</div>
				</div>
				<?php
			else:
				?>
				<div class="reviews__item reviews__item_text">
					<div class="item__header">
						<div class="item__icon">
							<?=wp_get_attachment_image( $item['item_img'], 'thumbnail' )?>
						</div>
						<div class="item__info">
							<div class="item__date"><?=esc_html( $item['item_date'] )?></div>
							<div class="item__name small__title"><?=esc_html( $item['item_title'] )?></div>
						</div>
					</div>
					<div class="item__content small__title">
						<?=wp_trim_words($item['item_text'], 25, '...')?>
					</div>
					<div class="item__link">
						<a href="javascript:void(0)" data-toggle="popup-open" data-modal-target="modal-reviews" data-index="<?=$i?>">
							<span><?=esc_html( get_sub_field('reviews_load_item_text') )?></span>
							<svg width="9" height="7" viewBox="0 0 9 7" fill="none">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M5.54057 0.157227L8.3641 3.15723C8.5453 3.34975 8.5453 3.65007 8.3641 3.84259L5.54057 6.84259L4.81237 6.15723L6.84279 3.99991H0V2.99991H6.84279L4.81237 0.842591L5.54057 0.157227Z" fill="#0E0F0F" />
							</svg>
						</a>
					</div>
				</div>
				<?php
			endif;

		}
		?>

		<?php ?>
			<div class="reviews__wrapper">
				<?php get_item_review($reviews[0], 0)?>				
			</div>
			<div class="reviews__wrapper">
				<?php get_item_review($reviews[1], 1)?>
			</div>
			<div class="d-lg-none reviews__wrapper">
				<?php get_item_review($reviews[2], 2)?>
			</div>
	</div>
	<div class="reviews__footer d-none d-sm-block">
		<button class="btn__load" data-toggle="popup-open" data-modal-target="modal-reviews">
			<?php get_template_part('template-blocks/icons/load-more')?>
			<span><?=$load_more_text?></span>
		</button>
		<a href="<?=esc_url( $link['url'])?>" class="btn btn__uppercase btn__small btn__hover btn__border" target="<?=esc_attr( $link['target'] )?>"><span><?=esc_html( $link['title'] )?></span><div class="item__arrow"><span></span></div></a>
	</div>
	<div id="modal-reviews" class="modal">
		<div class="modal__dialog">
			<span class="close">
				<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
					<path d="M1 1L11 11M21 21L11 11M11 11L21 1L1 21" stroke="black" stroke-width="1.6" />
				</svg>
			</span>
			<div class="modal__content">
				<div class="reviews__slider">
					<div class="swiper-wrapper">
						<?php
						if(have_rows('reviews_list')):
							while(have_rows('reviews_list')):
								the_row();
								if(get_row_layout()=='video'):
									?>
									<div class="swiper-slide reviews__item reviews__item_video">
										<div class="reviews__item_video-wrapper">
											<video poster="<?=esc_url(get_sub_field('item_poster'))?>">
												<source src="<?=esc_url(get_sub_field('item_video'))?>" type="video/mp4">
											</video>
											<div class="reviews__item_video-elements">
												<button class="btn__video">
													<svg width="112" height="112" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
														<circle cx="56" cy="56" r="55.5" stroke="white" />
														<path d="M46.9995 42L70.9995 56L46.9995 70V42Z" fill="white" />
													</svg>
												</button>
												<div class="item__date"><?=esc_html( get_sub_field('item_date') )?></div>
												<div class="item__name small__title"><?=esc_html( get_sub_field('item_title') )?></div>
											</div>
										</div>
									</div>
									<?php
								else:
									?>
									<div class="swiper-slide reviews__item reviews__item_text">
										<div class="item__header">
											<div class="item__icon">
												<?=wp_get_attachment_image( get_sub_field('item_img'), 'thumbnail' )?>
											</div>
											<div class="item__info">
												<div class="item__date"><?=esc_html( get_sub_field('item_date') )?></div>
												<div class="item__name small__title"><?=esc_html( get_sub_field('item_title') )?></div>
											</div>
										</div>
										<div class="item__content small__title">
											<?=wp_kses_post( get_sub_field('item_text'))?>
										</div>
										
									</div>
									<?php
								endif;
							endwhile;
						endif;
						?>
					</div>
					<div class="slider__nav">
						<div class="btn_nav btn_prev">
							<svg width="6" height="12" viewBox="0 0 6 12" fill="none">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M4.21388 0.206055L5.02262 0.794226L1.2365 6.00014L5.02262 11.2061L4.21388 11.7942L0 6.00014L4.21388 0.206055Z" fill="black" />
							</svg>
							<span><?=__('Предыдущий отзыв', 'alfa-glass')?></span>
						</div>
						<div class="btn_nav btn_next">
							<span><?=__('Следующий отзыв', 'alfa-glass')?></span>
							<svg width="6" height="12" viewBox="0 0 6 12" fill="none">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M0.80858 11.7939L-0.000155397 11.2058L3.78596 5.99986L-0.000154487 0.793945L0.808581 0.205774L5.02246 5.99986L0.80858 11.7939Z" fill="black" />
							</svg>

						</div>
					</div>
				</div>
			</div>
		</div>

	</div>
</section>
<?php else:
	$group = get_sub_field('vidzhet');
	$html_vidget = $group['kod_vidzheta'] ?? '';
	$widget_image_id = (int) get_sub_field( 'izobrazhenie_vidzheta' );
	$html_vidget = preg_replace( '/width\s*:\s*100vw/i', 'width:100%', $html_vidget );
	$html_vidget = preg_replace( '/\bwidth\s*:\s*\d+px/i', 'width:100%', $html_vidget );
	$html_vidget = preg_replace( '/margin-top\s*:\s*[^;"]+;?/i', '', $html_vidget );
	$widget_html = strip_tags( $html_vidget, '<div><span><a><img><br><strong><em><ul><ol><li><h3><h4><h5><h6><table><tr><td><th><thead><tbody><iframe><script></script>' );
	$section_class = 'container reviews-vidget mb__section';
	if ( ! $widget_image_id ) {
		$section_class .= ' reviews-vidget--no-image';
	}
	?>
	<section id="reviews" class="<?= esc_attr( $section_class ) ?>">
		<div class="reviews-vidget__grid">
			<?php if ( $title ) : ?>
				<h2 class="title section__title reviews-vidget__title"><?= $title ?></h2>
			<?php endif; ?>
			<?php if ( $widget_image_id ) : ?>
			<div class="reviews-vidget__image">
				<?= wp_get_attachment_image( $widget_image_id, 'large', false, array( 'loading' => 'lazy' ) ) ?>
			</div>
			<?php endif; ?>
			<div class="reviews-vidget__widget">
				<?= $widget_html ?>
			</div>
		</div>
	</section>
	<?php
endif;?>







<?php /* вёрстка от секции "Блог" которая чуть выше */?>
<!-- <section class="container-fluid blog mb__section">
	<div class="block__default block__light">
		<div class="row blog__header">
			<div class="col-9 col-lg-8 col-sm-6">
				<h2 class="title section__title">Реальные отзывы о нас</h2>

                
			</div>
			<div class="col-3 col-lg-4 col-sm-6">

			</div>
		</div>
		<div class="blog__slider">
			<div class="row blog__list swiper-wrapper">
				
                <script src="https://res.smartwidgets.ru/app.js" defer></script>
                <div class="sw-app" data-app="897d022352c9ff7b4153166c2725f298"></div>				
				
			</div>
		</div>
	</div>
</section> -->