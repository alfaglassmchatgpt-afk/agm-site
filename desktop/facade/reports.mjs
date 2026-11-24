import {facadeNumber} from './layout.mjs';
import {readFileSync} from 'node:fs';
import {profiles,colors,glassCut,validate,orderProfileLabel} from './data.js';
import {glasses} from './data.js?v=mf-series-20261021';
import {facadeEntry} from './quote.js';
import {render as production} from './manager-report.mjs';
import store from '../agm-configurator/quote-store.cjs';
const catalogue=JSON.parse(readFileSync(new URL('./glass-catalog.json',import.meta.url))).items;
const materials=Object.fromEntries(catalogue.map(g=>[g.id,g]));glasses.none=['Без наполнения','none'];for(const g of catalogue)glasses[g.id]=[g.title,g.color];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function check(data){for(const i of data.items){const c=i.config;if(!profiles.some(p=>p.id===c.profile)||!colors[c.color]||!(c.glass==='none'||materials[c.glass])||!['left','right'].includes(c.side)||!['vertical','horizontal'].includes(c.reed)||typeof c.hinge!=='string')throw Error('Неизвестный материал или профиль в проекте.');const errors=validate(c).errors;if(errors.length)throw Error(i.name+': '+errors.join(' '));if(c.sealExtra!=null&&(!Number.isInteger(c.sealExtra)||c.sealExtra<0||c.sealExtra>10000))throw Error('Некорректный запас уплотнителя.');}return data;}
export function components(c){
 const p=profiles.find(p=>p.id===c.profile),cut=glassCut(c),rows=[];
 const row=(name,quantity,unit,note)=>rows.push({name,quantity,unit,note});
 const noSeal=['10','12'].includes(p.id),mf20=p.series==='MF-20',mf30=p.series==='MF-30';
 if(c.glass!=='none'&&!noSeal)row(['07','17'].includes(p.id)?'Уплотнитель MZ 07/17 · прозрачный':'Уплотнитель MZ · '+(c.sealColor||'цвет уточнить'),(2*(cut.width+cut.height)+(c.sealExtra||0))/1000,'м','По периметру стекла; запас '+(c.sealExtra||0)+' мм. MODUS стр. '+(mf20?'67':mf30?'72':'64–65'));
 if(c.glass!=='none'&&p.bond)row('Клей для вклейки наполнения',null,'','Расход и марку согласовать. MODUS стр. 63');
 if(mf20){row('Комплект углов MF 20 (2 левых + 2 правых)',1,'компл.','MODUS стр. 67–68');row('Крепёж сборочных углов MF 20',null,'','Комплектацию и артикул уточнить по поставке');}
 else{row(mf30?'Литой уголок MF 30':p.b<20?'Уголок MZ узкий':'Уголок MZ широкий',4,'шт.','Четыре угла рамки. MODUS стр. '+(mf30?'72':'64–65'));row('Винты сборочных углов',mf30?16:8,'шт.',(mf30?'4 отверстия на угол':'2 отверстия на угол')+' по схеме MODUS стр. '+(mf30?'72':'65')+'; артикул/поставка в комплекте требуют подтверждения');}
 if(c.hinges.length)row('Крепёж петель и ответных частей',null,'','По артикулу выбранной петли; не включён в количество винтов рамки');
 return rows;
}
const table=rows=>'<table><thead><tr><th>Комплектующие</th><th>Количество</th><th>Основание / примечание</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+esc(r.name)+'</td><td>'+esc(r.quantity==null?'Уточнить':Number(r.quantity.toFixed(3))+' '+r.unit)+'</td><td>'+esc(r.note)+'</td></tr>').join('')+'</tbody></table>';
function sketch(c){const scale=Math.min(180/c.w,220/c.h),w=c.w*scale,h=c.h*scale;return '<svg viewBox="0 0 260 290" aria-label="Размерная схема"><rect x="45" y="35" width="'+w+'" height="'+h+'" fill="#e0eff3" stroke="#24506b" stroke-width="4"/>'+c.hinges.map(y=>'<circle cx="'+(c.side==='left'?48:42+w)+'" cy="'+(35+y*scale)+'" r="3" fill="#146e92"/>').join('')+'<text x="'+(45+w/2)+'" y="25" text-anchor="middle">'+c.w+' мм</text><text x="20" y="150" transform="rotate(-90 20 150)" text-anchor="middle">'+c.h+' мм</text></svg>';}
export function render(data,kind){check(data);const entries=data.items.map(i=>{const e=facadeEntry({...i,name:'№ '+facadeNumber(i)+' · '+i.name},true);return {...e,config:i.config};}),groups=store.groupFacades(entries);
 const meta='<p>Заказ / клиент: '+esc(data.meta?.customer||'—')+'</p><p>'+esc(data.meta?.comment||'')+'</p>';
 if(kind==='production'){
 let html=production({items:entries});
 const sheet=String((html.match(/data-sheet=/g)||[]).length);
 const extra='<section class="print-form" data-sheet="'+sheet+'"><h1>Комплектующие и дополнительные работы</h1>'+meta+'<p>Версия 0.1.7 · MODUS стр. 63–72. Строки «Уточнить» требуют согласования до передачи в цех. Раскрой использует пропил 4 мм и торцовку 50 мм с двух сторон палок 5,5/6 м; профиль-ручка 2850 мм — без торцовки.</p>'+groups.map(g=>'<h2>'+esc(g.title)+' · '+g.members.length+' шт.</h2>'+table(components(g.config).map(r=>({...r,quantity:r.quantity==null?null:r.quantity*g.members.length})))+'<p>Дополнительные работы: '+esc(g.config.extraWork||'Не указаны')+'</p>').join('')+'</section>';
 html=html.replace('</style>','html,body{background:#fff;color:#183039;color-scheme:light}.print-tools select,.print-tools button{background:#fff;color:#183039;border:1px solid #70838c}</style>');
 return html.replace('</select>','<option value="'+sheet+'">Комплектующие и работы</option></select>').replace('</main>',extra+'</main>');
 }
 const cards=groups.map(g=>{const c=g.config,p=profiles.find(p=>p.id===c.profile),seal=components(c).find(r=>r.name.startsWith('Уплотнитель'));return '<article>'+sketch(c)+'<div><h2>'+esc(g.title)+' · '+g.members.length+' шт.</h2><p>Размер фасада: '+c.w+' × '+c.h+' мм</p><p>Профиль: '+esc(orderProfileLabel(p,c.handle))+' · '+esc(colors[c.color][0])+'</p><p>Стекло / зеркало: '+esc(materials[c.glass]?.title||'Без наполнения')+(c.glass!=='none'?' · 4 мм':'')+'</p><p>'+esc(g.summary.split('\n').find(t=>t.startsWith('Петли:'))||'Без петель')+'</p><p>Присадки: '+(c.hinges.length?'под выбранные петли, по согласованному чертежу':'без присадки под петли')+'</p><p>Уплотнитель: '+esc(seal?.name||'Не предусмотрен для выбранной комплектации')+'</p><p>Дополнительные работы: '+esc(c.extraWork||'Не указаны')+'</p></div></article>';}).join('');
 return '<!doctype html><html lang="ru"><meta charset="utf-8"><title>Состав заказа для клиента</title><style>html,body{background:#fff;color-scheme:light}body{font:15px/1.5 Arial;color:#173749;max-width:900px;margin:30px auto}h1{font-size:26px}h2{font-size:18px}article{display:flex;border-top:1px solid #bbcdd4;break-inside:avoid;padding:16px 0}svg{width:180px;flex:none}p{margin:5px 0}@page{size:A4;margin:15mm}@media print{body{font-size:11pt;margin:0}}</style><h1>ALFAGLASS · Состав заказа фасадов</h1>'+meta+cards+'<p>Стоимость рассчитывается отдельно. Параметры и присадки согласуются перед изготовлением.</p></html>';
}
