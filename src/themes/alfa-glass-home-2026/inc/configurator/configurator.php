<?php
/**
 * Main Configurator Loader
 */

// Защита от прямого доступа
if (!defined('ABSPATH')) {
    exit;
}

// Подключаем дополнительные файлы
//require_once __DIR__ . '/debug.php';
require_once __DIR__ . '/cfr-post-types.php';
require_once __DIR__ . '/cfr_the_prod_fields.php';
require_once __DIR__ . '/cfr-order-counter.php';

if ( ! function_exists( 'ag_gs_send_cf7_to_sheets' ) ) {
	$ag_gs_paths = array(
		__DIR__ . '/google-sheets.php',
		dirname( __DIR__, 2 ) . '/google-sheets.php',
		get_template_directory() . '/google-sheets.php',
	);
	foreach ( $ag_gs_paths as $ag_gs_path ) {
		if ( is_readable( $ag_gs_path ) ) {
			require_once $ag_gs_path;
			break;
		}
	}
}


// Подключаем фронтенд скрипт

add_action('wp_enqueue_scripts', 'cfr_enqueue_frontend_scripts');
function cfr_enqueue_frontend_scripts() {
    // Регистрируем и подключаем наш JS
    wp_register_script(
        'configurator-frontend', get_template_directory_uri() . '/inc/configurator/configurator-frontend.js', array('jquery'), _S_VERSION . '-gs2', true
    );
    
    // Подключаем только на страницах товаров
    if (is_singular('product') || is_page('configurator')) {
        wp_enqueue_script('configurator-frontend');
        
        // Передаем данные из PHP в JS
        wp_localize_script('configurator-frontend', 'cfrConfig', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('cfr_nonce'),
            'product_id' => get_the_ID()
        ));
    }
}




// 1. РЕГИСТРАЦИЯ СТРАНИЦЫ ОПЦИЙ
if ( function_exists('acf_add_options_page') ) {
    acf_add_options_page(array(
        'page_title' => 'Дополнительные настройки для alfaglass',
        'menu_title' => 'Альфа-настройки',
        'menu_slug'  => 'alfa-options',
        'capability' => 'edit_posts',
        'redirect'   => false,
    ));
}



