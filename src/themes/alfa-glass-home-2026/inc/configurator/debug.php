<?php


// 3. ОТЛАДКА - ВЫВОДИМ ВСЕ НА ЭКРАН
add_filter('acf/load_field', function($field) {
    // Выводим только в админке на странице товара
    if (is_admin() && isset($_GET['post']) && isset($field['name'])) {
        
        // Если это наше поле конфигуратора
        if ($field['name'] === 'configurator-product-blocks') {
            echo '<div style="background: #ffeb3b; padding: 20px; margin: 20px 0; border: 2px solid red;">';
            echo '<h3>🔍 ОТЛАДКА CONFIGURATOR FIELDS</h3>';
            echo '<p><strong>Имя поля:</strong> ' . $field['name'] . '</p>';
            echo '<p><strong>Ключ поля:</strong> ' . $field['key'] . '</p>';
            echo '<p><strong>Количество лейаутов:</strong> ' . count($field['layouts']) . '</p>';
            
            echo '<p><strong>Лейауты (полная структура):</strong></p>';
            echo '<pre style="background: white; padding: 10px; border: 1px solid #ccc; max-height: 400px; overflow: auto;">';
            print_r($field['layouts']);
            echo '</pre>';
            
            // Проверяем библиотеку
            $options_library = get_field('ag-configurator', 'option');
            echo '<p><strong>Библиотека ag-configurator:</strong> ' . (empty($options_library) ? 'ПУСТО' : 'ЕСТЬ ДАННЫЕ') . '</p>';
            
            if (!empty($options_library) && is_array($options_library)) {
                echo '<p><strong>Элементы библиотеки (полная структура):</strong></p>';
                echo '<pre style="background: white; padding: 10px; border: 1px solid #ccc; max-height: 400px; overflow: auto;">';
                print_r($options_library);
                echo '</pre>';
            }
            
            echo '</div>';
        }
    }
    
    return $field;
});