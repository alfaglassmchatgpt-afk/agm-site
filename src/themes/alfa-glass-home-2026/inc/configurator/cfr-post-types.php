<?php
// ============================================
// РЕГИСТРАЦИЯ КАСТОМНОГО ТИПА ЗАПИСИ "ЗАЯВКИ"
// ============================================

function cfr_register_request_post_type() {
    $labels = array(
        'name'               => 'Заявки',
        'singular_name'      => 'Заявка',
        'menu_name'          => 'Заявки',
        'add_new'            => '', // 👈 Пустая строка
        'add_new_item'       => '', // 👈 Пустая строка
        'edit_item'          => 'Редактировать заявку',
        'view_item'          => 'Просмотреть заявку',
        'search_items'       => 'Искать заявки',
        'not_found'          => 'Заявки не найдены',
        'not_found_in_trash' => 'В корзине заявок не найдено',
    );
    
    $args = array(
        'labels'             => $labels,
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_nav_menus'  => false,
        'exclude_from_search'=> true,
        'capability_type'    => 'post',
        'capabilities'       => array(
            'create_posts' => false, // 👈 false вместо 'do_not_allow'
        ),
        'map_meta_cap'       => true, // 👈 ДОБАВИТЬ ЭТУ СТРОКУ
        'query_var'          => false,
        'rewrite'            => false,
        'has_archive'        => false,
        'hierarchical'       => false,
        'menu_position'      => 25,
        'menu_icon'          => 'dashicons-clipboard',
        'supports'           => array('title', 'editor'),
        'show_in_rest'       => false,
    );
    
    register_post_type('request', $args);
}
add_action('init', 'cfr_register_request_post_type');

// ============================================
// ИЗМЕНЕНИЕ КОЛОНОК В АДМИНКЕ
// ============================================

add_filter('manage_request_posts_columns', function($columns) {
    $new_columns = array(
        'cb' => $columns['cb'],
        'title' => 'Номер заявки',
        'customer_info' => 'Контактная информация',
        'date' => 'Дата',
        // 'status' => 'Статус' // 👈 ЗАКОММЕНТИРОВАНО
    );
    return $new_columns;
});

add_action('manage_request_posts_custom_column', function($column, $post_id) {
    switch ($column) {
        case 'customer_info':
            $email = get_post_meta($post_id, '_customer_email', true);
            $phone = get_post_meta($post_id, '_customer_phone', true);
            $name = get_post_meta($post_id, '_customer_name', true);
            
            echo '<strong>' . esc_html($name) . '</strong><br>';
            if ($email) echo '📧 ' . esc_html($email) . '<br>';
            if ($phone) echo '📞 ' . esc_html($phone);
            break;
            
        // case 'status': // 👈 ЗАКОММЕНТИРОВАНО
        //     $status = get_post_meta($post_id, '_status', true);
        //     $status_labels = array(
        //         'new' => '<span style="color:#2271b1;font-weight:bold;">🆕 Новая</span>',
        //         'processed' => '<span style="color:#dba617;font-weight:bold;">🔄 В работе</span>',
        //         'completed' => '<span style="color:#00a32a;font-weight:bold;">✅ Завершена</span>'
        //     );
        //     echo $status_labels[$status] ?? $status;
        //     break;
    }
}, 10, 2);

// ============================================
// УДАЛЕНИЕ "ИЗМЕНИТЬ ПОРЯДОК" ИЗ МЕНЮ
// ============================================

add_action('admin_menu', function() {
    remove_submenu_page('edit.php?post_type=request', 'order-post-types-request');
}, 999);



// ============================================
// СЧЕТЧИК НОВЫХ ЗАЯВОК В МЕНЮ АДМИНКИ
// ============================================

/**
 * Добавляет счетчик новых заявок (pending) в меню "Заявки"
 * Работает так же как счетчик комментариев в WordPress
 */
add_filter('add_menu_classes', function($menu) {
    // Считаем только заявки со статусом "pending" (на утверждении)
    $pending_count = wp_count_posts('request')->pending;
    
    if ($pending_count > 0) {
        // Ищем наш пункт меню "Заявки"
        foreach ($menu as $key => $item) {
            if ($item[2] === 'edit.php?post_type=request') {
                // Добавляем счетчик (такой же как у комментариев)
                $menu[$key][0] .= sprintf(
                    ' <span class="update-plugins count-%d">
                        <span class="plugin-count">%d</span>
                    </span>',
                    $pending_count,
                    number_format_i18n($pending_count)
                );
                break;
            }
        }
    }
    
    return $menu;
});
?>