// 2. ДИНАМИЧЕСКОЕ ОБНОВЛЕНИЕ - СОЗДАЕМ ТАКИЕ ЖЕ ПОЛЯ КАК В БИБЛИОТЕКЕ
add_filter('acf/load_field/name=configurator-product-blocks', 'add_cfr_custom_size_layout', 1);
function add_cfr_custom_size_layout($field) {
    // Проверяем, что это flexible_content поле
    if (empty($field['type']) || $field['type'] !== 'flexible_content') {
        return $field;
    }

    // Гарантируем min/max (ACF ожидает строки или числа)
    if (!isset($field['min'])) {
        $field['min'] = 0;
    }
    if (!isset($field['max'])) {
        $field['max'] = 0;
    }

    // Соберём массив динамических layouts (можно расширять)
    $dynamic_layouts = array();

    $options_library = get_field('ag-configurator', 'option');
    $layouts = array();
    foreach($options_library as $k => $item) {
        if (!is_array($item) || !isset($item['acf_fc_layout'])) {
            continue;
        }        

        // идея именовать префиксы
        // cfr-lib_block-name - для библиотеки
        // cfr-prod_block-name - для продукта
        // cfr-cat - категория...


        // ОПЦИЯ "Указать свой размер"
        if ($item['acf_fc_layout'] === 'cfr-lib_size') {
            //$uniq = uniqid();
            $layout_key  = 'cfr-prod_size';
            $layout_name = 'cfr-prod_size'; // берём имя блока из библиотеки
            $layouts[] = array(
                '_name' => $layout_name,
                '_key'  => $layout_key,
                'key'   => $layout_key,
                'name'  => $layout_name,
                'label' => 'Указать свои размеры', // Имя блока
                'display' => 'block',
                'sub_fields' => array(
                    array(
                        'key' => $layout_key . 'heading',
                        'label' => 'Заголовок',
                        'name' => 'heading',
                        'type' => 'text',
                        '_name' => 'heading',
                        '_key'  => $layout_key . 'heading',
                        'default_value' => $item['heading'] ?? '', // Значение из библиотеки
                        'wrapper' => array('width' => '50%',),  
                    ),
                    array(
                        'key' => $layout_key . 'email-label',
                        'label' => 'Как будет подписано в письме',
                        'name' => 'email-label',
                        'type' => 'text',
                        '_name' => 'email-label',
                        '_key'  => $layout_key . 'email-label',
                        'default_value' => $item['email-label'] ?? '', // Значение из библиотеки
                        'wrapper' => array('width' => '50%',),                        
                    ),
                    array(
                        'key' => $layout_key . '_unit',
                        'label' => 'Ед. изм.',
                        'name' => 'unit',
                        'type' => 'text',
                        '_name' => 'unit',
                        '_key'  => $layout_key . '_unit',
                        'default_value' => $item['unit'] ?? '', // Значение из библиотеки
                        'wrapper' => array('width' => '25%',),  
                    ),
                    array(
                        'key' => $layout_key . '_type',
                        '_key' => $layout_key . '_type',
                        'label' => 'Отображаемые поля',
                        'name'  => 'type',
                        '_name' => 'type',
                        'type'  => 'button_group',
                        'choices' => array(
                            'sizes' => 'высота + ширина',
                            'size'  => 'диаметр',
                        ),
                        'default_value' => 'sizes',
                        'allow_null' => 0,
                        'wrapper' => array('width' => '50%',), 
                    ),
                    
                ),
                'min' => '',
                'max' => '1',
            );
        }    
        
        // ОПЦИЯ "Цвет подсветки" - заголовок и текстовое сообщение, опции подтянет js
        if ($item['acf_fc_layout'] === 'cfr-lib_backlight-color') {
            //$uniq = uniqid();
            $layout_key  = 'cfr-prod_backlight-color';
            $layout_name = 'cfr-prod_backlight-color'; // берём имя блока из библиотеки
            $layouts[] = array(
                '_name' => $layout_name,
                '_key'  => $layout_key,
                'key'   => $layout_key,
                'name'  => $layout_name,
                'label' => 'Цвет подсветки', // Имя блока
                'display' => 'block',
                'sub_fields' => array(
                    array(
                        'key' => $layout_key . 'heading',
                        'label' => 'Заголовок',
                        'name' => 'heading',
                        'type' => 'text',
                        '_name' => 'heading',
                        '_key'  => $layout_key . 'heading',
                        'default_value' => $item['heading'] ?? '', // Значение из библиотеки
                        'wrapper' => array('width' => '50%',),  
                    ),           
                    array(
                        'key' => $layout_key . 'email-label',
                        'label' => 'Как будет подписано в письме',
                        'name' => 'email-label',
                        'type' => 'text',
                        '_name' => 'email-label',
                        '_key'  => $layout_key . 'email-label',
                        'default_value' => $item['email-label'] ?? '', // Значение из библиотеки
                        'wrapper' => array('width' => '50%',),                        
                    ),                    
                    array(
                        '_key'  => $layout_key . 'info-message',
                        '_name' => 'info-message',
                        'key' => $layout_key . 'info-message',
                        'name' => 'info-message',
                        'label' => '',
                        'type' => 'message',  // ← ТИП ИЗМЕНЕН НА 'message'
                        'message' => 'Набор опций с названиями добавляется автоматически. Для работы опции требуется заполнение поля "Основная галерея" во вкладке "Название и фото". 
Отдельно для каждой фотографии обязательно указать "Описание", оно и будет отображаться как опция для выбора.',
                        'wrapper' => array(
                            'width' => '100%',
                        )
                    )                    
                ),
                'min' => '',
                'max' => '1',
            );
        }       



        // ОПЦИЯ "Вызвать замерщика" - просто чекбокс
        if ($item['acf_fc_layout'] === 'cfr-lib_call-measurer') {
            //$uniq = uniqid();
            $layout_key  = 'cfr-prod_call-measurer';
            $layout_name = 'cfr-prod_call-measurer'; // берём имя блока из библиотеки
            $layouts[] = array(
                '_name' => $layout_name,
                '_key'  => $layout_key,
                'key'   => $layout_key,
                'name'  => $layout_name,
                'label' => 'Установка изделия', // Имя блока
                'display' => 'block',
                'sub_fields' => array(
                    array(
                        'key' => $layout_key . 'heading',
                        'label' => 'Заголовок группы',
                        'name' => 'heading',
                        'type' => 'text',
                        '_name' => 'heading',
                        '_key'  => $layout_key . 'heading',
                        'default_value' => $item['heading'] ?? '', // Значение из библиотеки
                        'wrapper' => array('width' => '50%',),  
                    ),           
                    array(
                        'key' => $layout_key . 'email',
                        'label' => 'Как будет подписано в письме',
                        'name' => 'email-label',
                        'type' => 'text',
                        '_name' => 'email-label',
                        '_key'  => $layout_key . 'email-label',
                        'default_value' => $item['email-label'] ?? '', // Значение из библиотеки
                        'wrapper' => array('width' => '50%',),                        
                    ),
                    array(
                        'key' => $layout_key . 'item-install',
                        'label' => 'Монтаж',
                        'name' => 'install-label',
                        'type' => 'text',
                        '_name' => 'install-label',
                        '_key'  => $layout_key . 'install-label',
                        'default_value' => $item['item-install'] ?? '', // Значение из библиотеки
                        'wrapper' => array('width' => '50%',),                        
                    ),  
                    array(
                        '_key'  => $layout_key . 'default-value-install',                        
                        '_name' => 'default-value',
                        'key' => $layout_key .'default-value-install',
                        'name' => 'default-value-install',
                        'label' => '',
                        'type' => 'checkbox',
                        'choices' => array(
                            'on' => 'Состояние по умолчанию'  // ← такой же как в библиотеке
                        ),
                        'default_value' => $item['default-value-install'] ?? array(), // берем из библиотеки
                        'return_format' => 'value',
                        'wrapper' => array(
                            'width' => '50%',
                        )
                    ),
                    array(
                        'key' => $layout_key . 'item-measurer',
                        'label' => 'Вызов замерщика',
                        'name' => 'measurer-label',
                        'type' => 'text',
                        '_name' => 'measurer-label',
                        '_key'  => $layout_key . 'measurer-label',
                        'default_value' => $item['item-measurer'] ?? '', // Значение из библиотеки
                        'wrapper' => array('width' => '50%',),                        
                    ),  
                    array(
                        '_key'  => $layout_key . 'default-value-measurer',                        
                        '_name' => 'default-value',
                        'key' => $layout_key .'default-value-measurer',
                        'name' => 'default-value-measurer',
                        'label' => '',
                        'type' => 'checkbox',
                        'choices' => array(
                            'on' => 'Состояние по умолчанию'  // ← такой же как в библиотеке
                        ),
                        'default_value' => $item['default-value-measurer'] ?? array(), // берем из библиотеки
                        'return_format' => 'value',
                        'wrapper' => array(
                            'width' => '50%',
                        )
                    ),
                    array(
                        'key' => $layout_key . '_adrs-placeholder',
                        'label' => 'Подсказка для адреса',
                        'name' => 'adrs-placeholder',
                        'type' => 'text',
                        '_name' => 'adrs-placeholder',
                        '_key'  => $layout_key . '_adrs-placeholder',
                        'default_value' => $item['adrs-placeholder'] ?? '', // Значение из библиотеки
                        'wrapper' => array('width' => '100%',),                        
                    )                    
                ),
                'min' => '',
                'max' => '1',
            );
        }       


        // ОПЦИЯ "Чекбоксы" - позволяет создать группу чекбоксов/радио, сделать их в виде кнопок и изменить направление строка/колонка.
        if (strpos($item['acf_fc_layout'], 'cfr-lib_checkboxes_') === 0) { 
            
            $number = str_replace('cfr-lib_checkboxes_', '', $item['acf_fc_layout']);
            $layout_key  = 'cfr-prod_checkboxes_' . $number;
            $layout_name = 'cfr-prod_checkboxes_' . $number;
            
            // Получаем items из библиотеки
            $library_items = isset($item['items']) && is_array($item['items']) ? $item['items'] : array();
            
            // Подготавливаем default_value для repeater
            $items_default = array();
            foreach ($library_items as $lib_item) {
                if (isset($lib_item['label'])) {
                    $items_default[] = array(
                        'field_' . $layout_key . '_items_label' => $lib_item['label']
                    );
                }
            }
            
            $layouts[] = array(
                '_name' => $layout_name,
                '_key'  => $layout_key,
                'key'   => $layout_key,
                'name'  => $layout_name,
                'label' => ($item['heading']) ? $item['heading'] . ' (Чекбоксы / кнопки) ' : 'Чекбоксы / кнопки',
                'display' => 'block',
                'sub_fields' => array(
                    array(
                        'key'           => 'field_' . $layout_key . '_heading',
                        '_key'          => 'field_' . $layout_key . '_heading',
                        'label'         => 'Заголовок',
                        '_name'         => 'heading',
                        'name'          => 'heading',
                        'type'          => 'text',
                        'default_value' => $item['heading'] ?? '',
                        'required'      => 0,
                        'maxlength'     => '',
                        'wrapper'       => array('width' => '50%'),
                    ),                          
                    array(
                        'key'           => 'field_' . $layout_key . '_email-label',
                        '_key'          => 'field_' . $layout_key . '_email-label',
                        'label'         => 'Как будет подписано в письме',
                        '_name'         => 'email-label',
                        'name'          => 'email-label',
                        'type'          => 'text',
                        'default_value' => $item['email-label'] ?? '',
                        'required'      => 0,
                        'maxlength'     => '',
                        'wrapper'       => array('width' => '50%'),
                    ),
                    array(
                        'key'           => 'field_' . $layout_key . '_multiple',
                        '_key'          => 'field_' . $layout_key . '_multiple',
                        'label'         => 'Тип выбора',
                        '_name'         => 'multiple',
                        'name'          => 'multiple',
                        'type'          => 'radio',
                        'layout'        => 'vertical',
                        'choices'       => array('checkbox' => 'множественный выбор','radio' => 'одиночный'),
                        'default_value' => $item['multiple'] ?? 'radio',
                        'return_format' => 'value',
                        'required'      => 0,
                        'save_other_choice' => 0,
                        'wrapper'       => array('width' => '33%'),
                    ),
                    array(
                        'key'           => 'field_' . $layout_key . '_view',
                        '_key'          => 'field_' . $layout_key . '_view',
                        'label'         => 'View',
                        '_name'         => 'view',
                        'name'          => 'view',
                        'type'          => 'radio',
                        'layout'        => 'vertical',
                        'choices'       => array('buttons' => 'Кнопки','texts' => 'Текст'),
                        'default_value' => $item['view'] ?? 'texts',
                        'return_format' => 'value',
                        'required'      => 0,
                        'save_other_choice' => 0,
                        'wrapper'       => array('width' => '33%'),
                    ),
                    array(
                        'key'           => 'field_' . $layout_key . '_directions',
                        '_key'          => 'field_' . $layout_key . '_directions',
                        'label'         => 'Расположение',
                        '_name'         => 'directions',
                        'name'          => 'directions',
                        'type'          => 'radio',
                        'layout'        => 'vertical',
                        'choices'       => array('rows' => 'в ряд', 'cols' => 'один под другим'),
                        'default_value' => $item['directions'] ?? 'rows',
                        'return_format' => 'value',
                        'required'      => 0,
                        'save_other_choice' => 0,
                        'wrapper'       => array('width' => '33%'),
                    ),
                    // Поле items (repeater)
                    array(
                        'key'           => 'field_' . $layout_key . '_items',
                        '_key'          => 'field_' . $layout_key . '_items',
                        'label'         => 'Варианты',
                        '_name'         => 'items',
                        'name'          => 'items',
                        'type'          => 'repeater',
                        'required'      => 0,
                        'min'           => 0,
                        'max'           => 0,
                        'layout'        => 'block',
                        'button_label'  => 'Добавить вариант',
                        'collapsed'     => '', // Оставляем пустым для простоты
                        'wrapper'       => array('width' => '100%'),
                        'sub_fields'    => array(
                            array(
                                'key'           => 'field_' . $layout_key . '_items_label',
                                '_key'          => 'field_' . $layout_key . '_items_label',
                                'label'         => 'Текст / значение',
                                '_name'         => 'label',
                                'name'          => 'label',
                                'type'          => 'text',
                                'required'      => 0,
                                'maxlength'     => '',
                                'wrapper'       => array('width' => '50%'),
                            ),
                        ),
                        // ВАЖНО: Правильная структура default_value для repeater
                        'default_value' => $items_default,
                    ),
                ),
                'min' => '',
                'max' => '1',
            );
        }       
           

    } // endforeach;

    
    // Добавляем ваш layout в массив динамических layouts
    $dynamic_layouts = $layouts;

    // Полностью заменяем существующие layouts на наши динамические
    $field['layouts'] = $dynamic_layouts;

    // Убедимся снова в min/max
    if (!isset($field['min'])) $field['min'] = 0;
    if (!isset($field['max'])) $field['max'] = 0;

    return $field;

}





