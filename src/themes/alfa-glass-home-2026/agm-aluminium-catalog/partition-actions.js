import {dimensions,checkGlassSize} from './t911-rules.mjs';
const $=id=>document.getElementById(id),scene=$('partition-scene');
const buttons=[...document.querySelectorAll('[data-partition-scene]')];
function sync(){buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.partitionScene===scene.value)));}
buttons.forEach(b=>b.addEventListener('click',()=>{scene.value=b.dataset.partitionScene;scene.dispatchEvent(new Event('change'));sync();}));scene.addEventListener('change',sync);sync();
const request=document.querySelector('.partition-request'),status=$('partition-request-status');
request.removeAttribute('data-al-request');request.textContent='Добавить в мой расчёт';
const quote=await window.AGMQuoteReady;
let quoteId=new URLSearchParams(location.search).get('quote-edit');
let catalog,limits;
const ready=Promise.all([fetch('./glass-catalog.json').then(r=>{if(!r.ok)throw Error();return r.json();}),fetch('./glass-limits.json').then(r=>{if(!r.ok)throw Error();return r.json();})]).then(([c,l])=>{catalog=c.items;limits=l;}).catch(()=>{});
request.addEventListener('click',event=>{
 event.preventDefault();status.textContent='';
 const fail=message=>{event.stopImmediatePropagation();status.textContent=message;};
 for(const id of ['opening-width','opening-height'])if(!$(id).reportValidity())return fail('Проверьте размеры проёма.');
 let size;try{size=dimensions(Number($('opening-width').value),Number($('opening-height').value));}catch{return fail('Проверьте размеры проёма.');}
 const glass=catalog?.find(m=>m.id===$('partition-glass').value);
 if(!glass||!limits)return fail('Выберите стекло после загрузки каталога.');
 if(checkGlassSize(size.glassWidth,size.glassHeight,limits[glass.slug]).status==='exceeded')return fail('Выбранное стекло не подходит по размеру.');
 const data={width:$('opening-width').value,height:$('opening-height').value,color:$('partition-color').value,glass:glass.id,scene:scene.value};
 const summary=`Проём ${size.b} × ${size.h} мм, 1 комплект\nMODUS Т-911 (2+2)\nПрофиль: ${$('partition-color').selectedOptions[0].textContent}\nСтекло 4 мм: ${glass.title}\nДверь: ${size.door} × ${size.height} мм\nСтекло: ${size.glassWidth} × ${size.glassHeight} мм\nСцена: ${scene.selectedOptions[0].textContent}\nРазмеры предварительные, комплектацию согласовать.`;
 try{quoteId=quoteId||crypto.randomUUID();quote.store.put({id:quoteId,type:'partition',title:'Перегородка MODUS Т-911',summary,errors:[],data,editUrl:'/aluminium/peregorodki/?quote-edit='+encodeURIComponent(quoteId)});quote.open();}catch(e){status.textContent='Не удалось сохранить: '+e.message;}

},true);
await ready;
const saved=quote.store.all().find(e=>e.type==='partition'&&e.id===quoteId);
if(saved){
 const restore=()=>{
  const d=saved.data;if(!$('partition-glass').querySelector('option[value="'+CSS.escape(d.glass)+'"]'))return false;
  for(const [id,value] of [['opening-width',d.width],['opening-height',d.height],['partition-color',d.color],['partition-glass',d.glass],['partition-scene',d.scene]]){$(id).value=value;$(id).dispatchEvent(new Event('change',{bubbles:true}));}
  return true;
 };
 if(!restore()){const observer=new MutationObserver(()=>{if(restore())observer.disconnect()});observer.observe($('partition-glass'),{childList:true,subtree:true});}
}
