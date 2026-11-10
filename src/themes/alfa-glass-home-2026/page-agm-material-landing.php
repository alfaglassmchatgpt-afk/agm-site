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
<link rel="stylesheet" href="<?php echo $asset($triplex ? 'agm-homepage/css/style.css' : 'agm-doors/style.css'); ?>">
<link rel="stylesheet" href="<?php echo $asset('agm-landings/style.css?v=20261109-cards'); ?>">
<?php if (!$triplex): ?>
<link rel="stylesheet" href="<?php echo $asset('agm-aluminium-catalog/shared-header.css'); ?>">
<script src="<?php echo $asset('agm-aluminium-catalog/shared-header.js'); ?>" defer></script>
<?php else: ?>
<style>
.triplex-hero .hero-art .aml-slide{opacity:0;transition:opacity .9s ease}
.triplex-hero .hero-art .aml-slide.is-active{opacity:1}
.triplex-hero .hero-inner{z-index:1;pointer-events:none}
@media(min-width:701px){
  .triplex-hero .hero-inner{min-height:clamp(390px,32vw,460px);padding-block:38px 58px}
  .triplex-hero .hero-art{left:54%}
  .triplex-hero .hero-brand{position:relative;color:var(--blue)}
  .triplex-hero .hero-brand img{display:block}
  .triplex-hero .hero-brand::after{content:"";position:absolute;top:0;bottom:0;left:calc(100% + 9px);width:1px;background:currentColor;pointer-events:none}
}
@media(max-width:700px){
  .triplex-hero .hero-art{width:90%;max-width:520px;align-self:center}
}
.triplex-hero .hero-art .aml-slide{transform:none}
.triplex-hero .hero-buttons{pointer-events:auto}
.triplex-hero .hero-controls{z-index:2}
@media(prefers-reduced-motion:reduce){.triplex-hero .hero-art .aml-slide{transition:none}}
.triplex-hero .hero-price-label {
    display: inline-block;
    transform: scale(1.25);
    transform-origin: left center;
}
</style>
<script>document.addEventListener('DOMContentLoaded',()=>{
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>Array.from(p.querySelectorAll(s));
  $('.search-toggle').addEventListener('click', () => location.assign('/#site-search'));
  $$('.asr-trigger').forEach(button => button.addEventListener('click', () => {
    if (!document.querySelector('#agm-service-dialog')) location.assign('/service/');
  }));
  const disclosures = $$('.nav-dropdown');
  function toggleDisclosure(item, open) {
    $('.nav-expand', item).setAttribute('aria-expanded', String(open));
    $('.nav-panel', item).hidden = !open;
  }
  function openDisclosure(item) {
    disclosures.forEach(other => toggleDisclosure(other, other === item));
  }
  disclosures.forEach(item => {
    const button = $('.nav-expand', item);
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-expanded') === 'true') toggleDisclosure(item, false);
      else openDisclosure(item);
    });
    item.addEventListener('pointerenter', e => {
      if (e.pointerType === 'mouse' && item.closest('.desktop-nav')) openDisclosure(item);
    });
    item.addEventListener('pointerleave', e => {
      if (e.pointerType === 'mouse' && item.closest('.desktop-nav') && !item.contains(document.activeElement)) toggleDisclosure(item, false);
    });
    item.addEventListener('focusout', e => { if (!item.contains(e.relatedTarget)) toggleDisclosure(item, false); });
    item.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); toggleDisclosure(item, false); button.focus(); }
    });
    $$('.nav-panel a', item).forEach(a => a.addEventListener('click', () => {
      toggleDisclosure(item, false);
    }));
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nav-dropdown')) disclosures.forEach(item => toggleDisclosure(item, false)); });
  const menu = $('#mobile-nav');
  const menuButton = $('.menu-toggle');
  function closeMenu(focus = false) {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    if (focus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('#mobile-nav a').forEach(a => a.addEventListener('click', () => closeMenu()));
  document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) closeMenu(true); });
  window.addEventListener('resize', () => { if (innerWidth > 1000) closeMenu(); }, { passive: true });
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', $('.site-header').getBoundingClientRect().height + 'px')).observe($('.site-header'));
  }

});</script>
<?php endif; ?>
</head><body id="top">
<?php if ($triplex):
    $home = agm_navigation_render(file_get_contents(__DIR__ . '/agm-homepage/index.html'));
    preg_match('~<svg[^>]*class="svg-library".*?</svg>~s', $home, $icons);
    preg_match('~<header class="site-header">.*?</header>~s', $home, $header);
    echo $icons[0];
    $page_header = preg_replace_callback('~(<a\b[^>]*?\shref=")#([^"]*)"~', static function ($match) {
        if ($match[2] === 'request') return $match[1] . '#triplex-builder" data-open-quote';
        return $match[1] . esc_url(home_url('/')) . ($match[2] === 'top' ? '' : '#' . $match[2]) . '"';
    }, $header[0]);
    echo strtr($page_header, [
        '__AGM_ASSETS__' => $asset('agm-homepage'),
        '__AGM_HOME__' => esc_url(home_url('/')),
    ]);
else:
    echo agm_aluminium_header($slug, ['/materialy/' => 'Все материалы', '/riflenoe-steklo/' => 'Рифлёное стекло', '/triplex/' => 'Триплекс', '/aluminium/peregorodki/' => 'Перегородки', '/#contacts' => 'Контакты'], '/' . $slug . '/#material-request');
