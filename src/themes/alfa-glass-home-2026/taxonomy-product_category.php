<?php
/**
 * The template for displaying archive pages
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Alfa-glass
 */

get_header();

$term = get_queried_object();
$taxonomy = $term->taxonomy;
if ( $term && $term->parent ) {
    // Получаем родительский терм
    $parent_term = get_term( $term->parent, $taxonomy );

   //  if ( ! is_wp_error( $parent_term ) ) {
   //      // Выводим имя родительского терма
   //      $term = $parent_term;
   //  }
} else {
	$parent_term = $term;
}
$term_id = $term->term_id;

$term_name = get_term_meta( $term_id, 'product_category_title', true ) ? get_term_meta( $term_id, 'product_category_title', true ) : single_term_title('', 0);



$term_style = get_term_meta( $term_id, 'product_category_style', true );
//$term_style = 'style1';

?>
<main id="primary" class="site-main">
	<section class="container-fluid mb__section category__first-screen">
		<div class="block__default block__light">

			<?= do_shortcode( '[alfa-breadcrumbs]');?>
			<h1 class="page-title"><?= $term_name ?></h1>
			<?php
           

			$term_subtitle = get_term_meta( $term_id, 'product_category_subtitle', true );
			if($term_subtitle) echo '<div>'.$term_subtitle.'</div>';
			?>
			<div class="category__filter" data-grabbing="true">
				<?php
				$child_terms = get_terms( array(
					'taxonomy'		=> $taxonomy,
					'parent'		=> $parent_term->term_id,
					'hide_empty'	=> 'true'
				));
				if(!empty($child_terms) && !is_wp_error($child_terms)) {
					echo '<ul>';
					$parent_active = $term==$parent_term ? '_active': ''; 
					echo '<li class="'.$parent_active.'" data-target="all"><a href="'.get_term_link( $parent_term ).'">'.__('Все', 'alfa-glass').'</a></li>';
					foreach($child_terms as $child_term) {
						$child_active = $term_id == $child_term->term_id ? '_active': '';
						echo '<li class="'.$child_active.'" data-target="'.$child_term->term_id.'"><a href="'.get_term_link( $child_term ).'">'.$child_term->name.'</a></li>';
					}
					echo '</ul>';
				}
				?>
			</div>
		</div>
	</section>
	<?php
	if($parent_term != $term) {
		$child_terms = array($term);
	}
	if ( ! empty( $child_terms ) && ! is_wp_error( $child_terms ) ) :	
      foreach ( $child_terms as $child_term ) :		
			$term_type = get_term_meta( $child_term->term_id, 'product_category_type', true );
			$child_term_name =  $child_term->name;
			if ($term_type === 'related'):
				echo '<section class="category__child-term" id="term-'.$child_term->term_id.'">';
				$child_terms = get_terms( array(
					'taxonomy'		=> $taxonomy,
					'parent'		=> $child_term->term_id,
					'hide_empty'	=> 'true'
				));
				foreach($child_terms as $child_term):
					$child_term_name =  $child_term->name;				
					?>
					<div class="mb__section">
						<div class="container">
							<div class="row">
								<div class="col-12"><h2><?= esc_html( $child_term_name ); ?></h2></div>
							</div>
						</div>
						<?php
						$child_posts = new WP_Query( array(
							'tax_query' => array(
								array(
										'taxonomy' => $taxonomy,
										'field'    => 'id',
										'terms'    => $child_term->term_id,
								),
							),
							//'posts_per_page' => 4, // Укажите количество постов для вывода
							'posts_per_page' => -1, // Укажите количество постов для вывода
							'orderby'			=> 'menu_order',
      					'order'				=> 'ASC',
						));
						if ( $child_posts->have_posts() ) : ?>
							<div class="container-full <?= 'style1'; /*$term_style*/ ?>">
								<div class="row product__list">									
									<?php
                                    $i=0;
									while ( $child_posts->have_posts() ) : $child_posts->the_post();									
										?>
										<div class="col-3 col-sm-12 item" >
											<div class="product__wrapper">
												<div class="product__img">
													<?= get_the_post_thumbnail( get_the_ID(),	'medium_large')?>
												</div>
												<div class="product__footer">
													<div class="product__title">
														<div class="product__category"><?= esc_html( $child_term_name )?></div>
														<?php the_title('<h3>', '</h3>'); ?>
													</div>
													<div class="item__arrow">
															<span></span>
														</div>
												</div>
												<a href="<?= the_permalink()?>"><?= the_title()?></a>
											</div>
										</div>
									<?php
									endwhile; ?>
								<?php /* if ( $child_posts->max_num_pages > 1 ):?> та что по центру "загрузить" (https://alfaglass.ru/catalog/steklo/)
									<div class="col-12 item_btn">
										<button class="btn btn__load" data-page="1" data-term="<?= $child_term->term_id ?>">
											<svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M11.8081 8.74879L14.1623 5.42833L10.8418 3.07422" stroke="#0E0F0F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
												<path d="M18.0213 12.3415L17.8954 11.6021L19.3741 11.3503L19.5 12.0897L18.0213 12.3415ZM7.08846 19.5558L7.52223 18.944L7.08846 19.5558ZM10.1516 6.11201L10.0257 5.37266L10.0257 5.37266L10.1516 6.11201ZM14.0382 4.68934C14.4465 4.61981 14.8339 4.89446 14.9035 5.30279C14.973 5.71113 14.6984 6.09852 14.29 6.16806L14.0382 4.68934ZM19.5 12.0897C19.7727 13.6908 19.5644 15.3369 18.9016 16.8197L17.5322 16.2076C18.0739 14.9956 18.2441 13.6502 18.0213 12.3415L19.5 12.0897ZM18.9016 16.8197C18.2387 18.3025 17.1511 19.5555 15.7761 20.4201L14.9776 19.1504C16.1014 18.4436 16.9904 17.4195 17.5322 16.2076L18.9016 16.8197ZM15.7761 20.4201C14.4012 21.2848 12.8007 21.7223 11.1771 21.6774L11.2186 20.178C12.5456 20.2147 13.8538 19.8571 14.9776 19.1504L15.7761 20.4201ZM11.1771 21.6774C9.5535 21.6324 7.97969 21.1071 6.65468 20.1677L7.52223 18.944C8.60522 19.7118 9.89157 20.1412 11.2186 20.178L11.1771 21.6774ZM6.65468 20.1677C5.32968 19.2283 4.31299 17.9171 3.73319 16.3999L5.13436 15.8644C5.60826 17.1045 6.43924 18.1762 7.52223 18.944L6.65468 20.1677ZM3.73319 16.3999C3.15338 14.8826 3.0365 13.2276 3.39733 11.6439L4.85985 11.9772C4.56493 13.2716 4.66046 14.6243 5.13436 15.8644L3.73319 16.3999ZM3.39733 11.6439C3.75816 10.0603 4.58048 8.61924 5.76032 7.50296L6.79122 8.59256C5.82689 9.50495 5.15477 10.6828 4.85985 11.9772L3.39733 11.6439ZM5.76032 7.50296C6.94015 6.38668 8.42451 5.64533 10.0257 5.37266L10.2775 6.85137C8.96879 7.07423 7.75556 7.68017 6.79122 8.59256L5.76032 7.50296ZM10.0257 5.37266L14.0382 4.68934L14.29 6.16806L10.2775 6.85137L10.0257 5.37266Z" fill="#0E0F0F" />
											</svg>
											<span data-text="<?= __('Загрузить еще', 'alfa-glass') ?>"><?= __('Загрузить еще', 'alfa-glass') ?></span>
										</button>
									</div>
								<?php	endif; */ ?>
								</div>								
							</div>
							<?php
							
						endif; 
						wp_reset_postdata(); // Восстанавливаем глобальные переменные поста ?>
					</div>
					<?php
				endforeach;
				echo '</section>';
			else:?>
            <section class="category__child-term mb__section" id="term-<?=$child_term->term_id?>">
					<div class="container">
						<div class="row">
							<div class="col-12"><h2><?= esc_html( $child_term_name ); ?></h2></div>
						</div>
					</div>
					<?php
					$child_posts = new WP_Query( array(
						'tax_query' => array(
							array(
									'taxonomy' => $taxonomy,
									'field'    => 'id',
									'terms'    => $child_term->term_id,
							),
						),
						//'posts_per_page' => 5, // Укажите количество постов для вывода
						'posts_per_page' => -1, // Укажите количество постов для вывода
						'orderby'			=> 'menu_order',
                        //'orderby' => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
                        
      				    'order'				=> 'ASC',
					));
					if ( $child_posts->have_posts() ) : ?>
						<div class="container-full <?= 'style1'; /* $term_style*/ ?>">
							<div class="row product__list">									
								<?php									
								$i = 0;
								while ( $child_posts->have_posts() ) : $child_posts->the_post();
									$col = $term_style === 'style1' ? 3 : 3;
                                        // теперь первый элемент визуально как все
                                        /* 
										if($term_style === 'style1' && $i === 0): ?>
											<div class="col-6 col-sm-12 item-part">
												<div class="product__info-wrapper">
													<div class="block__default block__light">
														<div class="product__info__header">
															<div class="product__title">
																<div class="product__category"><?= esc_html( $child_term_name )?></div>
                                                                <a href="<?php the_permalink(); ?>" class="">
																<?php the_title('<h3>', '</h3>'); ?>
                                                                </a>
															</div>



															<div class="shared__wrapper">
																<button class="btn btn__shared" data-link="<?=the_permalink(); ?>">
																	<span>Поделиться</span>
																	<?php get_template_part('template-blocks/icons/shared'); ?>
																</button>
																<div class="shared__tooltip">
																	<div class="content" role="tooltip" aria-modal="false">
																		<div class="decor"></div>
																		<?=__("Ссылка скопирована")?>
																	</div>
																</div>
															</div>
														</div>
														<div class="product__img">
                                                            <a href="<?php the_permalink(); ?>" class="">
															<?= get_the_post_thumbnail( get_the_ID(),	'medium_large')?>
                                                            </a>
														</div>
														<div class="product__info__footer">
															<div class="description"><?=get_the_excerpt()?></div>
															<a href="<?php the_permalink(); ?>" class="btn btn__border btn__hover">
																<span><?=__('Подробнее', 'alfa-glass')?></span>
																<div class="item__arrow">
																	<span></span>
																</div>
															</a>
														</div>
													</div>
												</div>
											</div>
                                            <div class="col-6 col-sm-12 item-part">
                                                <div class="product__img__wrapper">
                                                    <div class="product__img">
                                                        <?php
                                                        $second_img_id = get_field('second_img');
                                                        if ($second_img_id) {
                                                            // Если второе изображение есть, выводим его
                                                            echo wp_get_attachment_image($second_img_id, 'full');
                                                        } else {
                                                            // Если второго изображения нет, выводим изображение по умолчанию (thumbnail)
                                                            echo wp_get_attachment_image(get_post_thumbnail_id(), 'thumbnail');
                                                        }
                                                        ?>
                                                    </div>
                                                </div>
                                            </div>
										<?php
                                        */
										//else:
											?>
											<div class="col-<?=$col?> col-sm-12 item">
												<div class="product__wrapper">
													<div class="product__img">
														<?= get_the_post_thumbnail( get_the_ID(),	'medium_large')?>
													</div>
													<div class="product__footer">
														<div class="product__title">
															<div class="product__category"><?= esc_html( $child_term_name )?></div>
															<?php the_title('<h3>', '</h3>'); ?>
														</div>
														<div class="item__arrow">
																<span></span>
															</div>
													</div>
													<a href="<?= the_permalink()?>"><span><?= the_title()?></span></a>
												</div>
											</div>
											<?php
										//endif;
									?>
									<?php								
									$i++;
								endwhile; ?>
								<?php if ( $child_posts->max_num_pages > 1 ):
									if($term_style === 'style1') {
										$load_wrapper_class = 'col-12 item_btn';
										$decor = '<svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M11.8081 8.74879L14.1623 5.42833L10.8418 3.07422" stroke="#0E0F0F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
												<path d="M18.0213 12.3415L17.8954 11.6021L19.3741 11.3503L19.5 12.0897L18.0213 12.3415ZM7.08846 19.5558L7.52223 18.944L7.08846 19.5558ZM10.1516 6.11201L10.0257 5.37266L10.0257 5.37266L10.1516 6.11201ZM14.0382 4.68934C14.4465 4.61981 14.8339 4.89446 14.9035 5.30279C14.973 5.71113 14.6984 6.09852 14.29 6.16806L14.0382 4.68934ZM19.5 12.0897C19.7727 13.6908 19.5644 15.3369 18.9016 16.8197L17.5322 16.2076C18.0739 14.9956 18.2441 13.6502 18.0213 12.3415L19.5 12.0897ZM18.9016 16.8197C18.2387 18.3025 17.1511 19.5555 15.7761 20.4201L14.9776 19.1504C16.1014 18.4436 16.9904 17.4195 17.5322 16.2076L18.9016 16.8197ZM15.7761 20.4201C14.4012 21.2848 12.8007 21.7223 11.1771 21.6774L11.2186 20.178C12.5456 20.2147 13.8538 19.8571 14.9776 19.1504L15.7761 20.4201ZM11.1771 21.6774C9.5535 21.6324 7.97969 21.1071 6.65468 20.1677L7.52223 18.944C8.60522 19.7118 9.89157 20.1412 11.2186 20.178L11.1771 21.6774ZM6.65468 20.1677C5.32968 19.2283 4.31299 17.9171 3.73319 16.3999L5.13436 15.8644C5.60826 17.1045 6.43924 18.1762 7.52223 18.944L6.65468 20.1677ZM3.73319 16.3999C3.15338 14.8826 3.0365 13.2276 3.39733 11.6439L4.85985 11.9772C4.56493 13.2716 4.66046 14.6243 5.13436 15.8644L3.73319 16.3999ZM3.39733 11.6439C3.75816 10.0603 4.58048 8.61924 5.76032 7.50296L6.79122 8.59256C5.82689 9.50495 5.15477 10.6828 4.85985 11.9772L3.39733 11.6439ZM5.76032 7.50296C6.94015 6.38668 8.42451 5.64533 10.0257 5.37266L10.2775 6.85137C8.96879 7.07423 7.75556 7.68017 6.79122 8.59256L5.76032 7.50296ZM10.0257 5.37266L14.0382 4.68934L14.29 6.16806L10.2775 6.85137L10.0257 5.37266Z" fill="#0E0F0F" />
											</svg>';
									} else {
										$load_wrapper_class = 'col-4 item';
										$decor = '<div class="decor__vector"></div>';
									}
									?>
                                    <?php /* Большая кнопка справа (например https://alfaglass.ru/catalog/izdeliya/)
									<div class="<?=$load_wrapper_class?> col-sm-12">
										<div class="btn__wrapper" style="background: url(<?= wp_get_attachment_image_url(get_term_meta($child_term->term_id, 'product_category_img', true), 'full' ) ?>) "></div>
										
										<button class="btn btn__load" data-page="1" data-term="<?= $child_term->term_id ?>" data-style="<?=$term_style?>">
											<?=$decor?>
											<span data-text="<?= __('Загрузить еще', 'alfa-glass') ?>"><?= __('Загрузить еще', 'alfa-glass') ?></span>
										</button>
									</div>
                                    */?>
								<?php	endif; ?>	   
							</div>
							                    
						</div>
						<?php
						
					endif; 
					wp_reset_postdata(); // Восстанавливаем глобальные переменные поста ?>
				</section>
      	<?php
		  	endif;
		endforeach;
	endif;	
	?>
    <?php if ( get_the_archive_description() ):?>
    
    <section class="container-fluid mb__section category__first-screen" style="margin-bottom: 8rem;">
		<div class="block__default block__light" >		
			<?php  the_archive_description( '<div class="archive-description">', '</div>' ); ?>		
		</div>
	</section>
    <?php endif;?>

	<?php if(get_term_meta($term_id,'uses_on', true)):
		$slider_loop = get_term_meta($term_id,'slider_loop', true);
		$slider_speed = get_term_meta($term_id,'slider_speed', true);
		$slider_space = get_term_meta($term_id,'slider_space', true);
		$slider_delay = get_term_meta($term_id,'slider_delay', true);?>		
		<section class="container mb__section product__uses alfa__slider" data-loop="<?=$slider_loop?>" data-speed="<?=$slider_speed?>" data-spaceBetween="<?=$slider_space?>" data-delay="<?=$slider_delay?>">
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
			$uses_list = get_term_meta($term_id, 'uses_list', true);
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
										<div class="item__arrow"><span></span></div>
									</div>
									<a href="<?= esc_url( $term_link ) ?>" class="item__link"></a>
								</div>	
						<?php	endforeach;	?>
					</div>
				</div>
			<?php endif; ?>		
		</section>
<?php endif; ?>
</main><!-- #main -->
<?php
get_footer();
