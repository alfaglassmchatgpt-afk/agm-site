<?php
/**
 * Атомарный генератор номеров заявок с шаблонами
 */

// ============================================
// НАСТРОЙКИ (меняем только здесь!)
// ============================================
define('ORDER_COUNTER_MODE', 'continuous'); // 'daily' или 'continuous'
define('ORDER_COUNTER_TEMPLATE_DAILY', '{prefix}-{date_short}-{counter:4}');
define('ORDER_COUNTER_TEMPLATE_CONTINUOUS', '{prefix}-{date_short}-{counter:6}');
define('ORDER_COUNTER_PREFIX', 'AG');



// ============================================
// ОСНОВНАЯ ФУНКЦИЯ
// ============================================
function generate_order_number() {
    error_log("🔍 Вызывается generate_order_number()");
    $counter = get_next_counter_value();
    error_log("🔍 Получен счетчик: {$counter}");
    $formatted = format_order_number($counter);
    error_log("🔍 Отформатированный номер: {$formatted}");
    return $formatted;
}
// ============================================
// ШАБЛОНЫ И ФОРМАТИРОВАНИЕ
// ============================================
function format_order_number($counter) {
    $template = (ORDER_COUNTER_MODE === 'daily') 
        ? ORDER_COUNTER_TEMPLATE_DAILY 
        : ORDER_COUNTER_TEMPLATE_CONTINUOUS;
    
    $placeholders = array(
        '{prefix}' => ORDER_COUNTER_PREFIX,
        '{date}' => date('Y-m-d'),
        '{date_short}' => date('ymd'),      // 241205
        '{date_ymd}' => date('Ymd'),        // 20241205
        '{date_dmy}' => date('d.m.y'),      // 05.12.24
        '{date_dmY}' => date('d.m.Y'),      // 05.12.2024
        '{date_y}' => date('Y'),            // 2024
        '{date_m}' => date('m'),            // 12
        '{date_d}' => date('d'),            // 05
        '{time}' => date('H:i:s'),
        '{time_hm}' => date('H:i'),
        '{counter}' => $counter,
    );
    
    // Обрабатываем шаблон
    $result = $template;
    
    // 1. Заменяем простые плейсхолдеры
    foreach ($placeholders as $key => $value) {
        $result = str_replace($key, $value, $result);
    }
    
    // 2. Обрабатываем {counter:N} - дополнение нулями
    $result = preg_replace_callback('/\{counter:(\d+)\}/', 
        function($matches) use ($counter) {
            $length = (int)$matches[1];
            return str_pad($counter, $length, '0', STR_PAD_LEFT);
        }, 
        $result);
    
    return $result;
}

// ============================================
// АТОМАРНЫЙ СЧЕТЧИК (ядро)
// ============================================
function get_next_counter_value() {
    global $wpdb;
    
    error_log("🔧 [COUNTER SIMPLE] Начало get_next_counter_value()");
    
    $table_name = $wpdb->prefix . 'order_counter';
    
    // Создаем таблицу если нужно
    if (!order_counter_table_exists()) {
        create_order_counter_table();
    }
    
    $counter_key = (ORDER_COUNTER_MODE === 'daily') 
        ? date('Y-m-d') 
        : 'continuous_counter';
    
    error_log("🔑 [COUNTER SIMPLE] Ключ: {$counter_key}");
    
    // Простой инкремент БЕЗ транзакции
    // 1. Сначала получаем текущее значение
    $current = $wpdb->get_var($wpdb->prepare(
        "SELECT counter_value FROM {$table_name} WHERE counter_key = %s",
        $counter_key
    ));
    
    if ($current === null) {
        // Если записи нет - создаем с 1
        error_log("📝 [COUNTER SIMPLE] Создаем новую запись");
        $wpdb->insert(
            $table_name,
            array(
                'counter_key' => $counter_key,
                'counter_value' => 1,
                'last_used' => current_time('mysql')
            ),
            array('%s', '%d', '%s')
        );
        $new_value = 1;
    } else {
        // Если запись есть - увеличиваем на 1
        error_log("📈 [COUNTER SIMPLE] Увеличиваем с {$current} на 1");
        $new_value = (int)$current + 1;
        
        $wpdb->update(
            $table_name,
            array(
                'counter_value' => $new_value,
                'last_used' => current_time('mysql')
            ),
            array('counter_key' => $counter_key),
            array('%d', '%s'),
            array('%s')
        );
    }
    
    error_log("✅ [COUNTER SIMPLE] Новое значение: {$new_value}");
    return $new_value;
}



// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Разрешаем поля с подчеркиванием для CF7 и добавляем order-number
add_filter('wpcf7_posted_data', function($posted_data) {
    // Добавляем все поля с подчеркиванием из $_POST
    foreach ($_POST as $key => $value) {
        if (strpos($key, '_') === 0 && !isset($posted_data[$key])) {
            $posted_data[$key] = $value;
        }
    }
    
    // Также добавляем order-number если есть
    if (isset($_POST['order-number'])) {
        $posted_data['order-number'] = $_POST['order-number'];
    }
    
    return $posted_data;
}, 10, 1);

// Получить текущий счетчик (без увеличения)
function get_current_counter() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'order_counter';
    
    if (!order_counter_table_exists()) {
        return 0;
    }
    
    $counter_key = (ORDER_COUNTER_MODE === 'daily') 
        ? date('Y-m-d') 
        : 'continuous_counter';
    
    $counter = $wpdb->get_var($wpdb->prepare(
        "SELECT counter_value FROM {$table_name} WHERE counter_key = %s",
        $counter_key
    ));
    
    return $counter ? (int)$counter : 0;
}

// Получить следующий номер (для предпросмотра)
function get_next_order_number() {
    $next_counter = get_current_counter() + 1;
    return format_order_number($next_counter);
}

// Сброс счетчика
function reset_order_counter($date = null) {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'order_counter';
    
    if (!order_counter_table_exists()) {
        return false;
    }
    
    $counter_key = (ORDER_COUNTER_MODE === 'daily') 
        ? ($date ?: date('Y-m-d')) 
        : 'continuous_counter';
    
    $sql = $wpdb->prepare(
        "INSERT INTO {$table_name} (counter_key, counter_value, last_used) 
         VALUES (%s, 0, %s) 
         ON DUPLICATE KEY UPDATE counter_value = 0",
        $counter_key,
        current_time('mysql')
    );
    
    return $wpdb->query($sql) !== false;
}

// ============================================
// ТАБЛИЦА БАЗЫ ДАННЫХ
// ============================================
function order_counter_table_exists() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'order_counter';
    return $wpdb->get_var($wpdb->prepare(
        "SHOW TABLES LIKE %s",
        $table_name
    )) === $table_name;
}

function create_order_counter_table() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'order_counter';
    $charset_collate = $wpdb->get_charset_collate();
    
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") == $table_name) {
        return true;
    }
    
    $sql = "CREATE TABLE $table_name (
        counter_key VARCHAR(50) NOT NULL,
        counter_value INT NOT NULL DEFAULT 0,
        last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (counter_key)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
    
    return true;
}

// ============================================
// СОЗДАНИЕ ПОСТА ЗАЯВКИ ПРИ ОТПРАВКЕ ФОРМЫ
// ============================================

/**
 * Итог создания записи request — попадает в JSON /feedback.
 *
 * @param array|null $set
 * @return array
 */
function cfr_request_last_result($set = null) {
    static $result = array(
        'attempted' => false,
        'ok'        => false,
        'message'   => 'Хук заявки ещё не вызывался (wpcf7_before_send_mail).',
    );

    if ($set !== null) {
        $result = $set;
    }

    return $result;
}

function cfr_posted_scalar($value) {
    if (is_array($value)) {
        $value = reset($value);
    }

    return is_scalar($value) ? trim((string) $value) : '';
}

function cfr_extract_phone($posted_data) {
    foreach ((array) $posted_data as $key => $value) {
        $key = (string) $key;
        if (strpos($key, 'tel') === 0 || strpos($key, 'phone') !== false) {
            $phone = cfr_posted_scalar($value);
            if ($phone !== '') {
                return $phone;
            }
        }
    }

    return '';
}

function cfr_is_russian_phone($phone) {
    $digits = preg_replace('/\D+/', '', (string) $phone);

    if (strlen($digits) === 11 && ($digits[0] === '7' || $digits[0] === '8')) {
        return true;
    }

    if (strlen($digits) === 10 && $digits[0] === '9') {
        return true;
    }

    return false;
}

