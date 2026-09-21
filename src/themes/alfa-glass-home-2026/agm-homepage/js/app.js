/* ALFAGLASS homepage — vanilla JS. No trackers, frameworks or external requests in the offline edition. */
(() => {
  'use strict';
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const catalog = JSON.parse($('#catalog-data').textContent);
  const assets = JSON.parse($('#asset-data').textContent);
  const asset = key => assets[key + '.webp'] || assets[key] || '';
  const form = $('#quote-form');
  const endpoint = document.body.dataset.endpoint || 'api/quote.php';
  const state = { enabled: false, busy: false, csrf: '', requestId: '', files: [], detail: null, privacy: '', consent: '', sent: false };
  const MAX_BYTES = 10 * 1024 * 1024;
  const extensions = new Set(['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg', 'webp']);
  const themeKey = 'alfaglass-home-theme' + (location.protocol === 'file:' ? location.pathname : '');

  function syncTheme() {
    const dark = root.dataset.theme === 'dark';
    $('.theme-toggle').setAttribute('aria-pressed', String(dark));
    $('.theme-toggle').setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    $('.theme-toggle').title = dark ? 'Светлая тема' : 'Тёмная тема';
    $('meta[name="theme-color"]').content = dark ? '#0a1721' : '#f8fbff';
  }
  $('.theme-toggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(themeKey, root.dataset.theme); } catch (_) {}
    syncTheme();
  });
  syncTheme();


  /* Navigation dropdowns */
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
      if (a.hasAttribute('data-nav-product')) filterCards('product', 'all');
      toggleDisclosure(item, false);
    }));
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nav-dropdown')) disclosures.forEach(item => toggleDisclosure(item, false)); });
  /* End navigation dropdowns */

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
    new ResizeObserver(() => root.style.setProperty('--header-height', $('.site-header').getBoundingClientRect().height + 'px')).observe($('.site-header'));
  }

  function scrollToElement(el, focus = false) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduce.matches ? 'instant' : 'smooth', block: 'start' });
    if (focus) setTimeout(() => el.focus({ preventScroll: true }), reduce.matches ? 0 : 450);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    if (a.hasAttribute('data-privacy-link') || a.hasAttribute('data-consent-link')) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target || target.tagName === 'DIALOG') return;
    e.preventDefault(); scrollToElement(target);
  }));
  let toastTimer;
  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3700);
  }
  function showDialog(dialog) {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
  }
  $$('[data-close-dialog]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  $$('dialog').forEach(d => {
    d.addEventListener('close', () => { if (!$$('dialog[open]').length) document.body.classList.remove('modal-open'); });
    d.addEventListener('click', e => {
      const r = d.getBoundingClientRect();
      if (e.target === d && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) d.close();
    });
  });

  function openDetail(id) {
    const item = catalog.find(p => p.id === id);
    if (!item) return;
    state.detail = item;
    $('#detail-kind').textContent = item.kind;
    $('#detail-title').textContent = item.title;
    $('#detail-description').textContent = item.description;
    $('#detail-image').src = asset(item.img);
    $('#detail-image').alt = item.title + ' — визуализация';
    const dl = $('#detail-specs'); dl.replaceChildren();
    item.specs.forEach(([name, value]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = name;
      const dd = document.createElement('dd'); dd.textContent = value;
      row.append(dt, dd); dl.append(row);
    });
    showDialog($('#detail-dialog'));
  }
  $$('[data-detail]').forEach(b => b.addEventListener('click', () => openDetail(b.dataset.detail)));
  function syncQuantity() {
    const batch = $('#product-select').value === 'batch';
    $('#quantity').min = batch ? '100' : '1';
    if (batch && Number($('#quantity').value) < 100) $('#quantity').value = '100';
  }
  $('#product-select').addEventListener('change', syncQuantity);
  function requestFocus(el = $('#name')) {
    closeMenu(); scrollToElement($('#request'));
    setTimeout(() => el.focus({ preventScroll: true }), reduce.matches ? 0 : 450);
  }
  function appendMessage(text) {
    const field = $('#message');
    if (!field.value.includes(text)) field.value += (field.value.trim() ? '\n' : '') + text;
  }
  $('#select-detail').addEventListener('click', () => {
    if (!state.detail) return;
    const p = state.detail;
    $('#product-select').value = p.product; syncQuantity();
    appendMessage(p.kind + ': ' + p.title);
    $('#detail-dialog').close(); requestFocus();
    toast(p.title + ' — добавлено в запрос');
  });
  $$('[data-client]').forEach(a => a.addEventListener('click', () => {
    $('#client-select').value = a.dataset.client;
    if (a.dataset.client !== 'private') requestFocus($('#company'));
  }));

  function filterCards(type, value) {
    $$(`[data-${type}-filter]`).forEach(b => {
      const chosen = b.dataset[type + 'Filter'] === value;
      b.classList.toggle('active', chosen); b.setAttribute('aria-pressed', String(chosen));
    });
    let count = 0;
    $$(`[data-${type}-group]`).forEach(card => {
      card.hidden = value !== 'all' && card.dataset[type + 'Group'] !== value;
      if (!card.hidden) count++;
    });
    if (type === 'product') $('.products-grid').classList.toggle('is-filtered', value !== 'all');
    $('#' + (type === 'product' ? 'products' : 'materials') + '-status').textContent = 'Показано: ' + count;
  }
  $$('[data-material-filter]').forEach(b => b.addEventListener('click', () => filterCards('material', b.dataset.materialFilter)));
  $$('[data-product-filter]').forEach(b => b.addEventListener('click', () => filterCards('product', b.dataset.productFilter)));

  const slides = [
  [
    "hero-partitions-hq",
    "Стеклянные перегородки"
  ],
  [
    "hero-interior-hq",
    "Зеркала с подсветкой"
  ],
  [
    "hero-facades-hq",
    "Алюминиевые фасады со стеклом"
  ],
  [
    "hero-round-hq",
    "Круглые зеркала в алюминиевых рамах"
  ]
];
  $$('[data-slide]').forEach(b => b.addEventListener('click', () => {
    const n = Number(b.dataset.slide);
    $('#hero-photo').src = asset(slides[n][0]);
    $('#slide-label').textContent = slides[n][1];
    $('#slide-count').textContent = String(n + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    $$('[data-slide]').forEach(btn => {
      const active = btn === b; btn.classList.toggle('active', active); btn.setAttribute('aria-pressed', String(active));
    });
  }));

  const norm = s => s.toLowerCase().replace(/ё/g, 'е').trim();
  function search() {
    const query = norm($('#search-input').value);
    const found = query ? catalog.filter(x => query.split(/\s+/).every(w => norm(x.title + ' ' + x.kind + ' ' + x.description).includes(w))) : catalog.slice(0, 9);
    const list = $('#search-results'); list.replaceChildren();
    if (!found.length) {
      const p = document.createElement('p'); p.textContent = 'Ничего не найдено. Попробуйте «зеркало», «триплекс» или «фасады».'; list.append(p); return;
    }
    found.slice(0, 18).forEach(item => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'search-result';
      const text = document.createElement('span');
      const small = document.createElement('small'); small.textContent = item.kind;
      const title = document.createElement('b'); title.textContent = item.title;
      text.append(small, title); b.append(text);
      b.addEventListener('click', () => { $('#search-dialog').close(); openDetail(item.id); });
      list.append(b);
    });
  }
  $('.search-toggle').addEventListener('click', () => { search(); showDialog($('#search-dialog')); $('#search-input').focus(); });
  $('#search-input').addEventListener('input', search);

  $$('[data-supply-link]').forEach(a => a.addEventListener('click', e => {
    if (document.body.dataset.mode === 'preview') { e.preventDefault(); closeMenu(); showDialog($('#supply-dialog')); }
  }));
  $('#select-batch').addEventListener('click', () => {
    $('#product-select').value = 'batch'; syncQuantity(); $('#client-select').value = 'build'; $('#quantity').value = Math.max(Number($('#quantity').value) || 1, 100);
    appendMessage('Комплексная поставка.\nОбъект:\nЖелаемая дата поставки:\nТребования к спецификации / тендеру:');
    $('#supply-dialog').close(); requestFocus($('#company'));
  });

  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-revealed'); io.unobserve(e.target); }
    }), { threshold: .08 });
    $$('.reveal').forEach(el => io.observe(el));
  }
  const onScroll = () => $('.back-top').classList.toggle('visible', scrollY > 600);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Attachment handling: files stay in memory until the visitor explicitly sends or exports. */
  const fileInput = $('#attachments');
  function syncFiles() {
    try { const transfer = new DataTransfer(); state.files.forEach(f => transfer.items.add(f)); fileInput.files = transfer.files; } catch (_) {}
    const list = $('#files-list'); list.replaceChildren();
    state.files.forEach((f, i) => {
      const li = document.createElement('li'); const text = document.createElement('span');
      text.textContent = f.name + ' · ' + (f.size / 1024 / 1024).toFixed(2) + ' МБ';
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'file-remove';
      remove.setAttribute('aria-label', 'Удалить файл ' + f.name); remove.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>';
      remove.addEventListener('click', () => { state.files.splice(i, 1); syncFiles(); $('#file-error').textContent = ''; });
      li.append(text, remove); list.append(li);
    });
  }
  function addFiles(files) {
    const errors = [];
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!extensions.has(ext)) { errors.push('Недопустимый формат: ' + file.name); continue; }
      if (!file.size) { errors.push('Пустой файл: ' + file.name); continue; }
      if (state.files.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) continue;
      if (state.files.length >= 3) { errors.push('Можно добавить не более трёх файлов.'); continue; }
      if (state.files.reduce((s, f) => s + f.size, 0) + file.size > MAX_BYTES) { errors.push('Общий размер — не более 10 МБ.'); continue; }
      state.files.push(file);
    }
    syncFiles(); $('#file-error').textContent = [...new Set(errors)].join(' ');
  }
  fileInput.addEventListener('change', () => addFiles([...fileInput.files]));
  ['dragover', 'dragenter'].forEach(type => $('#dropzone').addEventListener(type, e => { e.preventDefault(); $('#dropzone').classList.add('dragover'); }));
  ['drop', 'dragleave'].forEach(type => $('#dropzone').addEventListener(type, e => { e.preventDefault(); $('#dropzone').classList.remove('dragover'); }));
  $('#dropzone').addEventListener('drop', e => { if (e.dataTransfer) addFiles([...e.dataTransfer.files]); });

  function field(name) { return String(form.elements.namedItem(name)?.value || '').trim() || '—'; }
  function selectedText(id) { const s = $(id); return s.options[s.selectedIndex]?.textContent || '—'; }
  function requestText() {
    return ['ALFAGLASS — запрос на расчёт проекта', 'Получатель: contact@example.invalid', '',
      'Имя: ' + field('name'), 'Телефон: ' + field('phone'), 'Email: ' + field('email'),
      'Компания: ' + field('company'), 'Тип клиента: ' + selectedText('#client-select'),
      'Изделие / задача: ' + selectedText('#product-select'), 'Количество: ' + field('quantity') + ' шт.', '',
      'Комментарий:', field('message'), '', 'Приложения: ' + (state.files.map(f => f.name).join(', ') || 'нет'),
      'Файлы необходимо прикрепить к письму отдельно.', '',
      'Стоимость, комплектация и сроки уточняются после согласования проекта.'
    ].join('\r\n');
  }
  function saveText(filename, text) {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  function exportRequest() { saveText('ALFAGLASS_запрос_на_расчёт.txt', requestText()); toast('Запрос скачан. Он не отправлен.'); }
  $('[data-export-request]').addEventListener('click', exportRequest);
  function status(text, kind = '') {
    const el = $('#form-status'); el.hidden = false; el.className = 'form-status' + (kind ? ' ' + kind : ''); el.textContent = text;
  }
  $('[data-mail-request]').addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const body = requestText();
    const shortened = body.length > 2000 ? body.slice(0, 1900) + '\r\nПродолжение — в файле запроса.' : body;
    location.href = 'mailto:contact@example.invalid?subject=' + encodeURIComponent('Запрос на расчёт — ' + selectedText('#product-select')) + '&body=' + encodeURIComponent(shortened);
    status('Открывается ваша почтовая программа. Письмо нужно отправить самостоятельно, а файлы прикрепить вручную. Если почта не открылась, скачайте запрос и отправьте его на contact@example.invalid.');
  });
  function previewMode(message) {
    state.enabled = false;
    $('#submit-quote').innerHTML = 'Подготовить запрос <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
    $('#mode-label').textContent = message || 'Отправка ещё не подключена. Запрос можно скачать или открыть через свою почту.';
    $('#preview-actions').hidden = false; $('#consent-row').hidden = true; $('#consent').required = false;
  }
  function privacy(e, consent = false) {
    if (state.enabled && (consent ? state.consent : state.privacy)) return;
    if (e) e.preventDefault(); showDialog($('#privacy-dialog'));
  }
  $('[data-privacy-button]').addEventListener('click', () => {
    if (state.enabled && state.privacy) window.open(state.privacy, '_blank', 'noopener,noreferrer');
    else privacy();
  });
  $('[data-privacy-link]').addEventListener('click', e => privacy(e));
  $('[data-consent-link]').addEventListener('click', e => privacy(e, true));

  async function serverState() {
    if (location.protocol === 'file:' || document.body.dataset.mode === 'preview') {
      previewMode('Тестовый сайт: отправка отключена. Можно скачать заполненный запрос; файлы остаются на вашем устройстве.'); return;
    }
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 7000);
    try {
      const res = await fetch(endpoint, { credentials: 'same-origin', headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!res.ok || !(res.headers.get('content-type') || '').includes('application/json')) throw new Error('configuration');
      const data = await res.json();
      if (!data.enabled) { previewMode(data.message); return; }
      const validURL = u => { try { const x = new URL(u); return x.protocol === 'https:' || (x.protocol === 'http:' && ['localhost','127.0.0.1'].includes(x.hostname)); } catch (_) { return false; } };
      if (!data.csrf || !data.request_id || !validURL(data.privacy_url) || !validURL(data.consent_url)) throw new Error('configuration');
      state.enabled = true; state.csrf = data.csrf; state.requestId = data.request_id;
      state.privacy = data.privacy_url; state.consent = data.consent_url;
      for (const [sel, url] of [['[data-privacy-link]', state.privacy], ['[data-consent-link]', state.consent]]) {
        const a = $(sel); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      }
      $('#submit-quote').innerHTML = 'Отправить заявку <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
      $('#mode-label').textContent = 'Поля со знаком * обязательны. Файлы передаются вместе с запросом.';
      $('#consent-row').hidden = false; $('#consent').required = true; $('#preview-actions').hidden = true;
    } catch (_) { previewMode('Сервер отправки не подключён или недоступен. Скачайте запрос или откройте письмо — данные останутся в форме.'); }
    finally { clearTimeout(timer); }
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.busy || state.sent || !form.reportValidity()) return;
    if (!state.enabled) {
      exportRequest(); status('Запрос сохранён в текстовый файл, но не отправлен. Пришлите его на contact@example.invalid. Добавленные фото и чертежи прикрепите к письму отдельно.'); return;
    }
    state.busy = true;
    const submit = $('#submit-quote'); const original = submit.innerHTML;
    submit.disabled = true; submit.textContent = 'Отправляем запрос…';
    status('Передаём запрос. Пожалуйста, не закрывайте страницу.');
    const data = new FormData(form); data.delete('attachments[]');
    state.files.forEach(f => data.append('attachments[]', f, f.name));
    data.set('csrf', state.csrf); data.set('request_id', state.requestId);
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch(endpoint, { method: 'POST', body: data, credentials: 'same-origin', headers: { Accept: 'application/json' }, signal: controller.signal });
      const result = await res.json().catch(() => { throw new Error('Сервер не подтвердил обработку запроса.'); });
      if (!res.ok || !result.ok) {
        if (result.field) form.elements.namedItem(result.field)?.focus();
        if (res.status === 403) await serverState();
        throw new Error(result.message || 'Запрос не отправлен.');
      }
      state.sent = true; status(result.message, 'success'); submit.textContent = 'Запрос передан почтовому серверу';
    } catch (err) {
      const message = err.name === 'AbortError' ? 'Время ожидания истекло. Письмо могло быть принято. Уточните статус по телефону перед повторной отправкой.' : err.message;
      status(message + ' Введённые данные остались в форме.', 'error');
      submit.disabled = false; submit.innerHTML = original; $('#preview-actions').hidden = false;
    } finally { clearTimeout(timer); state.busy = false; }
  });
  serverState();
})();
