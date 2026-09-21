
<?php
// Полностью отключаем доступ
http_response_code(403);
header('Content-Type: text/plain; charset=utf-8');
die('');
?>


<?php
/**
 * Тестирование генератора номеров заявок
 * Расположен рядом с cfr-order-counter.php
 * 
 * Использование:
 * 1. Открыть в браузере: https://alfaglass.ru/wp-content/themes/alfa-glass/inc/configurator/order-counter-test.php
 * 2. Доступ только для пользователя с ID = 4
 * 3. Не забыть удалить после тестирования!
 */

// ============================================
// БЕЗОПАСНОСТЬ - проверка по ID пользователя WordPress
// ============================================
define('WP_USE_THEMES', false);

// Корректный путь к wp-load.php
$wp_load_path = '/home/c/cf05383/alfaglass.ru/public_html/wp-load.php';
require_once($wp_load_path);

// Проверяем, авторизован ли пользователь и является ли ID = 4
if (!is_user_logged_in()) {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Требуется авторизация</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
            .login-form { max-width: 300px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="login-form">
            <h2>Требуется авторизация</h2>
            <p>Доступ только для администратора с ID = 4</p>
            <p><a href="<?php echo wp_login_url($_SERVER['REQUEST_URI']); ?>">Войти в WordPress</a></p>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Проверяем ID пользователя
$current_user = wp_get_current_user();
if ($current_user->ID != 4) {
    die('⚠️ Доступ запрещен. Эта страница доступна только для пользователя с ID = 4. Ваш ID: ' . $current_user->ID);
}

// ============================================
// ПОДКЛЮЧАЕМ ГЕНЕРАТОР (файл в той же папке)
// ============================================
$generator_file = __DIR__ . '/cfr-order-counter.php';
if (file_exists($generator_file)) {
    require_once($generator_file);
} else {
    die("❌ Файл генератора не найден: " . $generator_file);
}

// ============================================
// ОБРАБОТКА ДЕЙСТВИЙ УПРАВЛЕНИЯ
// ============================================
$action_message = '';
$action_type = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Сброс счетчика
    if (isset($_POST['reset_counter'])) {
        if (reset_order_counter()) {
            $action_message = '✅ Счетчик сброшен на 0';
            $action_type = 'success';
        } else {
            $action_message = '❌ Ошибка сброса счетчика';
            $action_type = 'error';
        }
    }
    
    // Установка значения
    if (isset($_POST['set_counter']) && isset($_POST['counter_value'])) {
        $value = intval($_POST['counter_value']);
        if (set_order_counter($value)) {
            $action_message = "✅ Счетчик установлен на {$value}";
            $action_type = 'success';
        } else {
            $action_message = '❌ Ошибка установки счетчика';
            $action_type = 'error';
        }
    }
}

// ============================================
// HTML ШАБЛОН
// ============================================
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тест генератора номеров заявок</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #f0f2f5; 
            margin: 0; 
            padding: 20px;
            color: #333;
        }
        .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-top: 0;
        }
        .section { 
            margin: 25px 0; 
            padding: 20px; 
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .success { color: #27ae60; border-color: #27ae60; background: #eafaf1; }
        .warning { color: #f39c12; border-color: #f39c12; background: #fef9e7; }
        .error { color: #e74c3c; border-color: #e74c3c; background: #fdedec; }
        .result { 
            font-size: 24px; 
            font-weight: bold; 
            padding: 15px; 
            background: #ecf0f1; 
            border-radius: 5px;
            text-align: center;
            margin: 10px 0;
            font-family: monospace;
        }
        .btn { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #3498db; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            border: none;
            cursor: pointer;
            font-size: 16px;
            margin: 5px;
            transition: background 0.3s;
        }
        .btn:hover { background: #2980b9; }
        .btn-danger { background: #e74c3c; }
        .btn-danger:hover { background: #c0392b; }
        .btn-success { background: #27ae60; }
        .btn-success:hover { background: #219653; }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin: 20px 0;
        }
        .info-item { 
            padding: 10px; 
            background: white; 
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        code { 
            background: #2c3e50; 
            color: #ecf0f1; 
            padding: 2px 6px; 
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
        .action-buttons { margin: 20px 0; }
        .form-inline { display: flex; gap: 10px; align-items: center; }
        .form-inline input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .alert { padding: 15px; margin: 15px 0; border-radius: 5px; }
        .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Тестирование генератора номеров заявок</h1>
        
        <?php if ($action_message): ?>
            <div class="alert alert-<?php echo $action_type; ?>">
                <?php echo $action_message; ?>
            </div>
        <?php endif; ?>
        
        <div class="section">
            <h2>👤 Пользователь</h2>
            <p>Вы вошли как: <strong><?php echo $current_user->user_login; ?></strong> (ID: <?php echo $current_user->ID; ?>)</p>
        </div>
        
        <div class="section">
            <h2>⚙️ Управление счетчиком</h2>
            
            <div class="action-buttons">
                <form method="post" onsubmit="return confirm('Вы уверены? Счетчик будет обнулен!');">
                    <button type="submit" name="reset_counter" class="btn btn-danger">
                        🔄 Сбросить счетчик на 0
                    </button>
                    <small>Обнулит счетчик в базе данных</small>
                </form>
                
                <div style="margin: 20px 0;"></div>
                
                <form method="post" class="form-inline" onsubmit="return confirm('Установить указанное значение?');">
                    <input type="number" name="counter_value" value="15643" style="width: 120px;">
                    <button type="submit" name="set_counter" class="btn btn-success">
                        💾 Установить значение
                    </button>
                    <small>Установит счетчик в указанное число</small>
                </form>
            </div>
        </div>
        
        <div class="section">
            <h2>📊 Текущее состояние</h2>
            
            <div class="info-grid">
                <div class="info-item">
                    <strong>Режим:</strong><br>
                    <code><?php echo defined('ORDER_COUNTER_MODE') ? ORDER_COUNTER_MODE : 'Не определен'; ?></code>
                </div>
                <div class="info-item">
                    <strong>Префикс:</strong><br>
                    <code><?php echo defined('ORDER_COUNTER_PREFIX') ? ORDER_COUNTER_PREFIX : 'Не определен'; ?></code>
                </div>
            </div>
            
            <div class="result">
                Текущий счетчик: <span style="color:#27ae60;font-size:32px;"><?php echo get_current_counter(); ?></span>
            </div>
            
            <div class="result">
                Следующий номер (предпросмотр):<br>
                <span style="color:#e74c3c;font-size:28px;"><?php echo get_next_order_number(); ?></span>
            </div>
        </div>
        
        <div class="section warning">
            <h2>⚠️ Тест генерации (увеличит счетчик!)</h2>
            <p>Нажатие кнопки ниже приведет к реальному увеличению счетчика в базе данных.</p>
            
            <form method="post">
                <button type="submit" name="test_generate" class="btn btn-danger">
                    🚀 Протестировать генерацию номера
                </button>
                <button type="submit" name="test_preview" class="btn">
                    👁️ Только предпросмотр (без увеличения)
                </button>
            </form>
            
            <?php
            if (isset($_POST['test_generate']) && function_exists('generate_order_number')) {
                echo '<div class="section error">';
                echo '<h3>✅ Реальная генерация выполнена</h3>';
                
                $before = get_current_counter();
                $generated = generate_order_number();
                $after = get_current_counter();
                
                echo '<div class="result" style="background:#27ae60;color:white;">';
                echo 'Сгенерирован номер: ' . $generated;
                echo '</div>';
                
                echo '<p><strong>Статистика:</strong></p>';
                echo '<p>Было: ' . $before . '</p>';
                echo '<p>Стало: ' . $after . '</p>';
                echo '<p>Увеличено на: ' . ($after - $before) . '</p>';
                echo '</div>';
                
            } elseif (isset($_POST['test_preview']) && function_exists('get_next_order_number')) {
                echo '<div class="section warning">';
                echo '<h3>👁️ Предпросмотр следующего номера</h3>';
                echo '<div class="result">' . get_next_order_number() . '</div>';
                echo '<p><em>Счетчик НЕ увеличен</em></p>';
                echo '</div>';
            }
            ?>
        </div>
        
        <div class="section">
            <h2>📋 Проверка таблицы БД</h2>
            <?php
            global $wpdb;
            $table_name = $wpdb->prefix . 'order_counter';
            
            if (function_exists('order_counter_table_exists') && order_counter_table_exists()) {
                $rows = $wpdb->get_results("SELECT * FROM $table_name ORDER BY last_used DESC");
                
                echo '<p>Таблица: <code>' . $table_name . '</code></p>';
                echo '<p>Записей: ' . count($rows) . '</p>';
                
                if (count($rows) > 0) {
                    echo '<table>';
                    echo '<tr><th>Ключ</th><th>Значение</th><th>Последнее использование</th></tr>';
                    foreach ($rows as $row) {
                        echo '<tr>';
                        echo '<td><code>' . $row->counter_key . '</code></td>';
                        echo '<td><strong>' . $row->counter_value . '</strong></td>';
                        echo '<td>' . $row->last_used . '</td>';
                        echo '</tr>';
                    }
                    echo '</table>';
                }
            } else {
                echo '<p>❌ Таблица не существует или не может быть проверена</p>';
            }
            ?>
        </div>
        
        <div class="section">
            <h2>📁 Информация о файлах</h2>
            <p><strong>Текущий файл:</strong> <?php echo __FILE__; ?></p>
            <p><strong>Файл генератора:</strong> <?php echo $generator_file; ?></p>
            <p><strong>Подключен:</strong> <?php echo file_exists($generator_file) ? '✅ Да' : '❌ Нет'; ?></p>
        </div>
        
        <div class="section">
            <p><strong>🕐 Время сервера:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
            <p><em>⚠️ Не забудьте удалить этот файл после тестирования!</em></p>
        </div>
    </div>
    
    <script>
    // Подтверждение опасных действий
    document.querySelectorAll('form').forEach(form => {
        if (form.querySelector('.btn-danger')) {
            form.addEventListener('submit', function(e) {
                if (!confirm('Вы уверены? Это действие изменит данные в базе!')) {
                    e.preventDefault();
                }
            });
        }
    });
    </script>
</body>
</html>