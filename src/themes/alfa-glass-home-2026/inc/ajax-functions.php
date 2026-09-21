<?php
/**
 * Функции ajax загрузки контента
 *
 * @package Alfa-glass
 */

/**
 * 
 * Подгрузка постов на странице блога
 */


function load_more_posts() {
	$paged = (int) $_POST['page']+1;

	$args = array(
		'post_type'			=> 'post',
		'posts_per_page' 	=> 10,
		'paged'				=> $paged,
		'orderby'			=> 'menu_order',
      'order'				=> 'ASC',
	);

	$posts = new WP_Query($args);
	ob_start();

	if($posts->have_posts()):
		$i = 1;
		while ( $posts->have_posts() ) :
			$posts->the_post();
			$class = ($i === 1 || $i === 10) ? 'col-6 item__wide' : 'col-3';
			echo '<div class="'.$class.' col-sm-12">';
			get_template_part( 'template-parts/content', get_post_type() );
			echo '</div>';
			$i++;
		endwhile;

		$content = ob_get_clean();
		$is_last_page = $paged >= $posts->max_num_pages;

		wp_send_json(array(
			'content'      => $content,
			'is_last_page' => $is_last_page
		));
	else:
		ob_end_clean();
      wp_send_json(array('content' => '', 'is_last_page' => true));
	endif;
	
	wp_reset_postdata();
}
add_action('wp_ajax_load_more_posts', 'load_more_posts');
add_action('wp_ajax_nopriv_load_more_posts', 'load_more_posts');

function load_more_products() {	
	$paged = (int) $_POST['page']+1;
	$term_id = (int) $_POST['term'];
	$style = sanitize_text_field($_POST['style']);

	// Определяем количество постов на страницу и количество колонок
	$posts_per_page = ($style === 'style2') ? 3 : 4;
	$col = ($style === 'style2') ? 4 : 3;

	// Смещение рассчитывается только при наличии стиля
   $offset = ($style) ? 5 + ($paged - 2) * $posts_per_page : null;

	$is_last_page = false;
	
	$args = array(
		'post_type'			=> 'product',
		'posts_per_page' 	=> $posts_per_page,
		'paged'				=> $paged,
		'orderby'			=> 'menu_order',
      'order'				=> 'ASC',
		'post_status'		=> 'publish',
		'tax_query' => array(
			array(
					'taxonomy' => 'product_category',
					'field'    => 'id',
					'terms'    => $term_id,
			),
		),
	);
	// Добавляем offset только если он нужен
	if (!is_null($offset)) {
		$args['offset'] = $offset;
	}

	$posts = new WP_Query($args);
	
	ob_start();
	if($posts->have_posts()):		
		$term_name = get_term( $term_id, 'product_category' )->name;
		while ( $posts->have_posts() ) :
			$posts->the_post();
				?>
				<div class="col-<?= esc_attr($col)?> col-sm-12 item">
						<div class="product__wrapper">
							<div class="product__img">
								<?= get_the_post_thumbnail( get_the_ID(),	'medium_large')?>
							</div>
							<div class="product__footer">
								<div class="product__title">
									<div class="product__category"><?= esc_html( $term_name )?></div>
									<?php the_title('<h2>', '</h2>'); ?>
								</div>
								<div class="item__arrow">
										<span></span>
									</div>
							</div>
							<a href="<?= esc_url(the_permalink())?>"><span><?= the_title()?></span></a>													
						</div>						
					</div>
				<?php
			
		endwhile;
		$content = ob_get_clean();		
		
		// Проверка на последнюю страницу
		$loaded_posts = $offset + $posts_per_page;
		$is_last_page = ($style) ? $loaded_posts >= $posts->found_posts : $paged >= $posts->max_num_pages;
		
		wp_send_json(array(
			'content'      => $content,
			'is_last_page' => $is_last_page
		));
	else:
		ob_end_clean();
      wp_send_json(array('content' => '', 'is_last_page' => true));
	endif;
	
	wp_reset_postdata();
}
add_action('wp_ajax_load_more_products', 'load_more_products');
add_action('wp_ajax_nopriv_load_more_products', 'load_more_products');

function configurator_load_more() {
	$paged = (int) $_POST['page']+1;
	$slug = (string) $_POST['term_slug'];
	$posts_per_page = 4;
   $offset = 7 + ($paged - 2) * $posts_per_page;

	$is_last_page = false;
	
	$args = array(
		'post_type'			=> 'product',
		'posts_per_page' 	=> $posts_per_page,
		'paged'				=> $paged,
		'offset'				=> $offset,
		'orderby'			=> 'menu_order',
      'order'				=> 'ASC',
		'post_status'		=> 'publish',
		'tax_query' => array(
			array(
					'taxonomy' => 'product_category',
					'field'    => 'slug',
					'terms'    => $slug,
			),
		),
	);
	$posts = new WP_Query($args);
	ob_start();
	if($posts->have_posts()):
		while ( $posts->have_posts() ) :
			$posts->the_post();
			$id= get_the_ID();
			?>
			<div class="gallary" data-id="<?=$id?>">
				<div class="items">									
					<?= wp_get_attachment_image(get_field('second_img', $id), 'full', false, ['class' => '_active'])?>
					<?= get_the_post_thumbnail($id, 'full' ) ?>
				</div>
				<div class="icons">
					<?= wp_get_attachment_image(get_field('second_img', $id), 'thumbnail', false, ['class' => '_active'])?>
					<?= get_the_post_thumbnail($id, 'thumbnail') ?>
					
				</div>
			</div>
			<?php
			
		endwhile;
		$contentPane = ob_get_clean();		
		
		ob_start();
		while ( $posts->have_posts() ) :
			$posts->the_post();
			$id= get_the_ID();
			?>
			<a href="javascript: void(0)" class="tab__link" data-target="<?=$id?>">
				<?= get_the_post_thumbnail($id, 'thumbnail') ?>
				<div class="item__name"><?= the_title()?></div>
			</a>
			<?php			
		endwhile;

		$contentTab = ob_get_clean();
		// Проверка на последнюю страницу
		$loaded_posts = $offset + $posts_per_page;
		$is_last_page = $loaded_posts >= $posts->found_posts;
		
		

		wp_send_json(array(
			'contentPane'      => $contentPane,
			'contentTab'		=> $contentTab,
			'is_last_page' => $is_last_page
		));

	else:
		ob_end_clean();
      wp_send_json(array('contentPane' => '', 'contentTab' => '', 'is_last_page' => true));
	endif;
	
	wp_reset_postdata();	
}

add_action('wp_ajax_configurator_load_more', 'configurator_load_more');
add_action('wp_ajax_nopriv_configurator_load_more', 'configurator_load_more');