function cfr_find_posted_field($posted_data, $needles) {
    foreach ((array) $needles as $needle) {
        if (isset($posted_data[$needle])) {
            $value = cfr_posted_scalar($posted_data[$needle]);
            if ($value !== '') {
                return $value;
            }
        }
    }

    foreach ((array) $posted_data as $key => $value) {
        $key_l = strtolower((string) $key);
        if ($key_l === '' || strpos($key_l, '_wpcf7') === 0) {
            continue;
        }
        foreach ((array) $needles as $needle) {
            if (strpos($key_l, strtolower((string) $needle)) !== false) {
                $found = cfr_posted_scalar($value);
                if ($found !== '') {
                    return $found;
                }
            }
        }
    }

    return '';
}

add_filter('wpcf7_feedback_response', function ($response) {
    $response['request_post'] = cfr_request_last_result();
    if (function_exists('ag_gs_last_result')) {
        $response['google_sheets'] = ag_gs_last_result();
    }
    return $response;
}, 11);

function cfr_create_request_post($order_number, $contact_form, $posted_data) {
    error_log("📄 [REQUEST POST] Создаем пост для номера: {$order_number}");
    
    // 1. ДЕБАГ: логируем ВСЕ что пришло
    error_log("🔍 [REQUEST POST] Все ключи в posted_data:");
    foreach (array_keys($posted_data) as $key) {
        $log_val = cfr_posted_scalar($posted_data[$key]);
        error_log("   - '{$key}' => '{$log_val}'");
    }
    
    // 2. Получаем шаблон письма из формы
    $mail = $contact_form->prop('mail');
    $email_body = $mail['body'] ?? '';
    
    // 3. Если шаблон пустой, создаем базовый
    if (empty($email_body)) {
        $email_body = "Заявка [order-number].\nОт: [name-53]\nE-mail: [email-594]\nТелефон: [tel-53]\n\n[_raw_configurator-data]\n\nСтраница: [page_title_field]";
    }
    
    // 4. Ищем конфигурацию ВО ВСЕХ возможных местах
    $config_data = '';
    
    // Способ 1: Из $_POST напрямую (самый надежный)
    if (empty($config_data) && !empty($_POST['_raw_configurator-data'])) {
        $config_data = $_POST['_raw_configurator-data'];
        error_log("✅ [REQUEST POST] Нашли конфигурацию в \$_POST['_raw_configurator-data']");
    }
    
    // Способ 2: Ищем в posted_data
    if (empty($config_data)) {
        foreach ($posted_data as $key => $value) {
            if (strpos($key, 'configurator') !== false || strpos($key, 'raw') !== false) {
                $config_data = $value;
                error_log("✅ [REQUEST POST] Нашли конфигурацию в posted_data['{$key}']");
                break;
            }
        }
    }
    
    // Способ 3: Ищем в данных submission
    if (empty($config_data)) {
        $submission = WPCF7_Submission::get_instance();
        if ($submission) {
            // Получаем ВСЕ данные включая скрытые
            $all_data = $submission->get_posted_data();
            foreach ($all_data as $key => $value) {
                if (strpos($key, 'configurator') !== false || strpos($key, 'raw') !== false) {
                    $config_data = $value;
                    error_log("✅ [REQUEST POST] Нашли конфигурацию в submission['{$key}']");
                    break;
                }
            }
        }
    }
    
    // 5. Логируем что нашли
    if (!empty($config_data)) {
        error_log("📏 [REQUEST POST] Длина конфигурации: " . strlen($config_data) . " символов");
        error_log("📝 [REQUEST POST] Первые 200 символов конфигурации: " . substr($config_data, 0, 200));
    } else {
        error_log("⚠️ [REQUEST POST] Конфигурация НЕ найдена!");
        error_log("🔍 [REQUEST POST] Все \$_POST ключи:");
        foreach (array_keys($_POST) as $key) {
            if (strpos($key, 'config') !== false || strpos($key, 'raw') !== false) {
                error_log("   - '{$key}'");
            }
        }
    }
    
    // 6. Форматируем конфигурацию если она в JSON
    $formatted_config = $config_data;
    if ($config_data) {
        $decoded = json_decode($config_data, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            error_log("✅ [REQUEST POST] Конфигурация в JSON формате, форматируем...");
            $formatted_config = "";
            foreach ($decoded as $item) {
                if (is_array($item)) {
                    $formatted_config .= implode(": ", $item) . "\n";
                } else {
                    $formatted_config .= $item . "\n";
                }
            }
        }
    }
    
    // 7. Основные замены тегов
    $replacements = [
        '[order-number]' => $order_number,
        '[name-53]' => $posted_data['name-53'] ?? '',
        '[email-594]' => $posted_data['email-594'] ?? '',
        '[tel-53]' => $posted_data['tel-53'] ?? '',
        '[_raw_configurator-data]' => $formatted_config, // Используем отформатированную конфигурацию
        '[page_title_field]' => $posted_data['page_title_field'] ?? '',
        '[_site_title]' => get_bloginfo('name'),
        '[_site_url]' => get_bloginfo('url'),
    ];
    
    // 8. Дополнительно: заменяем ВСЕ теги вида [field-name] из данных формы
    foreach ($posted_data as $key => $value) {
        $tag = '[' . $key . ']';
        if (strpos($email_body, $tag) !== false) {
            $replacements[$tag] = is_array($value) ? implode(', ', $value) : $value;
        }
    }
    
    // 9. Применяем все замены
    $email_body = str_replace(
        array_keys($replacements),
        array_values($replacements),
        $email_body
    );
    
    error_log("✅ [REQUEST POST] Заменили все теги в письме");
    
    // 10. Создаем пост
    $post_data = array(
        'post_title'    => "Заявка {$order_number}",
        'post_content'  => $email_body,
        'post_status'   => 'pending',
        'post_type'     => 'request',
        'post_author'   => 1,
        'meta_input'    => array(
            '_request_number'    => $order_number,
            '_request_date'      => current_time('mysql'),
            '_cf7_form_id'       => $contact_form->id(),
            '_customer_email'    => cfr_find_posted_field($posted_data, array('email-594', 'your-email', 'email')),
            '_customer_name'     => cfr_find_posted_field($posted_data, array('name-53', 'your-name', 'text-name', 'name', 'fio')),
            '_customer_phone'    => cfr_extract_phone($posted_data),
            '_config_data_raw'   => $config_data, // Сохраняем оригинальную конфигурацию
            '_config_data'       => $formatted_config, // И отформатированную
            //'_status'            => 'new'
        )       
    );
    
    $post_id = wp_insert_post($post_data, true);
    
    if (is_wp_error($post_id)) {
        error_log("❌ [REQUEST POST] Ошибка: " . $post_id->get_error_message());
        return false;
    }
    
    error_log("✅ [REQUEST POST] Пост создан! ID: {$post_id}");
    
    // 11. Логируем результат для проверки
    $preview = substr($email_body, 0, 500);
    error_log("📝 [REQUEST POST] Превью контента (500 символов):\n" . $preview);
    
    // Проверяем содержит ли контент конфигурацию
    if (strpos($email_body, $formatted_config) !== false) {
        error_log("✅ [REQUEST POST] Конфигурация успешно добавлена в контент");
    } else {
        error_log("⚠️ [REQUEST POST] Конфигурация НЕ добавлена в контент!");
    }
    
    return $post_id;
}

