(() => {
 'use strict';
 const asset=new URL('.',document.currentScript.src),$=id=>document.getElementById('agd-'+id),form=$('form');
 let quote,visuals,options,editing=null;
 const fields=['leaves','width','height','thickness','quantity','glass','fittings','finish','closer','handle','lock','install','delivery','comment'];
 const buttons=[...document.querySelectorAll('[type=submit][form="agd-form"],#agd-form [type=submit]')];
 buttons.forEach(b=>b.disabled=true);
 const read=()=>Object.fromEntries(fields.map(id=>[id,$(id).value]));
 const status=message=>{$('status').textContent=message;};
 function update(){
  const data=read(),m=quote.materials[data.glass],v=visuals[data.glass];if(!m||!v)return;
  const allowed=AGMDoors.thicknesses(m);
  for(const option of $('thickness').options)option.disabled=!allowed.includes(option.value);
  if(!allowed.includes(data.thickness))$('thickness').value=allowed[0]||'';
  data.thickness=$('thickness').value;
  const item=AGMDoors.entry({...data,id:editing||'preview'},quote.materials,visuals,options);
  $('s-size').textContent=item.errors.length?'Проверьте параметры':data.width+' × '+data.height+' мм';
  $('s-leaves').textContent=data.leaves==='1'?'Одна створка':'Две равные створки';
  $('s-glass').textContent=m.title;$('s-thickness').textContent=data.thickness+' мм';
  $('s-finish').textContent=$('finish').selectedOptions[0].textContent;
  $('s-area').textContent=item.errors.length?'—':(Number(data.width)*Number(data.height)*Number(data.quantity)/1e6).toLocaleString('ru-RU',{maximumFractionDigits:2})+' м²';
  $('validation').textContent=item.errors.join(' ')||'Размеры полотен и совместимость комплекта подтвердим после замера. Выбор здесь — пожелание для расчёта.';
  $('lock-note').hidden=!/^FMZ/.test(data.lock);
  const scene=$('scene');scene.classList.toggle('agd-double',data.leaves==='2');
  scene.style.setProperty('--hardware',data.finish==='BL'?'#222':/TP/.test(data.finish)?'#b79755':'#71818a');
  scene.dataset.glassType=v.type;scene.style.setProperty('--glass-tint',v.tint);scene.style.setProperty('--glass-edge',v.edge);scene.style.setProperty('--glass-blur',v.blur+'px');
  const spacing=v.spacing/3;
  scene.style.setProperty('--glass-pattern',v.type==='ribbed'?'repeating-linear-gradient(90deg,#ffffff99 0px,#ffffff19 '+spacing*.22+'px,#4c646840 '+spacing*.48+'px,#ffffff10 '+spacing*.72+'px,#ffffff99 '+spacing+'px)':'linear-gradient(115deg,#ffffff40,transparent 35%,#ffffff60 38%,transparent 44%)');
  const url='/materialy/'+data.glass+'/';
  for(const id of ['material-link','sample-link','sample-name'])$(id).href=url;
  $('sample-name').textContent=m.title;$('sample-image').src=v.image;$('sample-image').alt=m.title+' — образец из каталога';
  return item;
 }
 function reset(){
  editing=null;form.reset();$('glass').selectedIndex=0;$('edit-notice').hidden=true;
  buttons.forEach(b=>b.textContent='Добавить в мой расчёт');
  history.replaceState(null,'',location.pathname+'#door-configurator');update();status('Новая дверь. Сохранённые изделия остаются в «Моём расчёте».');
 }
 function editSaved(){
  const id=new URLSearchParams(location.search).get('quote-edit');if(!id)return;
  const item=quote.store.all().find(i=>i.type==='door'&&i.id===id);
  if(!item){status('Эта дверь уже удалена из расчёта. Можно добавить новую.');return;}
  editing=id;for(const key of fields)if(item.data[key]!==undefined)$(key).value=item.data[key];
  $('edit-notice').hidden=false;$('edit-notice').textContent='Редактирование сохранённой двери. Нажмите «Сохранить изменения», чтобы обновить расчёт.';
  buttons.forEach(b=>b.textContent='Сохранить изменения');
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!quote||!form.reportValidity())return;
  try{
   const item=update();if(!item||item.errors.length){status(item?.errors.join(' ')||'Выберите стекло.');return;}
   if(editing&&!quote.store.all().some(i=>i.type==='door'&&i.id===editing))throw Error('Эта дверь удалена. Нажмите «Ещё одна дверь», чтобы добавить новую.');
   const id=editing||crypto.randomUUID();quote.store.put(AGMDoors.entry({...read(),id},quote.materials,visuals,options));
   editing=id;buttons.forEach(b=>b.textContent='Сохранить изменения');
   $('edit-notice').hidden=false;$('edit-notice').textContent='Дверь добавлена. Измените параметры и сохраните или добавьте ещё одну дверь.';
   status('Сохранено в «Моём расчёте».');quote.open();
  }catch(error){status(error.message);}
 });
 form.addEventListener('input',()=>{if(quote){update();status(editing?'Есть изменения. Сохраните их в расчёт.':'');}});
 form.addEventListener('change',()=>{if(quote)update();});
 $('new').addEventListener('click',()=>{if(quote){reset();$('leaves').focus({preventScroll:true});}});
 document.addEventListener('agm:quote-editors-refresh',()=>{
  if(quote&&editing&&!quote.store.all().some(i=>i.type==='door'&&i.id===editing)){
   editing=null;buttons.forEach(b=>b.textContent='Добавить в мой расчёт');$('edit-notice').hidden=true;status('Дверь удалена из расчёта. Параметры остались в форме.');
  }
 });
 (async()=>{
  const json=async file=>{const response=await fetch(new URL(file,asset));if(!response.ok)throw Error('Не удалось загрузить параметры двери. Обновите страницу.');return response.json();};
  [quote,visuals,options]=await Promise.all([window.AGMQuoteReady,json('materials-visuals.json'),json('options.json')]);
  for(const [id,entries] of Object.entries(options))$(id).replaceChildren(...entries.map(o=>new Option(o.label,o.value)));
  $('glass').replaceChildren(...Object.keys(visuals).filter(key=>AGMDoors.thicknesses(quote.materials[key]).length).map(key=>new Option(quote.materials[key].title,key)));
  editSaved();update();buttons.forEach(b=>b.disabled=false);
 })().catch(error=>{quote=null;status(error.message);buttons.forEach(b=>b.disabled=true);});
})();
