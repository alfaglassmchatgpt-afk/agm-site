<?php
/* 
##################################
cfr_the_prod_fields - основная функция, вывод полей.
cfr_render_heading - рендер .heading
##################################
*/

function cfr_the_prod_fields($product_id) {
    if (!$product_id) {
        echo 'отсутствует ID продукта';
    }
    

    $configurator_data = get_field('configurator-product-blocks', $product_id);
    //echo 'поля конфигуратора для продукта ID: ' . $product_id;
    //echo '<pre>';
    //print_r($configurator_data);
    //echo '</pre>';

    if (is_array($configurator_data) && count($configurator_data) > 0) {
        
        // Открываем контейнер конфигуратора
        echo '<div class="product__configurator cfig">';

        foreach($configurator_data as $key => $item) {            

            if($item['acf_fc_layout']) {
                

                // Группа "Указать свой размер".
                if($item['acf_fc_layout'] === 'cfr-prod_size') {
                    $type = $item['type'];
                    $tpl = ($type === 'size') ? '{size}' : '{size1}x{size2}'; 
                    ?>
                    <!-- Кастомный размер -->
                    <div class="cfig__group cfig__g-custom-size" data-email-template="<?= $item['email-label']?>:  <?= $tpl ?><?= $item['unit'] ?>">
                        <div class="cfig__heading"><?= $item['heading'] ?></div>
                        <div class="cfig__body">
                            <?php if($type === 'size'):?>
                            <span><input class="cfig__input" type="number" autocomplete="off" placeholder="" name="size"></span>
                            <span><?= $item['unit'] ?></span>
                            
                            <?php else: ?>                             
                            <span><input class="cfig__input" type="number" autocomplete="off" placeholder="" name="size1"></span>
                            <span>x</span>
                            <span><input class="cfig__input" type="number" autocomplete="off" placeholder="" name="size2"></span>
                            <span><?= $item['unit'] ?></span>
                            <?php endif; ?>
                        </div>
                    </div>                    
                    <?php              
                }

                // Группа "Цвет подсветки.
                if($item['acf_fc_layout'] === 'cfr-prod_backlight-color') {
    // надо получить эти изображения... 
    $cur_terms = wp_get_post_terms($product_id, 'product_category');
    $belongs_to_category = false; // описание есть в content-product.php
    foreach ($cur_terms as $term) {
        if ((int)$term->term_id === 30) {
            $belongs_to_category = true;
            break;
        }
    }
    $gallery = get_field('main_gallary');
    if (!$belongs_to_category) {
        $ar_image_ids = array_filter([
            get_post_thumbnail_id(get_the_ID()),    // Основное изображение
            ...(is_array($gallery) ? $gallery : []) // Фотографии из поля
        ]);
    } else {
        // Товары принадлежат категории с ID 30
        // Используем СПЕЦИАЛЬНЫЙ сценарий: если есть фотографии в поле — используем их, иначе — основное изображение
        $ar_image_ids = ($gallery && count($gallery) > 1) ? $gallery : array(get_post_thumbnail_id(get_the_ID()));
    }   
    
    // Получаем ID первого изображения (которое будет активным на сайте)
    $first_image_id = !empty($ar_image_ids) ? reset($ar_image_ids) : null;
    
    // Собираем радио-кнопки только для изображений с описанием
    $radio_buttons = [];
    $first_radio_corresponds_to_first_image = false;
    
    if(!empty($ar_image_ids)):
        $radio_index = 0;
        foreach($ar_image_ids as $image_index => $image_id):
            $description = get_post_field('post_content', $image_id);
            if(!$description) continue; // Пропускаем изображения без описания
            
            $radio_buttons[] = [
                'id' => $image_id,
                'description' => $description,
                'image_index' => $image_index
            ];
            
            // Проверяем, соответствует ли ПЕРВАЯ радио-кнопка ПЕРВОМУ изображению
            if($radio_index === 0 && $image_id == $first_image_id) {
                $first_radio_corresponds_to_first_image = true;
            }
            
            $radio_index++;
        endforeach;
    endif;
    ?>

    <div class="cfig__group cfig__g-buttons js-backlight-color b-backlight-color" data-blc-id="blc<?= $product_id ?>" data-email-template="<?= $item['email-label']?>: {bcolor}">
        <div class="cfig__heading"><?= $item['heading'] ?></div>
        <div class="cfig__body">
            <fieldset style="flex-direction: column;">
                <?php
                if(!empty($radio_buttons)): 
                    foreach($radio_buttons as $index => $radio_data):
                        // Активируем только если:
                        // 1. Это первая радио-кнопка И она соответствует первому изображению
                        // 2. ИЛИ (альтернатива) если это первая радио-кнопка вообще
                        $is_active = ($index === 0 && $first_radio_corresponds_to_first_image) ? 'checked' : '';
                ?>
                    <label class="cfig__cb-btn">
                        <input value="<?php echo esc_attr($radio_data['description']); ?>" 
                               onclick="switchThumbnail(this)" 
                               name="bcolor" 
                               type="radio"
                               <?php echo $is_active; ?>>
                        <span class="cfig__input"><?php echo esc_html($radio_data['description']); ?></span>
                    </label>                         
                <?php 
                    endforeach;             
                endif;                
                ?>                         
            </fieldset>
        </div>
    </div>                    
    <?php              
}

                // Группа "Вызов замерщика".
                if($item['acf_fc_layout'] === 'cfr-prod_call-measurer') {
                    $i_checked_status = ($item['default-value-install'][0] && $item['default-value-install'][0] === 'on') ? 'checked' : false;
                    $m_checked_status = ($item['default-value-measurer'][0] && $item['default-value-measurer'][0] === 'on') ? 'checked' : false;
                    $address_display = ($checked_status) ? '' : 'display: none;';
                    ?>
                    <!-- Вызвать замерщика да/нет -->
                    <div class="cfig__group cfig__g-checboxes js-g-measurer" data-email-template="<?= $item['email-label']?>: {measurer}">
                        <div class="cfig__heading"><?= $item['heading'] ?></div>
                        <div class="cfig__body">
                            <fieldset>                            
                                <label class="cfig__cb">
                                    <input name="measurer" type="checkbox" value="<?= $item['install-label']?>" <?= $i_checked_status ?>>
                                    <span class="cfig__input"><?= $item['install-label']?></span>
                                </label>      
                                <label class="cfig__cb">
                                    <input name="measurer" type="checkbox" value="<?= $item['measurer-label']?>" <?= $m_checked_status ?>>
                                    <span class="cfig__input"><?= $item['measurer-label']?></span>
                                </label>    
                            </fieldset>                    
                        </div>
                    </div>  
                    
                    

                    <!-- Поле ввода адреса -->
                    <div class="cfig__group cfig__g-custom-size g-address js-g-address" style="<?= $address_display ?>" data-email-template="Адрес для замерщика: {address}">
                        <div class="cfig__heading">Адрес<i class="_color-red">*</i></div>
                        <div class="cfig__body" style="flex-direction: column;">
                            <input class="cfig__input" style="width: 100%; max-width: unset;" type="text" autocomplete="off" placeholder="<?= $item['adrs-placeholder']?>" name="address">  
                            <div class="cfig-error-message" style="display:none;">Укажите город, название улицы, номер дома и квартиры</div>
                        </div>
                    </div> 
                    <?php  
                }

                // Группа "Чекбоксы / кнопки".
                if (strpos($item['acf_fc_layout'], 'cfr-prod_checkboxes_') === 0):
                    $option_name = 'g-ops-' . $key;
                    $multiple = $item['multiple'];   // checkbox / radio
                    $directions = ($item['directions'] === 'cols') ? 'flex-direction: column;' : '';  // rows / cols     

                    $view_g_class = 'cfig__g-checboxes'; // buttons / texts
                    $view_o_class = 'cfig__cb';          // buttons / texts
                    if($item['view'] === 'buttons') {
                        $view_g_class = 'cfig__g-buttons';
                        $view_o_class = 'cfig__cb-btn';
                    }
                ?>        
                                
                    <!-- Выберите размер изделия - чекбоксы -->
                    <div class="cfig__group <?= $view_g_class ?>" data-email-template="<?= $item['email-label']?>: {<?= $option_name ?>}">                        
                        <div class="cfig__heading"><?= $item['heading'] ?></div>
                        <div class="cfig__body">
                            <fieldset style="<?= $directions ?>">
                                <?php foreach($item['items'] as $o => $option):?>                                
     

                                <label class="<?= $view_o_class ?>">
                                    <input value="<?= $option['label'] ?>" name="<?= $option_name ?>" type="<?= $multiple ?>">
                                    <span class="cfig__input"><?= $option['label'] ?></span>
                                </label>                                
                                <?php endforeach;?>
                            </fieldset>
                        </div>
                    </div>                    

                <?php              
                endif;



                /*
                // Группа "Указать свой размер".
                if($item['acf_fc_layout'] === 'cfr-prod_call-measurer') {                                     
                    ?>
                    <!-- Выберите размер изделия - радио -->
                    <div class="cfig__group cfig__g-buttons" data-email-template="<?= $item['email-label']?>: {size1}x{size2}<?= $item['unit'] ?>">
                        <div class="cfig__heading"><?= $item['heading'] ?></div>
                        <div class="cfig__body">
                            <fieldset>
                                <?php //foreach():?>
                                <label class="cfig__cb-btn">
                                    <input value="50x50" name="size" type="radio">
                                    <span class="cfig__input">50×50</span>
                                </label>                                
                                <?php //endforeach;?>
                            </fieldset>
                        </div>
                    </div>                                        
                    <?php
                }
                */
                
            }                       
        }

        echo '</div>'; // закрываем контейнер конфигуратора
    }
}


/* Заголовок группы опций */
function cfr_render_heading($title) {
    return "<div class='cfr__heading'>{$title}: </div>";
}