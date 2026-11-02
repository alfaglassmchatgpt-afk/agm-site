# Посадочные материалов и переходы из статьи — локально, 2026-11-02

Публикация не выполнена. Владелец согласует локальные страницы до переноса на БС.

## Обновление изображения карточки — 2026-11-02

Карточка «Триплекс» возвращена к обычному размеру соседних карточек; специальные grid-span и пропорции удалены. Новый квадратный рендер создан встроенным image_gen. Локальный файл: `.local/themes/alfa-glass-home-2026/agm-homepage/assets/triplex-layered-square-v1.png`; при согласованной публикации скопировать в `agm-homepage/assets/` темы. Бинарник не включён в публичный Git. Главный рендер посадочной не менялся.

Промпт генерации:

> Create a square 1:1 photorealistic premium architectural glass catalog product photograph for a website material card called Triplex. No text, labels, logos or watermarks. Show a single upright square laminated glass sample in a restrained three-quarter view, on a pale beige stone plinth, softly lit neutral warm grey studio interior. The sample consists of exactly two thin rigid glass panes, each physically 4 mm thick, and one very thin translucent milky EVA film between them. Exploded view with modest separation 15-20 mm between the components so the layered construction is unmistakable, the film slightly gently curved at one corner, otherwise parallel. One pane clear smooth glass, the front pane subtly reeded glass with fine realistic vertical ribs, not coarse bars. Glass remains transparent with soft distorted background visible. Glass edges subtle pale green, physically thin not acrylic blocks. All three components have the same square dimensions, aligned and centered, occupying 75 percent of the square frame with generous clean margins, no cropped corners. Material itself is hero, no doors, no full room scene, no hardware. Soft realistic reflections and contact shadows, elegant catalog style, legible at small thumbnail size.

## Что подготовлено

- `/riflenoe-steklo/`: 14 материалов действующего публичного каталога, переходы в их карточки к общему расчёту. Список и изображения сверены с публичным каталогом 2 ноября; `agm-landings/reeded.json` — редакционная подборка, при изменении ассортимента её нужно обновлять.
- `/triplex/`: прозрачный, цветной, с металлической сеткой, декоративный. Крафтовый подход описан внутри. Используется существующий профиль `dekorativnyy-triplex` и общий конфигуратор; идентификатор профиля не меняется, чтобы сохранить ранее собранные заявки. Публичное имя — «Триплекс».
- Статья `/iz-chego-delayut-zerkalo/`: реальная ссылка в заключительном абзаце и три варианта зеркала с расчётом. Вставка через `the_content`, без изменения БД статьи.
- Главная: карточка «Триплекс», ссылка с карточки рифлёного стекла; обе страницы в меню материалов. Старые group-URL остаются рабочими через 301 после публикации целевых страниц.

## Предпросмотр

- `http://127.0.0.1:8794/triplex/`
- `http://127.0.0.1:8794/riflenoe-steklo/`
- `http://127.0.0.1:8794/iz-chego-delayut-zerkalo/#mirror-choice`
- `http://127.0.0.1:8794/#materials`

Сервер только GET, noindex. В локальной статье использована копия публичного HTML вне Git. Переход на световые зеркала открывает существующую публичную страницу; новые посадочные и 14 карточек доступны локально. Недостающие изображения берутся с публичного сайта; оригиналы триплекса доступны в `.local/triplex`. Медиа в Git не добавлялись.

## Выборочный перенос после одобрения

1. Сравнить актуальные файлы БС с исходниками. Сохранить точечную копию изменяемых файлов и защищённую копию параметров затрагиваемых WP-страниц. Не переносить весь src.
2. Добавить `page-agm-material-landing.php`, каталог `agm-landings`, MU-плагин `agm-material-landings.php`. Проверить наличие используемых изображений и зависимостей общего расчёта/шапки. Главный триплекс-рендер — `agm-configurator/assets/triplex-motion-closed.png`; не заменять его другим материалом.
3. Создать/назначить страницы `riflenoe-steklo` и `triplex`, заголовки «Рифлёное стекло» и «Триплекс», шаблон `page-agm-material-landing.php`. Проверить отсутствие конфликта с существующими страницами до создания. У обеих должны быть self-canonical, индексируемость и включение в WP/Yoast sitemap. Метаданные задаёт MU-плагин; проверить отсутствие дублей в фактическом HTML.
4. В актуальном `inc/agm-material-groups.php` точечно добавить фильтр `agm_material_group_link` к результату `agm_material_group_url`. В `inc/agm-navigation.php` перенести поддержку новых посадочных и имя «Триплекс» для craft-triplex. Не заменять исходником полный файл групп: production содержит дополнительные материалы.
5. В актуальном `materials.json` изменить только title существующего профиля `dekorativnyy-triplex` на «Триплекс» и термин в note на EVA-плёнку. Не заменять реестр целиком: src неполон.
6. После публикации обеих страниц перенести точечные изменения главной и CSS для ссылок material-card. Сохранить более новые блоки, контакты, изображения, параметры ресурсов и JS сайта; обновить cache version. Ветка содержит исходные placeholders контактов, их не публиковать.
7. Проверить переходы из главной, мобильного/desktop меню, каталога; старые `/materialy/?group=riflenoe-steklo`, `/catalog/riflenoe-steklo/`, `/materialy/?group=craft-triplex`, `/dekorativnyy-triplex/`. Редиректы сохраняют query-параметры кампаний, удаляя только group. До публикации целей редиректов нет. Проверить конфликты с прежними redirect-плагинами.
8. Проверить статью, якоря `material-request`, `project-brief`, `calculation`, общий расчёт, обе темы, мобильные размеры. Реальные заявки без отдельного разрешения не отправлять.

## Проверки локально

PHP lint новых/изменённых PHP-файлов; JS syntax; `scripts/test-material-landings.php` (publication guard, redirects, query preservation, no loop, article placement and idempotence); `scripts/test-unified-quote.cjs`.

Через HTTP проверены 14 карточек и наличие общего конфигуратора, по одному H1 на двух новых посадочных и статье. В браузере: 14 карточек, переход MORU к расчёту, выбор цветного триплекса, добавление и удаление тестовой позиции без изменения прежних позиций; сохранение тёмной темы; мобильные iframe 320/390 px. Внешняя отправка не выполнялась. Полноценную WP-интеграцию (статусы страниц, канонические адреса, sitemap и редиректы всех действующих плагинов) нужно проверить при разрешённой публикации.
