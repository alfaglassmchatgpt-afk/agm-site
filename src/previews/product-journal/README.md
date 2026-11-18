# Макет первой страницы журнала
Текущий макет — шесть видов стеклянных полок, на всю ширину экрана.
Слева образец, по центру описание и параметры, справа применение. Навигация ведёт к соответствующему ряду.
Медиа хранится вне Git в .local/product-journal/assets/editorial-grid.png. Предыдущая иллюстрация сохранена как journal-v1.png.
Встроенный imagegen. Промпт: editorial product photography, exact 2-column 6-row grid, matching loose shelf on ivory studio background and installed shelf for each row. Clear rectangular / walnut wardrobe; low iron rounded rectangle / bathroom; bronze quarter circle / shower; grey trapezoid / niche; black semicircle / entrance; frosted rectangle / bathroom niche. No people, no lettering.
Вордстат проверен 18.11.2026: Москва и область, все устройства, показанный период 10.09–09.10.2026. Широкая частотность стеклянные полки 8851, полки из стекла 1250. Предупреждение сервиса о временной недоступности части данных присутствует.
Проверены синтаксис JS, отображение шести рядов и иллюстраций в браузере. На БС не опубликовано.

## Редактор полки
Для запуска нужны общие model.js, quote-model.js, quote-store.js, quote-ui.js, quote.css, materials.json и operations.json в shared/ рядом с макетом. Локальный сервер отдаёт их только по разрешённым путям. Это копии общих ресурсов для автономного просмотра, исходники общей корзины не изменялись. Реестр материалов взят из локального WordPress.
Редактор сохраняет позицию material с data.shelf, общим текстовым составом и editUrl на макет. При внедрении в WordPress путь редактирования необходимо заменить на маршрут каталога идей. Корзины разных origin изолированы браузером.
Формы: прямоугольник с независимыми радиусами, круг, полукруг, четверть круга, симметричная трапеция с верхним основанием. Радиус каждого угла строго меньше половины короткой стороны. Нулевой радиус означает 90 градусов.
12 мм в текущих профилях отсутствует. Обычное, бронза и серое имеют 5 мм. Показываются каталожные значения.
Проверены все шесть пресетов, ограничения размеров/диаметров/радиусов/толщины/количества, общий material validator и браузерный цикл добавление — редактирование — сохранение без дубликата.

Фирменное оформление: brand.css использует токены главной; brand.js сохраняет тему в alfaglass-home-theme. Для локального запуска скопировать logo-light.svg и logo-dark.svg из agm-homepage/assets в assets макета. Шапка макета упрощена; перед публикацией использовать общий шаблон шапки WordPress. Локальный сервер отдаёт brand.css, brand.js, SVG-логотипы и общие shelf-geometry.js/shelf-report.js.

Фон hero-v2: .local/product-journal/assets/shelf-hero-v2.png, 2172×724, встроенный imagegen. Промпт: panoramic photorealistic light limestone bathroom, clear polished glass shelf on compact chrome clamps, round illuminated mirror, stone soap dispenser, clear tumbler and white hydrangeas, quiet left area for text, crisp glass edges, no text, no collage. Фон отображается через cover в блоке высотой 450 px; исходник сохраняется отдельно от старой сетки.


## Страница зеркал
`mirrors.html` использует `mirror-catalog.js` и общий редактор полок/изделий. Медиа локально: `assets/mirrors-grid-1.png` (2×5), `mirrors-grid-2.png` и `mirrors-grid-3.png` (2×4), `mirrors-hero.png` (панорама). Не входят в публичный Git. Минимальные габариты 800×600 с поворотом, круг Ø800. Как у полок, партия от 3 шт. Толщины по варианту из общего materials.json; зеркала не закаляются.
