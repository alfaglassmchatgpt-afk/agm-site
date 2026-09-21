<?php
/**
 * Template part for displaying products
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Alfa-glass
 */

/*
$sizes = get_intermediate_image_sizes(); 
(
    [0] => thumbnail
    [1] => medium
    [2] => medium_large
    [3] => large
    [4] => 1536x1536
    [5] => 2048x2048
)
*/
$title = get_field('title') ? get_field('title') : get_the_title( );
$product_id = get_the_ID();       // ID товара
$user_id = get_current_user_id(); // ID текущего пользователя
?>

<?php
/*
Если метка стоит - на ПК отображаем контент под фото.
Если метки нет - то как обычно. 
content-view--v2
*/
?>
<?php 
#########################################################
if (is_user_logged_in() && get_current_user_id() == 4):

endif;
#########################################################

	$content_pos = get_field('content-position') ?: 'default';
	// при content-view--v2 мы отображаем контент под изображением, скрываем основной блок контента
	$content_pos_class = ($content_pos === 'left') ? 'content-view--left' : 'content-view--default';
?>
<section class="container-fluid mb__section product__first-screen <?php echo $content_pos_class;?>">
	<div class="block__default block__light">
		<?php
		echo do_shortcode( '[alfa-breadcrumbs]');

        $current_id = get_the_ID();
        $cur_terms = wp_get_post_terms($current_id, 'product_category');

        // Проверяем, принадлежит ли запись к категории с ID 30
        $belongs_to_category = false;

        foreach ($cur_terms as $term) {
            if ((int)$term->term_id === 30) {
                $belongs_to_category = true;
                break;
            }
        }


        // Основное raywall.jpeg 07.11.2024 679 КБ 1000 на 1500 пикселей 
        // Галерея  gothic_0-1-scaled.jpeg 10.03.2025 1334 x 2000 (459 КБ)
        // Получаем поле gallery
        $gallery = get_field('main_gallary');

        // Основная логика:
        if (!$belongs_to_category) {
            // Товары не принадлежат категории с ID 30
            // Используем ОБЩИЙ сценарий: кладем в массив и основное изображение, и изображения из поля
            $ar_image_ids = array_filter([
                get_post_thumbnail_id(get_the_ID()), // Основное изображение
                ...(is_array($gallery) ? $gallery : [])                      // Фотографии из поля
            ]);
        } else {
            // Товары принадлежат категории с ID 30
            // Используем СПЕЦИАЛЬНЫЙ сценарий: если есть фотографии в поле — используем их, иначе — основное изображение
            $ar_image_ids = ($gallery && count($gallery) > 1) ? $gallery : array(get_post_thumbnail_id(get_the_ID()));
        }


        //echo '<pre>';
        //print_r($ar_image_ids);
        //echo '</pre>';        

// Теперь $ar_image_ids содержит нужные изображения      
 
		?>




<style>


.img-magnifier-container {
  position:relative;
}