endif; ?>
<main id="main"<?php if (!$triplex) echo ' class="aml"'; ?>>
<?php if (!$triplex): ?>
<nav class="aml-crumbs" aria-label="Хлебные крошки"><a href="/">Главная</a> / <a href="/materialy/">Материалы</a> / <span><?php echo esc_html($title); ?></span></nav>
<section class="aml-hero">
<div><p class="aml-eyebrow">Материал для вашего проекта</p><h1><?php echo esc_html($title); ?> на заказ</h1>
<p class="aml-lead">Свет, фактура и приватность. Подберите рельеф, оттенок и толщину стекла под размеры вашего изделия.</p>
<div class="aml-actions"><a class="aml-button" href="#collection">Рассчитать по моим размерам</a><a href="#collection">Выбрать стекло ↓</a></div>
<p class="aml-note">Изготовление по размерам · Москва и Московская область</p></div>
<figure><img fetchpriority="high" src="<?php echo $asset('agm-glass/assets/generated/moru-ultra-aluminium-v2.png'); ?>" alt="Визуализация рифлёного стекла MORU в алюминиевой перегородке"><figcaption>Визуализация применения. Фактуру и оттенок выбираем по образцу.</figcaption></figure>
</section>
<?php else: $stories = [
    'Рифлёный триплекс для перегородок с матовым и тонированным стеклом.',
    'Триплекс с тонированным рифлёным стеклом для дверей и перегородок.',
    'Триплекс с металлической сеткой.',
    'Цветной триплекс для перегородок.',
    'Триплекс с декоративным стеклом.',
]; ?>
<section class="hero aml-showcase triplex-hero" aria-labelledby="hero-title">
<div class="container hero-inner">
  <div class="hero-brand"><img src="<?php echo $asset('agm-homepage/assets/brand-mark.svg'); ?>" alt="" width="214" height="208"></div>
  <div class="hero-copy">
    <p class="eyebrow"><span></span> Материал для вашего проекта</p>
    <h1 id="hero-title"><strong>Триплекс на заказ</strong></h1>
    <div class="aml-story"><?php foreach ($stories as $story): ?><span data-story aria-hidden="true"><?php echo esc_html($story); ?></span><?php endforeach; ?><p data-story-copy><?php echo esc_html($stories[0]); ?></p></div>
    <p class="hero-intro"><span class="hero-price-label">от <strong>2 500 ₽/м²</strong> с НДС</span></p>
    <div class="hero-buttons"><a class="button" href="#material-request">Рассчитать по моим размерам</a><a class="button button-outline" href="#collection">Выбрать сочетание</a></div>
    <p class="hero-chips">Изготовление по размерам · Москва и Московская область</p>
  </div>
  <div class="hero-caption"><span id="slide-label"></span></div>
</div>
<?php $slides = [
 ['Матовое стекло · серое, бронзовое и белый сатин', 'Три образца триплекса на подставке. Матовое стекло · серое, бронзовое и белый сатин', 'triplex-trio-satin-v1.jpg'],
 ['МОРУ с матовым серым стеклом в интерьере', 'Серая матовая перегородка МОРУ между прихожей и жилой комнатой', 'triplex-hero-2-v1.jpg'],
 ['МОРУ бронза, серое Estriado и прозрачное VisionSun', 'Три образца триплекса на подставке. МОРУ бронза, серое Estriado и прозрачное VisionSun', 'triplex-trio-ribbed-v1.jpg'],
 ['Бронзовый МОРУ · дверь в интерьере', 'Визуализация двери с бронзовым рифлёным заполнением в узком алюминиевом профиле', 'triplex-bronze-door-v1.jpg'],
 ['Сетки · латунь, нержавеющая сталь и медь', 'Три образца триплекса на подставке. Сетки · латунь, нержавеющая сталь и медь', 'triplex-trio-mesh-v1.jpg'],
 ['Перегородка с латунной сеткой', 'Светлая перегородка в алюминиевых профилях с золотистыми нитями сетки', 'triplex-hero-4-square-v2.jpg'],
 ['Цветная плёнка · зелёная, жёлтая и розовая', 'Три образца триплекса на подставке. Цветная плёнка · зелёная, жёлтая и розовая', 'triplex-trio-film-v1.jpg'],
 ['Цветной триплекс в фирменных цветах', 'Зелёный триплекс в перегородке коммерческого помещения', 'triplex-hero-5-v1.jpg'],
 ['Узорчатые и Декоративные стёкла триплекс', 'Три образца триплекса на подставке. Серый Сильвит, бронзовый Кафедрал Клейн и прозрачный Кризет', 'triplex-trio-patterned-v1.jpg'],
 ['Silvit + серое · лестничные вставки', 'Визуализация вставок в лестничное ограждение по фото нашей работы', 'triplex-hero-6-v1.jpg']
]; ?>
<div class="hero-art">
<?php foreach ($slides as $i => $slide): ?><img class="aml-slide<?php if (!$i) echo ' is-active'; ?>" data-caption="<?php echo esc_attr($slide[0]); ?>" aria-hidden="<?php echo $i ? 'true' : 'false'; ?>" <?php echo $i ? 'loading="lazy"' : 'fetchpriority="high"'; ?> src="<?php echo $asset('agm-landings/assets/' . $slide[2]); ?>" alt="<?php echo esc_attr($slide[1]); ?>" width="1254" height="1254"><?php endforeach; ?>
<div class="hero-shade"></div></div>
<div class="hero-controls"><button id="hero-pause" class="aml-slide-pause" type="button" aria-label="Приостановить слайды">Ⅱ</button></div>
</section>
<div class="aml aml-triplex">
<nav class="aml-crumbs" aria-label="Хлебные крошки"><a href="/">Главная</a> / <a href="/materialy/">Материалы</a> / <span><?php echo esc_html($title); ?></span></nav>
<section class="aml-section" id="collection">
  <h2>Какой триплекс вам нужен?</h2><details class="triplex-intro" id="what-is-triplex">
  <summary>Что такое триплекс?</summary>
  <div>
    <p>Триплекс — это несколько листов стекла, соединённых в одно полотно. В «Альфа Гласс» мы укладываем между стёклами EVA-плёнку и нагреваем их в печи. Плёнка скрепляет стёкла и помогает удерживать осколки, если полотно разобьётся.</p>
    <p><strong>Как выбрать стекло для перегородки или двери?</strong> Если важно сохранить обзор, подойдёт прозрачный триплекс. Чтобы за дверью были видны лишь размытые силуэты, можно сочетать рифлёное стекло с матовым. Для цветной вставки подберём оттенок плёнки, а для металлического блеска поместим между стёклами тонкую сетку.</p>
    <a href="#examples-flat">Посмотреть примеры в интерьере →</a>
  </div>
