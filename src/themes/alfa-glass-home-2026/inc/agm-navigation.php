<?php
/** Dynamic homepage lists: published pages plus current product catalog. */
defined('ABSPATH') || exit;
require_once __DIR__ . '/agm-material-groups.php';
function agm_navigation_pages($section) {
    $root = get_page_by_path($section === 'materials' ? 'materialy' : 'izdeliya');
    $pages = get_pages(['post_status' => 'publish', 'sort_column' => 'menu_order,post_title']);
    return array_values(array_filter($pages, function ($page) use ($section, $root) {
        return get_post_meta($page->ID, '_agm_navigation_section', true) === $section
            || ($root && in_array((int) $root->ID, array_map('intval', get_post_ancestors($page)), true));
    }));
}
function agm_navigation_render($html) {
    $catalog = [];
    if (preg_match('/<script[^>]*id="catalog-data"[^>]*>(.*?)<\/script>/s', $html, $match)) {
        $catalog = json_decode($match[1], true) ?: [];
    }
    foreach (['materials', 'products'] as $section) {
        $items = [];
        foreach (agm_navigation_pages($section) as $page) {
            $items[$page->post_title] = ['url' => get_permalink($page), 'card' => false];
        }
        if ($section === 'materials') {
            $items = [];
            foreach (agm_material_grouped_pages() as $key => $group) {
                $items[$group['title']] = ['url' => agm_material_group_url($key), 'card' => false];
            }
        }
        if ($section === 'products') {
            foreach ($catalog as $item) {
                if (strpos($item['id'], 'p-') !== 0 || isset($items[$item['title']])) { continue; }
                $id = 'product-' . substr($item['id'], 2);
                if (strpos($html, 'id="' . $id . '"') !== false) {
                    $items[$item['title']] = ['url' => '#' . $id, 'card' => true];
                }
            }
        }
        $links = '';
        foreach ($items as $title => $item) {
            $links .= '<a href="' . esc_url($item['url']) . '"' . ($item['card'] ? ' data-nav-product' : '') . '>' . esc_html($title) . '</a>';
        }
        $all = $section === 'materials' ? home_url('/materialy/') : '#products';
        $links .= '<a class="nav-view-all" href="' . esc_url($all) . '">' . ($section === 'materials' ? 'Все материалы' : 'Все изделия') . ' →</a>';
        $html = preg_replace_callback('/(<div class="nav-panel" id="(?:desktop|mobile)-' . $section . '" hidden>).*?(<\/div>)/s', function ($m) use ($links) { return $m[1] . $links . $m[2]; }, $html);
    }
    return $html;
}
add_action('add_meta_boxes_page', function () {
    add_meta_box('agm-navigation-section', 'Раздел меню ALFAGLASS', function ($post) {
        wp_nonce_field('agm_navigation_section', 'agm_navigation_nonce');
        $value = get_post_meta($post->ID, '_agm_navigation_section', true);
        echo '<label for="agm-navigation-select">Добавлять опубликованную страницу в меню:</label><select id="agm-navigation-select" name="agm_navigation_section" style="width:100%">';
        foreach (['' => 'По родительской странице', 'materials' => 'Материалы', 'products' => 'Изделия'] as $key => $label) {
            echo '<option value="' . esc_attr($key) . '" ' . selected($value, $key, false) . '>' . esc_html($label) . '</option>';
        }
        echo '</select><p>Черновики в меню не отображаются.</p>';
    }, 'page', 'side');
});
add_action('save_post_page', function ($id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) { return; }
    if (!isset($_POST['agm_navigation_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['agm_navigation_nonce'])), 'agm_navigation_section') || !current_user_can('edit_post', $id)) { return; }
    $section = isset($_POST['agm_navigation_section']) ? sanitize_key(wp_unslash($_POST['agm_navigation_section'])) : '';
    if (in_array($section, ['materials', 'products'], true)) { update_post_meta($id, '_agm_navigation_section', $section); }
    else { delete_post_meta($id, '_agm_navigation_section'); }
});
