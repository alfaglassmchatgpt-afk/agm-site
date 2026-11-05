<?php
/** Template Name: ALFAGLASS — Рифлёное стекло / Триплекс */
defined('ABSPATH') || exit;
require_once __DIR__ . '/inc/agm-aluminium-header.php';
require_once __DIR__ . '/inc/agm-configurator.php';
require_once __DIR__ . '/inc/agm-quote.php';
require_once __DIR__ . '/inc/agm-material-groups.php';
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
<link rel="stylesheet" href="<?php echo $asset('agm-landings/style.css?v=20261103-hero'); ?>">
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
<?php if ($triplex): $slides = [
 ['МОРУ + матовое серое · 4+4 мм', 'Крупный план триплекса МОРУ с матовым серым стеклом и полированной кромкой', 'triplex-hero-1-v1.jpg'],
 ['То же сочетание — в интерьере', 'Серая матовая перегородка МОРУ между прихожей и жилой комнатой', 'triplex-hero-2-v1.jpg'],
 ['Бронзовый МОРУ · образец', 'Образец бронзового МОРУ с вертикальным рифлением и полированной кромкой', 'triplex-bronze-sample-v1.jpg'],
 ['Бронзовый МОРУ · дверь в интерьере', 'Визуализация двери с бронзовым рифлёным заполнением в узком алюминиевом профиле', 'triplex-bronze-door-v1.jpg'],
 ['Латунная сетка внутри стекла', 'Кромка триплекса с тонкой латунной сеткой', 'triplex-hero-3-v1.jpg'],
 ['Перегородка с латунной сеткой', 'Светлая перегородка в алюминиевых профилях с золотистыми нитями сетки', 'triplex-hero-4-square-v2.jpg'],
 ['Зелёный триплекс · образец', 'Крупный план зелёного триплекса с полированной кромкой', 'triplex-green-sample-v1.jpg'],
 ['Цветной триплекс в фирменных цветах', 'Зелёный триплекс в перегородке коммерческого помещения', 'triplex-hero-5-v1.jpg'],
 ['Silvit + серое · образец', 'Фактура и кромка образца триплекса Silvit с серым стеклом', 'triplex-silvit-sample-v1.jpg'],
 ['Silvit + серое · лестничные вставки', 'Визуализация вставок в лестничное ограждение по фото нашей работы', 'triplex-hero-6-v1.jpg']
]; ?><div class="aml-showcase" role="region" aria-roledescription="карусель" aria-label="Триплекс: материал и готовые решения">
<div class="aml-slides">
<?php foreach ($slides as $i => $slide): ?><figure class="aml-slide<?php echo $i === 0 ? ' is-active' : ''; ?>" aria-hidden="<?php echo $i === 0 ? 'false' : 'true'; ?>">
<img <?php echo $i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'; ?> src="<?php echo $asset('agm-landings/assets/' . $slide[2]); ?>" alt="<?php echo esc_attr($slide[1]); ?>" width="1254" height="1254">
<figcaption><?php echo esc_html($slide[0]); ?></figcaption></figure><?php endforeach; ?>
</div>
<div class="aml-slide-controls"><div class="aml-slide-dots" aria-label="Выбор слайда"><?php foreach ($slides as $i => $slide): ?><button type="button" data-slide="<?php echo $i; ?>" aria-label="Слайд <?php echo $i + 1; ?>: <?php echo esc_attr($slide[0]); ?>" aria-pressed="<?php echo $i === 0 ? 'true' : 'false'; ?>"></button><?php endforeach; ?></div><button class="aml-slide-pause" type="button" aria-label="Приостановить слайды">Ⅱ</button></div>
<p class="aml-note">Визуализации. Фактуру и оттенок согласуем по образцу.</p>
</div>
<?php else: ?><figure><img fetchpriority="high" src="<?php echo $asset('agm-glass/assets/generated/moru-ultra-aluminium-v2.png'); ?>" alt="Визуализация рифлёного стекла MORU в алюминиевой перегородке"><figcaption>Визуализация применения. Фактуру и оттенок выбираем по образцу.</figcaption></figure><?php endif; ?>
</section>
<?php if ($triplex): ?>
<section class="aml-section" id="collection">
  <h2>Какой триплекс вам нужен?</h2>
  <div class="aml-grid aml-four">
    <article class="aml-card aml-text-card">
      <h3>Из плоского стекла</h3>
      <p>Листы плоского флоат-стекла (Float) — прозрачные, матовые или тонированные. Для межкомнатных дверей, душевых и офисных перегородок.</p>
      <a href="/triplex/#triplex-builder">Открыть конфигуратор →</a>
    </article>
    <article class="aml-card aml-text-card">
      <h3>С рифлёным стеклом</h3>
      <p>Рифление МОРУ пропускает свет и размывает очертания за стеклом. Подходит для дверей гардеробной и перегородок между прихожей и комнатой.</p>
      <a href="?variant=ribbed#triplex-builder">Открыть конфигуратор →</a>
    </article>
    <article class="aml-card aml-text-card">
      <h3>Из декоративного стекла</h3>
      <p>Узорчатое стекло задаёт рисунок, а второе стекло — оттенок. Например, Сильвит с серым стеклом используем для вставок в двери и лестничные ограждения.</p>
      <a href="?variant=patterned#triplex-builder">Открыть конфигуратор →</a>
    </article>
    <article class="aml-card aml-text-card">
      <h3>Свободная конфигурация</h3>
      <p>Подберём сочетание стекла, плёнки и декоративных вставок по вашему эскизу. Например, для перегородки со шпоном или двери в фирменных цветах.</p>
      <a href="?variant=custom#triplex-builder">Открыть конфигуратор →</a>
    </article>
