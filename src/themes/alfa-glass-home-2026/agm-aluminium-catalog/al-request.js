function initAlRequest(){
 const dialog=document.querySelector('#al-request');if(!dialog)return;
 const form=dialog.querySelector('form'),status=form.querySelector('.al-form-status'),submit=form.querySelector('[type=submit]');
 const endpoint='/wp-json/agm-aluminium/v1/request';let credentials,pending,busy=false,sent=false,opener;
 async function prepare(){if(pending)return pending;pending=(async()=>{const response=await fetch(endpoint,{cache:'no-store',credentials:'same-origin'});const data=await response.json();if(!response.ok||!data.enabled)throw Error('Отправка временно недоступна. Свяжитесь с нами по телефону.');credentials=data;})();try{await pending}finally{pending=null}}
 document.addEventListener('click',event=>{const button=event.target.closest('[data-al-request]');if(!button)return;event.preventDefault();opener=button;dialog.showModal();if(!credentials)prepare().catch(e=>status.textContent=e.message)});
 dialog.querySelector('.al-request-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener?.focus());
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||sent||!form.reportValidity())return;
  busy=true;submit.disabled=true;status.textContent='Отправляем запрос…';let timer;
  try{
   if(!credentials)await prepare();const age=Date.now()-Number(credentials.time)*1000;if(age<2200)await new Promise(resolve=>setTimeout(resolve,2200-age));
   const data={...Object.fromEntries(new FormData(form)),...credentials};delete data.enabled;
   const controller=new AbortController();timer=setTimeout(()=>controller.abort(),30000);
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(data),signal:controller.signal});
   const result=await response.json();if(!response.ok||!result.ok){if(response.status===403)credentials=null;throw Error(result.message||'Не удалось отправить запрос.');}
   sent=true;status.textContent=result.message;submit.textContent='Запрос передан';
  }catch(e){status.textContent=(e.name==='AbortError'?'Ответ задерживается. Уточните получение по телефону перед повторной отправкой.':e.message)+' Данные остались в форме.';submit.disabled=false}
  finally{clearTimeout(timer);busy=false}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initAlRequest,{once:true});else initAlRequest();
