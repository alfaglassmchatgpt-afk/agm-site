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
    'Тонированное матовое': {'Бронза': 'moru-bronze-mat', 'Серое': 'moru-grey-mat', 'Дарк грей': 'moru-dark-grey-mat'}
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
  const frontChoices = {flat: glassTypes, ribbed, patterned, custom: allGlass};
  const backChoices = {flat: glassTypes, ribbed: glassTypes, patterned: glassTypes, custom: allGlass};
  for (const [field, choices] of [[fields.front, frontChoices[group]], [fields.back, backChoices[group]]]) {
    options(field, choices, choices.map(id => materials[id]?.title || id));
    if (free) field.value = 'float-steklo-clear-m1';
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
  function refreshGlass(side, thicknessField, preferredShade, preferredThickness) {
    const value = fields[side].value;
    const profile = materials[value];
    const palette = palettes[value];
    const variants = Object.entries(profile?.variants || {});
    const shade = fields[side + 'Shade'];
    const hasChoice = Boolean(palette) || variants.length > 1;
    shade.closest('label').hidden = !hasChoice;
    shade.closest('label').firstChild.textContent = palette ? 'Оттенок стекла' : 'Вариант материала';
    shade.disabled = !hasChoice;
    shade.required = hasChoice;
    let selected = profile || materials[flatIds[value]];
    if (palette) {
      options(shade, ['', ...Object.keys(palette)], ['Выберите оттенок', ...Object.keys(palette)]);
      shade.value = preferredShade in palette ? preferredShade : '';
      selected = materials[palette[shade.value]];
    } else if (profile) {
      options(shade, variants.map(([id]) => id), variants.map(([, label]) => label));
      if (Object.hasOwn(profile.variants, preferredShade)) shade.value = preferredShade;
    }
    const catalogValues = selected?.variantThicknesses?.[shade.value] ?? selected?.thicknesses ?? [];
    const numeric = catalogValues.map(Number).filter(n => Number.isFinite(n) && n > 0);
    let allowed = numeric;
    if (!free && side === 'back') allowed = numeric.filter(n => Math.abs(n - Number(fields.first.value)) <= 2);
    options(thicknessField, allowed, allowed.map(n => n + ' мм'));
    if (free && !numeric.length && catalogValues.includes('unknown')) {
      thicknessField.add(new Option('Уточнить с менеджером', 'unknown'));
      return;
    }
    if (!allowed.length) {
      const hint = !selected ? 'Сначала выберите материал и оттенок' :
        numeric.length ? 'Нет совместимой толщины' : 'Толщина требует уточнения';
      thicknessField.add(new Option(hint, ''));
      return;
    }
    const preferred = Number(preferredThickness);
    thicknessField.value = allowed.includes(preferred) ? preferred : allowed.reduce((best, n) =>
      Math.abs(n - preferred) < Math.abs(best - preferred) ? n : best, allowed[0]);
  }
  function refreshStack(first = fields.first.value, second = fields.second.value) {
    refreshGlass('front', fields.first, fields.frontShade.value, first);
    refreshGlass('back', fields.second, fields.backShade.value, second);
  }
  refreshStack(4, 4);
  if (saved) {
    for (const key of ['width','height','quantity','color','edge']) fields[key].value = saved.flat[key];
    for (const side of ['front', 'back']) fields[side].value = replacedGlass[saved.flat[side]] || saved.flat[side];
    const oldMetal = saved.flat.fill.replace(/^Сетка · /, '');
    fields.fill.value = meshes.includes(oldMetal) ? 'Сетка' : saved.flat.fill;
    fields.metal.value = saved.flat.metal || (meshes.includes(oldMetal) ? oldMetal : meshes[0]);
    refreshGlass('front', fields.first, saved.flat.frontShade, saved.flat.first);
    refreshGlass('back', fields.second, saved.flat.backShade, saved.flat.second);
    for (const key of ['first', 'second']) {
      if (fields[key].value && fields[key].value !== String(saved.flat[key])) {
        fields[key].add(new Option('Выберите актуальную толщину', ''), 0);
        fields[key].value = '';
      }
    }
    if (!free && !fields.first.value) refreshGlass('back', fields.second, saved.flat.backShade, saved.flat.second);
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
      const shade = fields[side + 'Shade'];
      return [fields[side].selectedOptions[0]?.text, shade.disabled ? '' : shade.selectedOptions[0]?.text, thickness.selectedOptions[0]?.value && thickness.selectedOptions[0].text].filter(Boolean).join(' · ');
    }
    return [glassName('front', fields.first), filling(), glassName('back', fields.second)].join(' / ');
  }
  function refresh() {
    const canTemper = [fields.front, fields.back].every(field => !materials[field.value] || materials[field.value].operations.includes('temper'));
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
    if (['front', 'back', 'frontShade', 'backShade'].includes(name) || (name === 'first' && !free)) refreshStack();
    refresh();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    refresh();
    if (!form.reportValidity()) return;
    const processing = [fields.edge.value + ' кромка', fields.pack.checked ? 'обработка в пакете' : 'обработка отдельных стёкол', fields.tempered.checked ? 'с закаливанием' : 'без закаливания'].join(', ');
    const id = saved ? saved.id : crypto.randomUUID();
    const flat = Object.fromEntries(new FormData(form));
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
