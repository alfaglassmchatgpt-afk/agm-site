<?php
/** Shared material categories; existing material URLs remain unchanged. */
defined('ABSPATH') || exit;

function agm_material_groups() {
    return [
        'zerkala' => ['title' => 'Зеркала', 'slugs' => ['zerkalo-serebro', 'zerkalo-osvetlyonnoe', 'tonirovannye-zerkala', 'zerkalo-gezella']],
        'craft-triplex' => ['title' => 'Крафтовый триплекс', 'slugs' => ['craft-moru-bronze-mat']],
        'riflenoe-steklo' => ['title' => 'Рифлёное стекло', 'slugs' => ['riflenoe-steklo-flutes', 'moru-crystal', 'moru-ultra', 'moru-bronze-toned', 'moru-grey', 'raywall90', 'raywall', 'vison-sun', 'flutes-moru-bronze', 'flutes-moru-ultra', 'flutes-moru-grey', 'flutes-moru-grey-mat', 'flutes-moru-bronze-mat', 'flutes-moru-ultra-mat', 'tonirovannoe-v-masse-steklo-moru']],
        'sostarennye-zerkala' => ['title' => 'Состаренные зеркала', 'slugs' => ['sostarennye-zerkala', 'sostarennye-zerkala-k1']],
        'tonirovannoe-steklo' => ['title' => 'Тонированное стекло', 'slugs' => ['moru-dark-grey', 'moru-bronze', 'moru-bronze-mat', 'moru-grey-mat', 'moru-dark-grey-mat']],
        'okrashennoe-steklo' => ['title' => 'Окрашенное стекло', 'slugs' => ['steklo-lacobel', 'steklo-matelak']],
        'uzorchatoe-steklo' => ['title' => 'Узорчатое стекло', 'slugs' => ['diamant', 'hithicross', 'gothic', 'silvit', 'kathedral-klein', 'monumental-atlantic', 'krepi', 'kathedralaqualite']],
        'matovoe-steklo' => ['title' => 'Матовое стекло', 'slugs' => ['steklo-matovoe-matelux']],
        'prozrachnoe-steklo' => ['title' => 'Прозрачное и осветлённое стекло', 'slugs' => ['float-steklo-clear-m1', 'steklo-osvetlyonnoe-clearvision', 'steklo-kristalvizhn-crystalvision']],
        'solncezashhitnoe-steklo' => ['title' => 'Солнцезащитное стекло', 'slugs' => ['steklo-solnczezashhitnoe-stopsol']],
        'dihroichnoe-steklo' => ['title' => 'Дихроичное стекло', 'slugs' => ['dihroichnoe-steklo']],
        'other' => ['title' => 'Другие материалы', 'slugs' => []],
    ];
}

function agm_material_grouped_pages() {
    $groups = agm_material_groups();
    foreach ($groups as &$group) { $group['pages'] = []; }
    unset($group);
    foreach (agm_navigation_pages('materials') as $page) {
        $key = get_post_meta($page->ID, '_agm_material_group', true);
        if (!isset($groups[$key])) {
            $key = 'other';
            foreach ($groups as $candidate => $group) {
                if (in_array($page->post_name, $group['slugs'], true)) { $key = $candidate; break; }
            }
        }
        // Existing reeded cards are hidden while their replacement content is prepared.
        // Explicit slugs allow newly created cards to appear without lifting this hold.
        $held_reeded = ['raywall90', 'raywall', 'vison-sun', 'flutes-moru-bronze', 'flutes-moru-ultra', 'flutes-moru-grey', 'flutes-moru-grey-mat', 'flutes-moru-bronze-mat', 'tonirovannoe-v-masse-steklo-moru'];
        if ($key === 'riflenoe-steklo' && in_array($page->post_name, $held_reeded, true)) { continue; }
        $groups[$key]['pages'][] = $page;
    }
    $order = array_flip($groups['zerkala']['slugs']);
    usort($groups['zerkala']['pages'], function ($a, $b) use ($order) { return ($order[$a->post_name] ?? 99) <=> ($order[$b->post_name] ?? 99); });
    return array_filter($groups, function ($group) { return !empty($group['pages']); });
}

function agm_material_group_url($key) {
    return add_query_arg('group', $key, home_url('/materialy/'));
}

