<?php
/**
 * Template part for displaying products
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Alfa-glass
 */
?>
<section class="container-fluid mb__section product__first-screen">
	<div class="block__default block__light">
		<?php
		echo do_shortcode( '[alfa-breadcrumbs]');
		?>
		<?php
		$hero_image_id  = get_post_thumbnail_id( get_the_ID() );
		$hero_full_url  = $hero_image_id ? wp_get_attachment_url( $hero_image_id ) : '';
		$hero_large_url = $hero_image_id ? wp_get_attachment_image_url( $hero_image_id, 'large' ) : '';
		$hero_image_alt = $hero_image_id ? (string) get_post_meta( $hero_image_id, '_wp_attachment_image_alt', true ) : '';
		$hero_meta      = $hero_image_id ? wp_get_attachment_metadata( $hero_image_id ) : array();
		$hero_width     = isset( $hero_meta['width'] ) ? (int) $hero_meta['width'] : 0;
		$hero_height    = isset( $hero_meta['height'] ) ? (int) $hero_meta['height'] : 0;
		?>
		<div class="row">
			<div class="col-7 col-lg-6 product__img_wrapper d-sm-none">
				<div class="product__img">
                        <?php
                        if ( $hero_full_url && $hero_large_url ) {
                            echo '<a href="' . esc_url( $hero_full_url ) . '" data-fancybox="main">';
                            echo '<img src="' . esc_url( $hero_full_url ) . '" alt="' . esc_attr( $hero_image_alt ) . '" class="attachment-large size-large wp-post-image" fetchpriority="high" decoding="async"';
                            if ( $hero_width ) {
                                echo ' width="' . esc_attr( $hero_width ) . '"';
                            }
                            if ( $hero_height ) {
                                echo ' height="' . esc_attr( $hero_height ) . '"';
                            }
                            echo ' />';
                            echo '</a>';
                        }
                        ?>
				</div>
			</div>
			<div class="col-5 col-lg-6 col-sm-12">
				<div class="product__info">
					<?php
					$title = get_field('title') ? get_field('title') : get_the_title( );
					echo '<h1 class="item__title">'.$title.'</h1>';
					?>
					<div class="product__description small__title">
						<?php //the_content()?>
					</div>
					<div class="product__description">
						<?php echo get_field('pre_text');?>
					</div>
					<div class="product__img d-none d-sm-block">
                        <?php
                        if ( $hero_full_url && $hero_large_url ) {
                            echo '<a href="' . esc_url( $hero_full_url ) . '" data-fancybox="main-mini">';
                            echo '<img src="' . esc_url( $hero_large_url ) . '" alt="' . esc_attr( $hero_image_alt ) . '" class="attachment-large size-large wp-post-image skip-lazy" loading="lazy" decoding="async"';
                            if ( $hero_width ) {
                                echo ' width="' . esc_attr( $hero_width ) . '"';
                            }
                            if ( $hero_height ) {
                                echo ' height="' . esc_attr( $hero_height ) . '"';
                            }
                            echo ' />';
                            echo '</a>';
                        }
                        ?>
					</div>
					<?php
					if(have_rows('atributy')):
						echo '<ul class="product__atributes">';
						while(have_rows('atributy')): the_row();
							echo '<li>'.get_sub_field('item_title').' <span>'.get_sub_field('Item_value').'</span></li>';
						endwhile;
						echo '</ul>';
					endif;
					?>

					<?php
						$price = get_field('price');
						if($price) {
							echo '<div class="product__price">
										<div class="item__title">'.$price.'</div>
										<div class="price__desc">'.get_theme_mod('price_desc' ).'</div>
									</div>';
						}
					?>
					<div class="product__btn-group">
						<button class="btn btn__small btn__border btn__uppercase btn__hover" data-toggle="popup-open" data-modal-target="main-form-modal" title="Оставить заявку">
							<span>Оставить заявку</span>
							<span class="item__arrow">
								<span></span>
							</span>
						</button>
						<div class="shared__wrapper">
							<button class="btn btn__shared">
								<span>Поделиться</span>
								<svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M4.41958e-06 13.1598C-6.84356e-05 14.0337 -0.000112727 14.566 0.0762465 15.0251C0.495908 17.5486 2.57398 19.5277 5.22362 19.9274C5.70573 20.0001 6.26464 20.0001 7.1822 20L13.8178 20C14.7354 20.0001 15.2943 20.0001 15.7764 19.9274C18.426 19.5277 20.5041 17.5486 20.9238 15.0251C21.0001 14.566 21.0001 14.0337 21 13.1598L21 12.0513C21 10.7245 20.539 9.49809 19.7616 8.51237C19.4937 8.17269 18.9874 8.10416 18.6307 8.3593C18.274 8.61445 18.2021 9.09665 18.47 9.43634C19.0445 10.1648 19.3846 11.0691 19.3846 12.0513V13.0769C19.3846 14.0591 19.3821 14.4607 19.3283 14.7845C19.0181 16.6496 17.4821 18.1125 15.5237 18.4079C15.1837 18.4591 14.7621 18.4615 13.7308 18.4615L7.26923 18.4615C6.2379 18.4615 5.81627 18.4591 5.47632 18.4079C3.51789 18.1125 1.98193 16.6496 1.67174 14.7845C1.6179 14.4607 1.61539 14.0591 1.61539 13.0769L1.61539 12.0513C1.61539 11.0691 1.95551 10.1648 2.53003 9.43634C2.79794 9.09665 2.72598 8.61445 2.36931 8.3593C2.01264 8.10416 1.50633 8.17269 1.23843 8.51237C0.461001 9.49809 9.10542e-06 10.7245 9.04123e-06 12.0513L4.41958e-06 13.1598Z" fill="#0E0F0F"/>
									<path d="M5.55942 4.39387C5.28228 4.72677 5.34096 5.2106 5.6905 5.47454C6.04003 5.73849 6.54806 5.6826 6.8252 5.34971L8.33057 3.54154C8.93173 2.81946 9.34483 2.3251 9.69231 1.98925L9.69231 15.1282C9.69231 15.553 10.0539 15.8974 10.5 15.8974C10.9461 15.8974 11.3077 15.553 11.3077 15.1282L11.3077 1.98925C11.6552 2.3251 12.0683 2.81946 12.6694 3.54154L14.1748 5.34971C14.4519 5.6826 14.96 5.73849 15.3095 5.47455C15.659 5.2106 15.7177 4.72677 15.4406 4.39388L13.9046 2.54898C13.3304 1.85924 12.8566 1.29009 12.4325 0.884636C11.9973 0.468561 11.5143 0.123646 10.897 0.0299816C10.7655 0.0100288 10.6329 0 10.5 0C10.3671 0 10.2345 0.0100288 10.103 0.0299816C9.48571 0.123646 9.00268 0.468561 8.56748 0.884634C8.14339 1.29009 7.66958 1.85923 7.09538 2.54896L5.55942 4.39387Z" fill="#0E0F0F"/>
									</svg>
							</button>
							<div class="shared__tooltip">
								<div class="content" role="tooltip" aria-modal="false">
									<div class="decor"></div>
									Ссылка скопирована
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>


		</div>
	</div>











    <?php if ( get_the_content() ) : ?>
    <div class="block__default block__light" style="margin-top: 4rem;">
		<div class="row">
            <div class="col-12">
            <?php the_content()?>
            </div>
		</div>
	</div>
    <?php endif; ?>


	<?php if(get_field('features_on')): 
		echo '<div class="block__default product__features__wrapper">';
		if(have_rows('features_repeater')):
			echo '<div class="product__features__list">';
				while(have_rows('features_repeater')): the_row();
					?>
					<div class="item">
						<div class="small__title">
							<span><?=get_sub_field('item_title')?></span>
							<div class="icon"></div>
						</div>
						<div class="item__content"><?=get_sub_field('Item_content')?></div>
					</div>
					<?php
				endwhile;
			echo '</div>';
		endif;
		echo '</div>';	
	 endif; ?>



