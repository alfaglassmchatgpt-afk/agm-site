// The mirror panel prepares the specification; the existing Aluminium form sends it.
function initMirrorRequest(){
 const panel=document.querySelector('#mirror-panel'),form=document.querySelector('#al-request-form');
 if(!panel||!form||panel.dataset.requestReady)return;
 panel.dataset.requestReady='1';
 document.querySelector('#al-request-title').textContent='Мой расчёт · Зеркала';
 document.querySelector('#al-request-title').nextElementSibling.textContent='Оставьте контакты — уточним стоимость и изготовление выбранных зеркал.';
 const button=document.createElement('button');button.type='button';button.className='button';button.textContent='Отправить на расчёт';button.dataset.alRequest='';
 panel.querySelector('#mp-export').before(button);
 const help=panel.lastElementChild;help.textContent='Проверьте размеры всех зеркал и отправьте заявку. Мы уточним стоимость и детали изготовления.';
 const details=document.createElement('textarea');details.name='mirror_details';details.readOnly=true;details.rows=8;details.setAttribute('aria-label','Зеркала в заявке');
 form.querySelector('[name=comment]').closest('label').before(details);
 const product=form.querySelector('[name=product]');product.value='mirrors';product.closest('label').style.display='none';
 form.querySelector('[name=dimensions]').readOnly=true;
 button.addEventListener('click',e=>{
  const result={};window.dispatchEvent(new CustomEvent('agm-mirror-summary',{detail:result}));
  if(!result.text){e.preventDefault();e.stopImmediatePropagation();panel.querySelector('#mp-error').textContent||='Добавьте зеркало и укажите размеры.';return;}
  details.value=result.text;form.querySelector('[name=dimensions]').value=result.count+' позиций; параметры каждого зеркала приведены ниже.';
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMirrorRequest,{once:true});else initMirrorRequest();