.img-magnifier-glass {
	opacity: 0;
  	position: absolute;
  	border: 1px solid rgba(0,0,0,.2);
  	border-radius: 50%;
  	cursor: none;
  	/*Установите размер увеличительного стекла:*/
  	width: 150px;
  	height: 150px;
  	z-index: 10;
	box-shadow:0 3px 6px 0 rgba(0,0,0,0.5);
	transition: opacity .25s ease-in-out;
}
.img-magnifier-container:hover .img-magnifier-glass {
	opacity: 1;
	transition: opacity .25s ease-in-out;
}
</style>
<script>
(function() {
    'use strict';
    
    let isInitialized = false;

    function initMagnifierForImage(imgElement) {
        if (!imgElement) return;
        
        const parent = imgElement.parentElement;
        if (parent.querySelector('.img-magnifier-glass')) {
            console.log('Лупа уже существует, пропускаем');
            return;
        }

        // Получаем URL оригинала из href родительской ссылки
        const parentLink = imgElement.closest('a[href]');
        const originalUrl = parentLink ? parentLink.getAttribute('href') : (imgElement.getAttribute('data-src') || imgElement.src);
        
        console.log('📸 Оригинал URL:', originalUrl);
        
        // Создаём скрытое изображение для получения реальных размеров
        const tempImg = new Image();
        tempImg.src = originalUrl;
        
        tempImg.onload = function() {
            console.log(`✅ Оригинал загружен: ${tempImg.naturalWidth}x${tempImg.naturalHeight}`);
            console.log(`📺 Превью размер: ${imgElement.width}x${imgElement.height}`);
            
            // Вычисляем зум относительно превью
            const zoomX = tempImg.naturalWidth / imgElement.width;
            const zoomY = tempImg.naturalHeight / imgElement.height;
            const autoZoom = Math.min(zoomX, zoomY);
            
            console.log(`🔍 Зум: ${autoZoom}`);
            
            // Сохраняем размеры оригинала на элементе для доступа в лупе
            imgElement.dataset.originalWidth = tempImg.naturalWidth;
            imgElement.dataset.originalHeight = tempImg.naturalHeight;
            
            // Запускаем лупу с правильными размерами
            magnifyForElement(imgElement, autoZoom, originalUrl);
        };
        
        tempImg.onerror = function() {
            console.error('❌ Не удалось загрузить оригинал:', originalUrl);
            // fallback — используем превью
            const zoomX = imgElement.naturalWidth / imgElement.width;
            const zoomY = imgElement.naturalHeight / imgElement.height;
            const autoZoom = Math.min(zoomX, zoomY);
            
            imgElement.dataset.originalWidth = imgElement.naturalWidth;
            imgElement.dataset.originalHeight = imgElement.naturalHeight;
            
            magnifyForElement(imgElement, autoZoom, originalUrl);
        };
    }

    function magnifyForElement(img, zoom, originalUrl) {
        console.log('___________zooooooooooooooooooooooooooooooooom_____________')
        
        function createGlass() {
            const existingGlass = img.parentElement.querySelector('.img-magnifier-glass');
            if (existingGlass) {
                existingGlass.remove();
            }
            
            var glass, w, h, bw;
            
            // Берём URL оригинала (переданный или из href)
            const parentLink = img.closest('a[href]');
            const imageUrl = originalUrl || (parentLink ? parentLink.getAttribute('href') : (img.getAttribute('data-src') || img.src));
            
            // Берём размеры оригинала (сохранённые в dataset)
            const originalWidth = parseInt(img.dataset.originalWidth) || img.naturalWidth;
            const originalHeight = parseInt(img.dataset.originalHeight) || img.naturalHeight;
            
            glass = document.createElement("DIV");
            glass.setAttribute("class", "img-magnifier-glass");
            img.parentElement.insertBefore(glass, img);
            glass.style.backgroundImage = "url('" + imageUrl + "')";
            glass.style.backgroundRepeat = "no-repeat";
            
            // Используем РЕАЛЬНЫЕ размеры оригинала
            glass.style.backgroundSize = originalWidth + "px " + originalHeight + "px";
            
            console.log('🔍 Лупа использует URL:', imageUrl);
            console.log('🎯 Реальный размер фона:', originalWidth + 'x' + originalHeight);
            
            bw = 3;
            w = glass.offsetWidth / 2;
            h = glass.offsetHeight / 2;
            
            glass.addEventListener("mousemove", moveMagnifier);
            glass.addEventListener("touchmove", moveMagnifier);
            
            return {glass, w, h, bw};
        }
        
        let glassData = createGlass();
        let glass = glassData.glass;
        let w = glassData.w;
        let h = glassData.h;
        let bw = glassData.bw;
        
        img.addEventListener("mouseenter", function() {
            // Проверяем URL из href при наведении
            const parentLink = img.closest('a[href]');
            const currentImageUrl = originalUrl || (parentLink ? parentLink.getAttribute('href') : (img.getAttribute('data-src') || img.src));
            const glassBg = glass.style.backgroundImage;
            
            if (!glassBg.includes(currentImageUrl) || !glass.parentNode) {
                console.log('Изображение изменилось, пересоздаём лупу');
                
                // Пересчитываем зум
                const zoomX = (parseInt(img.dataset.originalWidth) || img.naturalWidth) / img.width;
                const zoomY = (parseInt(img.dataset.originalHeight) || img.naturalHeight) / img.height;
                const autoZoom = Math.min(zoomX, zoomY);
                
                // Обновляем zoom
                zoom = autoZoom;
                
                glassData = createGlass();
                glass = glassData.glass;
                w = glassData.w;
                h = glassData.h;
                bw = glassData.bw;
            }
        });
        
        img.addEventListener("mousemove", moveMagnifier);
        img.addEventListener("touchmove", moveMagnifier);
        
        function moveMagnifier(e) {
            var pos, x, y;
            e.preventDefault();
            pos = getCursorPos(e);
            x = pos.x;
            y = pos.y;
            
            // Ограничиваем, чтобы лупа не выходила за края превью
            if (x > img.width - (w / zoom)) {x = img.width - (w / zoom);}
            if (x < w / zoom) {x = w / zoom;}
            if (y > img.height - (h / zoom)) {y = img.height - (h / zoom);}
            if (y < h / zoom) {y = h / zoom;}
            
            // Позиция лупы на экране (оставляем как есть)
            glass.style.left = (x - w) + "px";
            glass.style.top = (y - h) + "px";
            
            // ПОЛУЧАЕМ РЕАЛЬНЫЕ РАЗМЕРЫ ОРИГИНАЛА
            const origW = parseInt(img.dataset.originalWidth) || img.naturalWidth;
            const origH = parseInt(img.dataset.originalHeight) || img.naturalHeight;
            
            // Коэффициенты масштабирования
            const scaleX = origW / img.width;
            const scaleY = origH / img.height;
            
            // Координаты в оригинале, соответствующие позиции мыши
            const origX = x * scaleX;
            const origY = y * scaleY;
            
            // Смещение фона так, чтобы точка (origX, origY) была в центре лупы
            const bgX = origX - (glass.offsetWidth / 2) + bw;
            const bgY = origY - (glass.offsetHeight / 2) + bw;
            
            glass.style.backgroundPosition = `-${bgX}px -${bgY}px`;
        }
        
        function getCursorPos(e) {
            var a, x = 0, y = 0;
            e = e || window.event;
            a = img.getBoundingClientRect();
            x = e.pageX - a.left;
            y = e.pageY - a.top;
            x = x - window.pageXOffset;
            y = y - window.pageYOffset;
            return {x : x, y : y};
        }
    }

    function start() {
        if (isInitialized) {
            console.log('Инициализация уже была, пропускаем');
            return;
        }
        isInitialized = true;
        
        setTimeout(() => {
            const containers = document.querySelectorAll('.img-magnifier-container');
            containers.forEach(container => {
                const img = container.querySelector('img');
                if (img) {
                    initMagnifierForImage(img);
                }
            });
        }, 500);
    }

    if (document.readyState === 'complete') {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start);
        window.addEventListener('load', start);
    }
})();
</script>

		<div class="row">
			<div class="col-7 col-lg-6 product__img_wrapper d-sm-none">
                
   



                <?php ##################### prod img #####################?>          
                <?php
                //Если есть фото в основной галереи (main_gallery), то берём фото только оттуда.
                // иначе берём миниатюру.                    
                ?>
                <div class="product__img">
                    <div class="gallery-main">
                    <?php
                    $n=0;
                    foreach($ar_image_ids as $item): $n++;
                        $active_class = ($n > 1) ? '' : '_active';
                        $display_none = ($n > 1) ? 'display:none;' : '';
                        //$full_img_url = wp_get_attachment_url($item, 'medium_large'); // Получаем URL полного изображения
                        $large_img_url = wp_get_attachment_image_url($item, '1536x1536'); // Получаем URL полного изображения
                        $full_img_url = wp_get_attachment_image_url($item, 'full'); // Получаем URL полного изображения
                    ?>
                        <a data-x="<?= $n ?>"  class="img-magnifier-container main-photo <?= $active_class; ?>" href="<?= esc_url($full_img_url); ?>" style="" data-fancybox="product"  data-loop="true" data-index="<?=$n;?>">
                            <img src="<?= esc_url($large_img_url); ?>" alt="Основное изображение"<?php echo 1 === $n ? ' class="skip-lazy" loading="eager" fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"'; ?> />
                        </a>
                    <?php endforeach; ?>   
                    </div> 

                    <?php 
                    # Миниатюры
                    # только если галерея есть и её длина 
                    if($ar_image_ids && count($ar_image_ids) > 1): $i=0;?>
                    <div class="thumbnails" data-blc-thumbs="blc<?= $product_id ?>">
                        <?php 
                        foreach($ar_image_ids as $item): $i++;
                            // Получаем URL полного изображения
                            $thumb_img_url = wp_get_attachment_image_url($item, 'medium');
                            $image_description = get_post_field('post_content', $item);
                            $active_class = ($i > 1) ? '' : '_active';
                        ?>
                        <div class="thumbnail-wrap">
                            <a class="thumbnail <?= $active_class; ?>" href="#">
                                <img src="<?= esc_url($thumb_img_url); ?>" alt="<?php echo $title;?>" data-description="<?php echo $image_description; ?>" />
                            </a>        
                        </div>
                        <?php endforeach; ?>
                    </div>  
                    <?php endif;?>  
                </div>
                <?php ################### end prod img ################### ?>                
            
			    <?php 
                #########################################################
                //if (is_user_logged_in() && get_current_user_id() == 4):
				?>




				<?php if ( get_the_content() && $content_pos === 'left' ) : ?>
				<div class="content-gray">
						<?php the_content()?>
				</div>
				<?php endif; ?>


                <?php 
                //endif;
                #########################################################
				?>
			</div> <!-- end col-7 col-lg-6 product__img_wrapper -->


			<div class="col-5 col-lg-6 col-sm-12">
				<div class="product__info">


					<?php