</section>
<?php if(get_field('gallary_on')):
	$options = get_field('gallary_options');
	?>
	<section class="container mb__section product__gallary alfa__slider" data-loop="<?=$options['slider_loop']?>" data-speed="<?=$options['slider_speed']?>" data-spaceBetween="<?=$options['slider_space']?>" data-delay="<?=$options['slider_delay']?>">
		<div class="block__header">
			<h2><?= esc_html( get_field('gallary_title') ) ?></h2>
			<div class="btn__group btn__group_slider">
				<div class="btn btn__slider btn__prev">
					<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="30" cy="30" r="29.2772" stroke="#000" stroke-width="1.44565" />
						<path fill-rule="evenodd" clip-rule="evenodd" d="M32.7076 25.2929C33.0981 25.6834 33.0981 26.3166 32.7076 26.7071L29.4147 30L32.7076 33.2929C33.0981 33.6834 33.0981 34.3166 32.7076 34.7071C32.3171 35.0976 31.6839 35.0976 31.2934 34.7071L27.2934 30.7071C26.9029 30.3166 26.9029 29.6834 27.2934 29.2929L31.2934 25.2929C31.6839 24.9024 32.3171 24.9024 32.7076 25.2929Z" fill="#000" />
					</svg>
				</div>
				<div class="btn btn__slider btn__next">
					<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="30" cy="30" r="29.2772" stroke="#000" stroke-width="1.44565" />
						<path fill-rule="evenodd" clip-rule="evenodd" d="M27.2924 25.2929C26.9019 25.6834 26.9019 26.3166 27.2924 26.7071L30.5853 30L27.2924 33.2929C26.9019 33.6834 26.9019 34.3166 27.2924 34.7071C27.6829 35.0976 28.3161 35.0976 28.7066 34.7071L32.7066 30.7071C33.0971 30.3166 33.0971 29.6834 32.7066 29.2929L28.7066 25.2929C28.3161 24.9024 27.6829 24.9024 27.2924 25.2929Z" fill="#000" />
					</svg>

				</div>
			</div>
		</div>
		<?php
		$gallary = get_field('gallary');
		if($gallary): ?>
		<div class="block__content">
			<div class="swiper-wrapper">
				<?php foreach($gallary as $item): ?>   
                <div class="swiper-slide">
                    <?php 
                    // Получаем URL полного изображения
                    $full_img_url = wp_get_attachment_url($item);

                    // Получаем HTML img тега (можно подставить нужный размер)
                    $img_html = wp_get_attachment_image($item, 'full');
                    ?>

                    <a href="<?= esc_url($full_img_url) ?>" data-fancybox="pgallery">
                    <?= $img_html ?>
                    </a>
                </div>
				<?php endforeach; ?>
			</div>
		</div>
		<?php endif; ?>
		
	</section>
