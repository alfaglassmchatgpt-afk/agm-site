<?php
/** Project requests. Disabled until explicitly configured on production. */
defined('ABSPATH') || exit;

final class AGM_Requests {
    const LIMIT = 20971520;
    const EXTENSIONS = 'jpg,jpeg,png,webp,gif,bmp,tif,tiff,pdf,svg,eps,ai,cdr,dxf,dwg,cdw,frw,m3d,a3d';

    public static function enabled() {
        return !(defined('AGM_STAGING') && AGM_STAGING)
            && defined('AGM_REQUESTS_ENABLED') && AGM_REQUESTS_ENABLED
            && defined('AGM_REQUESTS_TO') && is_email(AGM_REQUESTS_TO)
            && defined('AGM_REQUESTS_FROM') && is_email(AGM_REQUESTS_FROM)
            && get_privacy_policy_url();
    }

    public static function routes() {
        register_rest_route('agm/v1', '/requests', [
            ['methods' => 'GET', 'callback' => [__CLASS__, 'settings'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [__CLASS__, 'submit'], 'permission_callback' => '__return_true'],
        ]);
    }

    private static function response($data, $status = 200) {
        $response = new WP_REST_Response($data, $status);
        $response->header('Cache-Control', 'no-store, private');
        return $response;
    }

    private static function error($message, $status = 400) {
        return self::response(['ok' => false, 'message' => $message], $status);
    }

    private static function signature($id, $issued, $cookie) {
        return hash_hmac('sha256', $id . ':' . $issued . ':' . $cookie, wp_salt('nonce'));
    }

    public static function settings() {
        $data = ['enabled' => (bool) self::enabled(), 'max_bytes' => self::LIMIT,
            'extensions' => explode(',', self::EXTENSIONS),
            'message' => 'Отправка пока отключена. Заявку можно сохранить в TXT.'];
        if ($data['enabled']) {
            $cookie = $_COOKIE['agm_request_session'] ?? '';
            if (!preg_match('/^[a-f0-9]{64}$/D', $cookie)) {
                $cookie = bin2hex(random_bytes(32));
                setcookie('agm_request_session', $cookie, ['expires' => time() + 7200,
                    'path' => '/', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Strict']);
            }
            $data['request_id'] = bin2hex(random_bytes(16));
            $issued = time();
            $data['csrf'] = $issued . '.' . self::signature($data['request_id'], $issued, $cookie);
            $data['privacy_url'] = get_privacy_policy_url();
            $data['consent_url'] = get_privacy_policy_url();
        }
        return self::response($data);
    }

    public static function validate_fields($p) {
        foreach (['name', 'phone', 'email', 'comment', 'request_text', 'consent', 'website', 'csrf', 'request_id'] as $key) {
            if (isset($p[$key]) && !is_string($p[$key])) { return 'Некорректное поле формы.'; }
        }
        if (strlen($p['name'] ?? '') > 360 || strlen($p['phone'] ?? '') > 100
            || strlen($p['email'] ?? '') > 254 || strlen($p['comment'] ?? '') > 12000
            || strlen($p['request_text'] ?? '') > 100000) { return 'Слишком большой объём текста.'; }
        if (!trim($p['name'] ?? '') || !preg_match('/[0-9]{3}/', preg_replace('/\D/', '', $p['phone'] ?? ''))) {
            return 'Укажите имя и телефон.';
        }
        if (!empty($p['email']) && (!is_email($p['email']) || preg_match('/[\r\n]/', $p['email']))) { return 'Проверьте email.'; }
        if (($p['consent'] ?? '') !== '1') { return 'Подтвердите согласие на обработку данных.'; }
        if (!trim($p['request_text'] ?? '')) { return 'Добавьте описание заказа.'; }
        return '';
    }

    public static function validate_file($name, $path, $size) {
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($ext, explode(',', self::EXTENSIONS), true) || !$size || $size > self::LIMIT) {
            return 'Недопустимый формат или размер вложения.';
        }
        $head = file_get_contents($path, false, null, 0, 8192);
        if ($head === false || preg_match('/<\?(?:php|=)|<script\b|<!DOCTYPE|<!ENTITY/i', $head)
            || substr($head, 0, 2) === 'MZ' || substr($head, 0, 4) === "\x7fELF") { return 'Небезопасное содержимое вложения.'; }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($path);
        $images = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png',
            'webp' => 'image/webp', 'gif' => 'image/gif', 'bmp' => 'image/', 'tif' => 'image/tiff', 'tiff' => 'image/tiff'];
        if (isset($images[$ext]) && strpos($mime, $images[$ext]) !== 0) { return 'Содержимое изображения не соответствует расширению.'; }
        if ($ext === 'pdf' && strpos($head, '%PDF-') !== 0) { return 'Некорректный PDF.'; }
        if ($ext === 'svg' && (stripos($head, '<svg') === false || preg_match('/\bon\w+\s*=|(?:href|src)\s*=/i', file_get_contents($path)))) {
            return 'SVG должен быть без скриптов и внешних ссылок. Используйте PDF для сложного чертежа.';
        }
        // CAD formats are passed as opaque attachments, never rendered or executed.
        return '';
    }

    public static function submit($request) {
        if (!self::enabled()) { return self::error('Отправка на этом сайте отключена.', 503); }
        if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > self::LIMIT + 1048576) { return self::error('Вложения: не более 20 МБ.', 413); }
        $p = $request->get_body_params();
        if ($error = self::validate_fields($p)) { return self::error($error); }
        $id = $p['request_id'] ?? '';
        $token = explode('.', $p['csrf'] ?? '', 2);
        $cookie = $_COOKIE['agm_request_session'] ?? '';
        $issued = (int) ($token[0] ?? 0);
        if (!preg_match('/^[a-f0-9]{32}$/D', $id) || !$cookie || count($token) !== 2
            || $issued > time() - 2 || $issued < time() - 7200
            || !hash_equals(self::signature($id, $issued, $cookie), $token[1]) || !empty($p['website'])) {
            return self::error('Обновите страницу и повторите отправку.', 403);
        }
        $key = 'agm_request_' . $id;
        $previous = get_transient($key);
        if ($previous) { return self::response($previous); }
        $ipkey = 'agm_rate_' . hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', wp_salt('auth'));
        $rate = (int) get_transient($ipkey);
        if ($rate >= 5) { return self::error('Слишком много запросов. Попробуйте через 15 минут.', 429); }
        if (!add_option($key . '_lock', time(), '', false)) {
            return self::error('Этот запрос уже обрабатывается. Уточните получение у менеджера перед повторной отправкой.', 409);
        }
        // The lock contains no client data; expire even after an interrupted PHP request.
        wp_schedule_single_event(time() + 86400, 'agm_request_unlock', [$key . '_lock']);
        set_transient($ipkey, $rate + 1, 900);
        $paths = []; $directory = null;
        try {
            $previous = get_transient($key);
            if ($previous) { return self::response($previous); }
            $uploads = $request->get_file_params();
            $files = $uploads['attachments'] ?? ['name' => [], 'error' => [], 'tmp_name' => []];
            if (!is_array($files) || !isset($files['name']) || !is_array($files['name']) || count($files['name']) > 20) { return self::error('Не более 20 файлов в одной заявке.'); }
            $total = 0;
            foreach ($files['name'] as $n => $name) {
                if (!is_string($name) || !is_string($files['tmp_name'][$n] ?? null)) { return self::error('Некорректное вложение.'); }
                if (($files['error'][$n] ?? -1) === UPLOAD_ERR_NO_FILE) { continue; }
                $path = $files['tmp_name'][$n] ?? '';
                if (($files['error'][$n] ?? -1) !== UPLOAD_ERR_OK || !is_uploaded_file($path)) { return self::error('Файл не загрузился. Проверьте размер и повторите.'); }
                $size = filesize($path); $total += $size;
                if ($total > self::LIMIT) { return self::error('Общий объём вложений превышает 20 МБ.', 413); }
                if ($error = self::validate_file($name, $path, $size)) { return self::error($error); }
            }
            if (!empty($files['name'])) {
                $directory = sys_get_temp_dir() . '/agm-' . bin2hex(random_bytes(16));
                if (!mkdir($directory, 0700)) { return self::error('Не удалось подготовить вложения.', 500); }
                foreach ($files['name'] as $n => $name) {
                    if (($files['error'][$n] ?? -1) === UPLOAD_ERR_NO_FILE) { continue; }
                    $target = $directory . '/' . ($n + 1) . '-' . sanitize_file_name($name);
                    if (!move_uploaded_file($files['tmp_name'][$n], $target)) { return self::error('Не удалось подготовить вложение.', 500); }
                    chmod($target, 0600); $paths[] = $target;
                }
            }
            $number = strtoupper(substr($id, 0, 12));
            $body = 'Заявка ' . $number . "\n\n";
            foreach (['name' => 'Имя', 'phone' => 'Телефон', 'email' => 'Email', 'comment' => 'Комментарий', 'request_text' => 'Состав заявки'] as $field => $label) {
                $body .= $label . ': ' . sanitize_textarea_field($p[$field] ?? '') . "\n\n";
            }
            $body .= 'Доставка: ' . (!empty($p['delivery']) ? 'да' : 'нет') . "\nМонтаж: " . (!empty($p['install']) ? 'да' : 'нет');
            $body .= "\n\nСогласие подтверждено. Это запрос клиента; цена и техническая возможность требуют проверки менеджером.";
            $headers = ['Content-Type: text/plain; charset=UTF-8', 'From: ALFAGLASS <' . AGM_REQUESTS_FROM . '>'];
            $manager_headers = $headers;
            if (!empty($p['email'])) { $manager_headers[] = 'Reply-To: ' . $p['email']; }
            if (!wp_mail(AGM_REQUESTS_TO, 'ALFAGLASS — заявка ' . $number, $body, $manager_headers, $paths)) {
                return self::error('Почтовый сервер не принял заявку. Данные сохранены в форме; попробуйте позднее.', 502);
            }
            $result = ['ok' => true, 'message' => 'Заявка ' . $number . ' передана почтовому серверу. Менеджер свяжется с вами.'];
            // Record manager acceptance before the optional second message; a retry must not resend the order.
            set_transient($key, $result, 86400);
            if (!empty($p['email'])) {
                $reply = "Здравствуйте!\n\nВаша заявка " . $number . " передана менеджеру ALFAGLASS. Мы свяжемся с вами для уточнения деталей.\nЭто подтверждение получения запроса, а не согласование стоимости или запуск производства.\n\nКонтакт: " . AGM_REQUESTS_TO;
                if (!wp_mail($p['email'], 'ALFAGLASS — заявка ' . $number . ' принята', $reply, array_merge($headers, ['Reply-To: ' . AGM_REQUESTS_TO]))) {
                    $result['message'] .= ' Подтверждение на email отправить не удалось; повторять заявку не нужно.';
                    set_transient($key, $result, 86400);
                }
            }
            return self::response($result);
        } finally {
            foreach ($paths as $path) { unlink($path); }
            if ($directory) { rmdir($directory); }
            delete_option($key . '_lock');
        }
    }
}
add_action('rest_api_init', ['AGM_Requests', 'routes']);
add_action('agm_request_unlock', 'delete_option');