// ============================================
// ОБНОВЛЯЕМ ФУНКЦИЮ ОБРАБОТКИ CF7
// ============================================
function add_order_number_to_cf7_form($contact_form, &$abort = false, $submission = null) {
    $form_id = (int) $contact_form->id();
    error_log("🔧 [CF7 ХУК] Начинаем обработку формы. ID: {$form_id}");

    if (!$submission) {
        $submission = WPCF7_Submission::get_instance();
    }

    if (!$submission) {
        error_log("❌ [CF7 ХУК] Ошибка: Submission не получен");
        cfr_request_last_result(array(
            'attempted' => true,
            'ok'        => false,
            'form_id'   => $form_id,
            'message'   => 'WPCF7_Submission не получен.',
        ));
        return;
    }

    $posted_data = $submission->get_posted_data();

    $phone  = cfr_extract_phone($posted_data);
    $digits = preg_replace('/\D+/', '', $phone);

    if ($digits !== '' && !cfr_is_russian_phone($phone)) {
        error_log("🚫 Номер {$phone} не российский, блокируем");
        $abort = true;
        if (method_exists($submission, 'set_response')) {
            $submission->set_response('Укажите российский номер телефона (+7 или 8).');
        }
        cfr_request_last_result(array(
            'attempted' => true,
            'ok'        => false,
            'blocked'   => true,
            'form_id'   => $form_id,
            'phone'     => $phone,
            'message'   => 'Номер не российский. Запись request не создана, письмо не отправлено.',
        ));
        return;
    }

    error_log("🔧 [CF7 ХУК] Вызываем generate_order_number()");
    $order_number = generate_order_number();
    error_log("✅ [CF7 ХУК] Сгенерирован номер: {$order_number}");

    $request_id = cfr_create_request_post($order_number, $contact_form, $posted_data);
    if ($request_id) {
        error_log("✅ [CF7 ХУК] Создан пост заявки ID: {$request_id}");
        cfr_request_last_result(array(
            'attempted'    => true,
            'ok'           => true,
            'form_id'      => $form_id,
            'post_id'      => (int) $request_id,
            'order_number' => $order_number,
            'message'      => 'Заявка создана в админке (post_type=request, статус pending).',
        ));
    } else {
        error_log("⚠️ [CF7 ХУК] Не удалось создать пост заявки");
        cfr_request_last_result(array(
            'attempted' => true,
            'ok'        => false,
            'form_id'   => $form_id,
            'message'   => 'wp_insert_post вернул ошибку. Смотрите debug.log.',
        ));
    }

    $_POST['order-number'] = $order_number;

    $mail = $contact_form->prop('mail');
    if (is_array($mail)) {
        if (!empty($mail['subject'])) {
            $mail['subject'] = str_replace('[order-number]', $order_number, $mail['subject']);
        }
        if (!empty($mail['body'])) {
            $mail['body'] = str_replace('[order-number]', $order_number, $mail['body']);
        }
        $contact_form->set_properties(array('mail' => $mail));
    }

    $mail_2 = $contact_form->prop('mail_2');
    if (is_array($mail_2) && !empty($mail_2)) {
        if (!empty($mail_2['subject'])) {
            $mail_2['subject'] = str_replace('[order-number]', $order_number, $mail_2['subject']);
        }
        if (!empty($mail_2['body'])) {
            $mail_2['body'] = str_replace('[order-number]', $order_number, $mail_2['body']);
        }
        $contact_form->set_properties(array('mail_2' => $mail_2));
    }

    add_filter('wpcf7_mail_components', function ($components, $form, $mail) use ($order_number) {
        unset($form, $mail);
        if (!empty($components['subject'])) {
            $components['subject'] = str_replace('[order-number]', $order_number, $components['subject']);
        }
        if (!empty($components['body'])) {
            $components['body'] = str_replace('[order-number]', $order_number, $components['body']);
        }
        return $components;
    }, 10, 3);

    error_log("✅ [CF7 ХУК] Завершено. Форма {$form_id}, номер: {$order_number}");
}

