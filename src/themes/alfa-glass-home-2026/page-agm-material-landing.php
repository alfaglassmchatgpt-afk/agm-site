<?php
/** Template Name: ALFAGLASS — Рифлёное стекло / Триплекс */
defined('ABSPATH') || exit;
require_once __DIR__ . '/inc/agm-aluminium-header.php';
require_once __DIR__ . '/inc/agm-configurator.php';
require_once __DIR__ . '/inc/agm-quote.php';
$slug = get_post_field('post_name', get_queried_object_id());
$triplex = $slug === 'triplex';
$title = $triplex ? 'Триплекс' : 'Рифлёное стекло';
$url = get_template_directory_uri();
$asset = function ($path) use ($url) { return esc_url($url . '/' . $path); };
// Use the standard isolated shell, preserving SEO, theme and quote hooks.
$cleanup = function () {
    foreach (wp_styles()->queue as $handle) {
        if (!in_array($handle, ['admin-bar', 'dashicons', 'sm_theme_style', 'sm_style'], true)) wp_dequeue_style($handle);
    }
    foreach (wp_scripts()->queue as $handle) {
        if (!in_array($handle, ['admin-bar', 'sm_script'], true)) wp_dequeue_script($handle);
    }
};
add_action('wp_enqueue_scripts', $cleanup, PHP_INT_MAX);
add_action('wp_footer', $cleanup, 0);
ob_start();
?><!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<?php wp_head(); ?>
<link rel="stylesheet" href="<?php echo $asset('agm-doors/style.css'); ?>">
<link rel="stylesheet" href="<?php echo $asset('agm-landings/style.css'); ?>">
<link rel="stylesheet" href="<?php echo $asset('agm-aluminium-catalog/shared-header.css'); ?>">
<script src="<?php echo $asset('agm-aluminium-catalog/shared-header.js'); ?>" defer></script>
</head><body id="top">
<?php echo agm_aluminium_header($slug, ['/materialy/' => 'Все материалы', '/riflenoe-steklo/' => 'Рифлёное стекло', '/triplex/' => 'Триплекс', '/aluminium/peregorodki/' => 'Перегородки', '/#contacts' => 'Контакты'], '/' . $slug . '/#material-request'); ?>
<main class="aml<?php echo $triplex ? ' aml-triplex' : ''; ?>" id="main">
<nav class="aml-crumbs" aria-label="Хлебные крошки"><a href="/">Главная</a> / <a href="/materialy/">Материалы</a> / <span><?php echo esc_html($title); ?></span></nav>
<section class="aml-hero">
<div><p class="aml-eyebrow">Материал для вашего проекта</p><h1><?php echo esc_html($title); ?> на заказ</h1>
<p class="aml-lead"><?php echo $triplex ? 'Прозрачный, цветной или с выразительной фактурой. Соберём сочетание стёкол и EVA-плёнки под ваш интерьер.' : 'Свет, фактура и приватность. Подберите рельеф, оттенок и толщину стекла под размеры вашего изделия.'; ?></p>
<div class="aml-actions"><a class="aml-button" href="#<?php echo $triplex ? 'material-request' : 'collection'; ?>">Рассчитать по моим размерам</a><a href="#collection">Выбрать <?php echo $triplex ? 'сочетание' : 'стекло'; ?> ↓</a></div>
<p class="aml-note">Изготовление по размерам · Москва и Московская область</p></div>
<figure><img fetchpriority="high" src="<?php echo $asset($triplex ? 'agm-homepage/assets/triplex-layered-wave-v3.png' : 'agm-glass/assets/generated/moru-ultra-aluminium-v2.png'); ?>" alt="<?php echo $triplex ? 'Состав триплекса: рифлёное стекло, гибкая EVA-плёнка и серое стекло' : 'Визуализация рифлёного стекла MORU в алюминиевой перегородке'; ?>"><figcaption><?php echo $triplex ? 'Стекло + EVA-плёнка + стекло. Визуализация слоёв до соединения.' : 'Визуализация применения. Фактуру и оттенок выбираем по образцу.'; ?></figcaption></figure>
</section>
<?php if ($triplex): ?>
<nav class="aml-jump" aria-label="На странице триплекса"><a href="#collection">Варианты триплекса</a><a href="#combination">Состав и фактура</a><a href="#project">Наша работа</a><a href="#material-request">Мой расчёт ↗</a></nav>
<section class="aml-section" id="collection"><p class="aml-eyebrow">Четыре направления — множество сочетаний</p><h2>Какой триплекс вам нужен?</h2><div class="aml-grid aml-four">
<?php foreach ([
 ['Прозрачный', 'Два стекла и прозрачная EVA-плёнка. Для решений, где важно сохранить обзор и свет.', 'clear'],
 ['Цветной', 'Цветная EVA-плёнка для акцентов в интерьере и фирменных цветов коммерческих пространств.', 'colored'],
 ['С металлической сеткой', 'Латунь, медь или нержавеющая сталь между стёклами. Характер поверхности меняется вместе со светом.', 'mesh'],
 ['Декоративный', 'Рифлёное или узорчатое стекло в сочетании с гладким: прозрачным, матовым или тонированным.', 'custom']
] as $item): ?><article class="aml-card aml-text-card"><h3><?php echo esc_html($item[0]); ?></h3><p><?php echo esc_html($item[1]); ?></p><a href="#material-request" data-triplex-variant="<?php echo esc_attr($item[2]); ?>">Выбрать и рассчитать →</a></article><?php endforeach; ?>
</div></section>
<section class="aml-section" id="combination"><p class="aml-eyebrow">Индивидуальные решения</p><h2>Ваш замысел — в сочетании материалов</h2><p class="aml-intro">Рельеф задаёт характер, плёнка — цвет, второе стекло — глубину оттенка. Подбираем каждый слой под ваш проект.</p><div class="aml-grid aml-layers"><article class="aml-panel"><span class="aml-layer-label">Лицевая фактура</span><h3>Первое стекло</h3><p>Гладкое, рифлёное или подходящее узорчатое стекло. Для декоративной основы — 4 или 6 мм, в зависимости от материала.</p><a href="/riflenoe-steklo/">Рифлёные основы →</a></article><article class="aml-panel"><span class="aml-layer-label">Цвет и прозрачность</span><h3>EVA-плёнка</h3><p>Прозрачная по умолчанию. Цветная — для выразительных акцентов; матовый эффект согласуем по образцу.</p><div class="aml-colors" aria-label="Примеры цветов плёнки"><span style="--swatch:#3e8193">Голубой</span><span style="--swatch:#22724c">Зелёный</span><span style="--swatch:#9c2837">Красный</span><span style="--swatch:#dab52b">Жёлтый</span><span style="--swatch:#704787">Фиолетовый</span><span style="--swatch:#746e63">Серый</span></div><small>Цвета на экране условные. Желаемый цвет укажите в пожеланиях к изделию.</small></article><article class="aml-panel"><span class="aml-layer-label">Основа сочетания</span><h3>Второе стекло</h3><p>Прозрачное, осветлённое, матовое или тонированное. Например, Silvit с серым стеклом создаёт рельефный рисунок с дымчатым оттенком.</p><a href="#material-request" data-triplex-variant="custom">Подобрать сочетание →</a></article></div><p class="aml-note">Минимальный состав — 4+4 мм стекла плюс EVA-плёнка. Итоговая толщина больше 8 мм и зависит от состава.</p></section>
<section class="aml-section aml-split aml-mesh"><div><p class="aml-eyebrow">Металл внутри стекла</p><h2>Тонкие нити. Живые отражения.</h2><p>Латунь, медь или нержавеющая сталь между стёклами — три разных характера поверхности. При смене освещения сетка становится заметнее или растворяется в отражениях.</p><p>Сочетание стекла, сетки и EVA-плёнки согласуем по образцу, чтобы оценить оттенок и прозрачность.</p><a class="aml-button" href="#material-request" data-triplex-variant="mesh">Триплекс с сеткой</a></div><div class="aml-metal-list"><div><span class="aml-metal aml-brass"></span><h3>Латунь</h3><p>Тёплый золотистый акцент</p></div><div><span class="aml-metal aml-copper"></span><h3>Медь</h3><p>Насыщенный медный оттенок</p></div><div><span class="aml-metal aml-steel"></span><h3>Нержавеющая сталь</h3><p>Холодный металлический блеск</p></div><small>Условные обозначения оттенков, не образцы плетения.</small></div></section>
<section class="aml-section" id="project"><div class="aml-project-heading"><div><p class="aml-eyebrow">Реализованный проект</p><h2>Silvit + серое стекло</h2></div><p>Наша работа: декоративный триплекс в виде вставок в лестничное ограждение. Рельеф и прозрачность — на реальных фотографиях.</p></div><div class="aml-project-photos"><figure><img loading="lazy" src="<?php echo $asset('agm-configurator/assets/triplex-project-interior.jpg'); ?>" alt="Лестничное ограждение со вставками из триплекса Silvit и серого стекла"><figcaption>Общий вид лестничного ограждения.</figcaption></figure><figure><img loading="lazy" src="<?php echo $asset('agm-configurator/assets/triplex-project-detail.jpg'); ?>" alt="Фактура реальной вставки Silvit с серым стеклом крупным планом"><figcaption>Фактура стекла в готовом изделии.</figcaption></figure></div></section>
<section class="aml-section"><h2>Где использовать</h2><div class="aml-grid"><article class="aml-panel"><h3>Перегородки и двери</h3><p>В алюминиевых системах, рассчитанных на выбранную толщину заполнения.</p><a href="/aluminium/peregorodki/">Перегородки →</a></article><article class="aml-panel"><h3>Душевые и ограждения</h3><p>Состав, крепление и обработку кромок подбираем под условия эксплуатации и конструкцию.</p></article><article class="aml-panel"><h3>Вставки и цветовые акценты</h3><p>Вставки во входные и межкомнатные двери, оформление офисов и коммерческих помещений.</p></article></div></section>
<section class="aml-section"><h2>Что нужно согласовать</h2><p>Размеры, толщины, обработки и возможность изготовления проверяем для конкретного сочетания. Не каждое узорчатое стекло подходит: Хитхайкрос с рельефом с двух сторон не используем. Профили мебельных фасадов под стекло 4 мм для такого триплекса не подходят.</p></section>
<section class="container gc-section" id="material-request"></section>
<?php else: ?>
<section class="aml-section" id="collection"><p class="aml-eyebrow">Коллекция фактур</p><h2>Выберите рифлёное стекло</h2><p>Откройте материал, чтобы выбрать доступную толщину, указать размеры и добавить изделие в общий «Мой расчёт».</p><div class="aml-grid">
<?php foreach (json_decode(file_get_contents(__DIR__ . '/agm-landings/reeded.json'), true) as $card): ?>
<article class="aml-card"><a href="/materialy/<?php echo esc_attr($card['slug']); ?>/"><img loading="lazy" src="<?php echo $asset($card['image']); ?>" alt="<?php echo esc_attr($card['title']); ?>"><h3><?php echo esc_html($card['title']); ?></h3></a><p><?php echo esc_html($card['description']); ?></p><a class="aml-card-action" href="/materialy/<?php echo esc_attr($card['slug']); ?>/#material-request">Рассчитать по моим размерам →</a></article>
<?php endforeach; ?></div></section>
<section class="aml-section aml-split"><div><h2>Фактура, которая меняет пространство</h2><p>Рифлёное стекло пропускает свет и искажает видимые за ним предметы. Степень приватности зависит от рисунка, оттенка, матирования, освещения и расстояния до предметов.</p><p>Для перегородок, дверей и мебельных вставок подбираем не только внешний вид: важны толщина, размеры и совместимость с профилем. Доступные обработки указаны в карточке конкретного материала.</p><a href="/aluminium/peregorodki/">Подобрать перегородку →</a></div><div class="aml-panel"><h3>Хотите сложное сочетание?</h3><p>Рифлёное стекло может стать основой декоративного триплекса. Второе стекло и EVA-плёнка добавят оттенок и изменят прозрачность.</p><a href="/triplex/">Перейти к триплексу →</a></div></section>
<section class="aml-section" id="material-request"><h2>Расчёт по вашим размерам</h2><p>Выберите стекло в коллекции выше. В его карточке укажите ширину и высоту в миллиметрах, количество и доступную обработку. Несколько разных материалов можно собрать в одну заявку.</p><a class="aml-button" href="#collection">Выбрать материал</a></section>
<?php endif; ?>
<section class="aml-section aml-faq"><h2>Перед заказом</h2><details><summary>От чего зависит цена?</summary><p>От выбранного материала<?php echo $triplex ? ' и состава триплекса' : ''; ?>, толщины, размеров, количества, обработки и доставки. Для расчёта укажите параметры изделия; цену и срок подтвердим после проверки заказа.</p></details><details><summary>Можно ли выбрать по фотографии?</summary><p>Фотография помогает выбрать направление. Окончательно оттенок, фактуру и прозрачность лучше оценить на образце: свет и окружение влияют на восприятие стекла.</p></details><details><summary>Можно ли заказать несколько разных изделий?</summary><p>Да. Добавляйте материалы в «Мой расчёт» из их карточек и отправляйте общей заявкой.</p></details></section>
</main><footer class="aml-footer"><a href="/materialy/">Все материалы</a><a href="/riflenoe-steklo/">Рифлёное стекло</a><a href="/triplex/">Триплекс</a><a href="/#contacts">Контакты</a></footer>
<?php if ($triplex): ?><script src="<?php echo $asset('agm-landings/app.js'); ?>" defer></script><?php endif; ?>
<?php wp_footer(); ?></body></html><?php
$html = ob_get_clean();
echo $triplex ? agm_order_render($html, 'dekorativnyy-triplex') : agm_quote_assets($html);