</details>
<style>
.triplex-intro{scroll-margin-top:calc(var(--header-height,140px) + 16px);margin:0 auto 24px}
.triplex-intro summary{width:fit-content;margin:auto;padding:8px;color:var(--blue);cursor:pointer;text-decoration:underline;text-underline-offset:4px}
.triplex-intro>div{max-width:70ch;margin:8px auto 24px;padding:0 12px}
</style>
  <div class="aml-grid aml-four">
    <article class="aml-card aml-text-card">
      <img src="<?php echo $asset('agm-landings/assets/triplex-card-flat.webp'); ?>" alt="Полированная кромка прозрачного триплекса" width="640" height="640" loading="lazy">
      <h3>Из плоского стекла</h3>
      <p>Листы плоского флоат-стекла (Float) — прозрачные, матовые или тонированные. Для межкомнатных дверей, душевых и офисных перегородок.</p>
      <a href="/triplex/#triplex-builder" aria-label="Открыть конфигуратор — Из плоского стекла">Открыть конфигуратор →</a><a class="example-link" href="#examples-flat">Примеры применения ↓</a>
    </article>
    <article class="aml-card aml-text-card">
      <img src="<?php echo $asset('agm-landings/assets/triplex-card-ribbed.webp'); ?>" alt="Образец бронзового стекла МОРУ с вертикальным рифлением" width="640" height="640" loading="lazy">
      <h3>С рифлёным стеклом</h3>
      <p>Рифление МОРУ пропускает свет и размывает очертания за стеклом. Подходит для дверей гардеробной и перегородок между прихожей и комнатой.</p>
      <a href="?variant=ribbed#triplex-builder" aria-label="Открыть конфигуратор — С рифлёным стеклом">Открыть конфигуратор →</a>
      <a class="example-link" href="#examples-ribbed">Примеры применения ↓</a>
    </article>
    <article class="aml-card aml-text-card">
      <img src="<?php echo $asset('agm-landings/assets/triplex-card-patterned-v2.webp'); ?>" alt="Фактурное стекло крупным планом, полированная кромка и металлическое крепление" width="640" height="640" loading="lazy">
      <h3>Из декоративного стекла</h3>
      <p>Узорчатое стекло задаёт рисунок, а второе стекло — оттенок. Например, Сильвит с серым стеклом используем для вставок в двери и лестничные ограждения.</p>
      <a href="?variant=patterned#triplex-builder" aria-label="Открыть конфигуратор — Из декоративного стекла">Открыть конфигуратор →</a>
      <a class="example-link" href="#examples-patterned">Примеры применения ↓</a>
    </article>
    <article class="aml-card aml-text-card">
      <img src="<?php echo $asset('agm-landings/assets/triplex-card-estriado-k1-gold.webp'); ?>" alt="Рифлёное стекло Estriado Ultra, прозрачная EVA-плёнка и состаренное зеркало K1 Gold" width="640" height="640" loading="lazy">
      <h3>Свободная конфигурация</h3>
      <p>Подберём сочетание стекла, плёнки и декоративных вставок по вашему эскизу. Например, для перегородки со шпоном или двери в фирменных цветах.</p>
      <a href="?variant=custom#triplex-builder" aria-label="Открыть конфигуратор — Свободная конфигурация">Открыть конфигуратор →</a>
      <a class="example-link" href="#examples-custom">О сочетаниях материалов ↓</a>
    </article>