</div></section>
<section class="aml-section" id="combination"><p class="aml-eyebrow">Индивидуальные решения</p><h2>Ваш замысел — в сочетании материалов</h2><p class="aml-intro">Рельеф задаёт характер, плёнка — цвет, второе стекло — глубину оттенка. Подбираем каждый слой под ваш проект.</p><div class="aml-grid aml-layers"><article class="aml-panel"><span class="aml-layer-label">Лицевая фактура</span><h3>Первое стекло</h3><p>Гладкое, рифлёное или подходящее узорчатое стекло. Для декоративной основы — 4 или 6 мм, в зависимости от материала.</p><a href="/riflenoe-steklo/">Рифлёные основы →</a></article><article class="aml-panel"><span class="aml-layer-label">Цвет и прозрачность</span><h3>EVA-плёнка</h3><p>Прозрачная по умолчанию. Цветная — для выразительных акцентов; матовый эффект согласуем по образцу.</p><div class="aml-colors" aria-label="Примеры цветов плёнки"><span style="--swatch:#3e8193">Голубой</span><span style="--swatch:#22724c">Зелёный</span><span style="--swatch:#9c2837">Красный</span><span style="--swatch:#dab52b">Жёлтый</span><span style="--swatch:#704787">Фиолетовый</span><span style="--swatch:#746e63">Серый</span></div><small>Цвета на экране условные. Желаемый цвет укажите в пожеланиях к изделию.</small></article><article class="aml-panel"><span class="aml-layer-label">Основа сочетания</span><h3>Второе стекло</h3><p>Прозрачное, осветлённое, матовое или тонированное. Например, Silvit с серым стеклом создаёт рельефный рисунок с дымчатым оттенком.</p><a href="?variant=custom#triplex-builder">Подобрать сочетание →</a></article></div><p class="aml-note">Минимальный состав — 4+4 мм стекла плюс EVA-плёнка. Итоговая толщина больше 8 мм и зависит от состава.</p></section>
<section class="aml-section aml-split aml-mesh"><div><p class="aml-eyebrow">Металл внутри стекла</p><h2>Тонкие нити. Живые отражения.</h2><p>Латунь, медь или нержавеющая сталь между стёклами — три разных характера поверхности. При смене освещения сетка становится заметнее или растворяется в отражениях.</p><p>Сочетание стекла, сетки и EVA-плёнки согласуем по образцу, чтобы оценить оттенок и прозрачность.</p><a class="aml-button" href="/triplex/?fill=mesh#triplex-builder">Триплекс с сеткой</a></div><div class="aml-metal-list"><div><span class="aml-metal aml-brass"></span><h3>Латунь</h3><p>Тёплый золотистый акцент</p></div><div><span class="aml-metal aml-copper"></span><h3>Медь</h3><p>Насыщенный медный оттенок</p></div><div><span class="aml-metal aml-steel"></span><h3>Нержавеющая сталь</h3><p>Холодный металлический блеск</p></div><small>Условные обозначения оттенков, не образцы плетения.</small></div></section>
<section class="aml-section"><h2>Где использовать</h2><div class="aml-grid"><article class="aml-panel"><h3>Перегородки и двери</h3><p>В алюминиевых системах, рассчитанных на выбранную толщину заполнения.</p><a href="/aluminium/peregorodki/">Перегородки →</a></article><article class="aml-panel"><h3>Душевые и ограждения</h3><p>Состав, крепление и обработку кромок подбираем под условия эксплуатации и конструкцию.</p></article><article class="aml-panel"><h3>Вставки и цветовые акценты</h3><p>Вставки во входные и межкомнатные двери, оформление офисов и коммерческих помещений.</p></article></div></section>
<?php
$groups = agm_material_groups();
$builder_catalog = [
    'ribbed' => array_column(json_decode(file_get_contents(__DIR__ . '/agm-landings/reeded.json'), true), 'slug'),
    'patterned' => array_merge($groups['uzorchatoe-steklo']['slugs'], ['krezet']),
];
?>
<script type="application/json" id="tb-catalog"><?php echo wp_json_encode($builder_catalog, JSON_HEX_TAG); ?></script>
<?php readfile(__DIR__ . '/agm-landings/builder.html'); ?>
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
<?php if ($triplex): ?><script src="<?php echo $asset('agm-landings/app.js?v=20261103-hero'); ?>" defer></script><?php endif; ?>
<link rel="stylesheet" href="<?php echo $asset('agm-landings/builder.css'); ?>"><?php if ($triplex): ?><script src="<?php echo $asset('agm-landings/builder.js'); ?>" defer></script><?php endif; ?><?php wp_footer(); ?></body></html><?php
$html = ob_get_clean();
echo $triplex ? agm_order_render($html, 'dekorativnyy-triplex') : agm_quote_assets($html);