/**
 * Лейблы / статусы
 */
$ar_badges = get_field('prod-badges');

// Массив с лейблами по умолчанию
$default_labels = ['manufacturing', 'delivery'];

// Определяем, какие лейблы показывать
if (is_null($ar_badges) || empty($ar_badges)) {
    // Поле не сохраняли — показываем лейблы по умолчанию
    $labels_to_show = $default_labels;
} else {
    // Поле сохраняли — извлекаем только значения (value) из выбранных элементов
    $labels_to_show = array_column($ar_badges, 'value'); // ← ИСПРАВЛЕНО
}

// Выводим лейблы
if (!empty($labels_to_show)) {
    echo '<div class="product-badges">';
    foreach ($labels_to_show as $label) {
        switch ($label) {
            case 'manufacturing':
                echo '<div class="badge badge--manufacturing"><i></i><span>Под заказ</span></div>';
                break;
            case 'delivery':
                echo '<div class="badge badge--delivery"><i></i><span>Доставка</span></div>';
                break;
            case 'install':
                echo '<div class="badge badge--install"><i></i><span>Установка</span></div>';
                break;
        }
    }
    echo '</div>';
}
?>



					<?php
					echo '<h1 class="item__title">'.$title.'</h1>';
					?>
                    <?php /*
					<div class="product__description small__title">
						<?php the_content()?>
					</div>
                    */?>
					<div class="product__description">
						<?php echo get_field('pre_text');?>
					</div>                    
					<div class="product__img d-none d-sm-block">
                        <div class="gallery-main">
                        <?php
                        $n=0;
                        foreach($ar_image_ids as $item): $n++;
                            $active_class = ($n > 1) ? '' : '_active';
                            $display_none = ($n > 1) ? 'display:none;' : '';
                            //$full_img_url = wp_get_attachment_url($item, 'medium_large'); // Получаем URL полного изображения
                            $large_img_url = wp_get_attachment_image_url($item, 'medium_large'); // Получаем URL полного изображения
                            $full_img_url = wp_get_attachment_image_url($item, 'full'); // Получаем URL полного изображения
                            
                        ?>
                            <a data-n="<?= $n ?> <?= $active_class ?> <?= $display_none ?>" class="main-photo <?= $active_class; ?>" href="<?= esc_url($full_img_url); ?>" style="" data-fancybox="product2"  data-loop="true" data-index="<?=$n;?>">
                                <img src="<?= esc_url($large_img_url); ?>" alt="Основное изображение"<?php echo 1 === $n ? ' class="skip-lazy" loading="eager" fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"'; ?> />
                            </a>
                        <?php endforeach; ?>   
                        </div> 

                        <?php 
                        # Миниатюры
                        # только если галерея есть и её длина 
                        if($ar_image_ids && count($ar_image_ids) > 1): $i=0;?>
                        <div class="thumbnails" data-blc-thumbs="blc<?= $product_id ?>">
                            <?php 
                            foreach($ar_image_ids as $item): $i++;
                                // Получаем URL полного изображения
                                $thumb_img_url = wp_get_attachment_image_url($item, 'medium');
                                $image_description = get_post_field('post_content', $item);
                                $active_class = ($i > 1) ? '' : '_active';
                            ?>
                            <div class="thumbnail-wrap">
                                <a class="thumbnail <?= $active_class; ?>" href="#">
                                    <img src="<?= esc_url($thumb_img_url); ?>" alt="<?php echo $title;?>" data-description="<?php echo $image_description; ?>" />
                                </a>        
                            </div>
                            <?php endforeach; ?>
                        </div>  
                        <?php endif;?>                          
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
                    /**
                     * Вывод полей конфигуратора
                     */
                    cfr_the_prod_fields($product_id);
                    ?>

					<div class="product__btn-group">
                        <?php /*
						<button class="btn btn__small btn__border btn__uppercase btn__hover" data-toggle="popup-open" data-modal-target="main-form-modal" title="Оставить заявку">
							<span>Оставить заявку</span>
                           
							<span class="item__arrow">
								<span></span>
							</span>
						</button>
                        */?>

                                                 

                        
                        <button class="btn btn__small btn__border btn__uppercase btn__hover" data-toggle="popup-open" data-modal-target="cfr-modal-form" title="Оставить заявку">
							<span>Отправить запрос</span>                           
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




					<?php
						$price = get_field('price');
						if($price) {
							echo '<div class="product__price">
										<div class="item__title">'.$price.'</div>
										<div class="price__desc">'.get_theme_mod('price_desc' ).'</div>
									</div>';
						}
					?>
                    
                    


				</div>
			</div>
		</div>
	</div>



    <?php if ( get_the_content() ) : ?>
    <div class="block__default block__light content-full" style="margin-top: 4rem;">
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


