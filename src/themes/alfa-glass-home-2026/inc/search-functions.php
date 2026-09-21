<?php 
if ( ! defined('ABSPATH') ) {
	exit;
}
//регистрация значений в query
if(!function_exists('alfa_glass_add_get_val')) {
	add_action('init','alfa_glass_add_get_val');

	function alfa_glass_add_get_val() { 
		global $wp; 
		$wp->add_query_var('type');
	}
}

//форма поиска

	//-->START

if(!function_exists('alfa_glass_searh_form')) {
	function alfa_glass_search_form($attr){
		$html = '';
		extract(shortcode_atts( array(
			'class'	=> '',
			'placeholder' => esc_html__( 'Введите название товара', 'alfa-glass' ),
			'live_search'	=> 'on',
			'id'	=> '',
			'post_type' => 'product',
		), $attr));
		ob_start();

		$search_val = get_search_query();
		if(empty($search_val)) {
			$search_val = $placeholder;
		} ?>
		<form role="search" action="<?php echo esc_url( home_url( '/'  ) ); ?>" method="get" class="search-form <?php echo esc_attr($class)?> live-search-<?php echo esc_attr($live_search)?>" <?php if($id) echo 'id="'.$id.'"'; ?>>
			<div class="form__row">			
				<div class="search-field__wrapper">
					<input type="text" class="search-field" value="<?php echo esc_attr($search_val);?>" name="s"  onblur="if (this.value=='') this.value = this.defaultValue"></div>				
				<button type="submit" class="search-submit" value="Поиск">
					<?php get_template_part('template-blocks/icons/search-icon'); ?>
				</button>
			</div>
			<input type="hidden" name="type" value="<?php echo esc_attr($post_type)?>" />		
		</form>
		<div class="list-product-search">
			<?php	history_search()?>
		</div>
		<?php
		$html .=    ob_get_clean();
		return $html;
	}
}
add_shortcode('alfa_glass_search','alfa_glass_search_form');



if(!function_exists('history_search')){
	function history_search() {
		$history_query = get_theme_mod('popular_queris');
		if ($history_query) {
			$history_query = explode(',', $history_query);
			?>
			<div class="history__search">
				<div class="small__title"><?= esc_html__('Часто ищут', 'alfa-glass') ?></div>
				<?php
				foreach ($history_query as $item) {
					$search_url = esc_url(add_query_arg(array(
                's' => urlencode(trim($item)),
                'type' => 'product', // Тип поста
               //  'taxonomy' => 'product_category', // Таксономия
               //  'term' => urlencode(trim($item)) // Поиск по названию термина таксономии
            ), home_url('/')));
            ?>
					<div class="item__query">
							<?php get_template_part('template-blocks/icons/search-icon'); ?>
							<a href="<?= $search_url ?>">
								<span><?= esc_html($item) ?></span>
							</a>
					</div>
					<?php
				}
				?>
			</div>
			<?php
		}
	}
}


if(!function_exists('live_search_reset')){
	function live_search_reset() {
		ob_start();
		history_search();
		$data =  ob_get_clean();
		wp_send_json(array('message' => $data));
		wp_die();

	}
	add_action( 'wp_ajax_live_search_reset', 'live_search_reset' );
	add_action( 'wp_ajax_nopriv_live_search_reset', 'live_search_reset' );
}



if (!function_exists('live_search')) {
    function live_search() {
        $key = sanitize_text_field($_POST['key']);
        $post_type = sanitize_text_field($_POST['post_type']);
        $trim_key = trim($key);

        // Получаем ID постов по заголовкам и содержимому
        $args_title_content = array(
            'post_type' => $post_type,
            'posts_per_page' => -1, 
            'post_status' => 'publish',
            's' => $key,
            'fields' => 'ids', // Возвращаем только ID
        );

        $result_title_content = new WP_Query($args_title_content);
        $post_ids_by_content = $result_title_content->posts;

        // Получаем термины таксономии по частичному совпадению с названием
        $terms = get_terms(array(
            'taxonomy' => 'product_category',
            'name__like' => $key, // Поиск по частичному совпадению
            'fields' => 'ids',
        ));

        $post_ids_by_taxonomy = array();
        if (!empty($terms) && !is_wp_error($terms)) {
            // Получаем ID постов, которые относятся к найденным терминам
            $args_taxonomy = array(
                'post_type' => $post_type,
                'posts_per_page' => -1,
                'post_status' => 'publish',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'product_category',
                        'field' => 'term_id', // Используем ID термина
                        'terms' => $terms,
                    ),
                ),
                'fields' => 'ids', // Возвращаем только ID
            );

            $result_taxonomy = new WP_Query($args_taxonomy);
            $post_ids_by_taxonomy = $result_taxonomy->posts;
        }

        // Объединяем и убираем дубли
        $merged_ids = array_unique(array_merge($post_ids_by_content, $post_ids_by_taxonomy));

        $message = '';

        // Проверяем, есть ли уникальные ID
        if (!empty($merged_ids) && !empty($key) && !empty($trim_key)) {
            // Запрашиваем посты по уникальным ID
            $args_final = array(
                'post_type' => $post_type,
                'post__in' => $merged_ids, // Используем только уникальные ID
                'posts_per_page' => -1,
                'post_status' => 'publish',
            );

            $result_final = new WP_Query($args_final);

            $message .= '<ul>';

            // Выводим результаты
            while ($result_final->have_posts()) : $result_final->the_post();
					$id = get_the_ID();
                $message .= '<li class="item-search">
                    <a href="'.esc_url(get_the_permalink()).'">
						  		'.get_the_post_thumbnail( $id,	'mthumbnail').'
								<div class="item-search__content">
									'.get_product_category($id).'
                        	<div class="small__title">'.get_the_title().'</div>
								</div>
                    </a>
                </li>';
            endwhile;

            $message .= '</ul>';

            $data = array(
                'message' => $message,
                'status' => 'true'
            );
        } else {    
            $message .= '<p class="search-no-results">' . esc_html__( 'По вашему запросу ничего не найдено', 'alfa-glass' ) . '</p>';

            $data = array(
                'message' => $message,
                'status' => 'false'
            );
        }

        echo wp_send_json($data);

        wp_reset_postdata();
    }

    add_action('wp_ajax_live_search', 'live_search');
    add_action('wp_ajax_nopriv_live_search', 'live_search');
}

add_filter('posts_search', 'search_by_title_only', 10, 2);
function search_by_title_only($search, $wp_query) {
    global $wpdb;

    if (empty($search)) {
        return $search; // если запрос пустой, возвращаем стандартный результат
    }

    // Проверяем, что выполняется основной поисковый запрос и есть поисковый запрос (s)
    if (!empty($wp_query->query_vars['s'])) {
        $search = $wpdb->prepare(" AND {$wpdb->posts}.post_title LIKE %s ", '%' . $wpdb->esc_like($wp_query->query_vars['s']) . '%');
    }

    return $search;
}