// ============================================
// ИНФОРМАЦИЯ И ТЕСТИРОВАНИЕ
// ============================================
function show_order_counter_info() {
    $current = get_current_counter();
    $next_number = get_next_order_number();
    
    $mode_name = (ORDER_COUNTER_MODE === 'daily') ? 'Ежедневный' : 'Постоянный';
    $template = (ORDER_COUNTER_MODE === 'daily') 
        ? ORDER_COUNTER_TEMPLATE_DAILY 
        : ORDER_COUNTER_TEMPLATE_CONTINUOUS;
    
    $html = '<div style="background:#f8f9fa; padding:20px; margin:20px 0; border:1px solid #ddd; border-radius:5px; font-family:monospace;">';
    $html .= '<strong>⚙️ Настройки счетчика</strong><br>';
    $html .= 'Режим: <strong>' . $mode_name . '</strong><br>';
    $html .= 'Шаблон: <code>' . htmlspecialchars($template) . '</code><br>';
    $html .= 'Префикс: <code>' . ORDER_COUNTER_PREFIX . '</code><br><br>';
    
    $html .= '<strong>📊 Текущее состояние</strong><br>';
    $html .= 'Счетчик: ' . $current . '<br>';
    $html .= 'Следующий номер: <strong style="color:#d63638;">' . $next_number . '</strong><br><br>';
    
    $html .= '<strong>🎯 Примеры форматов</strong><br>';
    $html .= '<small>';
    $html .= 'Ежедневный: <code>{prefix}-{date_short}-{counter:4}</code> → AG-241205-0001<br>';
    $html .= 'Ежедневный: <code>{date_dmy}/{counter:4}</code> → 05.12.24/0001<br>';
    $html .= 'Постоянный: <code>{prefix}-{counter:6}</code> → AG-000001<br>';
    $html .= 'Постоянный: <code>{prefix}-{date_ymd}-{counter:6}</code> → AG-20241205-000001<br>';
    $html .= 'Простой: <code>{counter:6}</code> → 000001<br>';
    $html .= '</small>';
    $html .= '</div>';
    
    return $html;
}

