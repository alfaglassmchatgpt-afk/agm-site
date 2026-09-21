/* ALFAGLASS — responsive interactions and real form transport. No tracking. */
(() => {
  'use strict';
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const form = $('#quote-form');
  const status = $('#form-status');
  const submit = $('#submit-quote');
  const modeLabel = $('#mode-label');
  const previews = $('#preview-actions');
  const products = JSON.parse($('#product-data').textContent);
  const productDialog = $('#product-dialog');
  const privacyDialog = $('#privacy-dialog');
  const productSelect = $('#product-select');
  const endpoint = document.body.dataset.endpoint || 'api/quote.php';
  const state = { enabled: false, csrf: '', requestId: '', files: [], busy: false, activeProduct: null, privacy: '', consent: '' };
  const MAX_FILES = 3;
  const MAX_BYTES = 10 * 1024 * 1024;
  const EXTENSIONS = new Set(['pdf', 'docx', 'xlsx', 'jpg', 'jpeg', 'png', 'webp']);

  const themeButton = $('.theme-toggle');
  function syncTheme() {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    themeButton.title = dark ? 'Светлая тема' : 'Тёмная тема';
    $('meta[name="theme-color"]').content = dark ? '#091522' : '#ffffff';
  }
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('alfaglass-home-theme', root.dataset.theme); } catch (_) { /* Storage can be disabled. */ }
    syncTheme();
  });
  syncTheme();

  const menuButton = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  function closeMenu() {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
  }
  menuButton.addEventListener('click', () => {
    const open = mobileNav.hidden;
    mobileNav.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('#mobile-nav a').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMenu(); }, { passive: true });
  document.addEventListener('click', e => { if (!mobileNav.hidden && !e.target.closest('.header')) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); }
  });
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      if (a.hasAttribute('data-privacy-link') || a.hasAttribute('data-consent-link')) return;
      const id = a.getAttribute('href').slice(1);
      const target = id && document.getElementById(id);
      if (!target || target.tagName === 'DIALOG') return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
    });
  });

  let toastTimer;
  function toast(text) {
    const el = $('#toast');
    el.textContent = text; el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3300);
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
  $$('[data-product]').forEach(button => button.addEventListener('click', () => {
    const p = products.find(x => x.id === button.dataset.product);
    if (!p) return;
    state.activeProduct = p.id;
    $('#dialog-title').textContent = p.plain;
    $('#dialog-tag').textContent = p.tag;
    $('#dialog-description').textContent = p.details;
    // Read the actual card image source, so the same code works in a single-file export.
    $('#dialog-image').src = $(`#product-${p.id} img`).src;
    $('#dialog-image').alt = p.plain + ' — пример исполнения';
    const specs = $('#dialog-specs'); specs.replaceChildren();
    p.specs.forEach(([label, text]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = text;
      row.append(dt, dd); specs.append(row);
    });
    showDialog(productDialog);
  }));
  function focusRequest(target = $('#company')) {
    $('#request').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
    window.setTimeout(() => target.focus({ preventScroll: true }), reduceMotion.matches ? 0 : 500);
  }
  $('#select-product').addEventListener('click', () => {
    productSelect.value = state.activeProduct || 'mixed';
    const p = products.find(x => x.id === state.activeProduct);
    productDialog.close();
    focusRequest();
    toast((p ? p.plain : 'Изделие') + ': выбрано для расчёта');
  });
  $$('[data-attach]').forEach(a => a.addEventListener('click', () => focusRequest($('#attachments'))));
  $$('[data-tender]').forEach(a => a.addEventListener('click', () => {
    const message = $('#message');
    if (!message.value.trim()) message.value = 'Тендерный запрос.\nОбъект:\nСрок подачи предложения:\nЖелаемая дата поставки:\nТребования к документации:\n';
    focusRequest(message);
  }));
  function openPrivacy(e, kind) {
    const url = kind === 'consent' ? state.consent : state.privacy;
    if (state.enabled && url) return;
    e.preventDefault(); showDialog(privacyDialog);
  }
  $$('[data-privacy-link]').forEach(a => a.addEventListener('click', e => openPrivacy(e, 'privacy')));
  $$('[data-consent-link]').forEach(a => a.addEventListener('click', e => openPrivacy(e, 'consent')));
  $$('[data-privacy-button]').forEach(b => b.addEventListener('click', () => {
    if (state.enabled && state.privacy) { window.open(state.privacy, '_blank', 'noopener,noreferrer'); }
    else showDialog(privacyDialog);
  }));

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); reveal.unobserve(entry.target); }
    }), { threshold: .08 });
    $$('.reveal').forEach(el => reveal.observe(el));
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.desktop-nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === entry.target.id));
      }
    }), { rootMargin: '-15% 0px -55% 0px' });
    ['products','capabilities','process','contacts'].forEach(id => navObserver.observe(document.getElementById(id)));
  }
  const backTop = $('.back-top');
  const updateScroll = () => backTop.classList.toggle('visible', window.scrollY > 700);
  window.addEventListener('scroll', updateScroll, { passive: true }); updateScroll();

  function saveText(filename, text) {
    const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.append(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  $$('[data-download-brief]').forEach(button => button.addEventListener('click', () => {
    saveText('ALFAGLASS_запрос_на_поставку.txt', [
      'ALFAGLASS — запрос на комплексную поставку зеркал',
      'Получатель: contact@example.invalid | +70000000000', '',
      '1. Компания и контактное лицо:', '2. Телефон и email:',
      '3. Название объекта и адрес поставки:', '4. Общее количество (от 100 изделий):', '',
      'ПОЗИЦИИ СПЕЦИФИКАЦИИ', 'Для каждой позиции укажите:',
      '— Наименование и количество;', '— Форма и размеры, мм;',
      '— Вид зеркала, профиль и цвет рамы;', '— Наличие и вид подсветки;',
      '— Дополнительные функции / требования Smart Mirror;',
      '— Номер чертежа или приложения.', '',
      '5. Нужная дата и этапы поставки:', '6. Условия разгрузки, упаковки и маркировки:',
      '7. Нужен ли замер / монтаж:', '8. Требования к документам / тендеру:',
      '9. Срок подачи коммерческого предложения:', '',
      'Стоимость, сроки и комплектация определяются после согласования технического задания.'
    ].join('\r\n'));
    toast('Шаблон запроса подготовлен');
  }));
  const fileInput = $('#attachments');
  const filesList = $('#files-list');
  const fileError = $('#file-error');
  function syncFileInput() {
    try {
      const transfer = new DataTransfer(); state.files.forEach(f => transfer.items.add(f));
      fileInput.files = transfer.files;
    } catch (_) { /* FormData is assembled from state.files on submission. */ }
  }
  function renderFiles() {
    filesList.replaceChildren();
    state.files.forEach((file, index) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = file.name + ' · ' + (file.size / 1024 / 1024).toFixed(2) + ' МБ';
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'file-remove';
      remove.setAttribute('aria-label', 'Удалить файл ' + file.name);
      remove.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-close"></use></svg>';
      remove.addEventListener('click', () => { state.files.splice(index, 1); syncFileInput(); renderFiles(); fileError.textContent = ''; });
      li.append(name, remove); filesList.append(li);
    });
  }
  function addFiles(input) {
    const errors = [];
    [...input].forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!EXTENSIONS.has(ext)) { errors.push('Недопустимый формат: ' + file.name); return; }
      if (file.size === 0) { errors.push('Пустой файл: ' + file.name); return; }
      if (state.files.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) return;
      if (state.files.length >= MAX_FILES) { errors.push('Можно добавить не более трёх файлов.'); return; }
      if (state.files.reduce((sum, f) => sum + f.size, 0) + file.size > MAX_BYTES) { errors.push('Общий размер файлов не должен превышать 10 МБ.'); return; }
      state.files.push(file);
    });
    fileError.textContent = [...new Set(errors)].join(' ');
    syncFileInput(); renderFiles();
  }
  fileInput.addEventListener('change', () => addFiles(fileInput.files));
  const dropzone = $('#dropzone');
  ['dragenter', 'dragover'].forEach(name => dropzone.addEventListener(name, e => { e.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(name => dropzone.addEventListener(name, e => { e.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', e => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });

  function requestText() {
    const value = name => String(form.elements.namedItem(name)?.value || '').trim() || '—';
    const title = productSelect.options[productSelect.selectedIndex].textContent;
    return ['ALFAGLASS — запрос на комплексную поставку', '',
      'Компания: ' + value('company'), 'Контакт: ' + value('name'),
      'Email: ' + value('email'), 'Телефон: ' + value('phone'),
      'Изделия: ' + title, 'Количество: ' + value('quantity') + ' шт.', '',
      'Объект / адрес: ' + value('site_name'), 'Модели / типоразмеры: ' + value('model_count'),
      'Порядок поставки: ' + value('delivery_plan'), 'Желаемый график: ' + value('delivery_dates'), '',
      'Описание проекта:', value('message'), '',
      'Приложения: ' + (state.files.map(f => f.name).join(', ') || 'нет'),
      'Вложения нужно прикрепить к письму вручную.', '',
      'Отправить запрос: contact@example.invalid'
    ].join('\r\n');
  }
  $$('[data-export-request]').forEach(b => b.addEventListener('click', () => {
    saveText('ALFAGLASS_запрос_на_расчёт.txt', requestText());
    toast('Запрос сохранён в текстовый файл. Он не отправлен.');
  }));
  $$('[data-mail-request]').forEach(b => b.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const subject = 'Запрос на поставку зеркал — ' + $('#quantity').value + ' шт.';
    const body = requestText();
    // Very long projects are better attached as the downloadable TXT file.
    const shortBody = body.length > 2200 ? body.slice(0, 2100) + '\r\n\r\nПродолжение — в отдельном файле запроса.' : body;
    window.location.href = 'mailto:contact@example.invalid?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(shortBody);
    setStatus('Открывается почтовая программа. Прикрепите файлы и отправьте письмо самостоятельно. Если почтовая программа не настроена, скачайте запрос и отправьте его на contact@example.invalid.', '');
  }));
  function setStatus(message, kind = '') {
    status.hidden = false; status.className = 'full form-status' + (kind ? ' ' + kind : '');
    status.textContent = message;
  }
  function previewMode(reason) {
    state.enabled = false;
    submit.innerHTML = 'Подготовить запрос <svg class="icon" aria-hidden="true"><use href="#i-arrow"></use></svg>';
    previews.hidden = false;
    modeLabel.textContent = reason || 'Предпросмотр: почтовая отправка не подключена. Запрос можно скачать или отправить через свою почту.';
  }
  async function getServerState() {
    if (location.protocol === 'file:' || document.body.dataset.mode === 'preview') {
      previewMode('Тестовый сайт: отправка отключена. Запрос можно сохранить в файл; вложения остаются на вашем устройстве.');
      return;
    }
    try {
      const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8000);
      let res;
      try { res = await fetch(endpoint, { credentials: 'same-origin', headers: { 'Accept': 'application/json' }, signal: controller.signal }); }
      finally { clearTimeout(timer); }
      if (!res.ok || !(res.headers.get('content-type') || '').includes('application/json')) throw new Error('unavailable');
      const data = await res.json();
      if (!data.enabled) { previewMode(data.message); return; }
      const validUrl = url => { try { const u = new URL(url, location.href); return u.protocol === 'https:' || (u.protocol === 'http:' && ['localhost','127.0.0.1'].includes(u.hostname)); } catch (_) { return false; } };
      if (!data.csrf || !data.request_id || !validUrl(data.privacy_url) || !validUrl(data.consent_url)) throw new Error('configuration');
      state.enabled = true; state.csrf = data.csrf; state.requestId = data.request_id;
      state.privacy = data.privacy_url; state.consent = data.consent_url;
      $('#csrf').value = state.csrf; $('#request-id').value = state.requestId;
      $$('[data-privacy-link]').forEach(a => { a.href = state.privacy; a.target = '_blank'; a.rel = 'noopener noreferrer'; });
      $$('[data-consent-link]').forEach(a => { a.href = state.consent; a.target = '_blank'; a.rel = 'noopener noreferrer'; });
      modeLabel.textContent = 'Файлы передаются вместе с запросом. Поля со знаком * обязательны.';
    } catch (_) {
      previewMode('Сервер отправки не подключён или временно недоступен. Подготовьте письмо или скачайте запрос — введённые данные сохранятся на странице.');
    }
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.busy || !form.reportValidity()) return;
    if ($('#quantity').valueAsNumber < 100) { $('#quantity').focus(); return; }
    if (!state.enabled) {
      setStatus('Запрос подготовлен, но не отправлен. Скачайте заполненный запрос или откройте письмо кнопками ниже. При отправке через почту приложения нужно добавить вручную.');
      previews.hidden = false;
      return;
    }
    state.busy = true; submit.disabled = true;
    const previous = submit.innerHTML; submit.textContent = 'Передаём запрос…';
    setStatus('Передаём спецификацию. Пожалуйста, не закрывайте страницу.');
    const payload = new FormData(form);
    payload.delete('attachments[]'); state.files.forEach(f => payload.append('attachments[]', f, f.name));
    payload.set('csrf', state.csrf); payload.set('request_id', state.requestId);
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch(endpoint, { method: 'POST', body: payload, credentials: 'same-origin', headers: { 'Accept': 'application/json' }, signal: controller.signal });
      let result;
      try { result = await res.json(); } catch (_) { throw new Error('Сервер не подтвердил обработку запроса.'); }
      if (!res.ok || !result.ok) {
        if (result.field && form.elements.namedItem(result.field)) form.elements.namedItem(result.field).focus();
        if (res.status === 403) await getServerState();
        throw new Error(result.message || 'Не удалось отправить запрос.');
      }
      setStatus(result.message, 'success');
      submit.textContent = 'Запрос передан почтовому серверу';
      submit.disabled = true; // Prevent an accidental second send after a positive acknowledgement.
    } catch (error) {
      const text = error.name === 'AbortError'
        ? 'Ответ сервера не получен вовремя. Письмо могло быть передано. Перед повторной попыткой уточните статус по телефону или email.'
        : error.message;
      setStatus(text + ' Данные остались в форме. Можно скачать запрос или связаться с нами по почте.', 'error');
      previews.hidden = false; submit.innerHTML = previous; submit.disabled = false;
    } finally { clearTimeout(timer); state.busy = false; }
  });
  getServerState();
})();
