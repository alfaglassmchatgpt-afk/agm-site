# Фотообои локального фотобокса

Созданы встроенным image_gen 2026-10-20. Генерированные PNG хранятся только в `.local/modus-mz/prototype/assets/photobox/`, не публикуются в Git. При переносе прототипа нужны все четыре файла. Каждая стена получает отдельное изображение, масштаб cover с центральным кадрированием без растяжения. Потолочная подсветка сохранена.

## Промпты

Общий шаблон: Photorealistic-natural. Create a single landscape photograph for a full-wall photographic wallpaper texture inside a 3D product viewing room. Subject: [subject]. Landscape aspect ratio 3:2. Edge-to-edge scenery, balanced detailed composition, soft natural lighting, restrained saturation, no people, no objects in room, no furniture, no wall mockup, no frames, no text, no logos. This image itself will cover one wall.

- forest.png: quiet misty birch forest, sage green foliage, slender pale trunks
- mountains.png: layered alpine mountains and still lake, soft blue grey tones
- coast.png: calm Mediterranean sea coast with distant cliffs, muted turquoise and warm limestone
- dunes.png: sweeping sand dunes, warm beige and terracotta, soft dawn shadows

## Пол — oak-laminate.png

Встроенный image_gen, 2026-10-20. Файл: `.local/modus-mz/prototype/assets/photobox/oak-laminate.png`. Один повтор соответствует примерно 2400 × 2400 мм; размеры досок визуально приблизительные. Текстура sRGB, анизотропная фильтрация до 8×, матовая поверхность.

Промпт: Photorealistic architectural PBR base-color texture, square seamless tile of natural light oak laminate flooring, top-down orthographic view, no perspective. Covers 2.4 x 2.4 metres, plank widths 200 mm, plank lengths about 1200 mm, staggered end joints, subtle thin bevel seams. Natural restrained warm beige oak grain with fine pores, moderate grain variation, premium clean matte laminate, no knots larger than 15 mm. Completely even diffuse illumination, no directional light, no highlights, no shadows, no objects, no room, no text. Perfectly tileable on all four edges, high resolution fine detail. Image is the floor material itself, not a room render.