// ============================================
// РУЧНАЯ УСТАНОВКА СЧЕТЧИКА
// ============================================

function set_order_counter($value, $date = null) {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'order_counter';
    
    if (!order_counter_table_exists()) {
        return false;
    }
    
    // Определяем ключ
    if (ORDER_COUNTER_MODE === 'daily') {
        $counter_key = $date ?: date('Y-m-d');
    } else {
        $counter_key = 'continuous_counter';
    }
    
    $value = (int)$value;
    if ($value < 0) {
        $value = 0;
    }
    
    try {
        // Устанавливаем значение БЕЗ транзакций
        $sql = $wpdb->prepare(
            "INSERT INTO {$table_name} (counter_key, counter_value, last_used) 
             VALUES (%s, %d, %s) 
             ON DUPLICATE KEY UPDATE counter_value = %d, last_used = %s",
            $counter_key,
            $value,
            current_time('mysql'),
            $value,
            current_time('mysql')
        );
        
        if ($wpdb->query($sql) === false) {
            throw new Exception('UPDATE failed');
        }
        
        // Логируем
        error_log("Счетчик установлен: {$counter_key} = {$value}");
        
        return true;
        
    } catch (Exception $e) {
        error_log('Ошибка установки счетчика: ' . $e->getMessage());
        return false;
    }
}

// Автосоздание таблицы при первом использовании
add_action('init', function() {
    if (!order_counter_table_exists()) {
        create_order_counter_table();
    }
});

// ============================================
// ИНТЕГРАЦИЯ С CONTACT FORM 7 (ГЛАВНОЕ!)
// ============================================

// Подключаем хук для обработки форм
add_action('wpcf7_before_send_mail', 'add_order_number_to_cf7_form', 10, 3);

