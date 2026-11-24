// One basket and one checkout across materials and Aluminium. No contact details in storage.
(() => {
 'use strict';
 if(window.AGMQuoteReady)return;
 document.body.classList.add('agm-quote-ready');
 const asset=new URL('.',document.currentScript.src),endpoint='/wp-json/agm-aluminium/v1/request';
 const local=['127.0.0.1','localhost','::1','[::1]'].includes(location.hostname);
 document.querySelectorAll('.site-header .header-cta,.site-header .mobile-actions a.button').forEach(a=>{a.dataset.openQuote='';a.firstChild.textContent='Мой расчёт ';});
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const button=(text,fn)=>{const n=el('button',text);n.type='button';n.onclick=fn;return n;};
 const drawer=el('aside');drawer.id='quote-drawer';drawer.hidden=true;drawer.setAttribute('aria-label','Мой расчёт');
 const top=el('div'),heading=el('h2','Мой расчёт');top.className='quote-top';
 let opener;
 const close=()=>{drawer.hidden=true;opener?.focus({preventScroll:true});};
 top.append(heading,button('Закрыть',close));
 const list=el('div'),status=el('p');status.setAttribute('role','status');
 const links=el('nav');links.setAttribute('aria-label','Добавить к заказу');
 for(const [url,title] of [['/materialy/zerkalo-serebro/','Обычное зеркало'],['/aluminium/zerkala/','Зеркало в раме'],['/wp-content/themes/alfa-glass-home-2026/agm-aluminium-configurator/index.html','Фасад'],['/aluminium/peregorodki/','Перегородка'],['/dveri-iz-stekla/','Дверь из стекла'],['/dushevye-peregorodki-iz-stekla/','Душевая перегородка']]){const a=el('a',title);a.href=url;links.append(a);}
 const actions=el('div');actions.className='quote-actions';
 const checkout=button('Перейти к отправке',prepare),download=button('Скачать весь расчёт',()=>exportText());
 checkout.disabled=download.disabled=true;
 const more=el('details');more.append(el('summary','Добавить другое изделие'),links);
 actions.append(checkout,download);drawer.append(top,list,actions,status,more);document.body.append(drawer);
 const launcher=button('Мой расчёт',()=>open());launcher.id='quote-launcher';document.body.append(launcher);
 const dialog=el('dialog');dialog.id='quote-checkout';dialog.setAttribute('aria-labelledby','quote-title');
 dialog.innerHTML=`
   <div class="quote-top"><h2 id="quote-title">Заявка на расчёт</h2><button type="button" data-close>Закрыть</button></div>
   <section class="quote-order" aria-label="Ваш заказ">
     <strong data-count></strong><ul data-order></ul>
     <details><summary>Посмотреть параметры</summary><pre></pre></details>
   </section>
   <form>
     <div class="quote-contacts">
       <label>Ваше имя<input name="name" required maxlength="100" autocomplete="name"></label>
       <label>Телефон<input name="phone" type="tel" required maxlength="40" autocomplete="tel" placeholder="+7 (___) ___-__-__"></label>
     </div>
     <details class="quote-extras"><summary>Добавить почту или комментарий</summary>
       <label>Электронная почта<input name="email" type="email" maxlength="160" autocomplete="email"></label>
       <label>Комментарий<textarea name="comment" rows="2" maxlength="3000" placeholder="Например, удобное время для звонка"></textarea></label>
     </details>
     <div class="quote-trap" aria-hidden="true"><label>Сайт<input name="website" tabindex="-1" autocomplete="off"></label></div>
     <label class="quote-consent"><input type="checkbox" name="consent" value="1" required><span>Даю согласие на обработку персональных данных на условиях <a href="/privacy-policy/" target="_blank" rel="noopener">политики конфиденциальности</a>.</span></label>
     <button type="submit">Отправить заявку</button>
     <button type="button" data-copy-request>Скопировать заявку</button>
     <button type="button" data-send-max>Отправить в MAX</button>
     <p class="quote-max-note">Нажмите «Скопировать заявку», затем откройте чат MAX, вставьте текст и отправьте. При необходимости приложите файлы.</p>
     <div data-max-fallback hidden><label>Текст для MAX<textarea readonly rows="6" data-max-text></textarea></label></div>
     <p role="status" data-status></p>
   </form>`;
 document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>checkout.focus());
 const form=dialog.querySelector('form'),send=form.querySelector('[type=submit]'),feedback=form.querySelector('[data-status]');
 if(local){send.textContent='Отправить заявку (тест)';feedback.textContent='Локальная проверка: письмо не отправляется.';}
 let store,materials,operations,loadError,credentials,pending,fingerprint,sentFingerprint,busy=false;
 function report(e){status.textContent=e.message||String(e);}
 function render(){
  if(!store)return;
  try{
   const items=store.all();launcher.textContent='Мой расчёт · '+items.length;
   document.querySelectorAll('[data-quote-count]').forEach(n=>n.textContent=items.length);
   list.replaceChildren();if(!items.length)list.append(el('p','Пока нет изделий. Выберите их в каталоге.'));
   for(const [n,item] of AGMQuoteStore.groupFacades(items).entries()){
    const row=el('article');row.className='quote-item';row.append(el('h3',(n+1)+'. '+item.title));
    if(item.preview && (item.data?.shelf || item.data?.tilePack)){
      const previewUrl=new URL(item.preview.url,location.origin);
      if(previewUrl.origin===location.origin && /^https?:$/.test(previewUrl.protocol)){
        const sample=el('div');sample.className='quote-material-preview';
        sample.setAttribute('role','img');sample.setAttribute('aria-label',item.preview.alt||item.title);
        sample.style.backgroundImage='url('+JSON.stringify(previewUrl.href)+')';
        sample.style.backgroundSize=item.preview.size;
        sample.style.backgroundPosition=item.preview.position;
        sample.style.width='180px';sample.style.height='90px';sample.style.backgroundRepeat='no-repeat';
        row.append(sample);
      }
    }
    row.append(el('p',item.summary.split('\n').slice(0,2).join(' · ')));
    const details=el('details');details.append(el('summary','Все параметры'),el('pre',item.summary));row.append(details);
    if(item.errors.length){const message=el('p',item.errors.join(' '));message.className='quote-error';row.append(message);}
    const controls=el('div'),edit=el('a',item.members.length>1?'Изменить 1 шт.':'Изменить параметры');
    // Saved browser data may not introduce external links or script URLs.
    const url=new URL(item.editUrl,location.origin);edit.href=url.origin===location.origin?url.href:'/materialy/';
    controls.append(edit,button(item.members.length>1?'Удалить 1 шт.':'Удалить',()=>{try{store.remove(item.type,item.id);document.dispatchEvent(new CustomEvent('agm:quote-editors-refresh'));render();}catch(e){report(e);}}));row.append(controls);list.append(row);
   }
   checkout.disabled=download.disabled=!items.length;
  }catch(e){loadError=e;report(e);}
 }
 function open(){opener=document.activeElement;document.dispatchEvent(new CustomEvent('agm:quote-flush'));drawer.hidden=false;render();if(loadError)report(loadError);top.querySelector('button').focus({preventScroll:true});}
 function readableSummary(summary){
  return summary.replace(/Радиусы углов: ([^\n]+); 0 = без скругления/g,(_,values)=>{
   const corners=values.split('; ');
   if(corners.every(v=>/ 0 мм$/.test(v)))return 'Углы без скругления.';
   return 'Углы (вид сверху): '+corners.map(v=>v.replace(/ (\d+) мм$/,(_,r)=>Number(r)===0?' — без скругления':' — скругление R '+r+' мм')).join('; ');
  });
 }
 function text(items){return items.map((i,n)=>(n+1)+'. '+i.title+'\n'+readableSummary(i.summary)).join('\n\n');}
 function prepare(){
  try{if(loadError)throw loadError;const items=store.payload();status.textContent='';dialog.querySelector('pre').textContent=text(items);dialog.querySelector('[data-count]').textContent='Ваш заказ · позиций: '+items.length;
   dialog.querySelector('[data-order]').replaceChildren(...items.map(item=>el('li',item.title)));
   dialog.showModal();if(!local)credentialsReady().catch(e=>feedback.textContent=e.message);}catch(e){report(e);}
 }
 function exportText(items=store.all()){try{if(!items.length)return;const url=URL.createObjectURL(new Blob(['\ufeffALFAGLASS — Мой расчёт\n\n'+text(AGMQuoteStore.groupFacades(items).map(i=>i.type==='facade'?{...i,summary:i.summary.split('\n').filter(line=>/^(?:\d+ × |Профиль:|Цвет:|Заполнение:|Петли:|Направление рифления:|Маскировка зоны вклейки:|Количество:)/.test(line)).map(line=>line.split('; координаты от верха')[0]).join('\n')}:i))+'\nСтоимость и комплектация согласуются.'],{type:'text/plain;charset=utf-8'}));const a=el('a');a.href=url;a.download='ALFAGLASS-my-calculation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){report(e);}}
 async function credentialsReady(){
  if(credentials&&Date.now()/1000-Number(credentials.time)<3500)return;
  if(!pending)pending=(async()=>{const r=await fetch(endpoint,{cache:'no-store',credentials:'same-origin'}),data=await r.json();if(!r.ok||!data.enabled)throw Error('Отправка недоступна. Расчёт сохранён — его можно скачать.');credentials=data;})().finally(()=>pending=null);
  return pending;
 }
 const maxButton=form.querySelector('[data-send-max]');
 const copyButton=form.querySelector('[data-copy-request]');
 async function prepareMax(copyOnly=false){
  if(busy||!form.reportValidity())return;
  try{
   const items=store.payload(),contact=Object.fromEntries(new FormData(form));
   if(!contact.name.trim())throw Error('Укажите ваше имя.');
   if(!/^[78]\d{10}$/.test(contact.phone.replace(/\D/g,'')))throw Error('Введите телефон из 11 цифр, начиная с +7 или 8.');
   const sources=[...new Set(items.map(item=>/^Полка(?: ·|$)/.test(item.title)?'Полка из стекла':item.title.split(' · ')[0]))];
   const message=[sources.join(', ')+' — Заявка на расчёт','Имя: '+contact.name.trim(),'Телефон: '+contact.phone,contact.email?'Email: '+contact.email:'','',text(items),contact.comment?'Комментарий: '+contact.comment:''].filter(v=>v!=='').join('\n\n');
   const fallback=form.querySelector('[data-max-fallback]');
   form.querySelector('[data-max-text]').value=message;
   fallback.hidden=false;
   if(copyOnly){
    try{await navigator.clipboard.writeText(message);feedback.textContent='Заявка скопирована. Откройте чат MAX и вставьте текст в сообщение.';}
    catch(error){const field=form.querySelector('[data-max-text]');field.focus();field.select();feedback.textContent='Не удалось скопировать автоматически. Текст выделен — нажмите Ctrl+C или выберите «Копировать».';}
    return;
   }
   if(local){feedback.textContent='Локальный макет: текст подготовлен ниже. Чтобы скопировать его, нажмите «Скопировать заявку».';return;}
   maxButton.disabled=true;
   try{
    await navigator.clipboard.writeText(message);
    feedback.textContent='Заявка скопирована. Вставьте её в чат MAX и нажмите отправку.';
    window.open('https://max.ru/u/f9LHodD0cOJU_mzxnZFM89uKk2SxzncqmFTLwouS7FkvmwtdY23bOzzBQEw','_blank','noopener,noreferrer');
   }catch(error){feedback.textContent='Скопируйте текст заявки из поля ниже, откройте чат MAX и отправьте сообщение.';}
  }catch(error){feedback.textContent=error.message;}
  finally{maxButton.disabled=false;}
 }
 maxButton.addEventListener('click',()=>prepareMax());
 copyButton.addEventListener('click',()=>prepareMax(true));
 form.addEventListener('invalid',event=>{
  const section=event.target.closest('details');
  if(section)section.open=true;
 },true);
 form.addEventListener('input',event=>event.target.setCustomValidity?.(''));
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!form.reportValidity())return;
  let timer;busy=true;send.disabled=true;
  try{
   const items=store.payload(),contact=Object.fromEntries(new FormData(form)),phone=contact.phone.replace(/\D/g,'');
   if(!contact.name.trim()){form.elements.name.setCustomValidity('Укажите ваше имя.');form.elements.name.reportValidity();return;}
   if(!/^[78]\d{10}$/.test(phone)){form.elements.phone.setCustomValidity('Введите 11 цифр, начиная с +7 или 8.');form.elements.phone.reportValidity();return;}
   items.forEach(item=>{item.summary=readableSummary(item.summary);});
   if(items.some(i=>i.shelf)){const report=await import(new URL('shelf-report.js',asset));await report.prepare(items);}
   const data={...contact,product:'mixed',dimensions:'Позиций: '+items.length,items,...(items.some(i=>i.type==='facade')?{managerItems:store.all().map(({type,title,summary,data})=>({type,title,summary,...(type==='facade'?{config:data.config}:{})}))}:{})},current=JSON.stringify(data);
   if(current===sentFingerprint){feedback.textContent='Эта заявка уже передана.';return;}
   if(fingerprint&&fingerprint!==current)credentials=null;fingerprint=current;
   dialog.querySelector('pre').textContent=text(items);
   if(local){const count=items.length,mod=count%100;const noun=mod>=11&&mod<=14?'позиций':count%10===1?'позиция':count%10>=2&&count%10<=4?'позиции':'позиций';feedback.textContent='Заявка подготовлена: '+count+' '+noun+'. Это локальный макет — письмо не отправляется.';
    if(items.some(i=>i.shelfImage)){
     const report=await import(new URL('shelf-report.js',asset));
     const link=button('Посмотреть лист менеджера со схемами',()=>{
      const preview=el('dialog');preview.style.cssText='width:min(900px,94vw);max-height:90vh;overflow:auto';
      const closePreview=button('Закрыть просмотр',()=>{preview.close();preview.remove();});
      const frame=el('iframe');frame.title='Лист менеджера со схемами';frame.setAttribute('sandbox','');frame.style.cssText='width:100%;height:72vh;border:0';frame.srcdoc=report.documentHtml(items);
      preview.append(closePreview,frame);document.body.append(preview);preview.showModal();
     });feedback.append(document.createElement('br'),link);
    }return;}
   await credentialsReady();const age=Date.now()-Number(credentials.time)*1000;if(age<2200)await new Promise(r=>setTimeout(r,2200-age));
   const controller=new AbortController();timer=setTimeout(()=>controller.abort(),30000);
   const {id,time,token}=credentials;
   const r=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,id,time,token}),signal:controller.signal}),result=await r.json();
   if(!r.ok||!result.ok){if(r.status===403)credentials=null;throw Error(result.message||'Не удалось передать заявку.');}
   sentFingerprint=current;feedback.textContent='Ваша заявка отправлена. Наш менеджер свяжется с Вами. Спасибо.';
  }catch(error){feedback.textContent=(error.name==='AbortError'?'Ответ задерживается. При повторе неизменённой заявки используется тот же номер.':error.message)+' Данные не удалены.';}
  finally{clearTimeout(timer);busy=false;send.disabled=false;}
 });
 document.addEventListener('click',e=>{
  const trigger=e.target.closest('[data-open-quote],[data-open-cart],[data-open-mirror-order],[data-al-request],#prepare,#mp-export,#mp-reopen');
  if(!trigger)return;e.preventDefault();e.stopImmediatePropagation();
  if(trigger.id==='prepare'&&!document.dispatchEvent(new Event('agm:material-prepare',{cancelable:true})))return;
  open();
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.hidden&&!dialog.open)close();});
 document.addEventListener('agm:material-quote-ready',open);
 window.AGMQuoteReady=(async()=>{
  const read=async name=>{const r=await fetch(new URL(name,asset));if(!r.ok)throw Error('Не удалось загрузить каталог для расчёта. Обновите страницу.');return r.json();};
  [materials,operations]=await Promise.all([read('materials.json'),read('operations.json')]);
  store=AGMQuoteStore.create(localStorage,()=>document.dispatchEvent(new CustomEvent('agm:quote-change')));
  const oldFacades=store.all().filter(i=>i.type==='facade'&&i.data?.config);
  if(oldFacades.some(i=>i.title.startsWith('Фасад · '))){
   const {numberFacades}=await import(new URL('../agm-aluminium-configurator/project.js',asset));
   numberFacades(oldFacades.map(i=>i.data));
   for(const entry of oldFacades)if(entry.title!==entry.data.name)store.put({...entry,title:entry.data.name});
  }
  // Import once, leave original drafts intact. Deleting an imported position never resurrects it.
  const legacy=JSON.parse(localStorage.getItem('agm-materials-request-v2')||localStorage.getItem('agm-materials-request-v1')||'null');
  store.migrate('materials',(legacy?.items||[]).map(i=>{const normalized=AGMOrderModel.normalize(i,materials,()=>crypto.randomUUID());return normalized?AGMQuoteModel.material(normalized,materials,operations):{id:i.id||crypto.randomUUID(),type:'material',title:'Сохранённый материал',summary:JSON.stringify(i),errors:['Проверьте устаревшее исполнение материала.'],data:i,editUrl:'/materialy/'};}));
  const mirrors=JSON.parse(localStorage.getItem('agm-mirror-drafts-v1')||'[]');
  store.migrate('mirrors',mirrors.filter(i=>i&&AGMQuoteModel.names.includes(i.shape)).map(i=>AGMQuoteModel.mirror({...i,lighting:typeof i.lighting==='boolean'?i.lighting:Boolean(i.note?.includes('Лицевая подсветка'))})));
  window.AGMQuote={store,open,exportText,materials,operations};
  document.addEventListener('agm:quote-change',render);
  window.addEventListener('storage',e=>{if(e.key?.startsWith(AGMQuoteStore.prefix)){render();document.dispatchEvent(new CustomEvent('agm:quote-editors-refresh'));}});
  render();return window.AGMQuote;
 })();
 window.AGMQuoteReady.catch(e=>{loadError=e;report(e);launcher.textContent='Мой расчёт · ошибка загрузки';});
})();
