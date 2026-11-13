<?php
/** Plugin Name: AGM — Расчёты менеджера по фасадам */
defined('ABSPATH') || exit;

add_action('init', static function () {
    if (!get_role('agm_facade_manager')) {
        add_role('agm_facade_manager', 'Менеджер фасадов', ['read' => true, 'agm_calculate_facades' => true]);
    }
});
function agm_manager_can_calculate() {
    return current_user_can('agm_calculate_facades') || current_user_can('manage_options');
}
function agm_manager_url() {
    return add_query_arg('agm_facade_manager', '1', home_url('/'));
}
add_filter('login_redirect', static function ($url, $requested, $user) {
    if ($user instanceof WP_User && user_can($user, 'agm_calculate_facades')) return agm_manager_url();
    return $url;
}, 10, 3);
add_action('template_redirect', static function () {
    if (!isset($_GET['agm_facade_manager'])) return;
    nocache_headers();
    if (!is_user_logged_in()) {
        wp_safe_redirect(wp_login_url(agm_manager_url()));
        exit;
    }
    if (!agm_manager_can_calculate()) wp_die('Доступ только для менеджеров фасадов.', '', ['response'=>403]);
    $directory = '/agm-aluminium-configurator/';
    $template = file_get_contents(get_template_directory().$directory.'index.html');
    $base = '<base href="'.esc_url(get_template_directory_uri().$directory).'">';
    $form = '<form hidden id="manager-report-form" target="_blank" method="post" action="'.esc_url(admin_url('admin-post.php')).'">'
        .'<input name="action" value="agm_facade_manager_report"><input name="project">'
        .wp_nonce_field('agm_facade_manager_report', '_wpnonce', false, false).'</form>';
    $template = str_replace(['<head>', '<body>', '3D-подбор · проект можно скачать', 'Добавить в мой расчёт', '<button id="export">'],
        ['<head>'.$base, '<body>'.$form, 'Кабинет менеджера · <a href="'.esc_url(wp_logout_url(home_url('/'))).'">Выйти</a>', 'Рассчитать и открыть ведомость', '<button hidden id="export">'], $template);
    $template = preg_replace('~<script defer src="[^"]*/quote-ui\.js[^"]*"></script>~', '', $template);
    $template = str_replace('Отправьте проект через форму или скачайте его для обсуждения с менеджером.', 'Ведомость откроется в новой вкладке. Можно распечатать весь комплект или отдельный лист.', $template);
    $template = preg_replace('~<div class="next-note">.*?</div>~s', '', $template);
    $template = preg_replace('~<a id="manager-login".*?</a>~', '', $template);
    header('X-Robots-Tag: noindex, nofollow');
    echo $template;
    exit;
});
add_action('admin_post_agm_facade_manager_report', static function () {
    if (!agm_manager_can_calculate()) wp_die('Доступ ограничен.', '', ['response'=>403]);
    check_admin_referer('agm_facade_manager_report');
    $raw = wp_unslash($_POST['project'] ?? '');
    if (!is_string($raw) || strlen($raw)>1048576) wp_die('Слишком большой проект.', '', ['response'=>400]);
    $order = json_decode($raw, true);
    if (empty($order['managerItems']) || !is_array($order['managerItems']) || array_filter($order['managerItems'],static function($item){return ($item['type']??'')!=='facade';})) wp_die('Нужен проект фасадов.', '', ['response'=>400]);
    nocache_headers();
    try {
        echo agm_facade_report(array_merge($order,['name'=>'','email'=>'','phone'=>'','comment'=>'']));
    } catch (Throwable $error) {
        wp_die('Проверьте параметры фасадов и повторите расчёт.', '', ['response'=>400]);
    }
    exit;
});