<?php endif; ?>

<?php if(get_field('advice_on')):
	$options = get_field('advice_options');
	?>
	<section class="mb__section product__advice alfa__slider" data-loop="<?=$options['slider_loop']?>" data-speed="<?=$options['slider_speed']?>" data-spaceBetween="<?=$options['slider_space']?>" data-delay="<?=$options['slider_delay']?>">
		<div class="container">
			<div class="block__header">
				<h2><?= esc_html( get_field('advice_title') ) ?></h2>
				<div class="btn__group btn__group_slider d-none d-sm-flex">
					<div class="btn btn__slider btn__prev">
						<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="30" cy="30" r="29.2772" stroke="#000" stroke-width="1.44565" />
							<path fill-rule="evenodd" clip-rule="evenodd" d="M32.7076 25.2929C33.0981 25.6834 33.0981 26.3166 32.7076 26.7071L29.4147 30L32.7076 33.2929C33.0981 33.6834 33.0981 34.3166 32.7076 34.7071C32.3171 35.0976 31.6839 35.0976 31.2934 34.7071L27.2934 30.7071C26.9029 30.3166 26.9029 29.6834 27.2934 29.2929L31.2934 25.2929C31.6839 24.9024 32.3171 24.9024 32.7076 25.2929Z" fill="#000" />
						</svg>
					</div>
					<div class="btn btn__slider btn__next">
						<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="30" cy="30" r="29.2772" stroke="#000" stroke-width="1.44565" />
							<path fill-rule="evenodd" clip-rule="evenodd" d="M27.2924 25.2929C26.9019 25.6834 26.9019 26.3166 27.2924 26.7071L30.5853 30L27.2924 33.2929C26.9019 33.6834 26.9019 34.3166 27.2924 34.7071C27.6829 35.0976 28.3161 35.0976 28.7066 34.7071L32.7066 30.7071C33.0971 30.3166 33.0971 29.6834 32.7066 29.2929L28.7066 25.2929C28.3161 24.9024 27.6829 24.9024 27.2924 25.2929Z" fill="#000" />
						</svg>
	
					</div>
				</div>
			</div>
		</div>
		<?php
		$products_list = get_field('products_list');
		$args = array (
			'posts_per_page'	=> 4,
			'post_type' => 'product',
			'post__in' => $products_list,
			'post__not_in' => [get_the_ID(  )],
			'orderby'		=> 'post__in'
		);
		
		$products = new WP_Query($args);
		if($products->have_posts()): ?>
		<div class="block__content">
			<div class="swiper-wrapper">
				<?php while($products->have_posts()): $products->the_post(); ?>		
				<div class="swiper-slide">
					<div class="advice__item item">
						<div class="item__img"><?= get_the_post_thumbnail(get_the_ID(), 'medium')?></div>
						<?php
						$terms = get_the_terms(get_the_ID(), 'product_category');
						if ($terms && !is_wp_error($terms)) {
								foreach ($terms as $term) {
									if ($term->parent != 0) { // Проверка на дочерний термин
										// Выводим название первого дочернего термина
										echo '<div class="item__category">'.esc_html($term->name).'</div>';
										break; // Прерываем цикл после нахождения первой дочерней категории
									}
								}
						}
						?>
						<div class="item__title">
							<h3 class="small__title"><?= get_the_title( ) ?></h3>
							<span class="item__arrow">
								<span></span>
							</span>
						</div>
						<a href="<?= get_the_permalink()?>" class="item__link"></a>
					</div>

				</div>
				<?php endwhile; ?>
			</div>
		</div>
		<?php endif; 
		wp_reset_postdata(  );
		?>
		
	</section>
