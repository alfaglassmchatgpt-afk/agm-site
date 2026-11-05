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
  const meshes = ['Латунь', 'Медь', 'Нержавейка'].map(metal => 'Сетка · ' + metal);
  function options(select, values, labels = values) {
    select.replaceChildren(...values.map((value, index) => new Option(labels[index], value)));
  }
  options(fields.front, glassTypes);
  options(fields.back, glassTypes);
  options(fields.fill, [...films, ...meshes]);
  options(fields.first, thicknesses, thicknesses.map(n => n + ' мм'));
  const colors = ['Голубой', 'Чёрный', 'Оранжевый', 'Фиолетовый', 'Зелёный', 'Голубой джейд', 'Серый', 'Бронза', 'Синий', 'Голубой прозрачный', 'Тёмно-серый', 'Жёлтый', 'Светло-зелёный', 'Красный', 'Фуксия'];
  options(root.querySelector('#tb-colors'), colors);
  function updateSecond(preferred) {
    const first = Number(fields.first.value);
    const allowed = thicknesses.filter(n => n <= first + 2);
    options(fields.second, allowed, allowed.map(n => n + ' мм'));
    fields.second.value = allowed.includes(Number(preferred)) ? preferred : first;
  }
  updateSecond(4);
  if (saved) {
    for (const key of ['width','height','quantity','front','first','fill','color','back','edge']) fields[key].value = saved.flat[key];
    updateSecond(saved.flat.second);
    fields.tempered.checked = saved.flat.tempered;
    fields.pack.checked = saved.flat.pack;
    root.querySelector('[type=submit]').textContent = 'Сохранить изменения';
  }
  const isColored = () => fields.fill.value.startsWith('Цветная');
  function filling() {
    if (fields.fill.value === films[0]) return 'Прозрачная EVA-плёнка, 2 слоя';
    if (meshes.includes(fields.fill.value)) return fields.fill.value + ' между двумя прозрачными EVA-плёнками';
    return fields.fill.value + ' EVA-плёнка' + (isColored() && fields.color.value.trim() ? ' · ' + fields.color.value.trim() : '');
  }
  function composition() {
    return [fields.front.value + ' ' + fields.first.value + ' мм', filling(), fields.back.value + ' ' + fields.second.value + ' мм'].join(' / ');
  }
  function refresh() {
    const tempered = fields.tempered.checked;
    fields.pack.disabled = tempered;
    if (tempered) fields.pack.checked = false;
    root.querySelector('[data-processing]').textContent = tempered ? 'Кромку каждого стекла обрабатываем до закаливания.' : 'В пакете — кромку обрабатываем после склеивания стёкол.';
    root.querySelector('[data-color]').hidden = !isColored();
    fields.color.disabled = !isColored();
    fields.color.required = isColored();
    root.querySelector('[data-film]').textContent = meshes.includes(fields.fill.value) ? 'По одному слою прозрачной EVA-плёнки с каждой стороны сетки.' : fields.fill.value === films[0] ? 'Два слоя прозрачной EVA-плёнки.' : '';
    root.querySelector('[data-limit]').textContent = 'До ' + Math.min(10, Number(fields.first.value) + 2) + ' мм при выбранном первом стекле.';
    fields.height.setCustomValidity(Math.min(fields.width.valueAsNumber, fields.height.valueAsNumber) > 2200 ? 'Одна из сторон должна быть не больше 2200 мм.' : '');
    root.querySelector('[data-result]').textContent = composition();
  }
  form.addEventListener('input', event => {
    if (event.target === fields.first) updateSecond(fields.second.value);
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

