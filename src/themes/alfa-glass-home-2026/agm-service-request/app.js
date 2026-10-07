(()=>{'use strict';
const node=document.getElementById('agm-service-request-data'); if(!node)return;
const config=JSON.parse(node.textContent), dialog=document.getElementById('agm-service-dialog'), form=dialog.querySelector('form');
const field=n=>form.elements.namedItem(n), status=dialog.querySelector('.asr-status'), submit=dialog.querySelector('.asr-submit');
let settings=null, loading=null, busy=false, sent=false, opener=null, selectedFiles=[];
dialog.querySelector('.asr-service-link').href=config.serviceUrl;
dialog.querySelector('.asr-privacy').href=config.privacyUrl;
config.materials.forEach(title=>field('service_material').add(new Option(title,title)));
const tell=(text,error=false)=>{status.textContent=text;status.classList.toggle('asr-error',error);};
async function prepare(){
 if(loading)return loading;
 loading=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{
  const response=await fetch(config.endpoint,{credentials:'same-origin',headers:{Accept:'application/json'},signal:controller.signal});
  const data=await response.json();if(!response.ok||!data.enabled||!data.csrf||!data.request_id)throw Error('Сервис отправки временно недоступен. Попробуйте позже или свяжитесь с нами через страницу «Сервис».');
  settings=data;return data;
 }finally{clearTimeout(timer);loading=null;}})();return loading;
}
function open(event){
 opener=event.currentTarget;
 if(!sent){
  let material='';try{const data=JSON.parse(document.getElementById('agm-order-data')?.textContent||'{}');material=data.materials?.[data.current]?.title||'';}catch(_){}
  if(!material&&location.pathname.startsWith('/materialy/')&&location.pathname!='/materialy/')material=document.querySelector('h1')?.textContent.trim()||'';
  if(material){if(![...field('service_material').options].some(o=>o.value===material))field('service_material').add(new Option(material,material));field('service_material').value=material;}
 }
 dialog.showModal();document.documentElement.classList.add('asr-open');
 if(!settings)prepare().catch(error=>tell(error.message,true));
}
function button(){const b=document.createElement('button');b.type='button';b.className='asr-trigger';b.textContent='Замер и монтаж';b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-controls',dialog.id);b.addEventListener('click',open);return b;}
const header=document.querySelector('.header-main');if(header){const target=header.querySelector('.header-tools');header.insertBefore(button(),target||null);}
const mobile=document.querySelector('.mobile-actions');if(mobile)mobile.append(button());
if(location.pathname.startsWith('/materialy/')&&location.pathname!='/materialy/'){
 const target=document.querySelector('#material-request')||document.querySelector('#agm-order')||document.querySelector('main');
 if(target){const box=document.createElement('aside');box.className='asr-material-cta';const text=document.createElement('div');const title=document.createElement('strong');title.textContent='Поможем с замером и установкой';const p=document.createElement('p');p.textContent='Расскажите о проекте — согласуем детали и удобный порядок работ.';text.append(title,p);box.append(text,button());target.before(box);}
}
document.querySelectorAll('#agm-service a[href="#request"]').forEach(a=>{a.addEventListener('click',e=>{e.preventDefault();open(e);});});
dialog.querySelector('.asr-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.documentElement.classList.remove('asr-open');opener?.focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const kinds=()=>[...form.querySelectorAll('[name="services"]:checked')].map(x=>x.value);
form.addEventListener('change',()=>{dialog.querySelector('.asr-install-note').hidden=!kinds().includes('install');});
field('phone').addEventListener('input',()=>field('phone').setCustomValidity(''));
function renderFiles(){const list=dialog.querySelector('.asr-file-list');list.replaceChildren();selectedFiles.forEach((file,i)=>{const li=document.createElement('li'),remove=document.createElement('button');li.append(document.createTextNode(file.name+' '));remove.type='button';remove.textContent='Убрать';remove.setAttribute('aria-label','Убрать '+file.name);remove.addEventListener('click',()=>{selectedFiles.splice(i,1);renderFiles();});li.append(remove);list.append(li);});}
field('attachments[]').addEventListener('change',()=>{
 const files=[...selectedFiles,...field('attachments[]').files];field('attachments[]').value='';
 const allowed=['jpg','jpeg','png','webp','pdf','svg','eps','ai','cdr','dxf','dwg','cdw','frw','m3d','a3d','gif','bmp','tif','tiff'];
 if(files.length>20||files.reduce((n,f)=>n+f.size,0)>20971520){tell('Выберите до 20 файлов общим размером до 20 МБ.',true);return;}
 if(files.some(f=>!f.size||!allowed.includes(f.name.split('.').pop().toLowerCase()))){tell('Проверьте формат файлов. Принимаем изображения, PDF и чертежи.',true);return;}
 selectedFiles=files;renderFiles();tell('');
});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy||sent)return;
 if(field('phone').value.replace(/\D/g,'').length<10){field('phone').setCustomValidity('Укажите телефон с кодом города или оператора.');}
 if(!form.reportValidity())return;
 if(!kinds().length){tell('Выберите хотя бы одну услугу.',true);form.querySelector('[name="services"]').focus();return;}
 busy=true;submit.disabled=true;tell('Отправляем заявку…');
 const controller=new AbortController();let timer;
 try{
  if(!settings)await prepare();
  // Tokens have a minimum age of two seconds; keep the same request ID on retries.
  const age=Date.now()-Number(settings.csrf.split('.')[0])*1000;if(age<2200)await new Promise(resolve=>setTimeout(resolve,2200-age));
  const data=new FormData(form);data.delete('attachments[]');data.delete('services');selectedFiles.forEach(file=>data.append('attachments[]',file,file.name));
  data.set('service_request','1');data.set('service_kind',kinds().join(','));data.set('service_source',location.origin+location.pathname);data.set('csrf',settings.csrf);data.set('request_id',settings.request_id);
  timer=setTimeout(()=>controller.abort(),60000);
  const response=await fetch(config.endpoint,{method:'POST',body:data,credentials:'same-origin',headers:{Accept:'application/json'},signal:controller.signal});
  const result=await response.json();if(!response.ok||!result.ok){if(response.status===403)settings=null;throw Error(result.message||'Не удалось отправить заявку.');}
  sent=true;tell(result.message);submit.textContent='Заявка отправлена';
 }catch(error){tell((error.name==='AbortError'?'Время ожидания истекло. Письмо могло быть принято — уточните получение у менеджера перед повторной отправкой.':error.message)+' Введённые данные остались в форме.',true);submit.disabled=false;}
 finally{clearTimeout(timer);busy=false;}
});
})();
