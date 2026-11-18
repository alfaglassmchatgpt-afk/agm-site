(async () => {
  const dialog = document.createElement('dialog');
  dialog.id = 'shelf-editor';
  dialog.innerHTML = `
    <form>
      <div class="shelf-dialog-top"><h2>Параметры полки</h2><button type="button" data-close aria-label="Закрыть параметры">×</button></div>
      <p data-material></p>
      <div class="shelf-fields">
        <label>Форма<select name="shape"></select></label>
        <label>Толщина, мм<select name="thickness"></select></label>
        <label data-linear>Ширина / нижнее основание, мм<input name="width" type="number" min="1" step="1" required></label>
        <label data-linear>Глубина, мм<input name="height" type="number" min="1" step="1" required></label>
        <label data-round hidden>Диаметр исходного круга, мм<input name="diameter" type="number" min="300" step="1"></label>
        <label data-trapezoid hidden>Верхнее основание, мм<input name="topWidth" type="number" min="1" step="1"></label>
        <label>Количество, шт.<input name="quantity" type="number" min="3" max="9999" step="1" required></label>
      </div>
      <fieldset data-corners><legend>Углы — вид сверху</legend><p>0 — угол 90°. Скругление от 1 мм. Каждый угол можно настроить отдельно.</p><div class="shelf-fields">
        <label>Левый верхний, мм<input name="r0" type="number" min="0" step="1"></label>
        <label>Правый верхний, мм<input name="r1" type="number" min="0" step="1"></label>
        <label>Левый нижний, мм<input name="r3" type="number" min="0" step="1"></label>
        <label>Правый нижний, мм<input name="r2" type="number" min="0" step="1"></label>
      </div><p data-radius-limit></p></fieldset>
      <p data-dimensions></p>
      <p>Кромка — полированная. Минимальные габариты — 180 × 400 мм, для круга — Ø 300 мм.</p>
      <label>Отверстия, технические вырезы и пожелания<textarea name="note" maxlength="1200" rows="2"></textarea></label>
      <p data-error role="alert"></p>
      <button type="submit">Добавить в мой расчёт</button>
    </form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  let quote, shelf, entryId, opener;
  const model = AGMShelfModel;
  Object.entries(model.shapes).forEach(([value,label]) => form.elements.shape.add(new Option(label,value)));
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  dialog.addEventListener('close',()=>opener?.focus());
  function read() {
    return {...shelf,shape:form.elements.shape.value,thickness:form.elements.thickness.value,
      width:Number(form.elements.width.value),height:Number(form.elements.height.value),
      diameter:Number(form.elements.diameter.value),topWidth:Number(form.elements.topWidth.value),
      quantity:Number(form.elements.quantity.value),note:form.elements.note.value.trim(),
      radii:[0,1,2,3].map(i=>Number(form.elements['r'+i].value))};
  }
  function update() {
    const s=read(), round=['circle','semicircle','quarter'].includes(s.shape);
    for (const label of dialog.querySelectorAll('[data-linear]')) {
      label.hidden=round;
      label.querySelector('input').disabled=round;
    }
    dialog.querySelector('[data-round]').hidden=!round;
    form.elements.diameter.disabled=!round;
    form.elements.diameter.required=round;
    form.elements.diameter.step=s.shape==='circle'?'1':'2';
    dialog.querySelector('[data-trapezoid]').hidden=s.shape!=='trapezoid';
    form.elements.topWidth.disabled=s.shape!=='trapezoid';
    dialog.querySelector('[data-corners]').hidden=s.shape!=='rectangle';
    for(let i=0;i<4;i++) {
      form.elements['r'+i].disabled=s.shape!=='rectangle';
      form.elements['r'+i].max=model.radiusLimit(s);
    }
    dialog.querySelector('[data-radius-limit]').textContent='При этих размерах максимальный радиус каждого угла — '+model.radiusLimit(s)+' мм.';
    dialog.querySelector('[data-dimensions]').textContent='Габариты полки: '+model.dimensions(s).join(' × ')+' мм.';
    dialog.querySelector('[data-error]').textContent='';
  }
  function open(id, existing) {
    opener=document.activeElement;
    entryId=existing?.id || crypto.randomUUID();
    shelf=existing?.data?.shelf || {preset:id,...model.presets[id],width:400,height:180,diameter:400,topWidth:320,quantity:3,thickness:'4',note:'',radii:[0,0,0,0],...model.presets[id]};
    const material=quote.materials[shelf.material];
    if(!material) throw Error('Материал отсутствует в каталоге.');
    dialog.querySelector('[data-material]').textContent=material.title;
    form.elements.thickness.replaceChildren(...AGMOrderModel.thicknesses(material,'standard').filter(t=>t!=='unknown').map(t=>new Option(t,t)));
    for(const key of ['shape','thickness','width','height','diameter','topWidth','quantity','note']) form.elements[key].value=shelf[key];
    shelf.radii.forEach((r,i)=>form.elements['r'+i].value=r);
    dialog.querySelector('[type=submit]').textContent=existing?'Сохранить изменения':'Добавить в мой расчёт';
    update();
    dialog.showModal();
  }
  form.addEventListener('input',update);
  form.addEventListener('change',update);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    try {
      const s=read(), material=quote.materials[s.material];
      const errors=model.validate(s,material,AGMOrderModel);
      if(errors.length) throw Error(errors.join(' '));
      const [width,height]=model.dimensions(s);
      const shapeText = [
        'Полка: '+model.shapes[s.shape],
        ['circle','semicircle','quarter'].includes(s.shape)?'Диаметр исходного круга: '+s.diameter+' мм':'',
        s.shape==='rectangle'?'Радиусы углов (левый верхний, правый верхний, правый нижний, левый нижний): '+s.radii.join(' / ')+' мм; 0 = 90°':'',
        s.shape==='trapezoid'?'Верхнее основание: '+s.topWidth+' мм; нижнее: '+s.width+' мм. Трапеция симметричная.':'',
        s.note
      ].filter(Boolean).join('\n');
      const straight=s.shape==='rectangle'&&s.radii.every(r=>r===0);
      const data=AGMOrderModel.normalize({id:entryId,material:s.material,base:'standard',thickness:s.thickness,width,height,quantity:s.quantity,ops:[straight?'cut':'shape','polish'],note:shapeText},quote.materials,()=>entryId);
      const entry=AGMQuoteModel.material(data,quote.materials,quote.operations);
      if(entry.errors.length) throw Error(entry.errors.join(' '));
      entry.title='Полка · '+material.title;
      entry.data.shelf=s;
      entry.editUrl='/?shelf-edit='+encodeURIComponent(entryId);
      quote.store.put(entry);
      dialog.close();
      quote.open();
    } catch(error) { dialog.querySelector('[data-error]').textContent=error.message; }
  });
  try {
    quote=await window.AGMQuoteReady;
    for(const [id,preset] of Object.entries(model.presets)) {
      const article=document.getElementById(id);
      const thicknessRow=[...article.querySelectorAll('dl div')].find(row=>row.querySelector('dt').textContent==='Толщина');
      thicknessRow.querySelector('dd').textContent=AGMOrderModel.thicknesses(quote.materials[preset.material],'standard').join(', ')+' мм';
      const add=document.createElement('button');
      add.className='shelf-add';
      add.textContent='Добавить в мой расчёт';
      add.onclick=()=>{try{open(id);}catch(error){add.textContent=error.message;}};
      article.querySelector('figure').append(add);
    }
    const editId=new URLSearchParams(location.search).get('shelf-edit');
    if(editId) {
      const entry=quote.store.all().find(item=>item.id===editId && item.data?.shelf);
      if(entry) open(entry.data.shelf.preset,entry);
    }
  } catch(error) {
    const feedback=document.createElement('p');
    feedback.setAttribute('role','alert');
    feedback.textContent='Не удалось загрузить каталог: '+error.message;
    document.querySelector('#shelves').before(feedback);
  }
})();
