<?php
/** Service enquiry UI; delivery uses the existing AGM_Requests transport. */
defined('ABSPATH') || exit;

add_filter('rest_pre_dispatch', function ($result, $server, $request) {
    if ($result !== null || $request->get_route() !== '/agm/v1/requests' || $request->get_method() !== 'POST') { return $result; }
    $p = $request->get_body_params();
    if (($p['service_request'] ?? '') !== '1') { return $result; }
    $limits = ['service_kind' => 80, 'service_product' => 240, 'service_address' => 1200, 'service_material' => 400, 'service_source' => 2000];
    foreach ($limits as $key => $limit) {
        if (!isset($p[$key]) || !is_string($p[$key]) || strlen($p[$key]) > $limit) {
            return new WP_Error('service_field', 'Проверьте поля заявки.', ['status' => 400]);
        }
    }
    $kinds = array_unique(explode(',', $p['service_kind']));
    $labels = ['measure' => 'Замер', 'delivery' => 'Доставка', 'install' => 'Монтаж'];
    if (!$kinds || array_diff($kinds, array_keys($labels)) || !trim($p['service_product']) || !trim($p['service_address'])) {
        return new WP_Error('service_required', 'Выберите услугу, укажите изделие и адрес объекта.', ['status' => 400]);
    }
    if (!is_string($p['phone'] ?? null) || strlen(preg_replace('/\D/', '', $p['phone'])) < 10) {
        return new WP_Error('service_phone', 'Укажите телефон с кодом города или оператора.', ['status' => 400]);
    }
    $source = esc_url_raw($p['service_source']);
    if (wp_parse_url($source, PHP_URL_HOST) !== wp_parse_url(home_url(), PHP_URL_HOST)) { $source = ''; }
    $p['request_text'] = "ЗАЯВКА НА СЕРВИС\n";
    $p['request_text'] .= 'Услуги: ' . implode(', ', array_map(function ($k) use ($labels) { return $labels[$k]; }, $kinds)) . "\n";
    foreach (['service_product' => 'Изделие', 'service_material' => 'Материал', 'service_address' => 'Адрес объекта'] as $key => $label) {
        $p['request_text'] .= $label . ': ' . sanitize_text_field($p[$key]) . "\n";
    }
    $p['request_text'] .= 'Страница обращения: ' . $source;
    $p['delivery'] = in_array('delivery', $kinds, true) ? '1' : '';
    $p['install'] = in_array('install', $kinds, true) ? '1' : '';
    $request->set_body_params($p);
    add_filter('wp_mail', function ($mail) {
        if (strpos($mail['subject'], 'ALFAGLASS — заявка ') === 0) { $mail['subject'] = str_replace('ALFAGLASS — заявка ', 'ALFAGLASS — Сервис — заявка ', $mail['subject']); }
        return $mail;
    });
    return $result;
}, 10, 3);

add_action('wp_footer', function () {
    if (is_admin() || is_feed()) { return; }
    $dir = get_template_directory() . '/agm-service-request';
    $uri = get_template_directory_uri() . '/agm-service-request';
    $registry = json_decode(file_get_contents(get_template_directory() . '/agm-configurator/materials.json'), true) ?: [];
    $materials = array_values(array_unique(array_column($registry, 'title')));
    sort($materials, SORT_STRING);
    $config = ['endpoint' => rest_url('agm/v1/requests'), 'serviceUrl' => home_url('/service/'), 'privacyUrl' => get_privacy_policy_url(), 'materials' => $materials];
    echo '<link rel="stylesheet" href="' . esc_url($uri . '/style.css?v=' . filemtime($dir . '/style.css')) . '">';
    echo file_get_contents($dir . '/dialog.html');
    echo '<script type="application/json" id="agm-service-request-data">' . wp_json_encode($config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) . '</script>';
    echo '<script src="' . esc_url($uri . '/app.js?v=' . filemtime($dir . '/app.js')) . '" defer></script>';
}, 30);
