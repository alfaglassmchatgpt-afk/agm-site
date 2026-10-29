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
 const intro=el('p','Все выбранные изделия — в одной заявке. Можно продолжить выбор на других страницах.'),list=el('div'),status=el('p');status.setAttribute('role','status');
 const links=el('nav');links.setAttribute('aria-label','Добавить к заказу');
 for(const [url,title] of [['/materialy/zerkalo-serebro/','Обычное зеркало'],['/aluminium/zerkala/','Зеркало в раме'],['/wp-content/themes/alfa-glass-home-2026/agm-aluminium-configurator/index.html','Фасад'],['/aluminium/peregorodki/','Перегородка']]){const a=el('a',title);a.href=url;links.append(a);}
 const actions=el('div');actions.className='quote-actions';
 const checkout=button('Оформить общую заявку',prepare),download=button('Скачать весь расчёт',exportText);
 checkout.disabled=download.disabled=true;
 actions.append(checkout,download);drawer.append(top,intro,links,list,actions,status);document.body.append(drawer);
 const launcher=button('Мой расчёт',()=>open());launcher.id='quote-launcher';document.body.append(launcher);
 const dialog=el('dialog');dialog.id='quote-checkout';dialog.setAttribute('aria-labelledby','quote-title');
 dialog.innerHTML='<div class="quote-top"><h2 id="quote-title">Одна заявка на весь заказ</h2><button type="button" data-close>Закрыть</button></div><p data-count></p><details><summary>Состав заявки</summary><pre></pre></details><form><label>Ваше имя<input name="name" required maxlength="100" autocomplete="name"></label><label>Телефон<input name="phone" type="tel" required maxlength="40" autocomplete="tel"></label><label>Email — по желанию<input name="email" type="email" maxlength="160" autocomplete="email"></label><label>Пожелания, доставка и монтаж<textarea name="comment" rows="3" maxlength="3000"></textarea></label><div class="quote-trap" aria-hidden="true"><label>Сайт<input name="website" tabindex="-1" autocomplete="off"></label></div><label class="quote-consent"><input type="checkbox" name="consent" value="1" required><span>Даю согласие на обработку персональных данных на условиях <a href="/privacy-policy/" target="_blank" rel="noopener">политики конфиденциальности</a>.</span></label><p>Если нужен чертёж, укажите это в пожеланиях. Передачу файлов согласуем с менеджером.</p><button type="submit">Отправить заявку</button><p role="status" data-status></p></form>';
 document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>checkout.focus());
 const form=dialog.querySelector('form'),send=form.querySelector('[type=submit]'),feedback=form.querySelector('[data-status]');
 if(local){send.textContent='Проверить состав заявки';feedback.textContent='Локальная проверка: письмо не отправляется.';}
 let store,materials,operations,loadError,credentials,pending,fingerprint,sentFingerprint,busy=false;
 function report(e){status.textContent=e.message||String(e);}
 function render(){
  if(!store)return;
  try{
   const items=store.all();launcher.textContent='Мой расчёт · '+items.length;
   document.querySelectorAll('[data-quote-count]').forEach(n=>n.textContent=items.length);
   list.replaceChildren();if(!items.length)list.append(el('p','Пока нет изделий. Выберите их в каталоге.'));
   for(const [n,item] of items.entries()){
    const row=el('article');row.className='quote-item';row.append(el('h3',(n+1)+'. '+item.title));
    row.append(el('p',item.summary.split('\n').slice(0,2).join(' · ')));
    const details=el('details');details.append(el('summary','Все параметры'),el('pre',item.summary));row.append(details);
    if(item.errors.length){const message=el('p',item.errors.join(' '));message.className='quote-error';row.append(message);}
    const controls=el('div'),edit=el('a','Изменить параметры');
    // Saved browser data may not introduce external links or script URLs.
    const url=new URL(item.editUrl,location.origin);edit.href=url.origin===location.origin?url.href:'/materialy/';
    controls.append(edit,button('Удалить',()=>{try{store.remove(item.type,item.id);document.dispatchEvent(new CustomEvent('agm:quote-editors-refresh'));render();}catch(e){report(e);}}));row.append(controls);list.append(row);
   }
   checkout.disabled=download.disabled=!items.length;
  }catch(e){loadError=e;report(e);}
 }
 function open(){opener=document.activeElement;document.dispatchEvent(new CustomEvent('agm:quote-flush'));drawer.hidden=false;render();if(loadError)report(loadError);top.querySelector('button').focus({preventScroll:true});}
 function text(items){return items.map((i,n)=>(n+1)+'. '+i.title+'\n'+i.summary).join('\n\n');}
 function prepare(){
  try{if(loadError)throw loadError;const items=store.payload();status.textContent='';dialog.querySelector('pre').textContent=text(items);dialog.querySelector('[data-count]').textContent='Позиций: '+items.length+'. Контакты указываются один раз для всего заказа.';dialog.showModal();if(!local)credentialsReady().catch(e=>feedback.textContent=e.message);}catch(e){report(e);}
 }
 function exportText(){try{const items=store.all();if(!items.length)return;const url=URL.createObjectURL(new Blob(['\ufeffALFAGLASS — Мой расчёт\n\n'+text(items)+'\n\n'+items.filter(i=>i.errors.length).map(i=>i.title+': '+i.errors.join(' ')).join('\n')+'\nСтоимость и комплектация согласуются.'],{type:'text/plain;charset=utf-8'}));const a=el('a');a.href=url;a.download='ALFAGLASS-my-calculation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){report(e);}}
 async function credentialsReady(){
  if(credentials&&Date.now()/1000-Number(credentials.time)<3500)return;
  if(!pending)pending=(async()=>{const r=await fetch(endpoint,{cache:'no-store',credentials:'same-origin'}),data=await r.json();if(!r.ok||!data.enabled)throw Error('Отправка недоступна. Расчёт сохранён — его можно скачать.');credentials=data;})().finally(()=>pending=null);
  return pending;
 }
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!form.reportValidity())return;
  let timer;busy=true;send.disabled=true;
  try{
   const items=store.payload(),contact=Object.fromEntries(new FormData(form)),phone=contact.phone.replace(/\D/g,'');
   if(!contact.name.trim())throw Error('Укажите ваше имя.');
   if(!/^[78]\d{10}$/.test(phone))throw Error('Укажите полный российский телефон, начиная с +7 или 8.');
   const data={...contact,product:'mixed',dimensions:'Позиций: '+items.length,items},current=JSON.stringify(data);
   if(current===sentFingerprint){feedback.textContent='Эта заявка уже передана.';return;}
   if(fingerprint&&fingerprint!==current)credentials=null;fingerprint=current;
   dialog.querySelector('pre').textContent=text(items);
   if(local){feedback.textContent='Проверка пройдена: '+items.length+' позиций в одной заявке. Письмо не отправлено.';return;}
   await credentialsReady();const age=Date.now()-Number(credentials.time)*1000;if(age<2200)await new Promise(r=>setTimeout(r,2200-age));
   const controller=new AbortController();timer=setTimeout(()=>controller.abort(),30000);
   const {id,time,token}=credentials;
   const r=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,id,time,token}),signal:controller.signal}),result=await r.json();
   if(!r.ok||!result.ok){if(r.status===403)credentials=null;throw Error(result.message||'Не удалось передать заявку.');}
   sentFingerprint=current;feedback.textContent=result.message+' Состав заказа сохранён в браузере.';
  }catch(error){feedback.textContent=(error.name==='AbortError'?'Ответ задерживается. При повторе неизменённой заявки используется тот же номер.':error.message)+' Данные не удалены.';}
  finally{clearTimeout(timer);busy=false;send.disabled=false;}
 });
 document.addEventListener('click',e=>{
  const trigger=e.target.closest('[data-open-quote],[data-open-cart],[data-open-mirror-order],[data-al-request],#prepare,#mp-export,#mp-reopen');
  if(!trigger)return;e.preventDefault();e.stopImmediatePropagation();
  open();
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.hidden&&!dialog.open)close();});
 window.AGMQuoteReady=(async()=>{
  const read=async name=>{const r=await fetch(new URL(name,asset));if(!r.ok)throw Error('Не удалось загрузить каталог для расчёта. Обновите страницу.');return r.json();};
  [materials,operations]=await Promise.all([read('materials.json'),read('operations.json')]);
  store=AGMQuoteStore.create(localStorage,()=>document.dispatchEvent(new CustomEvent('agm:quote-change')));
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
