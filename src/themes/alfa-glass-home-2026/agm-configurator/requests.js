/* Shared request transport; no outbound submission in staging/preview mode. */
window.AGMRequestForm = function (form, endpoint, summary, getFiles, status) {
  let settings = null, busy = false, sent = false;
  const button = form.querySelector('[type=submit]');
  const extensions = 'jpg,jpeg,png,webp,gif,bmp,tif,tiff,pdf,svg,eps,ai,cdr,dxf,dwg,cdw,frw,m3d,a3d'.split(',');
  const input = form.querySelector('[type=file]');
  input.accept = extensions.map(x => '.' + x).join(',');
  form.elements.name.required = true;
  form.elements.phone.required = true;
  const note = form.querySelector('.dialog-note');
  const hint = input.closest('label').nextElementSibling;
  if (hint) hint.textContent = 'Изображения, PDF, SVG, EPS, AI, CDR, DXF, DWG, КОМПАС (CDW, FRW, M3D, A3D). До 20 файлов, всего до 20 МБ.';
  const consent = document.createElement('label');
  consent.className = 'check-row'; consent.hidden = true;
  consent.innerHTML = '<input type="checkbox" name="consent" value="1"><span>Согласен на обработку персональных данных согласно <a target="_blank" rel="noopener noreferrer">политике конфиденциальности</a>.</span>';
  button.before(consent);
  const trap = document.createElement('input');
  trap.name = 'website'; trap.type = 'text'; trap.tabIndex = -1; trap.autocomplete = 'off';
  trap.setAttribute('aria-hidden', 'true'); trap.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px';
  form.append(trap);
  async function load() {
    try {
      const response = await fetch(endpoint, {credentials:'same-origin', cache:'no-store'});
      if (!response.ok) throw new Error();
      const value = await response.json();
      if (!value.enabled) return;
      const privacy = new URL(value.privacy_url);
      if (!/^https?:$/.test(privacy.protocol) || !value.csrf || !value.request_id) return;
      settings = value; consent.hidden = false; consent.querySelector('input').required = true;
      consent.querySelector('a').href = privacy.href;
      button.textContent = 'Отправить заявку';
      if (note) note.textContent = 'Заявка и чертежи будут переданы менеджеру. На указанный email отправим подтверждение. Цена и возможность изготовления согласуются отдельно.';
    } catch (_) { status.textContent = 'Отправка недоступна. Можно сохранить заявку в TXT; менеджеру она не отправится.'; }
  }
  load();
  return async function (event) {
    if (!settings) return false;
    event.preventDefault();
    if (busy || sent || !form.reportValidity()) return true;
    const files = getFiles();
    if (files.length > 20 || files.reduce((sum, f) => sum + f.size, 0) > 20 * 1024 * 1024
      || files.some(f => !extensions.includes(f.name.split('.').pop().toLowerCase()))) {
      status.textContent = 'Проверьте форматы файлов и общий размер (до 20 МБ).'; return true;
    }
    busy = true; button.disabled = true; status.textContent = 'Передаём заявку…';
    const data = new FormData(form);
    data.set('request_text', summary()); data.set('csrf', settings.csrf); data.set('request_id', settings.request_id);
    data.delete('attachments[]'); files.forEach(f => data.append('attachments[]', f, f.name));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const response = await fetch(endpoint, {method:'POST', body:data, credentials:'same-origin', signal:controller.signal});
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'Сервер не подтвердил отправку.');
      sent = true; status.textContent = result.message; button.textContent = 'Заявка передана';
    } catch (error) {
      status.textContent = (error.message || 'Не удалось получить ответ сервера.') + ' Данные остались в форме. При обрыве связи повторите отправку этой же формы — номер заявки сохранён.';
    } finally { clearTimeout(timer); busy = false; button.disabled = sent; }
    return true;
  };
};