function agm_material_catalog_render($html) {
    $groups = agm_material_grouped_pages();
    $selected = isset($_GET['group']) && is_string($_GET['group']) ? sanitize_key(wp_unslash($_GET['group'])) : '';
    if (!isset($groups[$selected])) { $selected = ''; }
    if ($selected) {
        // Group links open the actual collection, without the catalog introduction.
        $html = preg_replace('/<section class="container gc-intro">.*?<\/section>/s', '', $html, 1);
        $html = str_replace(' / Все материалы</div>', ' / ' . esc_html($groups[$selected]['title']) . '</div>', $html);
    }
    preg_match_all('/<a class="gc-card"[^>]*>.*?<\/a>/s', $html, $matches);
    $cards = [];
    foreach ($matches[0] as $card) {
        if (preg_match('/href="[^"]*materialy\/([^\/"?]+)\//', $card, $match)) { $cards[$match[1]] = $card; }
    }
    $out = '<section class="container gc-catalog" data-selected-group="' . esc_attr($selected) . '">';
    if ($selected) { $out .= '<h1>' . esc_html($groups[$selected]['title']) . '</h1>'; }
    $out .= '<label class="gc-search">' . ($selected ? 'Найти в этой группе' : 'Найти среди всех материалов') . '<input id="material-search" type="search" placeholder="Например: Moru, бронза, рифлёное"></label>';
    $out .= '<a class="gc-back" href="' . esc_url(home_url('/materialy/')) . '"' . ($selected ? '' : ' hidden') . '>← Все группы материалов</a>';
    $out .= '<div class="gc-category-grid"' . ($selected ? ' hidden' : '') . '>';
    foreach ($groups as $key => $group) {
        $preview = '';
        foreach ($group['pages'] as $page) {
            if (isset($cards[$page->post_name]) && preg_match('/<img\b[^>]*>/', $cards[$page->post_name], $image)) { $preview = preg_replace('/alt="[^"]*"/', 'alt=""', $image[0]); break; }
        }
        $out .= '<a class="gc-category" href="' . esc_url(agm_material_group_url($key)) . '">' . $preview . '<div><h2>' . esc_html($group['title']) . '</h2><p>Материалов: ' . count($group['pages']) . '</p><strong>Смотреть группу →</strong></div></a>';
    }
    $out .= '</div><p id="material-count" aria-live="polite"></p>';
    foreach ($groups as $key => $group) {
        $out .= '<section class="gc-material-group" data-group="' . esc_attr($key) . '"' . ($selected === $key ? '' : ' hidden') . '>' . ($selected === $key ? '' : '<h2>' . esc_html($group['title']) . '</h2>') . '<div class="gc-grid">';
        foreach ($group['pages'] as $page) {
            $card = $cards[$page->post_name] ?? '<a class="gc-card" data-material-card href="' . esc_url(get_permalink($page)) . '"><div><h3>' . esc_html($page->post_title) . '</h3><strong>Выбрать материал →</strong></div></a>';
            if ($page->post_name === 'tonirovannye-zerkala') { $card = agm_tinted_cascade_card(get_permalink($page)); }
            $card = preg_replace('/ data-groups="[^"]*"/', '', $card);
            $out .= str_replace('data-material-card', 'data-material-card data-groups="' . esc_attr($key) . '"', $card);
        }
        $out .= '</div></section>';
    }
    $out .= '<p id="no-results" hidden>Ничего не найдено. Попробуйте другое название.</p></section>';
    $assets = get_template_directory_uri() . '/agm-glass/';
    $html = str_replace('</head>', '<link rel="stylesheet" href="' . esc_url($assets . 'craft.css?v=1') . '"></head>', $html);
    $html = str_replace('</head>', '<link rel="stylesheet" href="' . esc_url($assets . 'tinted-cascade.css?v=2') . '"></head>', $html);
    $html = str_replace('</body>', '<script src="' . esc_url($assets . 'tinted-cascade.js?v=2') . '" defer></script></body>', $html);
    return preg_replace_callback('/<section class="container gc-catalog">.*?<\/section>/s', function () use ($out) { return $out; }, $html, 1);
}

add_action('add_meta_boxes_page', function () {
    add_meta_box('agm-material-group', 'Группа материала', function ($post) {
        wp_nonce_field('agm_material_group', 'agm_material_group_nonce');
        $value = get_post_meta($post->ID, '_agm_material_group', true);
        echo '<select name="agm_material_group" style="width:100%"><option value="">Автоматически по материалу</option>';
        foreach (agm_material_groups() as $key => $group) {
            echo '<option value="' . esc_attr($key) . '" ' . selected($value, $key, false) . '>' . esc_html($group['title']) . '</option>';
        }
        echo '</select><p>Для опубликованных страниц раздела «Материалы».</p>';
    }, 'page', 'side');
});
add_action('save_post_page', function ($id) {
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || !current_user_can('edit_post', $id)) { return; }
    if (!isset($_POST['agm_material_group_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['agm_material_group_nonce'])), 'agm_material_group')) { return; }
    $key = isset($_POST['agm_material_group']) ? sanitize_key(wp_unslash($_POST['agm_material_group'])) : '';
    if (isset(agm_material_groups()[$key])) { update_post_meta($id, '_agm_material_group', $key); }
    else { delete_post_meta($id, '_agm_material_group'); }
});

function agm_tinted_cascade_card($url) {
    $colors = ['bronze'=>'Бронза','grey'=>'Серое','gold'=>'Золотое','pink'=>'Розовое','rainbow'=>'Радужное','blue'=>'Синее','black'=>'Чёрное'];
    $out = '<article class="gc-card tint-cascade" data-material-card><a class="tint-deck" data-tint-link href="' . esc_url(add_query_arg('variant','tint_bronze',$url)) . '" aria-label="Тонированное зеркало — Бронза">';
    $n = 0;
    foreach ($colors as $key=>$label) {
        $out .= '<img data-cascade-color="' . esc_attr($key) . '" data-label="' . esc_attr($label) . '" src="' . esc_url(get_template_directory_uri() . '/agm-materials/assets/tinted-' . $key . '-catalog-v3.png') . '" alt="' . esc_attr($label) . ' — визуализация зеркала" style="--slot:' . $n . ';z-index:' . (7-$n) . '" loading="lazy">';
        $n++;
    }
    $out .= '</a><div class="tint-copy"><h3>Тонированные зеркала</h3><p>7 оттенков</p><div class="tint-swatches" role="group" aria-label="Цвет зеркала" hidden>';
    foreach ($colors as $key=>$label) {
        $out .= '<button type="button" data-swatch="' . esc_attr($key) . '" aria-label="' . esc_attr($label) . '" title="' . esc_attr($label) . '" aria-pressed="' . ($key === 'bronze' ? 'true' : 'false') . '"></button>';
    }
    $out .= '</div><p class="tint-color-label" data-cascade-label aria-live="polite">Бронза</p><a data-tint-link href="' . esc_url(add_query_arg('variant','tint_bronze',$url)) . '"><strong>Выбрать материал →</strong></a></div></article>';
    return $out;
}