<?php 
######################################################
#                   Похожие товары                   #
######################################################

if(get_field('advice_on')):
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
							<circle cx="30" cy="30" r="29.2772" Autoplay stroke="#000" stroke-width="1.44565" />
							<path fill-rule="evenodd" clip-rule="evenodd" d="M27.2924 25.2929C26.9019 25.6834 26.9019 26.3166 27.2924 26.7071L30.5853 30L27.2924 33.2929C26.9019 33.6834 26.9019 34.3166 27.2924 34.7071C27.6829 35.0976 28.3161 35.0976 28.7066 34.7071L32.7066 30.7071C33.0971 30.3166 33.0971 29.6834 32.7066 29.2929L28.7066 25.2929C28.3161 24.9024 27.6829 24.9024 27.2924 25.2929Z" fill="#000" />
						</svg>
	
					</div>
				</div>
			</div>
		</div>
		<?php       
        
// Получаем ID текущего поста
$current_id = get_the_ID();

// Получаем все термины текущей записи в таксономии 'product_cat'
$terms = wp_get_post_terms($current_id, 'product_category');



if (!empty($terms) && !is_wp_error($terms)) {

    // Так как почему-то изначально сделано что категория товару указывается родительская+дочерняя, а не сразу дочерняя.
    // требуется исключить родительскую, чтоб не отображать лишние товары
    // Поэтому, если терминов несколько, ищем именно дочерний (с parent != 0)
    if (count($terms) > 1) {
        $child_term_id = null;
        foreach ($terms as $term) {
            if ($term->parent != 0) {
                $child_term_id = $term->term_id;
                break; // берем первый найденный дочерний
            }
        }
        // Если дочерний не нашли (на всякий случай), возьмём первый термин
        $term_id_to_use = $child_term_id ? $child_term_id : $terms[0]->term_id;

    } else {
        // Если термин только один — используем его
        $term_id_to_use = $terms[0]->term_id;
    }

    $args = [
        'post_type'      => 'product',
        'posts_per_page' => 30,
        'post__not_in'   => [$current_id],
        'tax_query'      => [
            [
                'taxonomy' => 'product_category',
                'field'    => 'term_id',
                'terms'    => $term_id_to_use,
            ],
        ],
    ];

    $products = new WP_Query($args);

    if ($products->have_posts()):
        ?>
		<div class="block__content">
			<div class="swiper-wrapper" style="padding-bottom: 1px;">        
        <?php
        while ($products->have_posts()): $products->the_post();?>
				<div class="swiper-slide">
					<div class="advice__item item">
						<div class="item__img"><?= get_the_post_thumbnail(get_the_ID(), 'medium_large')?></div>
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
       <?php endwhile;
       ?>
			</div>
		</div>       
       <?php
        wp_reset_postdata();
    endif;

}    
        
        


        /*
        ===================================================================

		$products_list = get_field('products_list');
		$args = array (
			'posts_per_page'	=> 20,
			'post_type' => 'product',
			'post__in' => $products_list,
			'post__not_in' => [get_the_ID()],
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
                ===================================================================
        */
		?>
		
	</section>
