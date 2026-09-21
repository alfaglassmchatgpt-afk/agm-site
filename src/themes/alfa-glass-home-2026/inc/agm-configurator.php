<?php
/** One configurator for the material cards; explicit per-material capabilities. */
defined('ABSPATH') || exit;
function agm_order_registry() {
    static $registry;
    if ($registry === null) {
        $registry = json_decode(file_get_contents(get_template_directory() . '/agm-configurator/materials.json'), true);
    }
    return $registry;
}
function agm_order_render($html, $slug, $legacy = false) {
    $registry = agm_order_registry();
    if (!isset($registry[$slug])) {
        preg_match('/<h1[^>]*>(.*?)<\/h1>/s', $html, $heading);
        $registry[$slug] = ['title' => wp_strip_all_tags($heading[1] ?? 'Материал'), 'variants' => ['standard' => 'По образцу'], 'thicknesses' => ['unknown'], 'operations' => ['cut', 'shape', 'polish', 'grind', 'drill', 'frame'], 'policy' => 'basic', 'note' => 'Специальные обработки включаются после подтверждения для этого материала.'];
    }
    $dir = get_template_directory() . '/agm-configurator';
    $url = get_template_directory_uri() . '/agm-configurator';
    $current = $registry[$slug];
    $asset = function ($name) use ($dir, $url) { return esc_url($url . '/' . $name . '?v=' . filemtime($dir . '/' . $name)); };
    if (!$legacy) {
        $choices = '';
        foreach (['base' => ['Исполнение', $current['variants']], 'thickness' => ['Толщина', array_combine($current['thicknesses'], array_map(function ($t) { return $t === 'unknown' ? 'Уточнить толщину' : $t . ' мм'; }, $current['thicknesses']))]] as $name => $field) {
            $choices .= '<fieldset class="choice"><legend>' . esc_html($field[0]) . '</legend><div class="options">';
            $first = true;
            foreach ($field[1] as $value => $label) {
                $choices .= '<label class="option"><input type="radio" name="' . esc_attr($name) . '" value="' . esc_attr($value) . '"' . ($first ? ' checked' : '') . '><span>' . esc_html($label) . '</span></label>';
                $first = false;
            }
            $choices .= '</div></fieldset>';
        }
        $component = str_replace('__AGM_CHOICES__', $choices, file_get_contents($dir . '/component.html'));
        $html = preg_replace_callback('/<section class="container gc-section" id="material-request">.*?<\/section>/s', function () use ($component) { return $component; }, $html, 1);
        // Flutes' display-only processing list is superseded by the working controls.
        $html = preg_replace('/<h3 id="flutes-processing-title">.*?<\/ul>/s', '<p><a href="#material-request">Выбрать обработку и собрать заявку ↓</a></p>', $html, 1);
        $html = str_replace('</head>', '<link rel="stylesheet" href="' . $asset('style.css') . '"></head>', $html);
    } else {
        $html = preg_replace('/<script src="__AGM_ASSETS__\/app\.js" defer><\/script>/', '', $html);
        $html = preg_replace('/<div class="operation-grid">.*?<\/div><p class="small muted"/s', '<div class="operation-grid"></div><p class="small muted"', $html, 1);
        $html = str_replace('<div class="operation-grid">', '<p id="operation-material-note">' . esc_html($current['note']) . '</p><div class="operation-grid">', $html);
        $html = str_replace('Добавить ещё зеркало', 'Добавить ещё изделие', $html);
    }
    $data = ['current' => $slug, 'materials' => $registry, 'operations' => json_decode(file_get_contents($dir . '/operations.json'), true)];
    $scripts = '<script id="agm-order-data" type="application/json">' . wp_json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) . '</script>';
    $scripts .= '<script src="' . $asset('model.js') . '" defer></script><script src="' . $asset('app.js') . '" defer></script>';
    return str_replace('</body>', $scripts . '</body>', $html);
}