</div></section>
<?php
$groups = agm_material_groups();
$published_materials = [];
foreach (agm_material_grouped_pages() as $family) {
    foreach ($family['pages'] as $page) {
        $published_materials[$page->post_name] = $page->post_title;
    }
}
$builder_catalog = [
    'published' => $published_materials,
    'families' => $groups,
    'ribbed' => array_column(json_decode(file_get_contents(__DIR__ . '/agm-landings/reeded.json'), true), 'slug'),
    'patterned' => array_merge($groups['uzorchatoe-steklo']['slugs'], ['krezet']),
];
?>
<script type="application/json" id="tb-catalog"><?php echo wp_json_encode($builder_catalog, JSON_HEX_TAG); ?></script>
<?php readfile(__DIR__ . '/agm-landings/builder.html'); ?>
<section class="container gc-section" id="material-request"></section>
<style>
.aml-triplex .aml-text-card>a.example-link{position:relative;z-index:1;align-self:flex-start;margin-top:.6rem;font-size:.94rem}
.aml-triplex .aml-text-card>a.example-link::after{content:none}
.example-group,.example-custom{scroll-margin-top:calc(var(--header-height,140px) + 16px)}
.example-group{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);align-items:start;gap:clamp(20px,5vw,72px)}
.flat-guide{grid-column:1/-1;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));align-items:start;gap:8px;scroll-margin-top:calc(var(--header-height,140px) + 12px)}
.flat-guide details{border:1px solid var(--line);border-radius:9px;background:var(--surface)}
.flat-guide summary{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:10px 12px;min-height:48px;box-sizing:border-box;cursor:pointer;font-weight:500;list-style:none}
.flat-guide summary{position:relative;justify-content:center;text-align:center;padding-inline:22px}.flat-guide summary::after{position:absolute;right:8px}.flat-guide p{text-align:center}
.flat-guide summary::-webkit-details-marker{display:none}
.flat-guide summary::after{content:"+";font-size:20px;color:var(--blue)}.flat-guide details[open]>summary::after{content:"−"}
.flat-guide summary:focus-visible{outline:2px solid var(--blue);outline-offset:2px}
.flat-guide p{margin:0;padding:0 16px 16px}
@media(max-width:1023px){.flat-guide{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.flat-guide{grid-template-columns:1fr}.flat-guide summary{min-height:48px}}
.example-gallery{position:relative;--image-height:clamp(240px,35vw,440px)}.example-gallery figure{margin:0}.example-gallery img{display:block;width:100%;height:var(--image-height);object-fit:contain;background:var(--soft);border-radius:10px}
.example-gallery figcaption{color:inherit;font-size:1rem}.example-gallery figcaption strong{display:block;margin:.7rem 0 .3rem}
.example-controls{text-align:right;color:var(--muted);font-size:.875rem}
.example-controls button{position:absolute;top:calc(var(--image-height) / 2);transform:translateY(-50%);width:44px;height:44px;border:1px solid #fff8;border-radius:50%;background:#17232dd9;color:white;cursor:pointer;font-size:20px}
.example-controls [data-step="-1"]{left:8px}.example-controls [data-step="1"]{right:8px}
@media(max-width:760px){.example-group{grid-template-columns:1fr}}
.example-group figure{position:relative}
.example-group img{object-fit:cover}
.example-group figcaption{position:absolute;right:0;bottom:25px;max-width:calc(100% - 32px);box-sizing:border-box;background:rgba(8,24,33,.65);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(10px);border-radius:7px;color:white;padding:12px 18px;font-size:18px;font-weight:600;line-height:1.35}
.example-group figcaption strong{margin:0;font-weight:inherit}
@media(max-width:760px){.example-group figcaption{right:16px;bottom:16px;padding:8px 12px;font-size:14px}}
@media(min-width:761px) and (max-width:1023px){:is(#examples-ribbed,#examples-patterned){grid-template-columns:1fr}:is(#examples-ribbed,#examples-patterned) .example-gallery{min-height:0;aspect-ratio:1372/880;margin-bottom:15px}}
.triplex-section-rule{width:100%;border:0;border-top:1px solid var(--line,currentColor);margin:32px 0}
.example-group .triplex-price-link{align-self:flex-start;display:inline-block;margin-top:10px;text-decoration:underline;text-underline-offset:.25em}
.triplex-order-faq{margin-block:clamp(32px,5vw,72px)}
.triplex-order-faq details{border-bottom:1px solid var(--line,currentColor);padding:.85rem 0}
.triplex-order-faq summary{cursor:pointer;font-weight:600}
.triplex-order-faq p{max-width:72ch;line-height:1.55}
</style>
<section class="aml-section example-group" id="examples-flat" aria-labelledby="title-flat">
 <div><h2 id="title-flat">Триплекс из плоского стекла</h2><p>Два гладких стекла и EVA-плёнка образуют единое полотно. Для душевой можно выбрать прозрачное стекло, чтобы сохранить обзор. Для офисной перегородки цветная плёнка добавит оттенок в тон интерьеру.</p>
   <style>
.example-group>div:first-child{display:flex;flex-direction:column;min-width:0;align-self:stretch}
.example-group .example-gallery{align-self:stretch;min-height:var(--image-height)}
.example-group .example-gallery figure{position:absolute;inset:0}
.example-group .example-gallery img{height:100%}
.example-group .example-controls button{top:50%}
.example-group .example-controls span{position:absolute;right:0;top:100%}
.lamination{margin-top:14px;flex:1;min-height:156px;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--surface);scroll-margin-top:calc(var(--header-height,140px) + 16px)}
.lamination h3{text-align:center;margin:0;padding:10px 14px;font-size:1rem;line-height:1.25}
.lamination-stage{position:relative;flex:1;min-height:116px;container-type:size;overflow:hidden;background:radial-gradient(ellipse at 64% 16%,#f6faf6,#d6e2e0 62%,#b6c9c8)}
.lam-pane{position:absolute;inset:0;margin:auto;width:min(54%,245px);height:65%;transform-style:preserve-3d;transform:rotateX(0deg) rotateY(-5deg)}
.lam-pane i{position:absolute;inset:0;border-radius:2px;box-sizing:border-box;border:1px solid #729796;background:linear-gradient(114deg,#a7c8c9cf,#e2f4f296 36%,#f9ffffcd 39%,#b8d5d4ae 50%,#91b4b4bc);box-shadow:inset 0 0 0 1px #f2ffffb0,1px 2px 0 #719191}
.lam-pane .film{border:1px solid #b9aa87;background:linear-gradient(120deg,#fbf9e582,#e9d299a8,#fffbed8c);box-shadow:none}
.lam-pane .front::after{content:"";position:absolute;inset:0;opacity:0;background:linear-gradient(110deg,transparent 5%,#ffc07a 40%,#ffdc9f 55%,transparent 85%);background-size:200% 100%}
@keyframes lam-turn{0%,44.8%{transform:rotateX(61deg) rotateZ(-16deg)}64.4%,70%,100%{transform:rotateX(0) rotateY(-5deg)}}
@keyframes lam-close{0%,9.1%{transform:translateZ(var(--start))}27.3%,100%{transform:translateZ(0)}}
@keyframes lam-heat{0%,28%{opacity:0;background-position:100% 50%}35.7%{opacity:.85}46.2%,100%{opacity:0;background-position:0% 50%}}
@media(prefers-reduced-motion:no-preference){
 .lamination-stage .lam-pane{animation:lam-turn 10s infinite both paused}
 .lamination-stage i{animation:lam-close 10s infinite both paused}
 .lamination-stage .front::after{animation:lam-heat 10s infinite both paused}
 .lamination-stage.is-playing .lam-pane,.lamination-stage.is-playing i,.lamination-stage.is-playing .front::after{animation-play-state:running}
}
@media(max-width:760px){.lamination{min-height:195px}.example-group .example-gallery{margin-bottom:15px}}
</style>
<section class="lamination" id="flat-lamination" aria-labelledby="lamination-title">
 <h3 id="lamination-title">Как делают триплекс</h3>
 <div class="lamination-stage" role="img" aria-label="Два стекла смыкаются вокруг EVA-плёнки. При ламинировании они образуют единое полотно.">
  <div class="lam-pane"><i style="--start:-34px"></i><i class="film" style="--start:0px"></i><i class="front" style="--start:34px"></i></div>
 </div>
</section>
<script>
(() => {
 const stage = document.currentScript.previousElementSibling.querySelector('.lamination-stage');
 if (!('IntersectionObserver' in window)) {stage.classList.add('is-playing'); return;}
 const observer = new IntersectionObserver(([entry]) => {
   stage.classList.toggle('is-playing',entry.isIntersecting);
 }, {threshold:.25});
 observer.observe(stage);
})();
</script>
   <a class="triplex-price-link" href="/#request">Узнать стоимость</a>
 </div>
 <div class="example-gallery" role="region" aria-label="Триплекс из плоского стекла — примеры изделий">
  <figure ><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-flat-shower.webp" alt="Душевая перегородка из прозрачного триплекса"><figcaption><strong>Душевая перегородка из прозрачного триплекса</strong></figcaption></figure>
  <figure hidden><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-flat-office-colours.webp" alt="Переговорная из разноцветного триплекса"><figcaption><strong>Переговорная из разноцветного триплекса</strong></figcaption></figure>
  <figure hidden><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-flat-door.webp" alt="Межкомнатная дверь из матового триплекса"><figcaption><strong>Межкомнатная дверь из матового триплекса</strong></figcaption></figure>
  <figure hidden><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-flat-sliding-three.webp" alt="Раздвижная перегородка из бронзового триплекса"><figcaption><strong>Раздвижная перегородка из бронзового триплекса</strong></figcaption></figure>
  <figure hidden><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-flat-stairs.webp" alt="Лестничное ограждение из прозрачного триплекса"><figcaption><strong>Лестничное ограждение из прозрачного триплекса</strong></figcaption></figure>
  <div class="example-controls"><button type="button" aria-label="Предыдущий пример" data-step="-1">←</button><span aria-live="polite">1 из 5</span><button type="button" aria-label="Следующий пример" data-step="1">→</button></div></div>
  <div class="flat-guide" id="flat-questions">
<details><summary>Где применяется?</summary><p>Прозрачный триплекс выбирают для межкомнатных дверей, боковых вставок у входа и витрин, когда важен обзор. Для переговорной или гардеробной подойдёт матовое заполнение: оно пропускает свет и скрывает детали за перегородкой.</p></details>
<details><summary>Преимущества</summary><p>В «Альфа Гласс» можно подобрать цвет и прозрачность полотна, сохранив гладкую поверхность с обеих сторон. Например, для офисной двери цветная EVA-плёнка даст фирменный оттенок, а снаружи останется стекло, которое удобно мыть.</p></details>
<details><summary>При ударе?</summary><p>Стекло может треснуть. Плёнка удерживает большую часть осколков и снижает риск травмы. Для душевой двери или лестничного ограждения состав подбирают с учётом креплений и нагрузок. Одна маркировка 4+4 не определяет допустимую нагрузку.</p></details>
<details><summary>Долговечность</summary><p>Особое внимание нужно уделить торцу, где видна граница слоёв. Если в нижнем профиле постоянно стоит вода или герметик несовместим с плёнкой, по краю могут появиться помутнения или участки расслоения. Для влажного помещения заранее согласуйте отвод воды и герметик для выбранного состава.</p></details><details><summary>Как ухаживать?</summary><p>Сначала смойте пыль и песчинки чистой водой. Гладкую поверхность протрите мягкой салфеткой с нейтральным моющим средством, ополосните и вытрите насухо. Абразивные губки и металлические скребки могут оставить царапины. Берегите открытый торец от растворителей и скопления жидкости.</p></details>
</div>
 </section>
<section class="aml-section example-group" id="examples-ribbed" aria-labelledby="title-ribbed">
 <div><h2 id="title-ribbed">Триплекс с рифлёным стеклом</h2><p>Для двери или перегородки можно сочетать рифлёное стекло с плоским. Рельеф преломляет свет и размывает контуры предметов. От второго стекла зависит, насколько светлым получится полотно и что будет видно за ним.</p>
 <a href="?variant=ribbed#triplex-builder">Подобрать рифлёный триплекс →</a>   <style>
.rib-stack{position:absolute;inset:0;margin:auto;width:min(54%,245px);height:65%;transform-style:preserve-3d}
.rib-stack span{position:absolute;inset:0;box-sizing:border-box;border-radius:2px}
.rib-base{border:1px solid #596567;background:linear-gradient(117deg,#47515499,#c6d0ce96 38%,#697475a8 49%,#475051a6);box-shadow:0 2px 0 #566263}
.rib-stack .rib-film{border:1px solid #f4ffffc4;background:linear-gradient(124deg,#dbe9e728 23%,#ffffffad 41%,#f7fffd72 45%,#e2efeb26 68%)}
.rib-face{border:1px solid #647070;background:repeating-linear-gradient(0deg,#36434359 0px,#eaf3f366 1px,#b2bfbe30 2px,#48565633 4px),linear-gradient(120deg,#dee7e626,#61707126);box-shadow:inset 0 0 0 1px #e9f3f08a}
.rib-stack .rib-cover{opacity:0;background:linear-gradient(115deg,#c6bfb43d,#e7bd82a8,#eee7d24a);border:1px solid #f3dfb7}
@keyframes rib-show-face{0%,66%{transform:rotateX(61deg) rotateZ(-16deg)}85%,100%{transform:rotateX(0deg) rotateZ(0deg)}}
@keyframes rib-first-film{0%,9%{transform:translateZ(420px) rotateY(-12deg)}23%,100%{transform:translateZ(0)}}
@keyframes rib-second-film{0%,28%{transform:translateZ(420px) rotateY(10deg)}42%,100%{transform:translateZ(0)}}
@keyframes rib-lower-glass{0%,46%{transform:translateZ(420px)}59%,100%{transform:translateZ(0)}}
@keyframes rib-covering{0%,59%{opacity:0;clip-path:inset(0 100% 0 0)}64%{opacity:.8;clip-path:inset(0)}70%,100%{opacity:0;clip-path:inset(0)}}
@media(prefers-reduced-motion:no-preference){
 .rib-stack,.rib-stack .rib-film,.rib-stack .rib-face,.rib-stack .rib-cover{animation:var(--motion) 10s ease-in-out infinite both paused}
 .rib-stack{--motion:rib-show-face}
 .rib-first{--motion:rib-first-film}
 .rib-second{--motion:rib-second-film}
 .rib-face{--motion:rib-lower-glass}
 .rib-cover{--motion:rib-covering}
 .is-playing .rib-stack,.is-playing .rib-stack .rib-film,.is-playing .rib-stack .rib-face,.is-playing .rib-stack .rib-cover{animation-play-state:running}
}
</style>
<section class="lamination" id="ribbed-lamination" aria-labelledby="ribbed-lamination-title">
 <h3 id="ribbed-lamination-title">Как делают рифлёный триплекс</h3>
 <div class="lamination-stage" role="img" aria-label="На серое прозрачное стекло по очереди опускаются две плёнки и рифлёное стекло. Пакет накрывают. Готовый триплекс поворачивается лицом, показывая серый оттенок и рифление вдоль длинной стороны.">
  <div class="rib-stack"><span class="rib-base"></span><span class="rib-film rib-first"></span><span class="rib-film rib-second"></span><span class="rib-face"></span><span class="rib-cover"></span></div>
 </div>
</section>
<script>
(() => {
 const stage = document.currentScript.previousElementSibling.querySelector('.lamination-stage');
 if (!('IntersectionObserver' in window)) {stage.classList.add('is-playing'); return;}
 const observer = new IntersectionObserver(([entry]) => {
   stage.classList.toggle('is-playing',entry.isIntersecting);
 }, {threshold:.25});
 observer.observe(stage);
})();
</script>

  <a class="triplex-price-link" href="/#request">Узнать стоимость</a>
 </div>
 <div class="example-gallery" role="region" aria-label="Триплекс с рифлёным стеклом — примеры изделий">
  <figure ><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-ribbed-office.webp" alt="Переговорная из серого рифлёного триплекса"><figcaption><strong>Переговорная из серого рифлёного триплекса</strong></figcaption></figure>
  <figure hidden><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-ribbed-door-four.webp" alt="Раздвижная дверь из бронзового МОРУ · 4 створки"><figcaption><strong>Раздвижная дверь из бронзового МОРУ · 4 створки</strong></figcaption></figure>
  <figure hidden><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-ribbed-bistro.webp" alt="Рифлёная перегородка между столиками в кафе"><figcaption><strong>Рифлёная перегородка между столиками в кафе</strong></figcaption></figure>
  <div class="example-controls"><button type="button" aria-label="Предыдущий пример" data-step="-1">←</button><span aria-live="polite">1 из 3</span><button type="button" aria-label="Следующий пример" data-step="1">→</button></div></div>
  <div class="flat-guide" id="ribbed-questions">
  <details><summary>Где применяется?</summary><p>В межкомнатной двери, перегородке между прихожей и гостиной или в остеклении гардеробной. Рифлёное полотно отделяет одну зону от другой и пропускает свет.</p></details>
  <details><summary>Что видно?</summary><p>Через прозрачное рифлёное стекло видны свет, цвет и силуэты. Предметы вплотную к стеклу различимы лучше. Для большей приватности выбирайте матовое второе стекло.</p></details>
  <details><summary>Какой рельеф?</summary><p>У МОРУ рёбра идут параллельными полосами с шагом 12 мм. Сравните его с Estriado и другими фактурами каталога на просвет: на фоне дверного проёма особенно хорошо видно, как рисунок меняет очертания предметов.</p></details>
  <details><summary>Второе стекло</summary><p>В этой группе второе стекло всегда плоское. Осветлённое сохраняет светлый тон, серое или бронзовое добавляет оттенок, а матовое смягчает силуэты.</p></details>
  <details><summary>Как ухаживать?</summary><p>Протрите гладкую сторону мягкой влажной салфеткой. По рельефной стороне ведите салфетку вдоль рёбер, чтобы очистить углубления. Затем вытрите поверхность насухо.</p></details>
 </div>
 </section>
<section class="aml-section example-group" id="examples-patterned" aria-labelledby="title-patterned">
 <div><h2 id="title-patterned">Декоративный триплекс</h2><p>Декоративный триплекс используют в межкомнатных дверях, перегородках, душевых и вставках для лестничных ограждений. Узорчатая поверхность преломляет свет и смягчает очертания предметов за стеклом. Цветной слой придаёт полотну оттенок, а сетка или шпон между стёклами добавляют металлический блеск или рисунок древесины.</p>
  <a href="?variant=patterned#triplex-builder">Подобрать декоративный триплекс →</a>   <style>
.mesh-stack{position:absolute;inset:0;margin:auto;width:min(54%,245px);height:65%;transform-style:preserve-3d}
.mesh-stack span{position:absolute;inset:0;border-radius:2px;box-sizing:border-box}
.mesh-glass{border:1px solid #72918e;background:linear-gradient(118deg,#e9ffff40,#ffffff15 31%,#ffffff87 37%,#eef9f81a 44%,#94b5ba32);box-shadow:inset 0 0 0 1px #ffffff55,1px 2px 0 #829b99}
.mesh-film{border:1px solid #f8f9e8;background:linear-gradient(112deg,#e8e7c84f,#ffffffa1 40%,#f1eccf38 53%)}
.mesh-sheet{border:1px solid #ae904e99;background-color:rgba(204,171,99,.08);
 background-image:repeating-linear-gradient(90deg,#937238b8 0px,#edcf88d9 .8px,transparent 1.2px,transparent 3px),repeating-linear-gradient(0deg,#9d81499e 0px,#efd59a94 .6px,transparent 1px,transparent 3px)}
.mesh-top::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 8%,#ffbb62bb 38%,#ffe3a8da 52%,transparent 83%);background-size:220% 100%;opacity:0}

@keyframes mesh-turn{0%,73%{transform:rotateX(58deg) rotateZ(0deg)}89%,100%{transform:rotateX(0deg) rotateZ(0deg)}}
@keyframes mesh-film-one{0%,7%{transform:translateZ(420px) rotateY(12deg)}20%,100%{transform:translateZ(0)}}
@keyframes mesh-lower{0%,21%{transform:translateZ(420px)}34%,100%{transform:translateZ(0)}}
@keyframes mesh-film-two{0%,35%{transform:translateZ(420px) rotateY(-12deg)}48%,100%{transform:translateZ(0)}}
@keyframes mesh-close{0%,49%{transform:translateZ(420px)}62%,100%{transform:translateZ(0)}}
@keyframes mesh-fuse{0%,62%{opacity:0;background-position:100% 50%}69%{opacity:1}78%,100%{opacity:0;background-position:0% 50%}}
@media(prefers-reduced-motion:no-preference){
 .mesh-stack{--motion:mesh-turn}
 .mesh-film:nth-child(2){--motion:mesh-film-one}
 .mesh-sheet{--motion:mesh-lower}
 .mesh-film:nth-child(4){--motion:mesh-film-two}
 .mesh-top{--motion:mesh-close}
 .mesh-top::after{--motion:mesh-fuse}
 .mesh-stack,.mesh-stack span:not(:first-child),.mesh-top::after{animation:var(--motion) 10s ease-in-out infinite both;animation-play-state:var(--mesh-state,paused)}
 .lamination-stage.is-playing{--mesh-state:running}
}
</style>
<section class="lamination" id="veneer-lamination" aria-labelledby="mesh-title">
 <h3 id="mesh-title">Как делают триплекс с латунной сеткой</h3>
 <div class="lamination-stage" role="img" aria-label="На прозрачное стекло последовательно укладывают EVA-плёнку, латунную сетку, вторую плёнку и прозрачное стекло. При нагреве слои соединяются.">
  <div class="mesh-stack"><span class="mesh-glass"></span><span class="mesh-film"></span><span class="mesh-sheet"></span><span class="mesh-film"></span><span class="mesh-glass mesh-top"></span></div>
 </div>
</section>
<script>
(() => {
 const stage = document.currentScript.previousElementSibling.querySelector('.lamination-stage');
 if (!('IntersectionObserver' in window)) {stage.classList.add('is-playing'); return;}
 const observer = new IntersectionObserver(([entry]) => {
   stage.classList.toggle('is-playing',entry.isIntersecting);
 }, {threshold:.25});
 observer.observe(stage);
})();
</script>
 <a class="triplex-price-link" href="/#request">Узнать стоимость</a>
 </div>
 <div class="example-gallery" role="region" aria-label="Декоративный триплекс — примеры изделий">
  <figure ><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-patterned-partition-klein.webp" alt="Межкомнатная перегородка из Кафедрал Клейн с бронзовым стеклом"><figcaption><strong>Межкомнатная перегородка из Кафедрал Клейн с бронзовым стеклом</strong></figcaption></figure>
  <figure hidden><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-patterned-shower-aqualite-framed.webp" alt="Душевая перегородка из Кафедрал Аквалайт"><figcaption><strong>Душевая перегородка из Кафедрал Аквалайт</strong></figcaption></figure>
  <figure hidden><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-configurator/assets/triplex-project-stairs.jpg" alt="Лестничные вставки из Сильвита с серым стеклом"><figcaption><strong>Лестничные вставки из Сильвита с серым стеклом</strong></figcaption></figure>
  <figure hidden><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-hero-4-square-v2.jpg" alt="Перегородка с латунной сеткой"><figcaption><strong>Перегородка с латунной сеткой</strong></figcaption></figure>
  <figure hidden><img loading="lazy" src="/wp-content/themes/alfa-glass-home-2026/agm-landings/assets/triplex-patterned-door-zebrano-framed.webp" alt="Межкомнатная дверь из триплекса со шпоном зебрано"><figcaption><strong>Межкомнатная дверь из триплекса со шпоном зебрано</strong></figcaption></figure>
  <div class="example-controls"><button type="button" aria-label="Предыдущий пример" data-step="-1">←</button><span aria-live="polite">1 из 5</span><button type="button" aria-label="Следующий пример" data-step="1">→</button></div></div>
  <div class="flat-guide" id="patterned-questions">
  <details><summary>Где применяется?</summary><p>В лестничном ограждении узкие вставки подчёркивают рисунок стекла. В двери или перегородке полотно крупнее, и на нём хорошо видно, как фактура меняется при боковом свете.</p></details>
  <details><summary>Какой узор?</summary><p>Начните с лицевого стекла. Например, у Сильвита вытянутый неровный рельеф. Среди других вариантов каталога — Кафедрал Клейн и Кризет. Сравните образцы на просвет и на фоне стены.</p></details>
  <details><summary>Второе стекло</summary><p>Осветлённое плоское стекло оставляет рисунок светлым, тонированное добавляет бронзовый или серый оттенок. Матовое подойдёт, если нужно сильнее скрыть очертания за стеклом.</p></details>
  <details><summary>Сетка</summary><p>Латунь даёт золотистый оттенок, медь — тёплый красноватый, нержавейка — серебристый. Плетение особенно заметно, когда на него падает боковой свет.</p></details>
  <details><summary>Шпон</summary><p>Между стёклами виден рисунок древесных волокон. Для спокойного рисунка посмотрите образец дуба, для контрастных полос — зебрано. Образцы можно развернуть в разделе «Декоративный эффект» конфигуратора.</p></details>
 </div>
 </section>
<hr class="triplex-section-rule">
<aside class="aml-panel example-custom" id="examples-custom">
 <h3>Свободная конфигурация триплекса</h3>
 <p>Каким вы хотите видеть готовое изделие? Подумайте, сколько света оно должно пропускать, что будет видно за ним и как оно впишется в интерьер.</p>
 <p>Соберите своё сочетание в конфигураторе: выберите первый и второй материалы, а между ними — наполнение. Укажите размеры и добавьте вариант в «Мой расчёт». Для нестандартного сочетания менеджер уточнит возможность изготовления.</p>
 <a href="?variant=custom#triplex-builder">Собрать свой триплекс →</a>
</aside>
<section class="aml-section triplex-order-faq" id="triplex-faq" aria-labelledby="triplex-faq-title">
 <h2 id="triplex-faq-title">Вопросы о триплексе на заказ</h2>
 <p>В «Альфа Гласс» можно заказать многослойное стекло по своим размерам. Если состав ещё не выбран, расскажите, где будет стоять полотно и что должно быть видно сквозь него. Этого достаточно, чтобы начать подбор.</p>
 <details><summary>Как выбрать триплекс для двери или перегородки?</summary><p>Для обзора между комнатами подойдёт прозрачное полотно. Если хочется сохранить дневной свет и скрыть детали интерьера, посмотрите матовые и рифлёные варианты. Для двери в алюминиевой раме укажите допустимую толщину заполнения профиля.</p></details>
 <details><summary>Какой максимальный размер полотна?</summary><p>Рабочий формат печи — 3200 × 2200 мм. Возможный размер готового полотна зависит также от формата выбранного стекла. Для нестандартного сочетания менеджер проверит возможность изготовления по вашим размерам.</p></details>
 <details><summary>От чего зависит цена готового триплекса?</summary><p>В расчёт входят стекло, плёнка, ламинирование и выбранная обработка. На стоимость влияют размеры, количество полотен, отделка кромки, закалка и декоративное наполнение. Указанная в начале страницы цена за квадратный метр относится к услуге триплексования.</p></details>
 <details><summary>Что прислать для расчёта?</summary><p>Укажите ширину и высоту каждого полотна в миллиметрах, количество и назначение. Если уже выбрали оттенок, рисунок или наполнение, добавьте их в описание. Для комплекта из разных полотен перечислите размеры и количество отдельно для каждой позиции.</p></details>
</section>
<script>
document.querySelectorAll('.example-gallery').forEach(gallery => {
 const slides = [...gallery.querySelectorAll('figure')];
 let index = 0;
 gallery.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
   slides[index].hidden = true;
   index = (index + Number(button.dataset.step) + slides.length) % slides.length;
   slides[index].hidden = false;
   gallery.querySelector('[aria-live]').textContent = (index + 1) + ' из ' + slides.length;
 }));
});
</script>
<?php endif; if (!$triplex): ?>
<section class="aml-section" id="collection"><p class="aml-eyebrow">Коллекция фактур</p><h2>Выберите рифлёное стекло</h2><p>Откройте материал, чтобы выбрать доступную толщину, указать размеры и добавить изделие в общий «Мой расчёт».</p><div class="aml-grid">
<?php foreach (json_decode(file_get_contents(__DIR__ . '/agm-landings/reeded.json'), true) as $card): ?>
<article class="aml-card"><a href="/materialy/<?php echo esc_attr($card['slug']); ?>/"><img loading="lazy" src="<?php echo $asset($card['image']); ?>" alt="<?php echo esc_attr($card['title']); ?>"><h3><?php echo esc_html($card['title']); ?></h3></a><p><?php echo esc_html($card['description']); ?></p><a class="aml-card-action" href="/materialy/<?php echo esc_attr($card['slug']); ?>/#material-request">Рассчитать по моим размерам →</a></article>
<?php endforeach; ?></div></section>
<section class="aml-section aml-split"><div><h2>Фактура, которая меняет пространство</h2><p>Рифлёное стекло пропускает свет и искажает видимые за ним предметы. Степень приватности зависит от рисунка, оттенка, матирования, освещения и расстояния до предметов.</p><p>Для перегородок, дверей и мебельных вставок подбираем не только внешний вид: важны толщина, размеры и совместимость с профилем. Доступные обработки указаны в карточке конкретного материала.</p><a href="/aluminium/peregorodki/">Подобрать перегородку →</a></div><div class="aml-panel"><h3>Хотите сложное сочетание?</h3><p>Рифлёное стекло может стать основой декоративного триплекса. Второе стекло и EVA-плёнка добавят оттенок и изменят прозрачность.</p><a href="/triplex/">Перейти к триплексу →</a></div></section>
<section class="aml-section" id="material-request"><h2>Расчёт по вашим размерам</h2><p>Выберите стекло в коллекции выше. В его карточке укажите ширину и высоту в миллиметрах, количество и доступную обработку. Несколько разных материалов можно собрать в одну заявку.</p><a class="aml-button" href="#collection">Выбрать материал</a></section>
<?php endif; ?>
<?php if (!$triplex): ?><section class="aml-section aml-faq"><h2>Перед заказом</h2><details><summary>От чего зависит цена?</summary><p>От выбранного материала<?php echo $triplex ? ' и состава триплекса' : ''; ?>, толщины, размеров, количества, обработки и доставки. Для расчёта укажите параметры изделия; цену и срок подтвердим после проверки заказа.</p></details><details><summary>Можно ли выбрать по фотографии?</summary><p>Фотография помогает выбрать направление. Окончательно оттенок, фактуру и прозрачность лучше оценить на образце: свет и окружение влияют на восприятие стекла.</p></details><details><summary>Можно ли заказать несколько разных изделий?</summary><p>Да. Добавляйте материалы в «Мой расчёт» из их карточек и отправляйте общей заявкой.</p></details></section>
<?php endif; ?>
<?php if ($triplex) echo '</div>'; ?>
</main><footer class="aml-footer"><a href="/materialy/">Все материалы</a><a href="/riflenoe-steklo/">Рифлёное стекло</a><a href="/triplex/">Триплекс</a><a href="/#contacts">Контакты</a></footer>
<?php if ($triplex): ?><script src="<?php echo $asset('agm-landings/app.js?v=20261110-resume'); ?>" defer></script><?php endif; ?>
<link rel="stylesheet" href="<?php echo $asset('agm-landings/builder.css'); ?>"><?php if ($triplex): ?><script src="<?php echo $asset('agm-landings/builder.js'); ?>" defer></script><?php endif; ?><?php wp_footer(); ?></body></html><?php
$html = ob_get_clean();
echo $triplex ? agm_order_render($html, 'dekorativnyy-triplex') : agm_quote_assets($html);
