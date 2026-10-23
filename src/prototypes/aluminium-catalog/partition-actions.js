import {dimensions,checkGlassSize} from './t911-rules.mjs';
const $=id=>document.getElementById(id),scene=$('partition-scene');
const buttons=[...document.querySelectorAll('[data-partition-scene]')];
function sync(){buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.partitionScene===scene.value)));}
buttons.forEach(b=>b.addEventListener('click',()=>{scene.value=b.dataset.partitionScene;scene.dispatchEvent(new Event('change'));sync();}));scene.addEventListener('change',sync);sync();
const request=document.querySelector('.partition-request'),status=$('partition-request-status');
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
 const form=$('al-request-form');form.elements.product.value='partitions';form.elements.dimensions.value=`Проём ${size.b} × ${size.h} мм, 1 комплект`;
 const comment=form.elements.comment,previous=comment.dataset.projectSummary||'';
 const userText=previous&&comment.value.startsWith(previous)?comment.value.slice(previous.length).trim():comment.value.trim();
 const summary=`MODUS Т-911 (2+2)\nПрофиль: ${$('partition-color').selectedOptions[0].textContent}\nСтекло 4 мм: ${glass.title}\nДверь: ${size.door} × ${size.height} мм\nСтекло: ${size.glassWidth} × ${size.glassHeight} мм\nСцена: ${scene.selectedOptions[0].textContent}\nРазмеры предварительные, комплектацию согласовать.`;
 comment.value=summary+(userText?'\n\n'+userText:'');comment.dataset.projectSummary=summary;
},true);
// Reuse the Aluminium form handler and its existing endpoint; no duplicate submission logic.
await ready;
const script=document.createElement('script');script.src=new URL('./al-request.js',import.meta.url).href;document.head.append(script);
