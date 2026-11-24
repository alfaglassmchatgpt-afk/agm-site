/* LED editor adapter: one shared basket, no separate checkout. */
(() => {
  'use strict';
  const form = document.querySelector('#led-brief');
  if (!form) return;
  const status = document.querySelector('#brief-status');
  const preview = document.querySelector('.led-selected-image');
  const cards = [...document.querySelectorAll('.led-card')];
  const box = document.querySelector('.led-lightbox');
  let editing = null, opener;
  const updateShape = () => {
    const round = form.elements.shape.value === 'Круглая';
    form.elements.height.required = !round;
    form.elements.height.disabled = round;
    document.querySelector('[data-height-label]').hidden = round;
  };
  form.elements.shape.addEventListener('change', updateShape);
  updateShape();
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    let count = 0;
    cards.forEach(card => {
      const shape = card.querySelector('.led-pick').dataset.shape;
      card.hidden = !(button.dataset.filter === 'all' || shape === button.dataset.filter || (button.dataset.filter === 'other' && !['Круглая','Овальная','Прямоугольная'].includes(shape)));
      if (!card.hidden) count++;
    });
    document.querySelector('.led-results').textContent = 'Найдено решений: ' + count + ' · размеры на заказ';
  }));
  cards.forEach(card => {
    const imageLink = card.querySelector('a'), pick = card.querySelector('.led-pick');
    imageLink.addEventListener('click', event => {
      event.preventDefault(); opener = imageLink;
      box.querySelector('img').src = imageLink.href;
      box.querySelector('img').alt = card.querySelector('img').alt;
      box.showModal();
    });
    pick.addEventListener('click', () => {
      editing = null;
      ['variant','kind','light','shape'].forEach(key => form.elements[key].value = pick.dataset[key]);
      preview.src = card.querySelector('img').src;
      preview.alt = pick.dataset.variant;
      updateShape();
      status.textContent = 'Выбрано: ' + pick.dataset.variant + '. Укажите размеры.';
      form.querySelector('[type="submit"]').textContent = 'Добавить в «Мой расчёт»';
      document.querySelector('#project-brief').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
      form.elements.width.focus({preventScroll: true});
    });
  });
  box.querySelector('button').addEventListener('click', () => box.close());
  box.addEventListener('close', () => opener?.focus({preventScroll:true}));
  box.addEventListener('click', event => { if (event.target === box) box.close(); });
  const labels = {variant:'Модель',shape:'Форма',kind:'Подсветка',light:'Цвет света',width:'Ширина / диаметр, мм',height:'Высота, мм',quantity:'Количество',control:'Управление',comment:'Комментарий'};
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const quote = await window.AGMQuoteReady;
      if (!quote) throw new Error('Расчёт ещё загружается. Попробуйте снова.');
      const data = Object.fromEntries(new FormData(form));
      data.extras = new FormData(form).getAll('extras');
      for (const key of ['width', ...(data.shape === 'Круглая' ? [] : ['height']), 'quantity']) {
        if (!/^\d+$/.test(data[key]) || !Number.isSafeInteger(Number(data[key])) || Number(data[key]) < 1) throw new Error('Размеры и количество укажите целыми положительными числами.');
      }
      const id = editing || 'led-' + crypto.randomUUID();
      const summary = Object.entries(labels).filter(([key]) => data[key]).map(([key,label]) => label + ': ' + data[key]).join('\n') + '\nДополнительно: ' + (data.extras.join(', ') || 'не выбрано') + '\nРазмеры, электрическая часть и комплектация требуют согласования перед изготовлением.';
      quote.store.put({type:'mirror',id,title:data.variant,summary,errors:[],data:{led:data,image:preview.getAttribute('src')},editUrl:'/zerkala-s-podsvetkoj/?led='+encodeURIComponent(id)+'#project-brief'});
      editing = id;
      status.textContent = 'Зеркало добавлено. Параметры можно изменить.';
      submit.textContent = 'Сохранить изменения';
      quote.open();
    } catch (error) { status.textContent = error.message; }
    finally { submit.disabled = false; }
  });
  window.AGMQuoteReady?.then(quote => {
    const id = new URLSearchParams(location.search).get('led');
    const item = quote.store.all().find(i => i.type === 'mirror' && i.id === id && i.data?.led);
    if (!item) return;
    editing = id;
    for (const key of Object.keys(labels)) if (item.data.led[key] !== undefined) form.elements[key].value = item.data.led[key];
    form.querySelectorAll('[name="extras"]').forEach(input => input.checked = item.data.led.extras.includes(input.value));
    if (item.data.image) {
      const url = new URL(item.data.image, location.origin);
      if (url.origin === location.origin) preview.src = url.href;
    }
    updateShape();
    form.querySelector('[type="submit"]').textContent = 'Сохранить изменения';
  }).catch(error => { status.textContent = error.message; });
})();
