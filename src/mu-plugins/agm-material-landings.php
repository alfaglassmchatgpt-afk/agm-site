<?php
/** Mirror article routes and material landing migration. No automatic page creation. */
defined('ABSPATH') || exit;

function agm_material_landing_map() {
    return ['riflenoe-steklo' => 'riflenoe-steklo', 'craft-triplex' => 'triplex'];
}
function agm_material_landing_ready($slug) {
    $page = get_page_by_path($slug);
    return $page && $page->post_status === 'publish'
        && get_post_meta($page->ID, '_wp_page_template', true) === 'page-agm-material-landing.php';
}
add_filter('agm_material_group_link', function ($url, $key) {
    $slug = agm_material_landing_map()[$key] ?? '';
    return $slug && agm_material_landing_ready($slug) ? home_url('/' . $slug . '/') : $url;
}, 10, 2);
add_action('template_redirect', function () {
    if (is_admin() || is_preview()) return;
    $path = trim((string) wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
    $group = isset($_GET['group']) && is_string($_GET['group']) ? sanitize_key(wp_unslash($_GET['group'])) : '';
    $slug = $path === 'materialy' ? (agm_material_landing_map()[$group] ?? '') : '';
    $aliases = ['catalog/riflenoe-steklo' => 'riflenoe-steklo', 'dekorativnyy-triplex' => 'triplex', 'kraftovyy-triplex' => 'triplex'];
    $slug = $aliases[$path] ?? $slug;
    if (!$slug || !agm_material_landing_ready($slug)) return;
    // Preserve campaign parameters, but do not carry the retired group selector.
    $target = home_url('/' . $slug . '/');
    $args = $_GET;
    unset($args['group']);
    if ($args) $target = add_query_arg(wp_unslash($args), $target);
    wp_safe_redirect($target, 301);
    exit;
}, 1);

function agm_mirror_article_choices() {
    ob_start(); ?>
    <section class="agm-mirror-choice" id="mirror-choice" aria-labelledby="mirror-choice-title">
      <p class="agm-mirror-choice-kicker">От материала — к вашему зеркалу</p>
      <h2 id="mirror-choice-title">Какое зеркало вам нужно?</h2>
      <p>Выберите исполнение, укажите размеры и добавьте изделие в «Мой расчёт».</p>
      <div class="agm-mirror-choice-grid">
      <?php foreach ([
        ['Обычное зеркало', 'По вашим размерам, с нужной обработкой кромки.', '/materialy/zerkalo-serebro/', 'material-request'],
        ['Зеркало с подсветкой', 'Световой рисунок и форма под ваш интерьер.', '/zerkala-s-podsvetkoj/', 'project-brief'],
        ['Зеркало в раме', 'Алюминиевый профиль, выбранная форма и цвет.', '/aluminium/zerkala/', 'calculation']
      ] as $choice): ?>
      <article><h3><a href="<?php echo esc_url(home_url($choice[2])); ?>"><?php echo esc_html($choice[0]); ?></a></h3><p><?php echo esc_html($choice[1]); ?></p><a class="agm-mirror-choice-action" href="<?php echo esc_url(home_url($choice[2]) . '#' . $choice[3]); ?>">Рассчитать по моим размерам →</a></article>
      <?php endforeach; ?>
      </div>
    </section>
    <?php return ob_get_clean();
}
add_filter('the_content', function ($content) {
    if (!is_singular() || !in_the_loop() || !is_main_query()
        || get_post_field('post_name', get_queried_object_id()) !== 'iz-chego-delayut-zerkalo') return $content;
    if (strpos($content, 'id="mirror-choice"') !== false) return $content;
    // Do not nest a link inside an existing anchor. Restrict replacement to the known plain phrase.
    $content = str_replace('на странице «Зеркало на заказ».', 'на странице <a href="' . esc_url(home_url('/materialy/zerkalo-serebro/')) . '">«Зеркало на заказ»</a>.', $content);
    $block = agm_mirror_article_choices();
    $pattern = '~(<p\b[^>]*>(?:(?!</p>).)*на странице <a href="[^"]+">«Зеркало на заказ»</a>\.(?:(?!</p>).)*</p>)~s';
    $updated = preg_replace_callback($pattern, function ($m) use ($block) { return $m[1] . $block; }, $content, 1, $count);
    return $count ? $updated : $content . $block;
}, 20);
add_action('wp_enqueue_scripts', function () {
    if (is_singular() && get_post_field('post_name', get_queried_object_id()) === 'iz-chego-delayut-zerkalo') {
        wp_enqueue_style('agm-mirror-choice', get_template_directory_uri() . '/agm-landings/mirror-choice.css', [], '20261102');
    }
});

function agm_landing_seo() {
    if (!is_page(['triplex', 'riflenoe-steklo'])) return null;
    return is_page('triplex')
        ? ['Триплекс на заказ в Москве — прозрачный, цветной, с сеткой | ALFAGLASS', 'Триплекс по вашим размерам: прозрачный, цветной, с металлической сеткой и декоративными стёклами. Подбор состава и расчёт для перегородок, дверей и ограждений.']
        : ['Рифлёное стекло на заказ в Москве — MORU, Flutes, Estriado | ALFAGLASS', 'Рифлёное стекло по размерам: MORU, Flutes, Estriado и другие фактуры. Выбор оттенка, толщины и обработки. Каталог материалов и расчёт заказа.'];
}
add_filter('pre_get_document_title', function ($title) { $seo = agm_landing_seo(); return $seo ? $seo[0] : $title; }, 30);
add_filter('wpseo_title', function ($title) { $seo = agm_landing_seo(); return $seo ? $seo[0] : $title; }, 30);
add_filter('wpseo_metadesc', function ($description) { $seo = agm_landing_seo(); return $seo ? $seo[1] : $description; }, 30);
add_action('wp_head', function () {
    $seo = agm_landing_seo();
    if ($seo && !defined('WPSEO_VERSION')) echo '<meta name="description" content="' . esc_attr($seo[1]) . '">';
}, 2);
