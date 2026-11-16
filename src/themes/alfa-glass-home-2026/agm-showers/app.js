(function showerApp(glasses, materials, hardware) {
  'use strict';
  const $ = id => document.getElementById('ags-' + id),
    form = $('form'),
    lt = String.fromCharCode(60),
    colors = {
      PSS: '#9baab3',
      SSS: '#7b8d96',
      BL: '#252c31',
      GOLD: '#c7a047',
      BTP: '#ad8b4b',
      SNG: '#c5aa70',
      GG: '#59616a'
    };
  let spec = '',
    context = '';
  const txt = id => $(id).selectedOptions ? $(id).selectedOptions[0].textContent : $(id).value,
    num = id => Number($(id).value),
    tag = (name, attrs, inside = '') => lt + name + ' ' + attrs + '>' + inside + lt + '/' + name + '>';

  const fixedScreenFraction = .7;
  function planView(layout, mode, left, doorFraction = .5, pendulum = false, live = false, measure = false) {
    const diagonal = layout === 'pentagon';
    const front = diagonal ? Math.SQRT2 * 66 : 190;
    const leaf = front * doorFraction;
    const split = mode === 'fixed' ? front * fixedScreenFraction : front - leaf;
    const walls = diagonal ? 'M67 150V18H199' : layout === 'niche' ? 'M40 123V27H230V123' : 'M40 123V27H230';
    const sides = diagonal ? 'M67 150H133 M199 84V18' : layout === 'corner' ? 'M230 27V123' : '';
    const position = diagonal ? 'translate(133 150) rotate(-45)' : 'translate(40 123)';
    const line = (path, color, width, dashed = false) =>
      tag('path', 'd="' + path + '" fill="none" stroke="' + color + '" stroke-width="' + width + '"' + (dashed ? ' stroke-dasharray="4 4"' : ''));
    const door = measure ? '#475967' : '#a45321';
    let face = line('M0 0H' + split, '#117774', measure ? 2.5 : 5);
    if (mode === 'hinged') {
      face += line('M' + split + ' 0H' + front, door, 2, true);
      face += line('M' + split + ' 0a' + leaf + ' ' + leaf + ' 0 0 0 ' + (leaf * .5) + ' ' + (leaf * .866), door, 1.5, true);
      face += line('M' + front + ' 0l-' + (leaf * .5) + ' ' + (leaf * .866), door, 4);
      face += tag('circle', 'cx="' + front + '" cy="0" r="4" fill="#ba935e"');
      face += tag('g', 'transform="translate(' + front + ' 0) rotate(120)"',
        line('M' + (leaf * .83) + ' -4v8', '#554330', 3));
      if (pendulum) {
        face += line('M' + split + ' 0a' + leaf + ' ' + leaf + ' 0 0 1 ' + (leaf * .5) + ' ' + (-leaf * .866), door, 1.5, true);
        face += line('M' + front + ' 0l-' + (leaf * .5) + ' ' + (-leaf * .866), door, 2, true);
      }
    } else if (mode === 'sliding') {
      face += line('M' + (split - 5) + ' 7H' + front, door, 4);
      face += line('M' + (split + 25) + ' 22h-40l7-5m-7 5 7 5', door, 2.5);
      face += line('M' + (front - leaf * .12) + ' 3v8', '#554330', 3);
    } else {
      face += line('M' + ((front + split) / 2) + ' 22v-45l-6 8m6-8 6 8', door, 3);
    }
    const mirrorX = x => left ? 270 - x : x;
    const label = (x, y, word) => tag('text', 'x="' + mirrorX(x) + '" y="' + y + '" text-anchor="middle" fill="#354245" stroke="#f5eee3" stroke-width="3" paint-order="stroke" font-size="13"', word);
    const floor = diagonal ? 'M67 18H199V84L133 150H67Z' : 'M40 27H230V123H40Z';
    if (measure) {
      const niche = layout === 'niche';
      const x1 = diagonal ? 67 : 40, x2 = diagonal ? 199 : 230;
      const y1 = diagonal ? 18 : 27, y2 = diagonal ? 150 : 123;
      const ink = '#344855';
      const hatch = tag('pattern', 'id="ags-wall-hatch" width="5" height="5" patternUnits="userSpaceOnUse"',
        tag('rect', 'width="5" height="5" fill="#e8ecee"') + line('M-1 1l2-2 M0 5l5-5 M4 6l2-2', '#84939b', .7));
      const wallSection = 'M' + x1 + ' ' + y2 + 'V' + y1 + 'H' + x2 +
        (niche ? 'V' + y2 + 'h7V' : 'v-7H' + (x1-7) + 'V' + y2 + 'Z');
      const outline = niche ? wallSection + (y1-7) + 'H' + (x1-7) + 'V' + y2 + 'Z' : wallSection;
      const structure = tag('path', 'd="' + outline + '" fill="url(#ags-wall-hatch)" stroke="' + ink + '" stroke-width="1.2"') +
        line(sides, '#117774', 2.5) + tag('g', 'transform="' + position + '"', face);
      const widthLine = 'M' + x1 + ' ' + (y1-9) + 'V-9 M' + x2 + ' ' + (y1-9) + 'V-9 M' + x1 + ' -4H' + x2 +
        ' M' + (x1-3) + ' -1l6-6 M' + (x2-3) + ' -1l6-6';
      const depthLine = 'M' + (x1-9) + ' ' + y1 + 'H13 M' + (x1-9) + ' ' + y2 + 'H13 M18 ' + y1 + 'V' + y2 +
        ' M15 ' + (y1+3) + 'l6-6 M15 ' + (y2+3) + 'l6-6';
      const dimension = id => $(id).value && $(id).validity.valid ? $(id).value + ' мм' : '—';
      const widthText = 'Ширина ' + dimension('width');
      const depthText = 'Глубина ' + dimension('depth');
      const depthLabel = niche ? '' : tag('text', 'transform="translate(' + mirrorX(11) + ' ' + ((y1+y2)/2) + ') rotate(-90)"', depthText);
      const marks = line(widthLine, ink, 1) + (niche ? '' : line(depthLine, ink, 1));
      const accessible = 'Обмерный план. ' + widthText + (niche ? '' : '. ' + depthText);
      const bottom = mode === 'hinged' ? Math.max(y2+16, diagonal ? 110 + leaf : y2 + leaf*.866 + 10) : y2+30;
      return tag('svg', 'viewBox="-7 -27 284 ' + (bottom+27) + '" role="img" aria-label="' + accessible + '"',
        tag('defs', '', hatch) + tag('g', left ? 'transform="translate(270 0) scale(-1 1)"' : '', structure + marks) +
        tag('g', 'text-anchor="middle" fill="' + ink + '" font-size="12"', tag('text', 'x="' + mirrorX((x1+x2)/2) + '" y="-10"', widthText) + depthLabel));
    }
    const tileId = 'ags-tile-' + (live ? 'live' : 'guide') + '-' + layout + '-' + mode;
    const tiles = tag('pattern', 'id="' + tileId + '" width="32" height="32" patternUnits="userSpaceOnUse"',
      tag('rect', 'width="32" height="32" fill="#e8dfcf"') + line('M32 0H0V32', '#c6bba9', 1));
    const drawing = tag('path', 'd="' + floor + '" fill="url(#' + tileId + ')"') +
      line(walls, '#958777', 8) + line('M110 48h34', '#a39988', 3) +
      line(sides, '#117774', 5) + tag('g', 'transform="' + position + '"', face);
    const oriented = tag('g', left ? 'transform="translate(270 0) scale(-1 1)"' : '', drawing);
    const labels = label(110, diagonal ? 13 : 19, 'Стена') +
      label(diagonal ? 98 : 64, diagonal ? 171 : 146, 'Стекло') +
      label(diagonal ? 218 : 214, diagonal ? 135 : 155, mode === 'fixed' ? 'Вход' : 'Дверь');
    const bounds = live ? '0 0 280 245' : diagonal ? '56 -4 190 184' : '30 0 214 215';
    return tag('svg', 'viewBox="' + bounds + '" aria-hidden="true"', tag('defs', '', tiles) +
      (live ? tag('rect', 'width="280" height="245" rx="9" fill="#f5eee3"') : '') +
      oriented + labels);
  }

  function refreshGuide() {
    document.querySelectorAll('[data-ags-mode]').forEach(link => {
      const layout = $('guide-layout').value;
      const mode = link.dataset.agsMode;
      const card = link.closest('article');
      const image = card.querySelector('.ags-example');
      if (!image.dataset.nicheSrc) {
        image.dataset.nicheSrc = image.getAttribute('src');
        image.dataset.nicheAlt = image.alt;
      }
      const heading = card.querySelector('h3');
      if (!heading.dataset.nicheTitle) heading.dataset.nicheTitle = heading.textContent;
      const shape = layout === 'corner' ? 'Угловая' : 'Пятиугольная';
      heading.textContent = layout === 'niche' ? heading.dataset.nicheTitle : shape + (mode === 'fixed'
        ? ' душевая перегородка без двери'
        : ' душевая кабина с ' + (mode === 'hinged' ? 'распашной' : 'раздвижной') + ' дверью');
      image.src = layout === 'niche' ? image.dataset.nicheSrc : '/wp-content/uploads/2026/11/shower-guide-' + layout + '-' + mode + '.webp';
      image.alt = layout === 'niche' ? image.dataset.nicheAlt : heading.textContent;
      card.querySelector('svg').outerHTML = planView(layout, mode, false);
    });
  }
  $('guide-layout').addEventListener('change', refreshGuide);
  refreshGuide();

  function showChoices(select, title, captions) {
    const group = document.createElement('div');
    group.className = 'ags-choice-row';
    group.id = select.id + '-choices';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', title);
    for (const option of select.options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.value = option.value;
      button.textContent = captions[option.value];
      button.addEventListener('click', () => {
        select.value = button.value;
        select.dispatchEvent(new Event('change', {bubbles: true}));
      });
      group.append(button);
    }
    const label = select.closest('label') || select.previousElementSibling;
    const container = document.createElement('div');
    container.className = 'agd-full';
    const heading = document.createElement('strong');
    heading.textContent = title;
    label.before(container);
    container.append(heading, group);
    label.hidden = true;
    select.hidden = true;
    document.querySelectorAll('a[href="#' + select.id + '"]').forEach(link => link.hash = group.id);
    return () => {
      for (const button of group.children) {
        button.setAttribute('aria-pressed', String(button.value === select.value));
      }
    };
  }
  const shapes = {niche: 'В нише', corner: 'Угловая', pentagon: 'Пятиугольная'};
  const syncGuide = showChoices($('guide-layout'), 'Форма душевой', shapes);
  const syncLayout = showChoices($('layout'), 'Форма душевой', shapes);
  const syncMode = showChoices($('mode'), 'Исполнение', {
    fixed: 'Без двери', hinged: 'Распашная дверь', sliding: 'Раздвижная дверь'
  });
  syncGuide();
  $('guide-layout').addEventListener('change', syncGuide);

  function draw() {
    const m = materials[num('glass')],
      mode = $('mode').value,
      layout = $('layout').value,
      c = colors[$('finish').value],
      bottom = 285,
      top = 285 - Math.min(235, Math.max(165, num('height') * .105)),
      sideX = Math.min(72, Math.max(28, num('depth') * .06)),
      sideY = Math.min(30, Math.max(12, num('depth') * .022)),
      fw = Math.min(layout === 'niche' ? 300 : layout === 'corner' ? 280 : 240, Math.max(150, num('width') * .19)),
      x = layout === 'corner' ? (440 - fw - sideX) / 2 : (440 - fw) / 2,
      xr = x + fw,
      ratio = num('width') > 0 ? Math.min(1, num('door') / num('width')) : .5,
      split = x + fw * (1 - ratio),
      fill = m.type === 'ribbed' ? 'url(#ags-ribs)' : m.tint;
    let svg = tag('defs', '', tag('pattern', 'id="ags-ribs" width="' + m.spacing / 3 + '" height="8" patternUnits="userSpaceOnUse"', tag('rect', 'width="100%" height="100%" fill="' + m.tint + '"') + tag('path', 'd="M0 0V8" stroke="white" stroke-opacity=".65"') + tag('path', 'd="M' + m.spacing / 6 + ' 0V8" stroke="#647b80" stroke-opacity=".3"')));
    svg += tag('rect', 'x="38" y="27" width="363" height="263" rx="3" fill="#e1dcd1"');
    for (let n = 1; n < 5; n++) svg += tag('path', 'd="M38 ' + (27 + n * 52) + 'H401" stroke="#f5f3ee" stroke-width="1.4"');
    for (let n = 1; n < 4; n++) svg += tag('path', 'd="M' + (38 + n * 91) + ' 27V290" stroke="#f5f3ee" stroke-width="1.4"');
    svg += tag('path', 'd="M319 205V80h-22" fill="none" stroke="#a9a59b" stroke-width="4"') + tag('ellipse', 'cx="287" cy="81" rx="20" ry="4" fill="#b3afa4"') + tag('circle', 'cx="319" cy="200" r="7" fill="#b3afa4"');
    const baseKind = $('base').value,
      baseColor = baseKind === 'tray' ? '#fafaf8' : baseKind === 'curb' ? '#c7bba7' : '#d0ccc2';
    if (baseKind === 'floor') {
      svg += tag('path', 'd="M38 289H401L424 310H16Z" fill="' + baseColor + '" stroke="#b6b7b2" stroke-width="1.2"');
    } else {
      const points = layout === 'corner' ? [
          [x - 3, bottom + 3],
          [xr + 3, bottom + 3],
          [xr + sideX + 3, bottom - sideY],
          [x + sideX, bottom - sideY]
        ] : layout === 'pentagon' ? [
          [x - 3, bottom + 3],
          [xr + 3, bottom + 3],
          [xr + sideX + 3, bottom - sideY],
          [(x + xr) / 2, bottom - sideY * 2],
          [x - sideX - 3, bottom - sideY]
        ] : [
          [x - 3, bottom + 3],
          [xr + 3, bottom + 3],
          [xr - 12, bottom - 30],
          [x + 12, bottom - 30]
        ],
        rise = baseKind === 'curb' ? 15 : 8;
      let baseSvg = '';
      for (let edge = 0; edge < (layout === 'niche' ? 1 : 2); edge++) {
        const p = points[edge],
          q = points[edge + 1];
        baseSvg += tag('polygon', 'points="' + p[0] + ',' + p[1] + ' ' + q[0] + ',' + q[1] + ' ' + q[0] + ',' + (q[1] + rise) + ' ' + p[0] + ',' + (p[1] + rise) + '" fill="' + (baseKind === 'tray' ? '#dfe4e5' : '#a99b83') + '" stroke="#a6aaa7" stroke-width="1"');
      }
      baseSvg += tag('polygon', 'data-shower-base="' + baseKind + '" points="' + points.map(p => p.join(',')).join(' ') + '" fill="' + baseColor + '" stroke="#adb5b3" stroke-width="1.5"');
      svg += tag('g', $('opening').value === 'left' ? 'transform="translate(440 0) scale(-1 1)"' : '', baseSvg);
    }
    const glass = (points) => tag('polygon', 'points="' + points + '" fill="' + fill + '" stroke="' + m.edge + '" stroke-width="1.5"');
    let panes = '';
    if (layout === 'corner') panes += glass(xr + ',' + top + ' ' + (xr + sideX) + ',' + (top - sideY) + ' ' + (xr + sideX) + ',' + (bottom - sideY) + ' ' + xr + ',' + bottom);
    if (layout === 'pentagon') {
      panes += glass(x + ',' + top + ' ' + (x - sideX) + ',' + (top - sideY) + ' ' + (x - sideX) + ',' + (bottom - sideY) + ' ' + x + ',' + bottom);
      panes += glass(xr + ',' + top + ' ' + (xr + sideX) + ',' + (top - sideY) + ' ' + (xr + sideX) + ',' + (bottom - sideY) + ' ' + xr + ',' + bottom);
    }
    if (mode === 'fixed') {
      const edge = x + fw * fixedScreenFraction;
      panes += glass(x + ',' + top + ' ' + edge + ',' + top + ' ' + edge + ',' + bottom + ' ' + x + ',' + bottom);
      panes += tag('path', 'd="M' + x + ' ' + top + 'V' + bottom + 'H' + edge + '" fill="none" stroke="' + c + '" stroke-width="4"') + tag('path', 'd="M' + (edge - 8) + ' ' + (top + 4) + 'L' + (edge - 20) + ' ' + (top - sideY) + '" stroke="' + c + '" stroke-width="4"');
    } else {
      const fixedEnd = mode === 'sliding' ? split + 6 : split;
      panes += glass(x + ',' + top + ' ' + fixedEnd + ',' + top + ' ' + fixedEnd + ',' + bottom + ' ' + x + ',' + bottom);
      const doorStart = mode === 'sliding' ? split - 6 : split + 4;
      panes += glass(doorStart + ',' + top + ' ' + xr + ',' + top + ' ' + xr + ',' + bottom + ' ' + doorStart + ',' + bottom);
      if (mode === 'sliding') {
        panes += tag('path', 'd="M' + (x - 2) + ' ' + (top + 10) + 'H' + (xr + 2) + '" stroke="' + c + '" stroke-width="8"');
        for (const cx of [doorStart + 17, xr - 17]) panes += tag('circle', 'cx="' + cx + '" cy="' + (top + 4) + '" r="7" fill="' + c + '" stroke="#64727a" stroke-width=".7"');
        panes += tag('rect', 'x="' + (split - 7) + '" y="' + (bottom - 6) + '" width="14" height="9" rx="2" fill="' + c + '"');
      } else {
        for (const hy of [top + 38, bottom - 38]) panes += tag('rect', 'x="' + (xr - 10) + '" y="' + hy + '" width="16" height="18" rx="2" fill="' + c + '" stroke="#65747a" stroke-width=".6"');
      }
      const hx = mode === 'sliding' ? xr - 18 : doorStart + 18,
        hy = (top + bottom) / 2;
      if ($('handle').value === 'knob') panes += tag('circle', 'cx="' + hx + '" cy="' + hy + '" r="5" fill="' + c + '"');
      else if ($('handle').value === 'recessed') panes += tag('ellipse', 'cx="' + hx + '" cy="' + hy + '" rx="4" ry="10" fill="none" stroke="' + c + '" stroke-width="3"');
      else panes += tag('path', 'd="M' + hx + ' ' + (hy - 20) + 'V' + (hy + 20) + '" stroke="' + c + '" stroke-width="5" stroke-linecap="round"');
      for (const hy of [top + 30, bottom - 30]) panes += tag('rect', 'x="' + (x - 4) + '" y="' + hy + '" width="10" height="12" rx="1" fill="' + c + '"');
    }
    if ($('threshold').value === 'low') panes += tag('path', 'd="M' + x + ' ' + (bottom + 1) + 'H' + xr + '" stroke="' + c + '" stroke-width="4"');
    svg += tag('g', $('opening').value === 'left' ? 'transform="translate(440 0) scale(-1 1)"' : '', panes);
    svg += tag('text', 'x="220" y="335" text-anchor="middle" fill="#607580" font-size="12"', num('width') + ' × ' + num('height') + ' мм');
    $('svg').innerHTML = tag('svg', 'viewBox="0 0 440 345" aria-hidden="true"', svg);
    $('scene').dataset.mode = mode;
    $('plan').innerHTML = planView(layout, mode, $('opening').value === 'left', Number.isFinite(ratio) ? ratio : .5, $('swing').value === 'both', true);
    $('plan-caption').textContent = txt('layout') + '. ' + txt('mode') + '. Вход ' + txt('opening').toLowerCase() + '.';
    $('measure-plan').innerHTML = planView(layout, mode, $('opening').value === 'left', Number.isFinite(ratio) ? ratio : .5, $('swing').value === 'both', false, true);
    $('measure-tip').textContent = {
      niche: 'Измерьте расстояние от плитки до плитки в трёх местах: внизу, посередине и вверху. Если размеры разные, запишите все три в комментарии.',
      corner: 'По готовой плитке измерьте ширину душевой спереди. Затем измерьте глубину — от задней стены до места, где закончится боковое стекло.',
      pentagon: 'Отмерьте от угла вдоль каждой стены расстояние до края будущей душевой. Для изготовления понадобится ещё и схема с размерами скосов. Её можно приложить к заявке.'
    }[layout];
    $('scene').dataset.layout = layout;
    $('scene').dataset.glassName = m.name;
    $('scene').dataset.finish = $('finish').value;
    $('scene').setAttribute('aria-label', 'Визуализация: ' + txt('mode') + ', ' + m.name + ', ' + txt('finish'));
  }

  // The drawing link carries only geometry and opens independently of the customer's basket.
  const sketchControls = ['layout', 'mode', 'opening', 'swing', 'width', 'height', 'depth', 'door'];
  function sketchLink() {
    const url = new URL(location.pathname, location.origin);
    for (const id of sketchControls) {
      if (!$(id).disabled) url.searchParams.set(id, $(id).value);
    }
    url.hash = 'ags-measure';
    return url.href;
  }
  function update() {
    $('swing-field').hidden = $('mode').value !== 'hinged';
    $('swing').disabled = $('swing-field').hidden;
    syncLayout();
    syncMode();
    const mode = $('mode').value,
      layout = $('layout').value,
      g = glasses[num('glass')],
      key = mode + '|' + layout + '|' + $('swing').value;
    if (context !== key) {
      const current = $('system').value,
        options = [
          ['auto', 'Подобрать по проекту']
        ];
      if (mode === 'fixed') options.push(['profile', 'Алюминиевый профиль под стекло 8 / 10 мм']);
      if (layout === 'niche') {
        if (mode === 'hinged' && $('swing').value === 'out') options.push(['FDP20', 'Петля Бета FDP-20 — стена–стекло']);
        if (mode === 'sliding') options.push(['FDS8', 'Нимфа FDS-8 — раздвижная система в нишу']);
      }
      $('system').replaceChildren(...options.map(([v, t]) => new Option(t, v)));
      if (options.some(([v]) => v === current)) $('system').value = current;
      context = key;
    }
    const system = $('system').value;
    for (const o of $('thickness').options) o.disabled = !g.thickness.includes(Number(o.value));
    if (system === 'FDS8')
      for (const o of $('thickness').options) o.disabled = o.value !== '8';
    if ($('thickness').selectedOptions[0].disabled) $('thickness').value = '8';
    for (const o of $('finish').options) o.disabled = system === 'FDS8' ? !hardware.slide[o.value] : system === 'FDP20' ? !hardware.hinge[o.value] : false;
    if ($('finish').selectedOptions[0].disabled) $('finish').value = system === 'FDS8' ? 'SNG' : 'PSS';
    $('depth').disabled = layout === 'niche';
    $('door').disabled = mode === 'fixed';
    $('handle').disabled = mode === 'fixed';
    $('width').min = system === 'FDS8' ? '1100' : '500';
    $('width').max = system === 'FDS8' ? '1650' : '4000';
    $('height').min = system === 'FDS8' ? '2000' : '1200';
    $('height').max = system === 'FDS8' ? '2000' : '3000';
    $('door').max = system === 'FDP20' ? '800' : '1000';
    let doorWeight = num('door') * num('height') * num('thickness') * .0000025;
    $('door').setCustomValidity(system === 'FDP20' ? (doorWeight > 40 ? 'Для пары петель FDP-20 масса двери должна быть не более 40 кг. Уменьшите полотно или выберите подбор по проекту.' : '') : '');
    $('width').setCustomValidity(mode === 'fixed' ? '' : num('door') >= num('width') ? 'Ширина полотна двери должна быть меньше ширины проёма.' : '');
    let link = hardware.catalog,
      note = 'Фурнитуру и отделку подберём под размеры и выбранную конструкцию. Уплотнители, крепления, стабилизатор и порог согласуем по чертежу.';
    if (system === 'FDS8') {
      link = hardware.slide[$('finish').value];
      note = 'Нимфа FDS-8: для ниши от стены до стены шириной 1100–1650 мм, высота 2000 мм, закалённое стекло 8 мм. Есть доводчики. Высота системы не регулируется; стекло и ручка заказываются отдельно.';
    }
    if (system === 'FDP20') {
      link = hardware.hinge[$('finish').value];
      note = 'Бета FDP-20: крепление стена–стекло 90°, для закалённого стекла 8 / 10 мм. Рекомендованная ширина двери до 800 мм и масса до 40 кг на две петли. Количество петель подтверждаем после расчёта.';
    }
    if (system === 'profile') {
      link = hardware.profile[$('thickness').value];
      note = 'Алюминиевый профиль под выбранную толщину стекла. Сечение, отделку, заглушки, стабилизатор и крепёж подберём по размерам перегородки.';
    }
    $('hardware-link').href = link;
    $('hardware-note').textContent = note;
    $('material-link').href = g.url;
    $('sample-name').textContent = g.name;
    $('sample-image').src = materials[num('glass')].image;
    $('glass-thumb').src = materials[num('glass')].image;
    $('sample-image').alt = g.name + ' — образец ALFAGLASS';
    const valid = form.checkValidity();
    $('s-layout').textContent = txt('layout') + ' · ' + txt('mode') + (mode === 'hinged' ? ' · ' + txt('swing') : '');
    $('s-size').textContent = num('width') + ' × ' + num('height') + (layout === 'niche' ? '' : ' × ' + num('depth')) + ' мм';
    $('s-glass').textContent = g.name;
    $('s-thickness').textContent = txt('thickness');
    $('s-system').textContent = txt('system');
    $('s-finish').textContent = txt('finish');
    $('validation').textContent = valid ? 'Всё заполнено. После замера проверим размеры стёкол, крепления и уплотнения.' : system === 'FDS8' ? 'Для FDS-8 нужен проём 1100–1650 × 2000 мм и стекло 8 мм. Проверьте размеры или выберите подбор по проекту.' : 'Проверьте размеры. Для FDP-20: полотно до 800 мм и до 40 кг на пару петель.';
    draw();
    spec = ['ALFAGLASS — запрос на индивидуальный расчёт', 'Душевые перегородки из стекла', 'Форма: ' + txt('layout'), 'Исполнение: ' + txt('mode') + (mode === 'hinged' ? ' · ' + txt('swing') : ''), 'Ширина фронта / проёма: ' + num('width') + ' мм', 'Высота конструкции: ' + num('height') + ' мм', layout === 'niche' ? '' : 'Глубина / боковая сторона: ' + num('depth') + ' мм', mode === 'fixed' ? 'Без двери' : 'Желаемая ширина полотна двери: ' + num('door') + ' мм', 'Дверь / вход: ' + txt('opening'),
      'Высота проёма по замеру: ' + ($('opening-height').value ? num('opening-height') + ' мм' : 'уточнить'),
      'Свободный проход: ' + ($('passage').value ? num('passage') + ' мм' : 'уточнить'),
      'Размеры отдельных стёкол со слов заказчика: ' + ($('pane-sizes').value.trim() || 'не указаны'),
      'Обмерная схема (вид сверху): ' + sketchLink(), 'Количество: ' + num('quantity'), 'Стекло: ' + g.name, 'Материал: ' + location.origin + g.url, 'Закалённое стекло: ' + txt('thickness'), 'Водоотталкивающая обработка: ' + txt('coating'), 'Фурнитура: ' + txt('system'), 'Отделка: ' + txt('finish'), 'Каталог: ' + link, mode === 'fixed' ? 'Ручка не требуется' : 'Ручка: ' + txt('handle'), 'Порог: ' + txt('threshold'), 'Основание: ' + txt('base'), 'Работы: ' + txt('install'), 'Доставка: ' + txt('delivery'), 'Комментарий: ' + $('comment').value, 'Размеры стекла, проход, монтажные зазоры, отверстия, вырезы, герметизация и полный комплект фурнитуры — по согласованному чертежу.', 'Стоимость: индивидуальный расчёт.'].filter(Boolean).join('\n');
  }
  const preview = $('glass-preview');
  for (const trigger of document.querySelectorAll('[data-ags-preview]')) {
    trigger.addEventListener('click', () => {
      $('preview-title').textContent = $('sample-name').textContent;
      $('preview-photo').src = $('sample-image').src;
      $('preview-photo').alt = $('sample-image').alt;
      preview.showModal();
    });
  }
  $('preview-close').addEventListener('click', () => preview.close());
  const panelButtons = [...$('panels').querySelectorAll('button')];
  const wideMeasure = matchMedia('(min-width: 801px)');
  const setMeasureOpen = () => { $('measure').open = wideMeasure.matches; };
  setMeasureOpen();
  wideMeasure.addEventListener('change', setMeasureOpen);
  const header = document.querySelector('.aluminium-header');
  const intro = document.getElementById('shower-configurator');
  if (header && window.ResizeObserver) {
    const alignIntro = () => {
      intro.style.scrollMarginTop = Math.ceil(header.getBoundingClientRect().height) + 'px';
    };
    alignIntro();
    new ResizeObserver(alignIntro).observe(header);
  }
  function showPanel(id) {
    for (const button of panelButtons) {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      panel.hidden = panel.id !== id;
      button.setAttribute('aria-pressed', String(!panel.hidden));
    }
  }
  function revealTarget(target) {
    const panel = target && target.closest('#ags-dimensions, #ags-materials, #ags-services');
    if (panel) showPanel(panel.id);
  }
  $('panels').hidden = false;
  for (const button of panelButtons) {
    button.addEventListener('click', () => showPanel(button.getAttribute('aria-controls')));
  }
  showPanel('ags-materials');
  const revealHash = () => revealTarget(document.getElementById(location.hash.slice(1)));
  revealHash();
  window.addEventListener('hashchange', revealHash);
  form.addEventListener('invalid', event => revealTarget(event.target), true);
  document.querySelectorAll('a[href="#ags-width"]').forEach(link =>
    link.addEventListener('click', () => showPanel('ags-dimensions')));
  form.addEventListener('input', () => {
    update();
    $('status').textContent = '';
  });
  form.addEventListener('change', update);
  document.querySelectorAll('[data-ags-mode]').forEach(link => link.addEventListener('click', () => {
    showPanel('ags-dimensions');
    $('layout').value = $('guide-layout').value;
    $('mode').value = link.dataset.agsMode;
    $('mode').dispatchEvent(new Event('change', {bubbles:true}));
  }));
  const fileInput = $('sketch-file');
  let savedFile = null;
  function displayFile() {
    const file = fileInput.files[0] || savedFile;
    $('file-state').textContent = file ? file.name : '';
    $('file-remove').hidden = !file;
  }
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    const invalid = file && (!/\.(pdf|jpe?g|png)$/i.test(file.name) || !file.size || file.size > 1048576);
    fileInput.setCustomValidity(invalid ? 'Выберите PDF, JPG или PNG размером до 1 МБ.' : '');
    displayFile();
    if (invalid) fileInput.reportValidity();
  });
  $('file-remove').addEventListener('click', () => {
    fileInput.value = '';
    fileInput.setCustomValidity('');
    savedFile = null;
    displayFile();
  });
  async function readSketch(file) {
    const reader = new FileReader();
    const contents = await new Promise((resolve,reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Не удалось прочитать файл схемы.'));
      reader.readAsDataURL(file);
    });
    return {name:file.name, base64:contents.slice(contents.indexOf(',')+1)};
  }
  const controls = [...form.querySelectorAll('input[id]:not([type=file]), select[id], textarea[id]')];
  const buttons = [...document.querySelectorAll('button[type="submit"]')].filter(button => button.form === form);
  let editing = new URLSearchParams(location.search).get('quote-edit');

  function setButtonText() {
    document.getElementById('ags-new').hidden = !editing;
    buttons.forEach(button => button.textContent = editing ? 'Сохранить изменения' : 'Добавить в мой расчёт');
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    update();
    if (!form.reportValidity()) return;
    buttons.forEach(button => button.disabled = true);
    try {
      const quote = await window.AGMQuoteReady;
      const id = editing || crypto.randomUUID();
      const fields = Object.fromEntries(controls.map(control => [control.id, control.value]));
      const sketch = fileInput.files[0] ? await readSketch(fileInput.files[0]) : savedFile;
      const url = new URL(location.pathname, location.origin);
      url.searchParams.set('quote-edit', id);
      url.hash = 'shower-configurator';
      quote.store.put({
        type: 'partition',
        id,
        title: 'Душевая перегородка',
        summary: sketch ? spec + '\nФайл схемы: ' + sketch.name : spec,
        errors: [],
        data: {
          shower: fields, sketch
        },
        editUrl: url.pathname + url.search + url.hash
      });
      editing = id;
      savedFile = sketch;
      fileInput.value = '';
      displayFile();
      setButtonText();
      $('status').textContent = 'Душевая перегородка добавлена в расчёт.';
      quote.open();
    } catch (error) {
      $('status').textContent = error.name === 'QuotaExceededError' ? 'В браузере недостаточно места. Уменьшите файл схемы и сохраните позицию ещё раз.' : error.message;
    } finally {
      buttons.forEach(button => button.disabled = false);
    }
  });
  document.addEventListener('agm:quote-editors-refresh', () => {
    if (editing && window.AGMQuote && !window.AGMQuote.store.all().some(i => i.type === 'partition' && i.id === editing)) {
      editing = null;
      setButtonText();
    }
  });
  $('download').addEventListener('click', () => {
    update();
    if (!form.reportValidity()) return;
    const url = URL.createObjectURL(new Blob([String.fromCharCode(65279) + spec], {
        type: 'text/plain;charset=utf-8'
      })),
      a = document.createElement('a');
    a.href = url;
    a.download = 'ALFAGLASS-shower-project.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('status').textContent = 'Спецификация скачана.';
  });
  $('mode').value = 'sliding';
  $('glass').value = '15';
  $('finish').value = 'BTP';
  const drawingParams = new URLSearchParams(location.search);
  if (!editing && location.hash === '#ags-measure' && drawingParams.has('layout')) {
    for (const id of sketchControls) {
      const value = drawingParams.get(id);
      const field = $(id);
      if (field.options ? [...field.options].some(option => option.value === value) : value && /^\d{1,4}$/.test(value)) {
        field.value = value;
      }
    }
    $('measure').open = true;
  }
  update();
  if (editing) window.AGMQuoteReady.then(quote => {
    const entry = quote.store.all().find(item => item.id === editing && item.type === 'partition');
    const fields = entry?.data?.shower;
    if (!fields) {
      editing = null;
      setButtonText();
      return;
    }
    for (const key of ['ags-layout', 'ags-mode', 'ags-glass']) document.getElementById(key).value = fields[key];
    savedFile = entry.data.sketch || null;
    displayFile();
    update();
    for (const control of controls)
      if (Object.hasOwn(fields, control.id)) control.value = fields[control.id];
    update();
    setButtonText();
  }).catch(error => {
    $('status').textContent = error.message;
  });
})([{
  "description": "Стекло прозрачное (М1)Выбрать материал →",
  "name": "Стекло прозрачное (М1)",
  "url": "/materialy/float-steklo-clear-m1/",
  "thickness": [8, 10]
}, {
  "description": "EstriadoОбычное стекло с лёгким зеленоватым оттенком · 4, 6, 8 ммВыбрать материал →",
  "name": "Estriado",
  "url": "/materialy/estriado/",
  "thickness": [8]
}, {
  "description": "Estriado CrystalПолуосветлённое стекло Crystal · 4, 6, 8 ммВыбрать материал →",
  "name": "Estriado Crystal",
  "url": "/materialy/estriado-crystal/",
  "thickness": [8]
}, {
  "description": "Estriado UltraОсветлённое стекло Ultra · 4, 6, 8 ммВыбрать материал →",
  "name": "Estriado Ultra",
  "url": "/materialy/estriado-ultra/",
  "thickness": [8]
}, {
  "description": "Vision Sun UltraРифлёное стекло · 4, 5, 6, 8 ммВыбрать материал →",
  "name": "Vision Sun Ultra",
  "url": "/materialy/vison-sun/",
  "thickness": [8]
}, {
  "description": "Рифлёное стекло MORU CRYSTALПолуосветлённое · 4, 5, 6, 8 и 10 ммВыбрать материал →",
  "name": "Рифлёное стекло MORU CRYSTAL",
  "url": "/materialy/moru-crystal/",
  "thickness": [8, 10]
}, {
  "description": "Рифлёное стекло MORU ULTRAУльтраосветлённое · 4, 5, 6, 8 и 10 ммВыбрать материал →",
  "name": "Рифлёное стекло MORU ULTRA",
  "url": "/materialy/moru-ultra/",
  "thickness": [8, 10]
}, {
  "description": "Тонированное стекло Серое4, 5, 6, 8, 10 мм · 3210 × 2250 ммВыбрать материал →",
  "name": "Тонированное стекло Серое",
  "url": "/materialy/tonirovannoe-steklo-grey/",
  "thickness": [8, 10]
}, {
  "description": "Тонированное стекло Бронза4, 5, 6, 8, 10 мм · 3210 × 2250 ммВыбрать материал →",
  "name": "Гладкое тонированное стекло Бронза",
  "url": "/materialy/moru-bronze/",
  "thickness": [8, 10]
}, {
  "description": "Тонированное стекло зелёное (Green)4, 8 мм · 3210 × 2250 ммВыбрать материал →",
  "name": "Тонированное стекло зелёное (Green)",
  "url": "/materialy/tonirovannoe-steklo-green/",
  "thickness": [8, 10]
}, {
  "description": "Тонированное стекло Черное (Black)4, 6, 8, 10 мм · 3300 × 2000 ммВыбрать материал →",
  "name": "Тонированное стекло Черное (Black)",
  "url": "/materialy/tonirovannoe-steklo-black/",
  "thickness": [8, 10]
}, {
  "description": "Матовое стекло Matelux4, 6, 8, 10 мм · 3210 × 2250 ммВыбрать материал →",
  "name": "Матовое стекло Matelux",
  "url": "/materialy/steklo-matovoe-matelux/",
  "thickness": [8, 10]
}, {
  "description": "Матовое осветлённое стекло4, 6, 8, 10 мм · 3210 × 2250 ммВыбрать материал →",
  "name": "Матовое осветлённое стекло",
  "url": "/materialy/steklo-matovoe-osvetlyonnoe/",
  "thickness": [8, 10]
}, {
  "description": "Матовое бронзовое стекло4, 6, 8, 10 мм · 3210 × 2250 ммВыбрать материал →",
  "name": "Матовое бронзовое стекло",
  "url": "/materialy/moru-bronze-mat/",
  "thickness": [8, 10]
}, {
  "description": "Матовое серое стекло4, 6, 8, 10 мм · 3210 × 2250 ммВыбрать материал →",
  "name": "Матовое серое стекло",
  "url": "/materialy/moru-grey-mat/",
  "thickness": [8, 10]
}, {
  "description": "Стекло осветлённое CrystalvisionВыбрать материал →",
  "name": "Стекло осветлённое Crystalvision",
  "url": "/materialy/steklo-kristalvizhn-crystalvision/",
  "thickness": [8, 10]
}, {
  "description": "Стекло осветлённое Extra Clear, OptiwhiteВыбрать материал →",
  "name": "Стекло осветлённое Extra Clear, Optiwhite",
  "url": "/materialy/steklo-osvetlyonnoe-clearvision/",
  "thickness": [8, 10]
}, {
  "name": "Рифлёное стекло MORU Bronze",
  "url": "/materialy/moru-bronze-toned/",
  "thickness": [8]
}], [{
  "name": "Стекло прозрачное (М1)",
  "tint": "rgba(135,183,164,.19)",
  "edge": "#6e9c88",
  "type": "clear",
  "blur": 0,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/clear-m1-4mm-v2.png"
}, {
  "name": "Estriado",
  "tint": "rgba(139,178,158,.24)",
  "edge": "#729482",
  "type": "ribbed",
  "blur": 0.8,
  "spacing": 5,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/estriado-ordinary-4-moru-style-v2.png"
}, {
  "name": "Estriado Crystal",
  "tint": "rgba(184,211,202,.15)",
  "edge": "#8aa99b",
  "type": "ribbed",
  "blur": 0.6,
  "spacing": 5,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/estriado-crystal-4-moru-style-v2.png"
}, {
  "name": "Estriado Ultra",
  "tint": "rgba(230,242,242,.10)",
  "edge": "#a3bec0",
  "type": "ribbed",
  "blur": 0.5,
  "spacing": 5,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/estriado-ultra-4-moru-style-v2.png"
}, {
  "name": "Vision Sun Ultra",
  "tint": "rgba(220,237,240,.12)",
  "edge": "#96b7be",
  "type": "ribbed",
  "blur": 0.6,
  "spacing": 12,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/vision-sun-ultra-approved-v1.png"
}, {
  "name": "Рифлёное стекло MORU CRYSTAL",
  "tint": "rgba(183,210,204,.17)",
  "edge": "#8eaaa2",
  "type": "ribbed",
  "blur": 0.8,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/moru-crystal-sample-v1.png"
}, {
  "name": "Рифлёное стекло MORU ULTRA",
  "tint": "rgba(228,240,242,.10)",
  "edge": "#9dbbc0",
  "type": "ribbed",
  "blur": 0.7,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/moru-ultra-sample-v1.png"
}, {
  "name": "Тонированное стекло Серое",
  "tint": "rgba(63,73,78,.46)",
  "edge": "#596369",
  "type": "tinted",
  "blur": 0,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/tinted-grey-v1.png"
}, {
  "name": "Гладкое тонированное стекло Бронза",
  "tint": "rgba(132,91,48,.47)",
  "edge": "#85633d",
  "type": "tinted",
  "blur": 0,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/moru-bronze-v1.png"
}, {
  "name": "Тонированное стекло зелёное (Green)",
  "tint": "rgba(42,121,79,.43)",
  "edge": "#337e57",
  "type": "tinted",
  "blur": 0,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/tinted-green-4mm-v1.png"
}, {
  "name": "Тонированное стекло Черное (Black)",
  "tint": "rgba(20,24,28,.78)",
  "edge": "#252d32",
  "type": "tinted",
  "blur": 0,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/tinted-black-4mm-v1.png"
}, {
  "name": "Матовое стекло Matelux",
  "tint": "rgba(219,231,220,.79)",
  "edge": "#a0b7a5",
  "type": "matte",
  "blur": 7,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/steklo-matovoe-matelux-v1.png"
}, {
  "name": "Матовое осветлённое стекло",
  "tint": "rgba(242,247,246,.86)",
  "edge": "#c0cfcb",
  "type": "matte",
  "blur": 8,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/matte-lowiron-4mm-v1.png"
}, {
  "name": "Матовое бронзовое стекло",
  "tint": "rgba(161,125,87,.79)",
  "edge": "#927453",
  "type": "matte",
  "blur": 7,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/matte-bronze-4mm-v1.png"
}, {
  "name": "Матовое серое стекло",
  "tint": "rgba(134,145,148,.80)",
  "edge": "#79868c",
  "type": "matte",
  "blur": 7,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/matte-grey-4mm-v1.png"
}, {
  "name": "Стекло осветлённое Crystalvision",
  "tint": "rgba(218,238,239,.08)",
  "edge": "#a4c3c4",
  "type": "clear",
  "blur": 0,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/clear-crystalvision-4mm-v2.png"
}, {
  "name": "Стекло осветлённое Extra Clear, Optiwhite",
  "tint": "rgba(240,249,249,.06)",
  "edge": "#b4ccce",
  "type": "clear",
  "blur": 0,
  "spacing": 8,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/clear-extra-clear-4mm-v2.png"
}, {
  "name": "Рифлёное стекло MORU Bronze",
  "tint": "rgba(156,108,52,.43)",
  "edge": "#85633d",
  "type": "ribbed",
  "blur": 0,
  "spacing": 12,
  "image": "/wp-content/themes/alfa-glass-home-2026/agm-glass/assets/generated/moru-bronze-toned-sample-8mm-v1.png"
}], {
  "catalog": "https://khancorp.ru/category/furnitura-dlya-dushevykh-kabin/",
  "hinge": {
    "PSS": "https://khancorp.ru/petlya-beta-stena-steklo-fdp-20-brcr/",
    "BL": "https://khancorp.ru/petlya-beta-stena-steklo-fdp-20-brbl/"
  },
  "slide": {
    "PSS": "https://khancorp.ru/razdvizhnaya-sistema-fds-8-sus304pss/",
    "BL": "https://khancorp.ru/razdvizhnaya-sistema-fds-8-sus304bl/",
    "GG": "https://khancorp.ru/razdvizhnaya-sistema-fds-8-sus304gg/",
    "SNG": "https://khancorp.ru/razdvizhnaya-sistema-fds-8-sus304sng/"
  },
  "profile": {
    "8": "https://khancorp.ru/category/furnitura-dlya-dushevykh-kabin/profil-dlya-stekla-i-zaglushki/profil-alyuminievyy-dlya-stekla-8-mm/",
    "10": "https://khancorp.ru/category/furnitura-dlya-dushevykh-kabin/profil-dlya-stekla-i-zaglushki/profil-alyuminievyy-dlya-stekla-10-mm/"
  }
});
