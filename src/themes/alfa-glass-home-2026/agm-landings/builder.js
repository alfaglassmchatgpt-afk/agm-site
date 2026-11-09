document.addEventListener('DOMContentLoaded', async () => {
  const root = document.querySelector('#triplex-builder');
  if (!root) return;
  const quote = await window.AGMQuoteReady;
  if (!quote) return;
  const form = root.querySelector('form');
  const fields = form.elements;
  const query = new URLSearchParams(location.search);
  if (query.has('quote-edit')) return; // Existing material positions use the shared editor.
  const saved = query.has('flat-edit') && quote.store.all().find(item =>
    item.type === 'material' && item.id === query.get('flat-edit') && item.flat);
  const glassTypes = ['Обычное прозрачное', 'Осветлённое', 'Матовое', 'Осветлённое матовое', 'Тонированное', 'Тонированное матовое'];
  const flatIds = {
    'Обычное прозрачное': 'float-steklo-clear-m1', 'Осветлённое': 'steklo-osvetlyonnoe-clearvision',
    'Матовое': 'steklo-matovoe-matelux', 'Осветлённое матовое': 'steklo-matovoe-osvetlyonnoe'
  };
  const films = ['Прозрачная', 'Матовая (сатин)', 'Цветная прозрачная', 'Цветная непрозрачная'];
  const meshes = ['Латунь', 'Медь', 'Нержавейка'];
  const palettes = {
    'Тонированное': {
      'Бронза': 'moru-bronze', 'Серое': 'tonirovannoe-steklo-grey',
      'Чёрное': 'tonirovannoe-steklo-black', 'Зелёное': 'tonirovannoe-steklo-green',
      'Синее': 'tonirovannoe-steklo-blue', 'Дарк грей': 'moru-dark-grey'
    },
    'Тонированное матовое': {'Серое': 'moru-grey-mat', 'Бронза': 'moru-bronze-mat'}
  };
  function options(select, values, labels = values) {
    select.replaceChildren(...values.map((value, index) => new Option(labels[index], value)));
  }
  const titles = {
    flat: 'Триплекс с плоским стеклом',
    ribbed: 'Триплекс с рифлёным стеклом',
    patterned: 'Триплекс из декоративного стекла',
    custom: 'Свободная конфигурация триплекса'
  };
  const requested = saved ? saved.flat.group : query.get('variant');
  // Keep both recorded materials when reopening an older ribbed/ribbed combination.
  const needsCustomEditor = saved && requested === 'ribbed' && !glassTypes.includes(saved.flat.back);
  const group = needsCustomEditor ? 'custom' : Object.hasOwn(titles, requested) ? requested : 'flat';
  const free = group === 'custom';
  root.querySelector('#tb-title').textContent = titles[group];
  root.querySelector('[data-agreement]').hidden = !free;
  const catalog = JSON.parse(document.querySelector('#tb-catalog').textContent);
  const materials = quote.materials;
  const replacedGlass = {
    'flutes-moru-ultra': 'moru-ultra',
    'flutes-moru-grey': 'moru-grey',
    'flutes-moru-bronze': 'moru-bronze-toned'
  };
  const ribbed = catalog.ribbed.filter(id => materials[id] && !replacedGlass[id]);
  const patterned = catalog.patterned.filter(id => !replacedGlass[id] && id !== 'hithicross' && materials[id]?.operations.includes('laminate'));
  const allGlass = Object.keys(materials).filter(id => !replacedGlass[id] && !materials[id].fixedComposition && !['kuhonnye-fartuki', 'dekorativnyy-triplex'].includes(id));
  const familyById = new Map();
  for (const family of Object.values(catalog.families)) {
    for (const id of family.slugs) familyById.set(id, family.title);
  }
  const series = {
    'Рифлёное стекло МОРУ': {
      'moru-ultra': 'Ультра', 'moru-crystal': 'Кристал',
      'moru-bronze-toned': 'Бронза', 'moru-grey': 'Серое',
      'moru-magnetron-bronze': 'Бронза с напылением', 'moru-magnetron-grey': 'Серое с напылением'
    },
    'Рифлёное стекло Эстриадо': {
      'estriado': 'Обычное', 'estriado-crystal': 'Кристал', 'estriado-ultra': 'Ультра'
    },
    'Матовое стекло': {
      'steklo-matovoe-matelux': 'Обычное', 'steklo-matovoe-osvetlyonnoe': 'Осветлённое',
      'moru-grey-mat': 'Серое', 'moru-bronze-mat': 'Бронза'
    }
  };
  const withdrawn = new Set(['flutes-moru-bronze-mat', 'flutes-moru-grey-mat', 'moru-dark-grey-mat', 'steklo-lacobel', 'steklo-matelak']);
  function familyName(id) {
    if (id === 'tonirovannye-zerkala') return 'Тонированные зеркала';
    if (id === 'zerkalo-gezella') return 'Двухсторонние зеркала';
    if (id.startsWith('sostarennye-zerkala')) return 'Состаренные зеркала';
    if (id.startsWith('lacobel-')) return 'Lacobel';
    if (id.startsWith('matelac-')) return 'Matelac';
    if (id.startsWith('stopsol-') || id === 'steklo-solnczezashhitnoe-stopsol') return 'Стопсол';
    for (const [name, variants] of Object.entries(series)) {
      if (Object.hasOwn(variants, id)) return name;
    }
    if (id.startsWith('tonirovannoe-steklo-')) return 'Тонированное стекло';
    if (catalog.ribbed.includes(id)) return 'Рифлёное стекло';
    if (catalog.patterned.includes(id)) return 'Узорчатое стекло';
    return familyById.get(id) || 'Другие материалы';
  }
  function materialChoices(ids) {
    const families = new Map();
    function add(family, choice) {
      if (!Object.hasOwn(catalog.published, choice.id)) return;
      if (!families.has(family)) families.set(family, []);
      families.get(family).push({...choice, label: series[family]?.[choice.id] || choice.label});
    }
    for (const value of ids) {
      if (withdrawn.has(value)) continue;
      if (palettes[value]) {
        for (const [shade, id] of Object.entries(palettes[value])) {
          if (materials[id]) add(familyName(id), {value, id, shade, label: shade});
        }
        continue;
      }
      const id = flatIds[value] || value;
      const profile = materials[id];
      const variants = Object.entries(profile.variants || {});
      for (const [shade, variant] of variants.length ? variants : [['', '']]) {
        let label = catalog.published[id] || profile.title;
        if (id === 'zerkalo-serebro' && shade !== 'standard') continue;
        if (id === 'zerkalo-serebro') label = 'Обычное зеркало';
        else if (id === 'zerkalo-osvetlyonnoe') label = 'Осветлённое зеркало Crystalvision';
        else if (id === 'tonirovannye-zerkala' || id === 'zerkalo-gezella') label = variant;
        else if (id === 'dihroichnoe-steklo') label = 'Дихроичное стекло';
        else if (variants.length > 1) label += ' · ' + variant;
        add(familyName(id), {value, id, shade, label});
      }
    }
    for (const [family, variants] of Object.entries(series)) {
      const order = Object.keys(variants);
      families.get(family)?.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    }
    return families;
  }
  const choices = {};
  function showFamily(side, preferred) {
    const entries = choices[side].get(fields[side + 'Family'].value);
    options(fields[side], entries.map((_, index) => index), entries.map(entry => entry.label));
    if (preferred) fields[side].selectedIndex = entries.indexOf(preferred);
  }
  function selectedGlass(side) {
    return choices[side].get(fields[side + 'Family'].value)[fields[side].selectedIndex];
  }
  for (const side of ['front', 'back']) {
    let ids = glassTypes;
    if (free) ids = allGlass;
    else if (side === 'front' && group !== 'flat') ids = group === 'ribbed' ? ribbed : patterned;
    const families = materialChoices(ids);
    choices[side] = families;
    const selector = fields[side + 'Family'];
    options(selector, [...families.keys()]);
    const initial = saved ? replacedGlass[saved.flat[side]] || saved.flat[side] : ids === allGlass ? flatIds[glassTypes[0]] : ids[0];
    const entries = [...families.values()].flat();
    const match = entries.find(e => e.value === initial && e.shade === saved?.flat?.[side + 'Shade']) || entries.find(e => e.value === initial);
    if (match) selector.value = familyName(match.id);
    showFamily(side, match);
    const oldShade = saved?.flat?.[side + 'Shade'];
    const oldMirror = initial === 'zerkalo-serebro' && oldShade === 'clear';
    if ((saved && !match) || oldMirror || withdrawn.has(initial) || (initial === 'Тонированное матовое' && oldShade === 'Дарк грей')) {
      const previous = oldMirror ? 'Серебро на осветлённом стекле' : materials[initial]?.title || oldShade || initial;
      const placeholder = new Option('Выберите замену: ' + previous, '');
      placeholder.disabled = true;
      fields[side].add(placeholder);
      fields[side].value = '';
    }
  }
  const fills = [...films];
  if (group === 'flat' || free) fills.push('Сетка');
  if (group === 'patterned' || free) fills.push('Шпон');
  options(fields.fill, fills);
  if (query.get('fill') === 'mesh' && fills.includes('Сетка')) fields.fill.value = 'Сетка';
  options(fields.metal, meshes);
  options(fields.wood, ['Светлый дуб', 'Орех', 'Вишня', 'Эбен', 'Зебрано']);
  const colors = ['Голубой', 'Чёрный', 'Оранжевый', 'Фиолетовый', 'Зелёный', 'Голубой джейд', 'Серый', 'Бронза', 'Синий', 'Голубой прозрачный', 'Тёмно-серый', 'Жёлтый', 'Светло-зелёный', 'Красный', 'Фуксия'];
  options(root.querySelector('#tb-colors'), colors);
  function refreshGlass(side, thicknessField, preferredThickness) {
    const choice = selectedGlass(side);
    if (!choice) {
      options(thicknessField, [''], ['Сначала выберите материал']);
      return;
    }
    const selected = materials[choice.id];
    const catalogValues = selected.variantThicknesses?.[choice.shade] ?? selected.thicknesses ?? [];
    const numeric = catalogValues.map(Number).filter(n => Number.isFinite(n) && n > 0);
    let allowed = numeric;
    if (!free && side === 'back') allowed = numeric.filter(n => Math.abs(n - Number(fields.first.value)) <= 2);
    options(thicknessField, allowed, allowed.map(n => n + ' мм'));
    if (free && !numeric.length && catalogValues.includes('unknown')) {
      thicknessField.add(new Option('Уточнить с менеджером', 'unknown'));
      return;
    }
    if (!allowed.length) {
      const hint = numeric.length ? 'Нет совместимой толщины' : 'Толщина требует уточнения';
      thicknessField.add(new Option(hint, ''));
      return;
    }
    const preferred = Number(preferredThickness);
    thicknessField.value = allowed.includes(preferred) ? preferred : allowed.reduce((best, n) =>
      Math.abs(n - preferred) < Math.abs(best - preferred) ? n : best, allowed[0]);
  }
  function refreshStack(first = fields.first.value, second = fields.second.value) {
    refreshGlass('front', fields.first, first);
    refreshGlass('back', fields.second, second);
  }
  refreshStack(4, 4);
  if (saved) {
    for (const key of ['width','height','quantity','color','edge']) fields[key].value = saved.flat[key];
    const oldMetal = saved.flat.fill.replace(/^Сетка · /, '');
    fields.fill.value = meshes.includes(oldMetal) ? 'Сетка' : saved.flat.fill;
    fields.metal.value = saved.flat.metal || (meshes.includes(oldMetal) ? oldMetal : meshes[0]);
    refreshGlass('front', fields.first, saved.flat.first);
    refreshGlass('back', fields.second, saved.flat.second);
    for (const key of ['first', 'second']) {
      if (fields[key].value && fields[key].value !== String(saved.flat[key])) {
        fields[key].add(new Option('Выберите актуальную толщину', ''), 0);
        fields[key].value = '';
      }
    }
    if (!free && !fields.first.value) refreshGlass('back', fields.second, saved.flat.second);
    if (saved.flat.wood) fields.wood.value = saved.flat.wood;
    fields.tempered.checked = saved.flat.tempered;
    fields.pack.checked = saved.flat.pack;
    root.querySelector('[type=submit]').textContent = 'Сохранить изменения';
  }
  const isColored = () => fields.fill.value.startsWith('Цветная');
  function filling() {

    if (fields.fill.value === 'Шпон') return 'Шпон · ' + fields.wood.value;
    if (fields.fill.value === 'Сетка') return 'Сетка · ' + fields.metal.value;
    return fields.fill.value + ' EVA-плёнка' + (isColored() && fields.color.value.trim() ? ' · ' + fields.color.value.trim() : '');
  }
  function composition() {
    function glassName(side, thickness) {
      const choice = selectedGlass(side);
      if (!choice) return 'Выберите материал';
      const name = series[familyName(choice.id)] || palettes[choice.value] || ['tonirovannye-zerkala', 'zerkalo-gezella'].includes(choice.id)
        ? familyName(choice.id) + ' · ' + choice.label : choice.label;
      return [name, thickness.value && thickness.selectedOptions[0].text].filter(Boolean).join(' · ');
    }
    return [glassName('front', fields.first), filling(), glassName('back', fields.second)].join(' / ');
  }
  function refresh() {
    const canTemper = ['front', 'back'].every(side => materials[selectedGlass(side)?.id]?.operations.includes('temper'));
    fields.tempered.disabled = !canTemper;
    if (!canTemper) fields.tempered.checked = false;
    const tempered = fields.tempered.checked;
    const canPack = group === 'flat' || free;
    fields.pack.closest('label').hidden = !canPack;
    fields.pack.disabled = tempered || !canPack;
    if (fields.pack.disabled) fields.pack.checked = false;
    root.querySelector('[data-processing]').textContent = tempered ? 'Кромку каждого стекла обрабатываем до закаливания.' : 'В пакете — кромку обрабатываем после склеивания стёкол.';
    root.querySelector('[data-processing]').hidden = !canPack && !tempered;
    fields.wood.disabled = fields.fill.value !== 'Шпон';
    fields.wood.closest('label').hidden = fields.wood.disabled;
    root.querySelector('[data-color]').hidden = !isColored();
    fields.color.disabled = !isColored();
    fields.color.required = isColored();
    fields.metal.disabled = fields.fill.value !== 'Сетка';
    fields.metal.closest('label').hidden = fields.metal.disabled;
    root.querySelector('[data-limit]').textContent = 'Разница между толщинами стёкол — до 2 мм включительно.';
    root.querySelector('[data-limit]').hidden = free;
    fields.height.setCustomValidity(Math.min(fields.width.valueAsNumber, fields.height.valueAsNumber) > 2200 ? 'Одна из сторон должна быть не больше 2200 мм.' : '');
    root.querySelector('[data-result]').textContent = composition();
  }
  form.addEventListener('input', event => {
    const name = event.target.name;
    if (name === 'frontFamily' || name === 'backFamily') showFamily(name.replace('Family', ''));
    if (['front', 'back', 'frontFamily', 'backFamily'].includes(name) || (name === 'first' && !free)) refreshStack();
    refresh();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    refresh();
    if (!form.reportValidity()) return;
    const processing = [fields.edge.value + ' кромка', fields.pack.checked ? 'обработка в пакете' : 'обработка отдельных стёкол', fields.tempered.checked ? 'с закаливанием' : 'без закаливания'].join(', ');
    const id = saved ? saved.id : crypto.randomUUID();
    const flat = Object.fromEntries(new FormData(form));
    for (const side of ['front', 'back']) {
      const choice = selectedGlass(side);
      flat[side] = choice.value;
      flat[side + 'Shade'] = choice.shade;
      delete flat[side + 'Family'];
    }
    flat.group = group;
    flat.tempered = fields.tempered.checked;
    flat.pack = fields.pack.checked;
    flat.color = fields.color.disabled ? '' : fields.color.value.trim();
    const item = AGMOrderModel.normalize({id, material:'dekorativnyy-triplex', base:group === 'flat' ? 'custom' : group, thickness:'unknown',
      width:flat.width, height:flat.height, quantity:flat.quantity, ops:[], note:composition() + '\n' + processing}, quote.materials, () => id);
    const entry = AGMQuoteModel.material(item, quote.materials, quote.operations);
    const status = root.querySelector('[data-status]');
    if (entry.errors.length) {status.textContent = entry.errors[0]; return;}
    entry.title = titles[group];
    entry.summary = [composition(), flat.width + ' × ' + flat.height + ' мм · ' + flat.quantity + ' шт.', processing].join('\n');
    entry.flat = flat;
    entry.editUrl = '/triplex/?flat-edit=' + encodeURIComponent(id) + '#triplex-builder';
    try {
      quote.store.put(entry);
      document.dispatchEvent(new CustomEvent('agm:quote-editors-refresh'));
      status.textContent = 'Состав сохранён в «Моём расчёте».';
      quote.open();
    } catch (error) {status.textContent = 'Не удалось сохранить: ' + error.message;}
  });
  refresh();
  root.hidden = false;
  const legacy = document.querySelector('#material-request');
  if (legacy) legacy.hidden = true;
  document.querySelectorAll('a[href="#material-request"],a[href$="/triplex/#material-request"]').forEach(a => {a.href = '#triplex-builder';});
  if (['#material-request', '#triplex-builder'].includes(location.hash)) root.scrollIntoView();
});
