(async () => {
  const dialog = document.createElement('dialog');
  dialog.id = 'shelf-editor';
  dialog.innerHTML = `
    <form>
      <div class="shelf-dialog-top"><h2>Параметры полки</h2><button type="button" data-close aria-label="Закрыть параметры">×</button></div>
      <div class="shelf-material-heading"><p data-material></p><div data-material-image role="img"></div></div>
      <div class="shelf-fields">
        <label>Форма<select name="shape"></select></label>
        <label>Толщина, мм<select name="thickness"></select></label>
        <label data-linear>Ширина / нижнее основание, мм<input name="width" type="number" min="1" step="1" required></label>
        <label data-linear>Глубина, мм<input name="height" type="number" min="1" step="1" required></label>
        <label data-round hidden>Диаметр исходного круга, мм<input name="diameter" type="number" min="300" step="1"></label>
        <label data-trapezoid hidden>Верхнее основание, мм<input name="topWidth" type="number" min="1" step="1"></label>
        <label>Количество, шт.<input name="quantity" type="number" min="3" max="9999" step="1" required></label>
      </div>
      <fieldset class="shelf-diagram"><legend>Схема полки — вид сверху</legend><button type="button" data-corner-lock aria-pressed="true"></button><p data-corners>0 — без скругления. Радиус от 1 мм.</p><div class="corner-layout"><svg viewBox="0 0 400 240" role="img" aria-label="Схема полки"><path data-outline></path></svg>
        <label data-corners class="corner tl"><span>Левый верхний, мм</span><input aria-label="Левый верхний, мм" name="r0" type="number" min="0" step="1"></label>
        <label data-corners class="corner tr"><span>Правый верхний, мм</span><input aria-label="Правый верхний, мм" name="r1" type="number" min="0" step="1"></label>
        <label data-corners class="corner bl"><span>Левый нижний, мм</span><input aria-label="Левый нижний, мм" name="r3" type="number" min="0" step="1"></label>
        <label data-corners class="corner br"><span>Правый нижний, мм</span><input aria-label="Правый нижний, мм" name="r2" type="number" min="0" step="1"></label>
      </div><p data-corners data-radius-limit></p></fieldset>
      <p data-dimensions></p>
      <p>Кромка — полированная. Минимальные габариты — 180 × 400 мм, для круга — Ø 300 мм.</p>
      <label>Отверстия, технические вырезы и пожелания<textarea name="note" maxlength="1200" rows="2"></textarea></label>
      <p data-error role="alert"></p>
      <button type="submit">Добавить в мой расчёт</button>
    </form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  let quote, shelf, entryId, opener;
  let cornersLocked = true;
  const cornerLock = dialog.querySelector('[data-corner-lock]');
  function renderCornerLock() {
    cornerLock.textContent = cornersLocked ? '🔒 Углы связаны' : '🔓 Углы отдельно';
    cornerLock.setAttribute('aria-pressed', String(cornersLocked));
    cornerLock.title = cornersLocked ? 'Открыть замок: настраивать углы отдельно' : 'Закрыть замок: изменение любого угла применится ко всем';
  }
  cornerLock.onclick = () => {
    cornersLocked = !cornersLocked;
    renderCornerLock();
  };
  const model = AGMShelfModel;
  Object.entries(model.shapes).forEach(([value,label]) => form.elements.shape.add(new Option(label,value)));
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  dialog.addEventListener('close',()=>opener?.focus());
  function read() {
    return {...shelf,shape:form.elements.shape.value,thickness:form.elements.thickness.value,
      width:Number(form.elements.width.value),height:Number(form.elements.height.value),
      diameter:Number(form.elements.diameter.value),topWidth:Number(form.elements.topWidth.value),
      quantity:Number(form.elements.quantity.value),note:form.elements.note.value.trim(),cornersLocked,
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

    const corners=model.cornerIndices(s);
    dialog.querySelectorAll('[data-corners]').forEach(node=>node.hidden=!corners.length);
    cornerLock.hidden=!corners.length;
    dialog.querySelectorAll('label[data-corners]').forEach(label=>label.hidden=!corners.includes(Number(label.querySelector('input').name.slice(1))));

    for(let i=0;i<4;i++) {
      form.elements['r'+i].disabled=!corners.includes(i);
      form.elements['r'+i].max=model.radiusLimit(s);
    }
    dialog.querySelector('[data-radius-limit]').textContent='При этих размерах максимальный радиус каждого угла — '+model.radiusLimit(s)+' мм.';
    dialog.querySelector('[data-dimensions]').textContent='Габариты полки: '+model.dimensions(s).join(' × ')+' мм.';

    const max=quote.materials[s.material].maxSize || {width:10000,height:10000};
    form.elements.width.min=s.height>=400?180:400;
    form.elements.height.min=s.width>=400?180:400;
    form.elements.width.max=max.width;
    form.elements.height.max=max.height;
    form.elements.diameter.min={circle:300,semicircle:400,quarter:800}[s.shape]||300;
    form.elements.diameter.max=s.shape==='quarter'?2*Math.min(max.width,max.height):Math.min(max.width,max.height);
    form.elements.topWidth.max=s.width;
    for(let i=0;i<4;i++) form.elements['r'+i].value=Math.min(Number(form.elements['r'+i].value)||0,model.radiusLimit(s));
    drawScheme(read());
    dialog.querySelector('[data-error]').textContent='';

  }
  function open(id, existing) {
    opener=document.activeElement;
    entryId=existing?.id || crypto.randomUUID();
    shelf=existing?.data?.shelf || {preset:id,...model.presets[id],width:400,height:180,diameter:400,topWidth:320,quantity:3,thickness:'4',note:'',radii:[0,0,0,0],...model.presets[id]};
    const material=quote.materials[shelf.material];
    if(!material) throw Error('Материал отсутствует в каталоге.');
    dialog.querySelector('[data-material]').textContent=material.title;
    const materialImage=dialog.querySelector('[data-material-image]');
    materialImage.style.backgroundPosition='0% '+Object.keys(model.presets).indexOf(shelf.preset)*20+'%';
    materialImage.setAttribute('aria-label','Полка из карточки: '+material.title);
    form.elements.thickness.replaceChildren(...AGMOrderModel.thicknesses(material,'standard').filter(t=>t!=='unknown').map(t=>new Option(t,t)));
    for(const key of ['shape','thickness','width','height','diameter','topWidth','quantity','note']) form.elements[key].value=shelf[key];
    shelf.radii.forEach((r,i)=>form.elements['r'+i].value=r);
    cornersLocked = shelf.cornersLocked ?? shelf.radii.every(r=>r===shelf.radii[0]);
    renderCornerLock();
    dialog.querySelector('[type=submit]').textContent=existing?'Сохранить изменения':'Добавить в мой расчёт';
    update();
    dialog.showModal();
  }
  form.addEventListener('input',event=>{
    if(cornersLocked && /^r[0-3]$/.test(event.target.name)) {
      for(let i=0;i<4;i++) form.elements['r'+i].value=event.target.value;
    }
    update();
  });

  function constrainInput(event) {
    const input=event.target;
    if(input.name==='shape'){
      update();
      for(const field of ['width','height','diameter','topWidth']){
        const n=form.elements[field];
        if(!n.disabled) n.value=Math.min(Number(n.max)||10000,Math.max(Number(n.min)||1,Number(n.value)||0));
      }
    }
    if(input.type==='number'){
      const step=Number(input.step)||1, min=Number(input.min)||0;
      const max=Number(input.max)||10000;
      input.value=Math.min(max,Math.max(min,Math.round(Number(input.value)/step)*step));
      if(cornersLocked && /^r[0-3]$/.test(input.name)) {
        for(let i=0;i<4;i++) form.elements['r'+i].value=input.value;
      }
    }
    update();
  }
  form.addEventListener('change',constrainInput);
  form.addEventListener('focusout',constrainInput);
  function drawScheme(s) {
    const [w,h]=model.dimensions(s);
    const scale=Math.min(250/Math.max(1,w),130/Math.max(1,h));
    const W=w*scale,H=h*scale,x=(400-W)/2,y=(240-H)/2;
    let d;
    if(s.shape==='circle') {
      d='M '+x+' 120 a '+W/2+' '+H/2+' 0 1 0 '+W+' 0 a '+W/2+' '+H/2+' 0 1 0 '+(-W)+' 0';

    } else if(s.shape==='semicircle'||s.shape==='quarter'){
      const R=s.shape==='semicircle'?W/2:W;
      const cx=s.shape==='semicircle'?x+R:x;
      const right=s.radii[1]*scale;
      const left=s.radii[s.shape==='semicircle'?0:3]*scale;
      const tangent=r=>{
        const c=Math.sqrt(Math.max(0,R*R-2*R*r));
        return {c,u:c*R/(R-r),v:r*R/(R-r)};
      };
      const a=tangent(right),b=tangent(left);
      const arc=(r,px,py)=>r>0?' A '+r+' '+r+' 0 0 1 '+px+' '+py:' L '+px+' '+py;
      if(s.shape==='semicircle'){
        d='M '+(cx-b.c)+' '+y+' L '+(cx+a.c)+' '+y+arc(right,cx+a.u,y+a.v)
          +' A '+R+' '+R+' 0 0 1 '+(cx-b.u)+' '+(y+b.v)+arc(left,cx-b.c,y)+' Z';
      } else {
        const corner=s.radii[0]*scale;
        d='M '+(x+corner)+' '+y+' L '+(x+a.c)+' '+y+arc(right,x+a.u,y+a.v)
          +' A '+R+' '+R+' 0 0 1 '+(x+b.v)+' '+(y+b.u)+arc(left,x,y+b.c)
          +' L '+x+' '+(y+corner)+arc(corner,x+corner,y)+' Z';
      }
    } else {
      const inset=s.shape==='trapezoid'?(W-s.topWidth*scale)/2:0;
      const points=[[x+inset,y],[x+W-inset,y],[x+W,y+H],[x,y+H]];
      const rounded=points.map((p,i)=>{
        const prev=points[(i+3)%4],next=points[(i+1)%4];
        const u=[prev[0]-p[0],prev[1]-p[1]],v=[next[0]-p[0],next[1]-p[1]];
        const ul=Math.hypot(...u),vl=Math.hypot(...v);
        const angle=Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/(ul*vl))));
        const radius=s.radii[i]*scale,distance=radius/Math.tan(angle/2);
        return {radius,a:[p[0]+u[0]*distance/ul,p[1]+u[1]*distance/ul],b:[p[0]+v[0]*distance/vl,p[1]+v[1]*distance/vl]};
      });
      d='M '+rounded[0].a.join(' ');
      rounded.forEach((p,i)=>{
        if(i) d+=' L '+p.a.join(' ');
        d+=p.radius>0?' A '+p.radius+' '+p.radius+' 0 0 1 '+p.b.join(' '):' L '+p.b.join(' ');
      });
      d+=' Z';
    }
    dialog.querySelector('[data-outline]').setAttribute('d',d);
  }

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
        model.cornerIndices(s).length?'Радиусы углов: '+model.cornerIndices(s).map(i=>['левый верхний','правый верхний','правый нижний','левый нижний'][i]+' '+s.radii[i]+' мм').join('; ')+'; 0 = без скругления':'',
        s.shape==='trapezoid'?'Верхнее основание: '+s.topWidth+' мм; нижнее: '+s.width+' мм. Трапеция симметричная.':'',
        s.note
      ].filter(Boolean).join('\n');
      const straight=s.shape==='rectangle'&&s.radii.every(r=>r===0);
      const data=AGMOrderModel.normalize({id:entryId,material:s.material,base:'standard',thickness:s.thickness,width,height,quantity:s.quantity,ops:[straight?'cut':'shape','polish'],note:shapeText},quote.materials,()=>entryId);
      const entry=AGMQuoteModel.material(data,quote.materials,quote.operations);
      if(entry.errors.length) throw Error(entry.errors.join(' '));
      entry.title='Полка · '+material.title;
      entry.data.shelf=s;
      entry.preview={url:'/assets/editorial-grid.png',position:'0% '+Object.keys(model.presets).indexOf(s.preset)*20+'%',size:'200% 600%',alt:material.title};

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

