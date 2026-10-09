<?php
/**
 * Plugin Name: AGM retired public pages
 * Description: Explicit retirement map; keeps original records available to editors.
 */
defined('ABSPATH') || exit;

function agm_legacy_page_rules() {
    static $rules;
    if ($rules === null) {
        $rules = json_decode(file_get_contents(__DIR__ . '/agm-legacy-pages.json'), true) ?: array();
    }
    return $rules;
}

function agm_legacy_page_ids() {
    return array_values(array_filter(array_column(agm_legacy_page_rules(), 'id')));
}

function agm_retire_legacy_page($early = false) {
    if (is_admin() || wp_doing_ajax() || wp_doing_cron() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    if (isset($_GET['preview']) && current_user_can('edit_posts')) return;
    $path = '/' . trim(rawurldecode(wp_parse_url(wp_unslash($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH)), '/') . '/';
    $path = preg_replace('~/+~', '/', $path);
    // Avoid handing retired sitemap requests to the legacy theme's error template.
    if (preg_match('~^/(?:product|materials|uslugi|product_category|materials_cat)-sitemap[0-9]*\.xml/$~', $path)) {
        status_header(410);
        nocache_headers();
        header('X-Robots-Tag: noindex, follow', true);
        header('Content-Type: application/xml; charset=UTF-8');
        echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>';
        exit;
    }
    $id = $early ? absint($_GET['page_id'] ?? $_GET['p'] ?? 0) : (is_singular() ? get_queried_object_id() : 0);
    foreach (agm_legacy_page_rules() as $rule) {
        $extra = substr($path, strlen($rule['source']));
        $archive_child = strpos($path, $rule['source']) === 0 && preg_match('~^(?:page/[0-9]+/|feed/)$~', $extra);
        if ($path !== $rule['source'] && !$archive_child && !($id && $id === $rule['id'])) continue;
        if ($rule['status'] === 301) {
            wp_safe_redirect(home_url($rule['target']), 301, 'AGM legacy pages');
            exit;
        }
        status_header(410);
        nocache_headers();
        header('X-Robots-Tag: noindex, follow', true);
        header('Content-Type: text/html; charset=UTF-8');
        echo '<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Страница закрыта — ALFAGLASS</title><style>body{margin:0;background:#f4f6f7;color:#172f37;font:18px/1.6 Arial,sans-serif}main{max-width:680px;margin:12vh auto;padding:28px}h1{font-size:32px}a{color:#087895;display:inline-block;margin:8px 20px 8px 0}small{color:#53676e}</style><main><small>ALFAGLASS</small><h1>Эта страница больше не используется</h1><p>Мы обновили сайт. Актуальные материалы, способы обработки и услуги доступны в новых разделах.</p><nav><a href="/">Главная</a><a href="/materialy/">Материалы</a><a href="/obrabotka-stekla-i-zerkal/">Обработка</a><a href="/service/">Сервис</a><a href="/contacts/">Контакты</a></nav></main></html>';
        exit;
    }
}
// Redirection runs at init; handle explicit paths before its legacy database rules.
add_action('init', function () { agm_retire_legacy_page(true); }, 0);
add_action('template_redirect', function () { agm_retire_legacy_page(false); }, -100);

// Exclude retired URLs from both supported sitemap providers, without deleting content.
add_filter('wpseo_exclude_from_sitemap_by_post_ids', function ($ids) {
    return array_unique(array_merge((array) $ids, agm_legacy_page_ids()));
});
add_filter('wpseo_sitemap_exclude_taxonomy', function ($exclude, $taxonomy) {
    return $exclude || in_array($taxonomy, array('product_category', 'materials_cat'), true);
}, 999, 2);
add_filter('wpseo_sitemap_exclude_post_type', function ($exclude, $type) {
    return $exclude || in_array($type, array('product', 'materials', 'uslugi'), true);
}, 999, 2);
add_filter('wp_sitemaps_posts_query_args', function ($args) {
    $args['post__not_in'] = array_unique(array_merge($args['post__not_in'] ?? array(), agm_legacy_page_ids()));
    return $args;
});
add_filter('wp_sitemaps_taxonomies', function ($taxonomies) {
    unset($taxonomies['product_category'], $taxonomies['materials_cat']);
    return $taxonomies;
});
add_action('pre_get_posts', function ($query) {
    if (!is_admin() && $query->is_main_query() && $query->is_search()) {
        $query->set('post__not_in', array_unique(array_merge((array) $query->get('post__not_in'), agm_legacy_page_ids())));
    }
});
