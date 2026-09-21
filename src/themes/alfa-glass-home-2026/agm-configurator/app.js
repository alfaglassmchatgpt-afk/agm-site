(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const config=JSON.parse($('#agm-order-data').textContent), materials=config.materials, current=config.current;
  const ops=config.operations, opById=new Map(ops.map(o=>[o.id,o]));
  const key='agm-materials-request-v2', mirrorPage=true;
  const materialName=i=>materials[i.material].title;
  const baseName=i=>materials[i.material].variants[i.base];
  const thicknessName=i=>i.thickness==='unknown'?'толщина уточняется':i.thickness+' мм';
  const onThisPage=i=>i&&i.material===current;
  let state={items:[],active:null}, nextDraft={material:current,base:Object.keys(materials[current].variants)[0],thickness:materials[current].thicknesses[0]},opDialogId=null,returnFocus=null,files=[];
  const newId = () => Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
  const bevelWidths = ['5','10','15','20','25','30','35'];
  const clean = (v,n=500) => typeof v==='string'?v.slice(0,n):'';
  const hole = h => ({diameter:clean(h?.diameter,12),count:typeof h?.count==='string'?clean(h.count,5):'1',unknown:!!h?.unknown});
  const normalize=i=>AGMOrderModel.normalize(i,materials,newId);
  try { const saved=JSON.parse(localStorage.getItem(key)||localStorage.getItem('agm-materials-request-v1')); if(saved && Array.isArray(saved.items)){state.items=saved.items.slice(0,30).map(normalize).filter(Boolean);state.active=state.items.some(i=>i.id===saved.active)?saved.active:state.items[0]?.id||null;} } catch(e) {}
  const active = () => state.items.find(i=>i.id===state.active);
  function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch(e){toast('Браузер не сохраняет выбор. Скачайте заявку перед закрытием страницы.');}}
  let toastTimer;
  function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
  function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
  function itemLabel(i){return materialName(i)+' · '+thicknessName(i);}
  function dimensions(i){return i.unknown?'размеры уточнить':i.width&&i.height?i.width+' × '+i.height+' мм':'размеры не указаны';}
  function renderList(){
    $$('[data-count]').forEach(el=>el.textContent=state.items.length);
    $('#empty-cart').hidden=!!state.items.length;$('#cart-filled').hidden=!state.items.length;
    const list=$('#cart-list');list.replaceChildren();
    state.items.forEach((i,n)=>{const row=node('div',undefined,'cart-item'+(i.id===state.active?' active':''));
      const select=node('button',undefined,'select-item');select.type='button';select.dataset.selectItem=i.id;select.setAttribute('aria-pressed',String(i.id===state.active));select.append(node('strong',(n+1)+'. '+itemLabel(i)),node('span',baseName(i)),node('span',dimensions(i)+' · '+i.quantity+' шт.'));
      const del=node('button','×','delete-item');del.type='button';del.dataset.deleteItem=i.id;del.setAttribute('aria-label','Удалить изделие '+(n+1));row.append(select,del);list.append(row);
    });
  }
  function renderOps(){
    const i=active(), selected=i?.ops||[], target=materials[i?.material||current];
    const grid=$('.operation-grid'); grid.replaceChildren();
    target.operations.forEach(id=>{const op=opById.get(id),card=node('article',undefined,'operation');card.dataset.opCard=id;
      const icon=node('div',undefined,'operation-icon');icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+op.icon+'</svg>';
      const title=node('h3',op.title),actions=node('div',undefined,'operation-actions'),info=node('button','Что это?','text-btn'),toggle=node('button','+ В расчёт','btn toggle-op');
      info.type=toggle.type='button';info.dataset.info=id;info.setAttribute('aria-label','Подробнее: '+op.title);toggle.dataset.toggleOp=id;toggle.setAttribute('aria-label','В расчёт: '+op.title);actions.append(info,toggle);card.append(icon,title,actions);grid.append(card);
    });
    $('#operations-title').textContent='Обработка: '+target.title;
    if($('#operation-material-note'))$('#operation-material-note').textContent=target.note;

    $$('[data-op-card]').forEach(card=>{const yes=selected.includes(card.dataset.opCard);card.classList.toggle('selected',yes);const b=card.querySelector('[data-toggle-op]');b.setAttribute('aria-pressed',String(yes));b.textContent=yes?'✓ Добавлено':'+ В расчёт';});
    if($('#packaging'))$('#packaging').checked=!!i?.packaging;
    const ul=$('#selected-ops');ul.replaceChildren();
    const entries=selected.map(id=>({id,title:opById.get(id).title}));if(i?.packaging)entries.push({id:'packaging',title:'Упаковка в картон'});
    if(!entries.length)ul.append(node('li','Обработки пока не выбраны'));
    entries.forEach(o=>{const li=node('li');const b=node('button','×');b.type='button';b.dataset.removeOp=o.id;b.setAttribute('aria-label','Убрать: '+o.title);li.append(node('span',o.title),b);ul.append(li);});
  }
  function render(){
    renderList();renderOps();renderProcessing();$('#cart-error').hidden=true;
    const i=active(), selection=onThisPage(i)?i:nextDraft;
    if(i){$('#width').value=i.width;$('#height').value=i.height;$('#quantity').value=i.quantity;$('#unknown').checked=i.unknown;$('#width').disabled=i.unknown;$('#height').disabled=i.unknown;$('#item-note').value=i.note;$('#active-item-label').textContent='Параметры изделия '+(state.items.indexOf(i)+1);}
    if(mirrorPage){$$('input[name=base]').forEach(r=>r.checked=r.value===selection.base);$$('input[name=thickness]').forEach(r=>r.checked=r.value===selection.thickness);$('#variant-note').textContent=materialName(selection)+': '+baseName(selection)+', '+thicknessName(selection)+'.'+(i&&!onThisPage(i)?' В расчёте выбрано изделие другого материала. Нажмите «Добавить ещё изделие», чтобы добавить этот вариант.':'');$('#add-material').textContent=i?'Добавить ещё изделие →':'Добавить к расчёту →';}
  }
  const processing=node('div',undefined,'processing-options');
  $('#selected-ops').after(processing);
  function field(label,id,value,type='text') {
    const l=node('label',undefined,'field'), input=node(type==='textarea'?'textarea':'input');
    l.append(node('span',label));input.id=id;if(type!=='textarea')input.type=type;input.value=value;input.maxLength=type==='textarea'?1000:12;l.append(input);return [l,input];
  }
  function renderProcessing(){
    processing.replaceChildren();const i=active();if(!i)return;
    const commit=()=>{save();$('#cart-error').hidden=true;};
    if(i.ops.includes('bevel')){
      const box=node('fieldset',undefined,'processing-box');box.append(node('legend','Параметры фацета'));
      const l=node('label',undefined,'field');l.append(node('span','Ширина фацета, мм'));
      const select=node('select');select.id='bevel-width';
      [['','Выберите ширину'],...bevelWidths.map(w=>[w,w+' мм'])].forEach(([v,t])=>{const o=node('option',t);o.value=v;select.append(o);});select.value=i.bevel.width;
      select.addEventListener('change',()=>{i.bevel.width=select.value;commit();});l.append(select);box.append(l);
      const scopeLabel=node('label',undefined,'field');scopeLabel.append(node('span','Где выполнить фацет'));
      const scope=node('select');scope.id='bevel-scope';[['all','По всему периметру'],['sides','На отдельных сторонах']].forEach(([v,t])=>{const o=node('option',t);o.value=v;scope.append(o);});scope.value=i.bevel.scope;
      scope.addEventListener('change',()=>{i.bevel.scope=scope.value;commit();renderProcessing();$('#bevel-scope').focus();});scopeLabel.append(scope);box.append(scopeLabel);
      if(i.bevel.scope==='sides'){const [l,t]=field('Стороны фацета / ссылка на чертёж','bevel-sides',i.bevel.sides,'textarea');t.maxLength=500;t.placeholder='Например: верхняя и две боковые';t.addEventListener('input',()=>{i.bevel.sides=t.value;commit();});box.append(l);}
      box.append(node('p','Допустимость ширины для выбранного материала подтвердим при расчёте.','small muted'));processing.append(box);
    }
    if(i.ops.includes('drill')){
      const box=node('fieldset',undefined,'processing-box');box.append(node('legend','Параметры отверстий'),node('p','Количество указывайте на одно изделие. Для разных диаметров добавьте отдельные строки.','small muted'));
      i.drill.rows.forEach((r,n)=>{
        const row=node('div',undefined,'hole-row');row.append(node('strong','Отверстия — группа '+(n+1)));
        const [dl,d]=field('Диаметр, мм','hole-diameter-'+n,r.diameter,'number');d.min='0.1';d.step='any';d.disabled=r.unknown;d.inputMode='decimal';d.addEventListener('input',()=>{r.diameter=d.value;commit();});
        const [cl,c]=field('Количество на изделие','hole-count-'+n,r.count,'number');c.min='1';c.max='9999';c.step='1';c.inputMode='numeric';c.addEventListener('input',()=>{r.count=c.value;commit();updateTotal();});row.append(dl,cl);
        const unknown=node('label',undefined,'check-row'),check=node('input');check.type='checkbox';check.checked=r.unknown;check.id='hole-unknown-'+n;unknown.append(check,node('span','Диаметр не знаю — нужна консультация'));check.addEventListener('change',()=>{r.unknown=check.checked;d.disabled=r.unknown;commit();});row.append(unknown);
        const total=node('p',undefined,'small muted');function updateTotal(){const q=Number(i.quantity),c=Number(r.count);total.textContent=Number.isInteger(q)&&q>0&&Number.isInteger(c)&&c>0?'Всего: '+(q*c)+' отв. на '+q+' изд.':'Укажите количество отверстий и изделий.';}updateTotal();row.append(total);
        const del=node('button','Удалить группу','text-btn');del.type='button';del.setAttribute('aria-label','Удалить группу отверстий '+(n+1));del.addEventListener('click',()=>{i.drill.rows.splice(n,1);if(!i.drill.rows.length)i.drill.rows.push(hole({}));commit();renderProcessing();$('#add-hole-row').focus();});row.append(del);box.append(row);
      });
      const add=node('button','+ Добавить другой диаметр','text-btn');add.id='add-hole-row';add.type='button';add.disabled=i.drill.rows.length>=20;add.addEventListener('click',()=>{i.drill.rows.push(hole({}));commit();renderProcessing();$('#hole-diameter-'+(i.drill.rows.length-1)).focus();});box.append(add);
      const [l,t]=field('Расположение отверстий','hole-location',i.drill.location,'textarea');t.placeholder='Опишите расположение или укажите: по чертежу. Чертёж можно выбрать при подготовке заявки.';t.addEventListener('input',()=>{i.drill.location=t.value;commit();});box.append(l,node('p','Диаметры и отступы проверим по проекту.','small muted'));processing.append(box);
    }
  }
  function processingText(i){
    const text=[];
    if(i.ops.includes('bevel'))text.push('Фацет: '+(i.bevel.width?i.bevel.width+' мм':'ширина не указана')+', '+(i.bevel.scope==='all'?'по всему периметру':'отдельные стороны: '+i.bevel.sides));
    if(i.ops.includes('drill')){i.drill.rows.forEach(r=>text.push('Отверстия: '+(r.unknown?'диаметр уточнить':'Ø '+r.diameter+' мм')+' — '+r.count+' шт. на изделие; всего '+(Number(r.count)*Number(i.quantity))+' шт.'));text.push('Расположение отверстий: '+(i.drill.location||'уточнить / по чертежу'));}
    return text.length?'\n'+text.join('\n'):'';
  }
  function processingError(i){
    if(i.ops.includes('bevel')){if(!bevelWidths.includes(i.bevel.width))return 'Выберите ширину фацета.';if(i.bevel.scope==='sides'&&!i.bevel.sides.trim())return 'Укажите стороны фацета или напишите «по чертежу».';}
    if(i.ops.includes('drill'))for(const r of i.drill.rows){if(!r.unknown&&(!Number.isFinite(Number(r.diameter))||Number(r.diameter)<=0))return 'Укажите положительный диаметр отверстий или выберите консультацию.';if(!Number.isInteger(Number(r.count))||Number(r.count)<1||Number(r.count)>9999)return 'Количество отверстий на изделие должно быть целым числом от 1 до 9999.';}
    return null;
  }
  function addItem(){
    if(state.items.length>=30){toast('В одной заявке можно собрать до 30 изделий.');return null;}
    const selection={material:current,base:$('input[name=base]:checked').value,thickness:$('input[name=thickness]:checked').value};
    const item=normalize({id:newId(),material:selection.material,base:selection.base,thickness:selection.thickness,quantity:'1',ops:[]});state.items.push(item);state.active=item.id;save();render();return item;
  }
  function ensureItem(){return active()||addItem();}
  function toggleOp(id,onlyAdd=false){
    if(!opById.has(id))return;const i=ensureItem();if(!i||!materials[i.material].operations.includes(id))return;
    if(i.ops.includes(id)){if(!onlyAdd)i.ops=i.ops.filter(x=>x!==id);}
    else {const alternative={polish:'grind',grind:'polish'}[id];if(alternative&&i.ops.includes(alternative)){i.ops=i.ops.filter(x=>x!==alternative);toast('Для одной кромки выбран новый вид обработки. Разные стороны укажите в комментарии.');}i.ops.push(id);}
    save();render();
  }
  $('#cart-list').addEventListener('click',e=>{const select=e.target.closest('[data-select-item]'),del=e.target.closest('[data-delete-item]');if(select){state.active=select.dataset.selectItem;save();render();}if(del){state.items=state.items.filter(i=>i.id!==del.dataset.deleteItem);if(!active())state.active=state.items[0]?.id||null;save();render();}});
  $('#selected-ops').addEventListener('click',e=>{const b=e.target.closest('[data-remove-op]');if(!b||!active())return;if(b.dataset.removeOp==='packaging'){active().packaging=false;save();render();}else toggleOp(b.dataset.removeOp);});
  ['width','height','quantity'].forEach(id=>$('#'+id).addEventListener('input',e=>{if(active()){active()[id]=e.target.value;save();renderList();if(id==='quantity')renderProcessing();$('#cart-error').hidden=true;}}));
  $('#item-note').addEventListener('input',e=>{if(active()){active().note=e.target.value;save();}});
  $('#unknown').addEventListener('change',e=>{if(active()){active().unknown=e.target.checked;save();render();}});
  $$('[data-add-current]').forEach(b=>b.addEventListener('click',()=>{addItem();openCart();}));
  $('#add-another').addEventListener('click',()=>{addItem();toast('Добавлено новое изделие. У него свой набор обработок.');});
  if(mirrorPage){
    $('#add-material').addEventListener('click',()=>{addItem();toast('Изделие добавлено в «Мой расчёт»');openCart();});
    $$('input[name=base],input[name=thickness]').forEach(r=>r.addEventListener('change',()=>{const i=onThisPage(active())?active():nextDraft;i.base=$('input[name=base]:checked').value;i.thickness=$('input[name=thickness]:checked').value;save();render();}));
    $('.operation-grid').addEventListener('click',e=>{
      const toggle=e.target.closest('[data-toggle-op]'),b=e.target.closest('[data-info]');
      if(toggle){const id=toggle.dataset.toggleOp;toggleOp(id);$('.operation-grid [data-toggle-op="'+id+'"]')?.focus();toast('Выбор обновлён в «Мой расчёт»');}
      if(b){opDialogId=b.dataset.info;const op=opById.get(opDialogId);$('#op-title').textContent=op.title;$('#op-description').textContent=op.description;$('#op-note').textContent=op.note;$('#op-diagram').replaceChildren(b.closest('.operation').querySelector('svg').cloneNode(true));$('#op-add').textContent=active()?.ops.includes(op.id)?'Уже в расчёте':'Добавить к расчёту';$('#operation-dialog').showModal();}
    });
    $('#packaging').addEventListener('change',e=>{const checked=e.target.checked;const i=ensureItem();if(i){i.packaging=checked;save();render();}});
  }
  $('#op-add').addEventListener('click',()=>{toggleOp(opDialogId,true);$('#operation-dialog').close();toast('Обработка добавлена к выбранному изделию');});
  $$('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  const mobile=matchMedia('(max-width:980px)'), panel=$('#cart-panel');
  function openCart(){if(!mobile.matches){panel.scrollIntoView({block:'nearest',behavior:'smooth'});panel.focus({preventScroll:true});return;}returnFocus=document.activeElement;panel.classList.add('is-open');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');$('#cart-shade').hidden=false;document.body.style.overflow='hidden';panel.focus();}
  function closeCart(){panel.classList.remove('is-open');panel.removeAttribute('role');panel.removeAttribute('aria-modal');$('#cart-shade').hidden=true;document.body.style.overflow='';if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
  $$('[data-open-cart]').forEach(b=>b.addEventListener('click',openCart));$('.cart-close').addEventListener('click',closeCart);$('#cart-shade').addEventListener('click',closeCart);
  document.addEventListener('keydown',e=>{if(!panel.classList.contains('is-open')||$('dialog[open]'))return;if(e.key==='Escape'){e.preventDefault();closeCart();}if(e.key==='Tab'){const focusables=[...panel.querySelectorAll('button,a,input,textarea,select')].filter(x=>!x.disabled&&x.getClientRects().length);const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===panel)){e.preventDefault();first?.focus();}}});
  mobile.addEventListener('change',()=>closeCart());
  function requestText(){return state.items.map((i,n)=>`${n+1}. ${materialName(i)} — ${baseName(i)}, ${thicknessName(i)}\nРазмеры: ${dimensions(i)}\nКоличество: ${i.quantity} шт.\nОбработки: ${i.ops.map(id=>opById.get(id).title).join(', ')||'не выбраны'}${processingText(i)}\nУпаковка в картон: ${i.packaging?'да':'нет'}${i.note?'\nКомментарий: '+i.note:''}`).join('\n\n');}
  function validation(){if(!state.items.length)return [null,"Добавьте изделие к расчёту."];for(let n=0;n<state.items.length;n++){const i=state.items[n];if(i.ops.some(id=>!materials[i.material].operations.includes(id)))return [i,'Обработка недоступна для выбранного материала.'];const pe=processingError(i);if(pe)return [i,`Изделие ${n+1}: ${pe}`];if(!Number.isInteger(Number(i.quantity))||Number(i.quantity)<1||Number(i.quantity)>9999)return [i,`Изделие ${n+1}: укажите количество от 1 до 9999.`];if(!i.unknown&&(!Number.isFinite(Number(i.width))||!Number.isFinite(Number(i.height))||Number(i.width)<=0||Number(i.height)<=0||Number(i.width)>10000||Number(i.height)>10000))return [i,`Изделие ${n+1}: укажите размеры в мм или отметьте «Размеры пока не знаю».`];}return null;}
  $('#prepare').addEventListener('click',()=>{const invalid=validation();if(invalid){state.active=invalid[0]?.id||null;render();$('#cart-error').textContent=invalid[1];$('#cart-error').hidden=false;$('#cart-error').scrollIntoView({block:'nearest'});return;}closeCart();$('#request-preview').textContent=requestText();$('#export-status').textContent='';$('#request-dialog').showModal();});
  $('#attachments').addEventListener('change',e=>{files=[...e.target.files];const bad=files.length>3||files.reduce((a,f)=>a+f.size,0)>10*1024*1024||files.some(f=>!(/\.(pdf|png|jpe?g|webp)$/i).test(f.name));$('#file-error').hidden=!bad;$('#file-error').textContent=bad?'Выберите до 3 файлов PDF, PNG, JPG или WebP, суммарно до 10 МБ.':'';if(bad){files=[];e.target.value='';}$('#file-list').replaceChildren(...files.map(f=>node('li',f.name)));});
  $('#request-form').addEventListener('submit',e=>{e.preventDefault();if(!e.target.reportValidity())return;const f=new FormData(e.target);let text='ALFAGLASS — тестовая заявка на расчёт\n\n'+requestText()+'\n\nИмя: '+f.get('name')+'\nТелефон: '+f.get('phone')+'\nEmail: '+f.get('email')+'\nДоставка: '+(f.has('delivery')?'да':'нет')+'\nМонтаж: '+(f.has('install')?'да':'нет')+'\nКомментарий: '+f.get('comment');text+='\n\nЧертежи (приложить отдельно): '+(files.map(f=>f.name).join(', ')||'не выбраны')+'\n\nЗаявка сохранена локально, не отправлена. Стоимость не рассчитана.';const a=document.createElement('a');const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}));a.href=url;a.download='ALFAGLASS-materials-request.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);$('#export-status').textContent='Заявка скачана. Менеджеру ничего не отправлено. Чертежи нужно приложить отдельно.';});
  function themeState(){const dark=document.documentElement.dataset.theme==='dark';$('#theme-toggle').setAttribute('aria-label',dark?'Включить светлую тему':'Включить тёмную тему');$('#theme-toggle').setAttribute('aria-pressed',String(dark));}
  $('#theme-toggle')?.addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('alfaglass-home-theme',document.documentElement.dataset.theme);}catch(e){}themeState();});
  $('#menu-toggle')?.addEventListener('click',()=>{const yes=$('#main-nav').classList.toggle('is-open');$('#menu-toggle').setAttribute('aria-expanded',String(yes));$('#menu-toggle').setAttribute('aria-label',yes?'Закрыть меню':'Открыть меню');});
  if($('#theme-toggle'))themeState();render();
})();