<?php endif; ?>

<?php if(get_field('uses_on')):
	$options = get_field('uses_options'); ?>
	<section class="container mb__section product__uses alfa__slider" data-loop="<?=$options['slider_loop']?>" data-speed="<?=$options['slider_speed']?>" data-spaceBetween="<?=$options['slider_space']?>" data-delay="<?=$options['slider_delay']?>">
		<div class="block__header">
			<div>
				<div class="small__title"><?= esc_html( get_field('uses_subtitle') ) ?></div>
				<h2><?= esc_html( get_field('uses_title') ) ?></h2>
			</div>
			<div class="btn__group btn__group_slider d-none d-sm-flex">
				<div class="btn btn__slider btn__prev">
					<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="30" cy="30" r="29.2772" stroke="#000" stroke-width="1.44565" />
						<path fill-rule="evenodd" clip-rule="evenodd" d="M32.7076 25.2929C33.0981 25.6834 33.0981 26.3166 32.7076 26.7071L29.4147 30L32.7076 33.2929C33.0981 33.6834 33.0981 34.3166 32.7076 34.7071C32.3171 35.0976 31.6839 35.0976 31.2934 34.7071L27.2934 30.7071C26.9029 30.3166 26.9029 29.6834 27.2934 29.2929L31.2934 25.2929C31.6839 24.9024 32.3171 24.9024 32.7076 25.2929Z" fill="#000" />
					</svg>
				</div>
				<div class="btn btn__slider btn__next">
					<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="30" cy="30" r="29.2772" stroke="#000" stroke-width="1.44565" />
						<path fill-rule="evenodd" clip-rule="evenodd" d="M27.2924 25.2929C26.9019 25.6834 26.9019 26.3166 27.2924 26.7071L30.5853 30L27.2924 33.2929C26.9019 33.6834 26.9019 34.3166 27.2924 34.7071C27.6829 35.0976 28.3161 35.0976 28.7066 34.7071L32.7066 30.7071C33.0971 30.3166 33.0971 29.6834 32.7066 29.2929L28.7066 25.2929C28.3161 24.9024 27.6829 24.9024 27.2924 25.2929Z" fill="#000" />
					</svg>

				</div>
			</div>
		</div>
		<?php
		$uses_list = get_field('uses_list');
		if(!empty($uses_list)): ?>
			<div class="block__content">
				<div class="swiper-wrapper">
					<?php
					foreach($uses_list as $term_id):
						$term = get_term( $term_id, 'product_category' );
						if ( ! $term || is_wp_error( $term ) ) {
							continue;
						}
						$term_link = get_term_link( $term );
						if ( is_wp_error( $term_link ) ) {
							continue;
						}
						$term_name = $term->name;
						$term_img = get_term_meta($term_id, 'product_category_img', true);
						$term_img_url = wp_get_attachment_image_url( $term_img, 'full' );
						?>
							<div class="swiper-slide uses__item item" style="background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.00) 60%, rgba(0, 0, 0, 0.40) 95.19%), url(<?= esc_url( $term_img_url ) ?>)">						
								<div class="item__title">
									<h3 class="small__title"><?= esc_html( $term_name ) ?></h3>
									<span class="item__arrow"><span></span></span>
								</div>
								<a href="<?= esc_url( $term_link ) ?>" class="item__link"></a>
							</div>	
					<?php	endforeach;	?>
				</div>
			</div>
		<?php endif; ?>		
	</section>
<?php endif; ?>