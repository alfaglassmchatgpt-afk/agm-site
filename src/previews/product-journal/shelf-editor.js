(async () => {
  let shelfOutline;
  const mirror=window.AGMCatalogProduct?.kind==='mirror';
  const noun=mirror?'Зеркало':'Полка';
  const dialog = document.createElement('dialog');
  dialog.id = 'shelf-editor';
  dialog.innerHTML = `
    <form>
      <div class="shelf-dialog-top"><h2>Параметры ${mirror?'зеркала':'полки'}</h2><button type="button" data-close aria-label="Закрыть параметры">×</button></div>
      <div class="shelf-material-heading"><p data-material></p><div data-material-image role="img"></div></div>
      <div class="shelf-fields">
        <label>Форма<select name="shape"></select></label>
        <label>Толщина, мм<select name="thickness"></select></label>
        <label data-linear>${mirror?'Ширина':'Ширина / нижнее основание'}, мм<input name="width" type="number" min="1" step="1" required></label>
        <label data-linear>${mirror?'Высота':'Глубина'}, мм<input name="height" type="number" min="1" step="1" required></label>
        <label data-round hidden>Диаметр исходного круга, мм<input name="diameter" type="number" min="300" step="1"></label>
        <label data-trapezoid hidden>Верхнее основание, мм<input name="topWidth" type="number" min="1" step="1"></label>
        <label>Количество, шт.<input name="quantity" type="number" min="${mirror?1:3}" max="9999" step="1" required></label>
      </div>
      <fieldset class="shelf-diagram"><legend>${mirror?'Схема зеркала — вид спереди':'Схема полки — вид сверху'}</legend><button type="button" data-corner-lock aria-pressed="true"></button><p data-corners>0 — без скругления. Радиус от 1 мм.</p><div class="corner-layout"><svg viewBox="0 0 400 240" role="img" aria-label="Схема изделия"><path data-outline></path></svg>
        <label data-corners class="corner tl"><span>Левый верхний, мм</span><input aria-label="Левый верхний, мм" name="r0" type="number" min="0" step="1"></label>
        <label data-corners class="corner tr"><span>Правый верхний, мм</span><input aria-label="Правый верхний, мм" name="r1" type="number" min="0" step="1"></label>
        <label data-corners class="corner bl"><span>Левый нижний, мм</span><input aria-label="Левый нижний, мм" name="r3" type="number" min="0" step="1"></label>
        <label data-corners class="corner br"><span>Правый нижний, мм</span><input aria-label="Правый нижний, мм" name="r2" type="number" min="0" step="1"></label>
      </div><p data-corners data-radius-limit></p></fieldset>
      <p data-dimensions></p>
      <p>${mirror?'':'Кромка — полированная. '}${mirror?'Прямоугольное зеркало — от 300 × 300 мм; овал и арка — от 800 × 600 мм, круг — от Ø 300 мм.':'Минимальные габариты — 180 × 400 мм, для круга — Ø 300 мм.'}</p>
      ${mirror?`<fieldset data-processing><legend>Обработка зеркала</legend><div class="mirror-operations"></div><p data-processing-hint role="status"></p>
      <label data-bevel hidden>Ширина фацета, мм<select name="bevelWidth"><option value="">Выберите</option>${[5,10,15,20,25,30,35].map(n=>`<option>${n}</option>`).join('')}</select></label>
      <p data-bevel hidden>Фацет по всему периметру. Другие стороны укажите в пожеланиях.</p>
      <div data-drill hidden class="shelf-fields"><label>Диаметр отверстий, мм<input name="holeDiameter" type="number" min="1" step="1"></label><label>Отверстий на изделие<input name="holeCount" type="number" min="1" max="9999" step="1" value="1"></label><label><input name="holeUnknown" type="checkbox"> Диаметр уточнить</label><label>Фото или схема отверстий<input name="holeFile" type="file" accept=".pdf,.jpg,.jpeg,.png"><small>PDF, JPG или PNG, до 1 МБ. Файл получит менеджер вместе с заявкой.</small></label><div><span data-file-name></span> <button type="button" data-file-remove hidden>Удалить файл</button></div></div>
      <label><input name="packaging" type="checkbox"> Упаковка в картон</label><label><input name="delivery" type="checkbox"> Доставка</label><label data-address hidden>Адрес доставки<input name="deliveryAddress" maxlength="500"></label></fieldset>`:''}
      <label>Отверстия, технические вырезы и пожелания<textarea name="note" maxlength="1200" rows="2"></textarea></label>
      <p data-error role="alert"></p>
      <button type="submit">Добавить в мой расчёт</button>
    </form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  let quote, shelf, entryId, opener;
  let cornersLocked = true;
  let savedSketch=null;
  function showSketch(){
    dialog.querySelector('[data-file-name]').textContent=savedSketch?.name||'';
    dialog.querySelector('[data-file-remove]').hidden=!savedSketch;
  }
  if(mirror){
    dialog.querySelector('[data-file-remove]').onclick=()=>{savedSketch=null;form.elements.holeFile.value='';form.elements.holeFile.setCustomValidity('');showSketch();};
    form.elements.holeFile.onchange=()=>{
      const file=form.elements.holeFile.files[0];
      const invalid=file && (!/\.(pdf|jpe?g|png)$/i.test(file.name)||file.size>1048576||!file.size);
      form.elements.holeFile.setCustomValidity(invalid?'Выберите PDF, JPG или PNG до 1 МБ.':'');
      if(invalid)form.elements.holeFile.reportValidity();
    };
  }
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
  Object.entries(model.shapes).filter(([k])=>mirror?['rectangle','circle','ellipse','arch'].includes(k):!['ellipse','arch'].includes(k)).forEach(([value,label]) => form.elements.shape.add(new Option(label,value)));
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  dialog.addEventListener('close',()=>opener?.focus());
  function read() {
    return {...shelf,shape:form.elements.shape.value,thickness:form.elements.thickness.value,
      width:Number(form.elements.width.value),height:Number(form.elements.height.value),
      diameter:Number(form.elements.diameter.value),topWidth:Number(form.elements.topWidth.value),
      quantity:Number(form.elements.quantity.value),...(mirror?{ops:[...dialog.querySelectorAll('[data-operation]:checked')].map(n=>n.value),bevel:{width:form.elements.bevelWidth.value,scope:'all'},drill:{rows:[{diameter:form.elements.holeDiameter.value,count:form.elements.holeCount.value,unknown:form.elements.holeUnknown.checked}],location:form.elements.note.value.trim()},packaging:form.elements.packaging.checked,delivery:form.elements.delivery.checked,deliveryAddress:form.elements.deliveryAddress.value}:{}),note:form.elements.note.value.trim(),cornersLocked,
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
    dialog.querySelector('[data-dimensions]').textContent='Габариты: '+model.dimensions(s).join(' × ')+' мм.';

    const max=quote.materials[s.material].maxSize || {width:10000,height:10000};
    form.elements.width.min=mirror?(s.shape==='rectangle'?300:(s.height>=800?600:800)):(s.height>=400?180:400);
    form.elements.height.min=mirror?(s.shape==='rectangle'?300:Math.max(s.width>=800?600:800,s.shape==='arch'?Math.ceil(s.width/2):0)):(s.width>=400?180:400);
    form.elements.width.max=max.width;
    form.elements.height.max=max.height;
    form.elements.diameter.min=mirror?300:({circle:300,semicircle:400,quarter:800}[s.shape]||300);
    form.elements.diameter.max=s.shape==='quarter'?2*Math.min(max.width,max.height):Math.min(max.width,max.height);
    form.elements.topWidth.max=s.width;
    for(let i=0;i<4;i++) form.elements['r'+i].value=Math.min(Number(form.elements['r'+i].value)||0,model.radiusLimit(s));
    if(mirror){
      const allowed=model.availableOperations(s,quote.materials[s.material],AGMOrderModel);
      let removedEdge=false;
      dialog.querySelectorAll('[data-operation]').forEach(input=>{input.disabled=!allowed.includes(input.value);input.closest('label').hidden=input.disabled;if(input.disabled&&input.checked){if(input.value==='bevel')removedEdge=true;input.checked=false;}});
      if(removedEdge)dialog.querySelector('[data-operation="polish"]').checked=true;
      const ops=read().ops;
      dialog.querySelectorAll('[data-bevel]').forEach(n=>n.hidden=!ops.includes('bevel'));
      form.elements.bevelWidth.required=ops.includes('bevel');
      dialog.querySelector('[data-drill]').hidden=!ops.includes('drill');
      form.elements.holeDiameter.required=ops.includes('drill')&&!form.elements.holeUnknown.checked;
      form.elements.holeDiameter.disabled=!ops.includes('drill')||form.elements.holeUnknown.checked;
      form.elements.holeCount.disabled=!ops.includes('drill');
      form.elements.holeFile.disabled=!ops.includes('drill');
      dialog.querySelector('[data-address]').hidden=!s.delivery;
      form.elements.deliveryAddress.required=s.delivery;
      dialog.querySelector('[data-processing-hint]').textContent=model.straight(s)?'Фацет доступен только без скруглений.':'Кромка этой формы: полированная или шлифованная. Фацет недоступен.';
    }
    drawScheme(read());
    dialog.querySelector('[data-error]').textContent='';

  }
  function open(id, existing) {
    opener=document.activeElement;
    entryId=existing?.id || crypto.randomUUID();
    shelf=existing?.data?.shelf || {preset:id,...model.presets[id],width:400,height:180,diameter:400,topWidth:320,quantity:3,thickness:'4',note:'',radii:[0,0,0,0],...model.presets[id]};
    const material=quote.materials[shelf.material];
    if(!material) throw Error('Материал отсутствует в каталоге.');
    dialog.querySelector('[data-material]').textContent=material.title+(shelf.base&&shelf.base!=='standard'?' · '+material.variants[shelf.base]:'');
    const materialImage=dialog.querySelector('[data-material-image]');
    materialImage.style.backgroundPosition='0% '+Object.keys(model.presets).indexOf(shelf.preset)*20+'%';
    if(shelf.preview){materialImage.style.backgroundImage=`url(${shelf.preview.url})`;materialImage.style.backgroundPosition=shelf.preview.position;materialImage.style.backgroundSize=shelf.preview.size;}
    materialImage.setAttribute('aria-label',noun+' из карточки: '+material.title);
    form.elements.thickness.replaceChildren(...AGMOrderModel.thicknesses(material,shelf.base||'standard').filter(t=>t!=='unknown').map(t=>new Option(t,t)));
    for(const key of ['shape','thickness','width','height','diameter','topWidth','quantity','note']) form.elements[key].value=shelf[key];
    if(mirror){
      const box=dialog.querySelector('.mirror-operations');box.replaceChildren();
      const all=AGMOrderModel.operations(material,shelf.thickness).filter(id=>['polish','grind','bevel','drill'].includes(id));
      savedSketch=existing?.data?.sketch||null;form.elements.holeFile.value='';form.elements.holeFile.setCustomValidity('');showSketch();
      for(const id of all){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=id;input.dataset.operation=id;input.checked=(shelf.ops||['polish']).includes(id);label.append(input,document.createTextNode(quote.operations.find(op=>op.id===id)?.title||id));box.append(label);}
      form.elements.bevelWidth.value=shelf.bevel?.width||'';
      const hole=shelf.drill?.rows?.[0]||{};
      form.elements.holeDiameter.value=hole.diameter||'';form.elements.holeCount.value=hole.count||'1';form.elements.holeUnknown.checked=!!hole.unknown;
      form.elements.packaging.checked=!!shelf.packaging;form.elements.delivery.checked=!!shelf.delivery;form.elements.deliveryAddress.value=shelf.deliveryAddress||'';
    }
    shelf.radii.forEach((r,i)=>form.elements['r'+i].value=r);
    cornersLocked = shelf.cornersLocked ?? shelf.radii.every(r=>r===shelf.radii[0]);
    renderCornerLock();
    dialog.querySelector('[type=submit]').textContent=existing?'Сохранить изменения':'Добавить в мой расчёт';
    update();
    dialog.showModal();
  }
  form.addEventListener('input',event=>{
    if(event.target.matches('[data-operation]')&&event.target.checked&&['polish','grind','bevel'].includes(event.target.value))dialog.querySelectorAll('[data-operation]').forEach(n=>{if(n!==event.target&&['polish','grind','bevel'].includes(n.value))n.checked=false;});
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
    dialog.querySelector('[data-outline]').setAttribute('d',shelfOutline(s));
  }

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    try {
      const s=read(), material=quote.materials[s.material];
      const errors=model.validate(s,material,AGMOrderModel);
      if(errors.length) throw Error(errors.join(' '));
      const [width,height]=model.dimensions(s);
      const shapeText = [
        noun+': '+model.shapes[s.shape],
        ['circle','semicircle','quarter'].includes(s.shape)?'Диаметр исходного круга: '+s.diameter+' мм':'',
        model.cornerIndices(s).length?(model.cornerIndices(s).every(i=>s.radii[i]===0)?'Углы без скругления.':(mirror?'Углы (вид спереди): ':'Углы (вид сверху): ')+model.cornerIndices(s).map(i=>['левый верхний','правый верхний','правый нижний','левый нижний'][i]+' — '+(s.radii[i]===0?'без скругления':'скругление R '+s.radii[i]+' мм')).join('; ')):'',
        s.shape==='trapezoid'?'Верхнее основание: '+s.topWidth+' мм; нижнее: '+s.width+' мм. Трапеция симметричная.':'',
        s.note
      ].filter(Boolean).join('\n');
      const straight=s.shape==='rectangle'&&s.radii.every(r=>r===0);
      const data=AGMOrderModel.normalize({id:entryId,material:s.material,base:s.base||'standard',thickness:s.thickness,width,height,quantity:s.quantity,ops:[straight?'cut':'shape',...(s.ops||['polish'])],bevel:s.bevel,drill:s.drill,packaging:s.packaging,delivery:s.delivery,deliveryAddress:s.deliveryAddress,note:shapeText},quote.materials,()=>entryId);
      const entry=AGMQuoteModel.material(data,quote.materials,quote.operations);
      if(entry.errors.length) throw Error(entry.errors.join(' '));
      entry.title=noun+' · '+material.title+(s.base&&s.base!=='standard'?' · '+material.variants[s.base]:'');
      entry.data.shelf=s;
      if(mirror && s.ops.includes('drill')){
        const file=form.elements.holeFile.files[0];
        if(file){
          if(!form.elements.holeFile.reportValidity())return;
          const contents=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Не удалось прочитать файл.'));reader.readAsDataURL(file);});
          savedSketch={name:file.name,base64:contents.slice(contents.indexOf(',')+1)};
        }
        if(savedSketch){entry.data.sketch=savedSketch;entry.summary+='\nСхема отверстий: '+savedSketch.name;}
      }
      entry.preview=s.preview||{url:'/assets/editorial-grid.png',position:'0% '+Object.keys(model.presets).indexOf(s.preset)*20+'%',size:'200% 600%',alt:material.title};

      entry.editUrl=(mirror?'/mirrors.html':'/')+'?shelf-edit='+encodeURIComponent(entryId);
      quote.store.put(entry);
      dialog.close();
      quote.open();
    } catch(error) { dialog.querySelector('[data-error]').textContent=error.name==='QuotaExceededError'?'Недостаточно места в браузере. Уменьшите размер файла или удалите ненужные позиции расчёта.':error.message; }
  });
  try {
    quote=await window.AGMQuoteReady;
    shelfOutline=(await import('./shared/shelf-geometry.js')).outline;
    for(const [id,preset] of Object.entries(model.presets)) {
      const article=document.getElementById(id);
      const thicknessRow=[...article.querySelectorAll('dl div')].find(row=>row.querySelector('dt').textContent==='Толщина');
      thicknessRow.querySelector('dd').textContent=AGMOrderModel.thicknesses(quote.materials[preset.material],preset.base||'standard').join(', ')+' мм';
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