/**
 * Мы не можем добавлять много групп с одинаковым ключём, так как
 * не сможем адекватно синхронизировать то что в библиотеке и что в товаре...
 * при добавлении/удалении какого либо нарушится порядок и мы перезапишем не то что надо
 * -
 * поэтому идём другим путём, создаём НЕСКОЛЬКО одинаковых элементов по отдельности - получим разные id.
 * Но чтоб не было в "добавить" много "чекбоксы", мы будем выдавать их там по 1, по мере использования
 * 1 заняли, открывается второй...
 */
add_action('admin_head', 'cfr_smart_add_buttons_clean');
function cfr_smart_add_buttons_clean() {
    global $pagenow;
    if ($pagenow !== 'admin.php' || !isset($_GET['page']) || $_GET['page'] !== 'alfa-options') {
        return;
    }
    ?>
    
    <script>
    jQuery(document).ready(function($) {
        function replaceAddPopup() {
            var $popup = $('.acf-fc-popup');
            if ($popup.length === 0) return;
            
            var $checkboxButtons = $popup.find('[data-layout^="cfr-lib_checkboxes_"]');
            var $availableButton = $checkboxButtons.not('.disabled').first();
            
            $checkboxButtons.hide();
            
            if ($availableButton.length > 0) {
                $availableButton.show();
                // УБИРАЕМ переименование - оставляем оригинальный текст
            }
        }
        
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                    $(mutation.addedNodes).each(function() {
                        if ($(this).hasClass('acf-fc-popup') || $(this).find('.acf-fc-popup').length) {
                            setTimeout(replaceAddPopup, 10);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        $('body').on('click', '[data-name="add-layout"]', function() {
            setTimeout(replaceAddPopup, 100);
        });
        
        acf.addAction('append remove', function() {
            setTimeout(replaceAddPopup, 100);
        });
    });
    </script>
    <?php
}




/**
 * Чекбоксы / кнопки - так как группа добавляется сколько угодно раз и
 * будут множество "Чекбоксы / кнопки", будет не понятно где и что именно, придется заходить 
 * а этот код к лейблу будет добавлять в скобках то что пользователь вписал в heading
 * Будет "Чекбоксы / кнопки (Текст из хеадинг)"
 */
/**
 * Универсальный фильтр для красивого отображения лейаутов в flexible content
 * Работает как в товарах, так и в библиотеке опций
 */
##############################################################
################ Авто переименование в библиотеке ############
##############################################################
add_filter('acf/fields/flexible_content/layout_title', 'cfr_library_only_title', 10, 4);
function cfr_library_only_title($title, $field, $layout, $i) {
    // Только в админке
    if (!is_admin()) {
        return $title;
    }
    
    // Только для библиотеки опций
    $screen = get_current_screen();
    if (!$screen || $screen->id !== 'toplevel_page_alfa-options') {
        return $title;
    }
    
    // Только layout'ы библиотеки cfr-lib_checkboxes_*
    $layout_name = $layout['name'];
    if (!preg_match('/^cfr-lib_checkboxes_\d+$/', $layout_name)) {
        return $title;
    }
    
    // Пробуем получить heading
    $heading = '';
    
    // 1. Самый простой способ - из get_sub_field
    if (function_exists('get_sub_field')) {
        $heading = get_sub_field('heading');
    }
    
    // 2. Из данных layout'а
    if (empty($heading) && isset($layout['value']) && is_array($layout['value'])) {
        if (!empty($layout['value']['heading'])) {
            $heading = $layout['value']['heading'];
        }
    }
    
    // 3. Для AJAX добавления (когда вводим и сразу видим)
    if (empty($heading) && wp_doing_ajax()) {
        $heading = cfr_get_ajax_heading($layout_name, $i);
    }
    
    // Форматируем результат
    if (!empty($heading)) {
        $heading = strip_tags($heading);
        if (mb_strlen($heading) > 60) {
            $heading = mb_substr($heading, 0, 60) . '…';
        }
        return $heading . ' (Чекбоксы / кнопки)';
    }
    
    return $title;
}

/**
 * Простой поиск heading в AJAX данных
 */
function cfr_get_ajax_heading($layout_name, $index) {
    if (empty($_POST['acf'])) {
        return '';
    }
    
    foreach ($_POST['acf'] as $field_key => $field_value) {
        if (is_array($field_value)) {
            foreach ($field_value as $i => $item) {
                if (is_array($item) && isset($item['heading'])) {
                    if ($i == $index) {
                        return $item['heading'];
                    }
                }
            }
        }
    }
    
    return '';
}
##############################################################
############### /Авто переименование в библиотеке ############
##############################################################

//add_action('admin_head-post.php', 'cfr_simple_debug_info');
/*
function cfr_simple_debug_info() {
    global $post;
    
    // Только для товаров
    if (!$post || $post->post_type !== 'product') {
        return;
    }
    
    // Получаем все мета-поля товара
    $all_meta = get_post_meta($post->ID);
    
    echo '<div style="position: fixed; top: 10px; right: 10px; background: white; border: 2px solid red; padding: 15px; z-index: 9999; max-width: 500px; max-height: 400px; overflow: auto;">';
    echo '<h3 style="margin-top: 0;">CFR Debug Info</h3>';
    echo '<p><strong>Post ID:</strong> ' . $post->ID . '</p>';
    
    echo '<p><strong>Мета-поля с "cfr" или "heading":</strong></p>';
    echo '<ul style="margin: 0; padding-left: 20px;">';
    
    $found_something = false;
    foreach ($all_meta as $key => $values) {
        if (strpos($key, 'cfr') !== false || strpos($key, 'heading') !== false) {
            $found_something = true;
            echo '<li><strong>' . $key . ':</strong> ';
            if (is_array($values)) {
                echo esc_html($values[0]);
            } else {
                echo esc_html($values);
            }
            echo '</li>';
        }
    }
    
    if (!$found_something) {
        echo '<li>Ничего не найдено</li>';
    }
    
    echo '</ul>';
    echo '<p><small>Закрой это окно после копирования информации</small></p>';
    echo '</div>';
}

*/















// Автозаполнение конфигуратора для категории ID 38 (С ЗАЩИТОТОЙ)
//add_action('wp', 'cfr_auto_fill_products_once');
function cfr_auto_fill_products_once() {
    // Если уже выполняли - выходим
    if (get_option('cfr_auto_fill_done')) {
        return;
    }
    
    $args = array(
        'post_type' => 'product',
        'posts_per_page' => -1,
        'tax_query' => array(
            array(
                'taxonomy' => 'product_category',
                'field'    => 'term_id',
                'terms'    => array(38),
            ),
        ),
    );
    
    $products = get_posts($args);
    $updated_count = 0;
    $skipped_count = 0;
    
    foreach ($products as $product) {
        $product_id = $product->ID;
        
        // 🔒 ПРОВЕРЯЕМ - ЕСЛИ УЖЕ ЗАПОЛНЕНО - ПРОПУСКАЕМ
        $existing_blocks = get_field('configurator-product-blocks', $product_id);
        if (!empty($existing_blocks)) {
            $skipped_count++;
            continue; // переходим к следующему товару
        }
        
        // Массив блоков для flexible content
        $configurator_blocks = array();
        
        // Блок 1: Указать свой размер
        $configurator_blocks[] = array(
            'acf_fc_layout' => 'cfr-prod_size',
            'heading' => 'Укажите размер изделия',
            's1' => 'Ширина',
            's2' => 'Высота',
            'unit' => 'см'
        );
        
        // Блок 2: Вызвать замерщика  
        $configurator_blocks[] = array(
            'acf_fc_layout' => 'cfr-prod_call-measurer',
            'is-active' => true
        );
        
        // Записываем в поле
        update_field('configurator-product-blocks', $configurator_blocks, $product_id);
        $updated_count++;
    }
    
    // Помечаем что выполнили
    update_option('cfr_auto_fill_done', true);
    
    // Логируем в error_log
    error_log("CFR Autofill: обновлено $updated_count, пропущено $skipped_count товаров категории ID 38");
}


/*
add_filter('wpcf7_mail_components', function($mail, $wpcf7) {
    if (!isset($mail['body'])) return $mail;
    
    if ($wpcf7->id() == 3128) {
        // Просто удаляем <br> в начале письма
        $mail['body'] = preg_replace('/^(\s*<br\s*\/?>\s*)+/i', '', $mail['body']);
        
        // Безопасность
        $mail['body'] = strip_tags($mail['body'], '<br><a>');
    }
    
    return $mail;
}, 10, 2);
*/


// contact@example.invalid
//add_action('wpcf7_before_send_mail', 'cf7_silent_block_non_russian_phone', 10, 1);
function cf7_silent_block_non_russian_phone($contact_form) {
    // Применяем только к нужной форме
    //if ((int) $contact_form->id() !== 3128) {
    //    return $contact_form;
    //}

    $submission = WPCF7_Submission::get_instance();
    if (! $submission) {
        return $contact_form;
    }

    $data = $submission->get_posted_data();
    //$phone = isset($data['tel-53']) ? trim($data['tel-53']) : '';
    $phone = '';
    foreach ($data as $key => $value) {
        if (strpos($key, 'tel-') === 0) { // ключ начинается с "tel-"
            $phone = trim($value);
            break; // убрать, если нужно собрать несколько таких полей
        }
    }
    $normalized = preg_replace('/[^0-9+]/', '', $phone);

    // Если номер не начинается с +7 — блокируем "молча"
    if ($normalized === '' || strpos($normalized, '+7') !== 0) {
        // ЕДИНСТВЕННОЕ что нужно сделать:
        add_filter('wpcf7_skip_mail', '__return_true');
        
        // Для отладки (опционально):
        // error_log("CF7 #{$contact_form->id()}: blocked non-RU phone: {$phone}");
    }
    
    return $contact_form;
}