<?php endif; ?>





<?php 
######################################################
#                   Вы смотрели                      #
######################################################
// Простая проверка
$current_user_id = get_current_user_id();

//if ($current_user_id === 4): // Показываем контент для пользователя с ID 1;



    ?>
<section id="ag-viewed-section" class="mb__section product__advice alfa__slider" style="display:none;" data-loop="true" data-speed="300" data-spacebetween="0" data-delay="2000">
  <div class="container">
    <div class="block__header">
      <h2>Вы смотрели</h2>
      <!-- кнопки -->
    </div>
  </div>


  <div class="block__content">
    <div class="swiper-wrapper" data-recent="1" id="ag-viewed">
      <!-- сюда JS подставит слайды -->
    </div>
  </div>
</section>

<?php
/*
	?>
	<section class="mb__section product__advice alfa__slider" data-loop="true" data-speed="300" data-spacebetween="0" data-delay="2000">
		<div class="container">
			<div class="block__header">
				<h2>Вы смотрели</h2>
				<div class="btn__group btn__group_slider d-none d-sm-flex">
					<div class="btn btn__slider btn__prev">
						<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="30" cy="30" r="29.2772" stroke="#000" stroke-width="1.44565" />
							<path fill-rule="evenodd" clip-rule="evenodd" d="M32.7076 25.2929C33.0981 25.6834 33.0981 26.3166 32.7076 26.7071L29.4147 30L32.7076 33.2929C33.0981 33.6834 33.0981 34.3166 32.7076 34.7071C32.3171 35.0976 31.6839 35.0976 31.2934 34.7071L27.2934 30.7071C26.9029 30.3166 26.9029 29.6834 27.2934 29.2929L31.2934 25.2929C31.6839 24.9024 32.3171 24.9024 32.7076 25.2929Z" fill="#000" />
						</svg>
					</div>
					<div class="btn btn__slider btn__next">
						<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="30" cy="30" r="29.2772" Autoplay stroke="#000" stroke-width="1.44565" />
							<path fill-rule="evenodd" clip-rule="evenodd" d="M27.2924 25.2929C26.9019 25.6834 26.9019 26.3166 27.2924 26.7071L30.5853 30L27.2924 33.2929C26.9019 33.6834 26.9019 34.3166 27.2924 34.7071C27.6829 35.0976 28.3161 35.0976 28.7066 34.7071L32.7066 30.7071C33.0971 30.3166 33.0971 29.6834 32.7066 29.2929L28.7066 25.2929C28.3161 24.9024 27.6829 24.9024 27.2924 25.2929Z" fill="#000" />
						</svg>
	
					</div>
				</div>
			</div>
		</div>

		<?php    
		$products_list = get_field('products_list');
		$args = array (
			'posts_per_page'	=> 20,
			'post_type' => 'product',
			'post__in' => $products_list,
			'post__not_in' => [get_the_ID()],
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
    
<?php 
*/
//endif; // Показываем контент для пользователя с ID 1;
##############################################################
?>




<?php 
# Варианты использования
if(get_field('uses_on')):
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