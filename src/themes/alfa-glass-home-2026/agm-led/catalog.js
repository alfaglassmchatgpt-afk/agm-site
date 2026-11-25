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
  let selected = cards.find(c=>c.querySelector('.led-pick').dataset.variant==='Круг с контражуром').querySelector('.led-pick');
  const fileInput=document.querySelector('#led-file'); let savedFile=null;
  const displayFile=()=>{document.querySelector('#led-file-state').textContent=(fileInput.files[0]||savedFile)?.name||'';document.querySelector('#led-file-remove').hidden=!(fileInput.files[0]||savedFile);};
  fileInput.addEventListener('change',()=>{const f=fileInput.files[0];fileInput.setCustomValidity(f&&(!/\.(pdf|jpe?g|png)$/i.test(f.name)||!f.size||f.size>1048576)?'Выберите PDF, JPG или PNG до 1 МБ.':'');displayFile();fileInput.reportValidity();});
  document.querySelector('#led-file-remove').addEventListener('click',()=>{fileInput.value='';fileInput.setCustomValidity('');savedFile=null;displayFile();});
  const updateShape = () => {
    const d=selected.dataset, round=d.sizeMode==='diameter';
    ['variant','shape','kind'].forEach(k=>form.elements[k].value=d[k]);
    const rgb=!!selected.closest('.led-card').querySelector('.led-rgb-lights');
    Array.from(form.elements.light.options).forEach(o=>{if(o.value.startsWith('RGB')){o.hidden=!rgb;o.disabled=!rgb;}});
    if(!rgb&&form.elements.light.value.startsWith('RGB'))form.elements.light.value='Нейтральный';
    form.elements.width.min=d.minWidth;
    form.elements.height.min=d.minHeight;
    form.elements.height.required=!round;form.elements.height.disabled=round;
    document.querySelector('[data-height-label]').hidden=round;
    document.querySelector('[data-width-title]').textContent=round?'Диаметр, мм':d.shape==='Фигурная'?'Габаритная ширина, мм':'Ширина, мм';
    document.querySelector('[data-height-title]').textContent=d.shape==='Фигурная'?'Габаритная высота, мм':'Высота, мм';
    form.elements.width.placeholder='От '+d.minWidth+' мм';form.elements.height.placeholder='От '+d.minHeight+' мм';
  };
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
      editing = null; selected=pick; form.elements.width.value='';form.elements.height.value=''; savedFile=null;fileInput.value="";fileInput.setCustomValidity("");displayFile();
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
    updateShape();
    if (!form.reportValidity()) return;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const quote = await window.AGMQuoteReady;
      if (!quote) throw new Error('Расчёт ещё загружается. Попробуйте снова.');
      const data = Object.fromEntries(new FormData(form));
      data.extras = new FormData(form).getAll('extras');
      for (const key of ['width', ...(selected.dataset.sizeMode === 'diameter' ? [] : ['height']), 'quantity']) {
        if (!/^\d+$/.test(data[key]) || !Number.isSafeInteger(Number(data[key])) || Number(data[key]) < 1) throw new Error('Размеры и количество укажите целыми положительными числами.');
      }
      if(+data.width < +selected.dataset.minWidth || (selected.dataset.sizeMode!=='diameter' && +data.height < +selected.dataset.minHeight))throw Error('Размер меньше допустимого для выбранной модели.');
      if(fileInput.files[0]){const f=fileInput.files[0];const contents=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Не удалось прочитать файл.'));r.readAsDataURL(f);});savedFile={name:f.name,base64:contents.split(',')[1]};}
      labels.width=selected.dataset.sizeMode==='diameter'?'Диаметр, мм':'Ширина по габариту, мм';
      const id = editing || 'led-' + crypto.randomUUID();
      let summary = Object.entries(labels).filter(([key]) => data[key]).map(([key,label]) => label + ': ' + data[key]).join('\n') + '\nДополнительно: ' + (data.extras.join(', ') || 'не выбрано') + '\nРазмеры, электрическая часть и комплектация требуют согласования перед изготовлением.';
      if(savedFile)summary+='\nПриложение: '+savedFile.name;
      quote.store.put({type:'mirror',id,title:data.variant,summary,errors:[],data:{led:data,sketch:savedFile,image:preview.getAttribute('src')},editUrl:'/zerkala-s-podsvetkoj/?led='+encodeURIComponent(id)+'#project-brief'});
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
    selected=cards.map(c=>c.querySelector('.led-pick')).find(p=>p.dataset.variant===item.data.led.variant)||selected;
    savedFile=item.data.sketch||null;displayFile();
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
