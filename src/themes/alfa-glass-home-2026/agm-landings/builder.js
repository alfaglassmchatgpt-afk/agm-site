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
  const thicknesses = [4, 5, 6, 8, 10];
  const films = ['Прозрачная', 'Матовая (сатин)', 'Цветная прозрачная', 'Цветная непрозрачная'];
  const meshes = ['Латунь', 'Медь', 'Нержавейка'];
  const palettes = {
    'Тонированное': {
      'Бронза': 'moru-bronze', 'Серое': 'tonirovannoe-steklo-grey',
      'Чёрное': 'tonirovannoe-steklo-black', 'Зелёное': 'tonirovannoe-steklo-green'
    },
    'Тонированное матовое': {'Бронза': 'moru-bronze-mat', 'Серое': 'moru-grey-mat'}
  };
  function options(select, values, labels = values) {
    select.replaceChildren(...values.map((value, index) => new Option(labels[index], value)));
  }
  options(fields.front, glassTypes);
  options(fields.back, glassTypes);
  options(fields.fill, [...films, 'Сетка']);
  options(fields.metal, meshes);
  options(fields.first, thicknesses, thicknesses.map(n => n + ' мм'));
  const colors = ['Голубой', 'Чёрный', 'Оранжевый', 'Фиолетовый', 'Зелёный', 'Голубой джейд', 'Серый', 'Бронза', 'Синий', 'Голубой прозрачный', 'Тёмно-серый', 'Жёлтый', 'Светло-зелёный', 'Красный', 'Фуксия'];
  options(root.querySelector('#tb-colors'), colors);
  function refreshGlass(side, thicknessField, preferredShade, preferredThickness) {
    const palette = palettes[fields[side].value];
    const shade = fields[side + 'Shade'];
    shade.closest('label').hidden = !palette;
    shade.disabled = !palette;
    shade.required = Boolean(palette);
    let allowed = thicknesses;
    if (palette) {
      options(shade, ['', ...Object.keys(palette)], ['Выберите оттенок', ...Object.keys(palette)]);
      shade.value = preferredShade in palette ? preferredShade : '';
      const material = quote.materials[palette[shade.value]];
      if (material) allowed = allowed.filter(n => material.thicknesses.includes(String(n)));
    }
    if (side === 'back') allowed = allowed.filter(n => Math.abs(n - Number(fields.first.value)) <= 2);
    options(thicknessField, allowed, allowed.map(n => n + ' мм'));
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
    for (const key of ['width','height','quantity','front','color','back','edge']) fields[key].value = saved.flat[key];
    const oldMetal = saved.flat.fill.replace(/^Сетка · /, '');
    fields.fill.value = meshes.includes(oldMetal) ? 'Сетка' : saved.flat.fill;
    fields.metal.value = saved.flat.metal || (meshes.includes(oldMetal) ? oldMetal : meshes[0]);
    refreshGlass('front', fields.first, saved.flat.frontShade, saved.flat.first);
    refreshGlass('back', fields.second, saved.flat.backShade, saved.flat.second);
    fields.tempered.checked = saved.flat.tempered;
    fields.pack.checked = saved.flat.pack;
    root.querySelector('[type=submit]').textContent = 'Сохранить изменения';
  }
  const isColored = () => fields.fill.value.startsWith('Цветная');
  function filling() {

    if (fields.fill.value === 'Сетка') return 'Сетка · ' + fields.metal.value;
    return fields.fill.value + ' EVA-плёнка' + (isColored() && fields.color.value.trim() ? ' · ' + fields.color.value.trim() : '');
  }
  function composition() {
    function glassName(side, thickness) {
      const shade = fields[side + 'Shade'];
      return [fields[side].value, shade.disabled ? '' : shade.value, thickness.value + ' мм'].filter(Boolean).join(' · ');
    }
    return [glassName('front', fields.first), filling(), glassName('back', fields.second)].join(' / ');
  }
  function refresh() {
    const tempered = fields.tempered.checked;
    fields.pack.disabled = tempered;
    if (tempered) fields.pack.checked = false;
    root.querySelector('[data-processing]').textContent = tempered ? 'Кромку каждого стекла обрабатываем до закаливания.' : 'В пакете — кромку обрабатываем после склеивания стёкол.';
    root.querySelector('[data-color]').hidden = !isColored();
    fields.color.disabled = !isColored();
    fields.color.required = isColored();
    fields.metal.disabled = fields.fill.value !== 'Сетка';
    fields.metal.closest('label').hidden = fields.metal.disabled;
    root.querySelector('[data-limit]').textContent = 'Разница между толщинами стёкол — до 2 мм включительно.';
    fields.height.setCustomValidity(Math.min(fields.width.valueAsNumber, fields.height.valueAsNumber) > 2200 ? 'Одна из сторон должна быть не больше 2200 мм.' : '');
    root.querySelector('[data-result]').textContent = composition();
  }
  form.addEventListener('input', event => {
    if (['front', 'back', 'frontShade', 'backShade', 'first'].includes(event.target.name)) refreshStack();
    refresh();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    refresh();
    if (!form.reportValidity()) return;
    const processing = [fields.edge.value + ' кромка', fields.pack.checked ? 'обработка в пакете' : 'обработка отдельных стёкол', fields.tempered.checked ? 'с закаливанием' : 'без закаливания'].join(', ');
    const id = saved ? saved.id : crypto.randomUUID();
    const flat = Object.fromEntries(new FormData(form));
    flat.tempered = fields.tempered.checked;
    flat.pack = fields.pack.checked;
    flat.color = fields.color.disabled ? '' : fields.color.value.trim();
    const item = AGMOrderModel.normalize({id, material:'dekorativnyy-triplex', base:'custom', thickness:'unknown',
      width:flat.width, height:flat.height, quantity:flat.quantity, ops:[], note:composition() + '\n' + processing}, quote.materials, () => id);
    const entry = AGMQuoteModel.material(item, quote.materials, quote.operations);
    const status = root.querySelector('[data-status]');
    if (entry.errors.length) {status.textContent = entry.errors[0]; return;}
    entry.title = 'Триплекс с плоским стеклом';
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
