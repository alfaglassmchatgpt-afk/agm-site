# Локальный редакционный макет зеркал с подсветкой

Production не изменён. Preview: http://127.0.0.1:8802/zerkala-s-podsvetkoj/.

Вместо прежней компоновки: интерьерный hero, фильтр по семи силуэтам, восемь крупных карточек, интерактивные крупные планы, короткое объяснение света, общий расчёт и FAQ. Фильтр не меняет заявку; детали также демонстрационные. Комплектация согласуется индивидуально.

Новые изображения созданы встроенным image_gen, без фотографий конкурентов. Локальные файлы находятся в `.local/led-catalog-20261124/cache/agm-led/assets/`: `editorial-hero.png`, `detail-on.png`, `detail-off.png`, `detail-heater.png`. Перед публикацией перенести эти четыре файла выборочно в `agm-led/assets/`; они исключены из публичного Git как бинарные медиа.

Задания генератору: photorealistic landscape 3:2 editorial photographs, frameless mirrors, realistic reflections, neutral warm stone interiors, no branding or people. Hero — organic asymmetrical mirror with warm backlight above floating vanity. Detail on — macro of rounded rectangular mirror with inset frosted luminous stripe, touch sensor and 08:24 clock. Detail off — edit of the same photograph with lighting and display off, preserving composition. Heater — round mirror, condensation outside the clear heated central zone. These are visual illustrations, not technical specifications.

Проверено: переключение on/off меняет изображения; подогрев и часы меняют иллюстрацию/текст; фильтр «Арка» даёт одну карточку и передаёт арочную форму в редактор. Переполнение отсутствует при 390px, размер иллюстрации адаптивен; ошибок JS в браузере нет. Node syntax и test-unified-quote пройдены. Локальная отправка писем запрещена; реальное письмо не отправлялось.
