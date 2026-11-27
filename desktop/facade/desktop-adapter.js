import {drillingTypes} from './drilling.mjs';
import {hingeOptions} from './data.js';
import {installPricing} from './pricing-ui.js';
export async function installDesktop({project,state,activate,update,validate,facadeEntry,controls}){
 const retired=['tonirovannoe-steklo-blue__standard','flutelite-s__standard','krepi__bronze','flutes-moru-bronze__standard','flutes-moru-grey__standard','raywall__standard','zerkalo-gezella__standard','moru-dark-grey__standard','moru-dark-grey-mat__standard','steklo-lacobel__standard','steklo-matelak__standard','tonirovannoe-v-masse-steklo-moru__standard'];
 for(const id of retired)document.querySelectorAll('[data-glass="'+id+'"]').forEach(button=>button.remove());
 const extras={sealColor:'Уточнить',sealExtra:0,extraWork:''};Object.assign(project.defaults,extras);for(const item of project.items)item.config={...extras,...item.config};Object.assign(state,project.current().config);
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(a){e.preventDefault();if(/modus|pdf/i.test(a.href))window.alfaDesktop.catalog();}});
 const api=window.alfaDesktop,$=s=>document.querySelector(s),status=t=>$('#desktop-status').textContent=t;
 const metadata=document.createElement('div');metadata.className='desktop-client-meta';metadata.innerHTML='<label>Заказ / клиент<input id="desktop-customer" maxlength="180"></label><label>Комментарий к проекту<input id="desktop-comment" maxlength="1000"></label>';
 $('.desktop-tools').after(metadata);
 let meta=JSON.parse(localStorage.getItem('alfa-desktop-meta')||'{}');$('#desktop-customer').value=meta.customer||'';$('#desktop-comment').value=meta.comment||'';
 metadata.oninput=()=>{meta={customer:$('#desktop-customer').value,comment:$('#desktop-comment').value};localStorage.setItem('alfa-desktop-meta',JSON.stringify(meta));};
 const components=document.createElement('section');components.className='desktop-components';components.innerHTML='<h2>Уплотнитель</h2><label>Цвет уплотнителя<select id="seal-color"><option>Уточнить</option><option>Чёрный</option><option>Серый</option><option>Прозрачный</option></select></label>';
 $('aside').append(components);
 document.addEventListener('rf-facade-activated',()=>sync());
 function sync(){const c=project.current().config;$('#seal-color').value=c.sealColor||'Уточнить';}
 components.oninput=()=>{Object.assign(state,{sealColor:$('#seal-color').value});update();};
 $('#facade-select').addEventListener('change',sync);for(const id of ['add-new','add-copy','add-mirror','remove-facade','undo-remove'])$('#'+id).addEventListener('click',sync);sync();
 const pricing=await installPricing(project,type=>{if(type==='auto')return;if(type==='none'){state.hinge='none';state.hinges=[];}else{if(!state.hinges.length)state.hinges=[100,state.h-100];const desired=type==='mf20'?'mf20':type==='cup35'?'cup':type==='blum'?'blum':'custom';state.hinge=hingeOptions(state).includes(desired)?desired:'custom';state.customHinge=drillingTypes.find(x=>x.id===type)?.name||'';}controls();update();});$('#desktop-pricing').onclick=()=>document.querySelector('.rf-pricing').scrollIntoView({behavior:'smooth'});
 const reset=document.createElement('button');reset.id='desktop-reset-facade';reset.type='button';reset.textContent='Начать сначала';reset.title='Сбросить настройки и имя выбранного фасада';$('#add-facade').before(reset);
 const startOver=()=>{if(!confirm('Начать сначала? Все фасады, имена, связи и настройки текущего расчёта будут сброшены. Сохранённые файлы проектов и прайсы останутся.'))return;for(const key of Object.keys(localStorage))if(key.startsWith('agm-quote-v1:')||['agm-facade-editor-v1','alfa-desktop-meta','rf-pricing','rf-layout-numbers','rf-layout-links'].includes(key))localStorage.removeItem(key);location.reload();};
 reset.title='Вернуть весь конфигуратор в стартовое состояние';reset.onclick=startOver;

 const payload=()=>({format:'alfaglass-facade-project',schemaVersion:1,appVersion:'0.1.27',catalogRevision:'MODUS-63-72',pricing:pricing.snapshot(),meta,items:structuredClone(project.items),activeId:project.activeId,nextId:project.nextId});
 async function run(fn){try{status('');await fn();}catch(e){status(e.message);}}
 $('#desktop-save').onclick=()=>run(async()=>{project.update(state);const r=await api.save(payload());status(r?'Проект сохранён: '+r:'Сохранение отменено.');});
 $('#export').onclick=$('#desktop-save').onclick;
 $('#desktop-open').onclick=()=>run(async()=>{if(!confirm('Открыть другой проект? Сохраните текущий в файл перед заменой.'))return;const data=await api.open();if(!data)return;for(const i of data.items){if(!i.config||!i.id)throw Error('Повреждённый проект');}localStorage.removeItem('agm-facade-editor-v1');for(const key of Object.keys(localStorage))if(key.startsWith('agm-quote-v1:'))localStorage.removeItem(key);localStorage.setItem('agm-facade-editor-v1',JSON.stringify({...data,signature:null}));localStorage.setItem('alfa-desktop-meta',JSON.stringify(data.meta||{}));if(data.pricing?.enabled)localStorage.setItem('rf-pricing',JSON.stringify(data.pricing));else localStorage.removeItem('rf-pricing');location.reload();});
 $('#desktop-new').onclick=startOver;
 async function report(kind){project.update(state);const errors=project.items.flatMap(i=>validate(i.config).errors.map(e=>i.name+': '+e));if(errors.length)throw Error(errors.join('\n'));await api.report(payload(),kind);status('Документ открыт. Доступны печать и сохранение PDF.');}
 $('#desktop-client').onclick=()=>run(()=>report('client'));$('#desktop-production').onclick=()=>run(()=>report('production'));$('#send-project').onclick=$('#desktop-client').onclick;
 $('#desktop-update').onclick=()=>api.updates();$('#desktop-catalog').onclick=()=>api.catalog();
 status('Офлайн-версия 0.1.27 · проекты сохраняются на вашем компьютере · расчёт по локальным прайсам');
}