// Google Sheets живёт здесь же: отдельный google-sheets.php на сервере не подхватывался.
if (!function_exists('ag_gs_send_cf7_to_sheets')) {
    if (!defined('AG_GS_WEBHOOK_URL')) {
        define('AG_GS_WEBHOOK_URL', getenv('AG_GS_WEBHOOK_URL') ?: '');
    }
    if (!defined('AG_GS_SECRET')) {
        define('AG_GS_SECRET', getenv('AG_GS_SECRET') ?: '');
    }

    function ag_gs_sheet_names() {
        return array();
    }

    function ag_gs_last_result($set = null) {
        static $result = array(
            'attempted' => false,
            'ok'        => false,
            'message'   => 'Google Sheets ещё не вызывался. Хук срабатывает только после mail_sent.',
        );
        if ($set !== null) {
            $result = $set;
        }
        return $result;
    }

    function ag_gs_stringify_field($value) {
        if (is_array($value)) {
            $parts = array();
            foreach ($value as $item) {
                if ($item === null || $item === false || $item === '') {
                    continue;
                }
                $parts[] = is_scalar($item) ? (string) $item : wp_json_encode($item, JSON_UNESCAPED_UNICODE);
            }
            return implode(', ', $parts);
        }
        if ($value === null || $value === false) {
            return '';
        }
        return is_scalar($value) ? (string) $value : wp_json_encode($value, JSON_UNESCAPED_UNICODE);
    }

    function ag_gs_collect_cf7_fields($submission) {
        $posted = $submission->get_posted_data();
        if (!is_array($posted)) {
            $posted = array();
        }
        $skip_exact = array(
            'g-recaptcha-response',
            'h-captcha-response',
            'cf-turnstile-response',
            '_wpcf7_unit_tag',
            '_wpcf7_container_post',
            '_wpcf7_posted_data_hash',
            '_wpcf7_recaptcha_response',
        );
        $fields = array();
        foreach ($posted as $key => $value) {
            $key = (string) $key;
            if ($key === '' || strpos($key, '_wpcf7') === 0 || in_array($key, $skip_exact, true)) {
                continue;
            }
            $fields[$key] = ag_gs_stringify_field($value);
        }
        return $fields;
    }

    function ag_gs_parse_apps_script_response($response, $form_id, $sheet_name) {
        $debug = array(
            'attempted'   => true,
            'ok'          => false,
            'form_id'     => (int) $form_id,
            'sheet'       => (string) $sheet_name,
            'http_code'   => 0,
            'apps_script' => null,
            'message'     => '',
        );
        if (is_wp_error($response)) {
            $debug['message'] = 'wp_remote_post: ' . $response->get_error_message();
            return $debug;
        }
        $code     = (int) wp_remote_retrieve_response_code($response);
        $body     = (string) wp_remote_retrieve_body($response);
        $location = wp_remote_retrieve_header($response, 'location');
        $debug['http_code'] = $code;
        if ($code === 302 && $location) {
            $follow = wp_remote_get($location, array('timeout' => 15, 'redirection' => 5));
            if (!is_wp_error($follow)) {
                $body = (string) wp_remote_retrieve_body($follow);
            }
        }
        $decoded = json_decode($body, true);
        if (is_array($decoded)) {
            $debug['apps_script'] = $decoded;
            if (!empty($decoded['ok'])) {
                $debug['ok']      = true;
                $debug['message'] = 'Записано в лист «' . (isset($decoded['sheet']) ? $decoded['sheet'] : $sheet_name) . '»';
                if (isset($decoded['id'])) {
                    $debug['row_id'] = $decoded['id'];
                }
                return $debug;
            }
            $debug['message'] = isset($decoded['error']) ? (string) $decoded['error'] : 'Apps Script вернул ok: false';
            return $debug;
        }
        if (in_array($code, array(200, 302), true)) {
            $debug['ok']      = true;
            $debug['message'] = 'HTTP ' . $code . ', тело не JSON. POST, скорее всего, дошёл; проверьте таблицу.';
            return $debug;
        }
        $debug['message'] = 'HTTP ' . $code . ($body !== '' ? ': ' . substr($body, 0, 300) : '');
        return $debug;
    }

    function ag_gs_send_cf7_to_sheets($contact_form) {
        $url = defined('AG_GS_WEBHOOK_URL') ? trim((string) AG_GS_WEBHOOK_URL) : '';
        if ($url === '' || strpos($url, 'https://') !== 0) {
            ag_gs_last_result(array(
                'attempted' => false,
                'ok'        => false,
                'message'   => 'AG_GS_WEBHOOK_URL пустой или не https.',
            ));
            return;
        }
        if (!class_exists('WPCF7_Submission')) {
            return;
        }
        $submission = WPCF7_Submission::get_instance();
        if (!$submission) {
            ag_gs_last_result(array(
                'attempted' => false,
                'ok'        => false,
                'message'   => 'Нет объекта WPCF7_Submission.',
            ));
            return;
        }
        $form_id    = (int) $contact_form->id();
        $form_title = $contact_form->title();
        $sheet_map  = ag_gs_sheet_names();
        $sheet_name = isset($sheet_map[$form_id]) ? $sheet_map[$form_id] : $form_title;
        $payload    = array(
            'secret'     => AG_GS_SECRET,
            'form_id'    => $form_id,
            'form_title' => $form_title,
            'sheet'      => $sheet_name,
            'submitted'  => current_time('mysql'),
            'fields'     => ag_gs_collect_cf7_fields($submission),
        );
        $response = wp_remote_post($url, array(
            'timeout'     => 15,
            'redirection' => 0,
            'blocking'    => true,
            'headers'     => array('Content-Type' => 'application/json; charset=utf-8'),
            'body'        => wp_json_encode($payload, JSON_UNESCAPED_UNICODE),
        ));
        $debug = ag_gs_parse_apps_script_response($response, $form_id, $sheet_name);
        ag_gs_last_result($debug);
        error_log('CF7 Google Sheets: ' . wp_json_encode($debug, JSON_UNESCAPED_UNICODE));
    }

    add_action('wpcf7_mail_sent', 'ag_gs_send_cf7_to_sheets');
}

?>