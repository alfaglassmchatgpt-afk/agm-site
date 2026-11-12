import quoteStore from '../../src/themes/alfa-glass-home-2026/agm-configurator/quote-store.js';
import {reedSlugs} from '../../src/themes/alfa-glass-home-2026/agm-aluminium-configurator/glass-groups.js';
import {readFileSync} from 'node:fs';
import {profiles,colors,profileLabel,handleProfileLabel,orderProfileLabel,glassCut,validate} from '../../src/themes/alfa-glass-home-2026/agm-aluminium-configurator/data.js';
const catalog=JSON.parse(readFileSync(new URL('../../src/themes/alfa-glass-home-2026/agm-aluminium-configurator/glass-catalog.json',import.meta.url))).items;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title='Ведомость материалов для изготовления фасада';
const hinges={none:'Без петель',mf20:'Скрытые MF 20',mzf:'MZF 63',blum:'BLUM 71B950A',cup:'Чашка 35 мм · модель уточнить',narrow:'Для узкого рамочного профиля'};
function table(headers,rows){return '<div class="scroll"><table><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function sketch(c,p,g){
 const scale=Math.min(205/c.w,208/c.h),w=c.w*scale,h=c.h*scale,x=(320-w)/2,y=(278-h)/2;
 const pins=c.hinges.map((v,i)=>'<circle r="3.6" fill="#147097" cx="'+(c.side==='left'?x+5:x+w-5)+'" cy="'+(p.series==='MF-20'?(i?y+h-5:y+5):y+v*scale)+'"/>').join('');
 const ribs=reedSlugs.includes(g?.slug)?'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="url(#reed-'+c.reed+')"/>':'';
 const pattern='<defs><pattern id="reed-'+c.reed+'" width="6" height="6" patternUnits="userSpaceOnUse"><path d="'+(c.reed==='horizontal'?'M0 1H6':'M1 0V6')+'" stroke="#586970" opacity=".45"/></pattern></defs>';
 const handleHeight=(c.handle?Math.min(250,c.h-80):p.gripLength||c.h)*scale;
 const handleX=c.side==='left'?x+w:x;
 const handle=(c.handle||p.baseId)?'<line x1="'+handleX+'" x2="'+handleX+'" y1="'+(139-handleHeight/2)+'" y2="'+(139+handleHeight/2)+'" stroke="#5c5147" stroke-width="5"/>':'';
 return '<svg role="img" aria-label="Эскиз фасада '+c.w+' на '+c.h+' мм" viewBox="0 0 320 278">'+pattern+'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+(g?.color||'white')+'" stroke="'+colors[c.color][1]+'" stroke-width="5"/>'+ribs+pins+handle+'<path fill="none" stroke="#57727e" d="M'+x+' '+(y-7)+'v-5h'+w+'v5 M'+(x-7)+' '+y+'h-5v'+h+'h5"/><text x="160" y="'+(y-17)+'">'+c.w+' мм</text><text transform="translate('+(x-18)+' 139) rotate(-90)">'+c.h+' мм</text></svg>';
}
function planCuts(group){
 const usable=group.stock-(group.stock===2850?0:100);
 const bars=[];
 for(const length of [...group.parts].sort((a,b)=>b-a)){
   const cost=length+(group.singleGrip?8:4);
   if(cost>usable)return null;
   let bar=group.singleGrip?null:bars.find(b=>b.remaining>=cost);
   if(!bar){
     bar={lengths:[],remaining:usable};
     bars.push(bar);
   }
   bar.lengths.push(length);
   bar.remaining-=cost;
 }
 return bars;
}
function lengthsSummary(lengths){
 const counts=new Map();
 for(const length of lengths)counts.set(length,(counts.get(length)||0)+1);
 return [...counts].map(([length,count])=>length+' мм × '+count+' шт.').join(' · ');
}
function cutSheet(groups,facades){
 const sections=groups.map(({group,bars})=>{
   const heading='<h3>'+esc(group.label)+' · '+esc(group.color)+' · '+group.stock+' мм</h3>';
   if(!bars)return heading+'<p>Требуется уточнить раскрой: деталь с припуском превышает рабочую длину.</p>';
   const rows=bars.map((bar,i)=>['□ '+(i+1),lengthsSummary(bar.lengths),bar.lengths.length,bar.remaining+' мм']);
   const note=group.singleGrip?'Стойку центрировать по заводскому хвату. Остаток указан суммарно с двух сторон, учтены два пропила.':'';
   return heading+table(['Палка №','Длины по порядку','Деталей','Расчётный остаток'],rows)+'<p><b>Комплектация</b> · '+esc(lengthsSummary(group.parts))+'</p><small>'+note+'</small>';
 }).join('');
 return '<section class="cuts"><h2>Карта раскроя рамочного профиля</h2><p>Фасадов в заявке: '+facades+'. Размер рамочной детали — по наружной длинной стороне. Пропил 4 мм. Торцовка с каждого конца 6- и 5,5-метровой палки — 50 мм. Профиль 2850 мм используется без торцовки.</p>'+sections+'</section>';
}
function hingeSheet(item, profile, base, color, quantity){
 const c=item.config;
 if(!c.hinges.length)return '';
 const left=c.side==='left', hidden=profile.series==='MF-20';
 const side=left?'левая':'правая';
 const positions=[...c.hinges].sort((a,b)=>a-b);
 const x=left?41:135;
 const marks=hidden?[25,179]:positions.map(v=>25+154*v/c.h);
 const diagram='<svg class="hinge-layout" viewBox="0 0 175 205" role="img" aria-label="Расположение петель, вид спереди"><rect x="41" y="25" width="94" height="154" fill="none" stroke="#87979d"/><path d="M'+x+' 25V179" stroke="#335e70" stroke-width="4"/>'+marks.map(y=>'<circle cx="'+x+'" cy="'+y+'" r="4" fill="#183039"/>').join('')+'<text x="87" y="16">Верх</text><text x="87" y="199">Низ</text></svg>';
 const member=profileLabel(base);
 const rows=hidden?[
   ['Верхний угол','Верхняя поперечина и '+side+' стойка','Узел верхней скрытой петли'],
   ['Нижний угол','Нижняя поперечина и '+side+' стойка','Узел нижней скрытой петли']
 ]:positions.map((v,i)=>[i+1,v+' мм',(c.h-v)+' мм']);
 const header=hidden?['Узел','Детали '+member,'Операция']:['Петля','Центр от верха','Центр от низа'];
 let detail;
 if(hidden){
   const width=c.w-(profile.baseId?profile.b-profile.baseWidth:0);
   detail='<p>Поперечины — 2 × '+width+' мм. Фрезеровка в основном профиле MF 20. Положение и обработку углов сверить с чертежами MODUS, стр. 68–69.</p>';
 }else if(c.hinge==='mzf'){
   detail='<h3>Фрезеровка под MZF 63 · на каждую петлю</h3><svg class="hinge-detail" viewBox="0 0 440 95" role="img" aria-label="Два вида обработки MZF 63"><g fill="none" stroke="#183039" stroke-width="2"><rect x="28" y="27" width="135" height="33" rx="16.5"/><rect x="289" y="17" width="63" height="53"/><circle cx="274" cy="48" r="13"/><circle cx="367" cy="48" r="13"/><circle cx="274" cy="48" r="7"/><circle cx="367" cy="48" r="7"/></g><text x="96" y="86">Паз 41 × 10 · R5</text><text x="320" y="86">Окно и два крепления</text></svg><p>Окно 19 × 16 мм. Два отверстия Ø4,3 мм с зенковкой Ø8 мм. Между центрами 28 мм, ось крепежа в 7 мм от кромки по чертежу. Ориентация граней и привязка паза — MODUS, стр. 66.</p>';
 }else{
   detail='<p>'+ (c.hinge==='cup'?'Чашка Ø35 мм. ':'')+'Перед обработкой сверить артикул петли и монтажный чертёж. По нему определить форму выборки, отступ от кромки, отверстия крепежа и глубину.</p>';
 }
 return '<section class="hinge-page"><h2>Лист присадки под петли</h2><h3>'+esc(item.title)+' · '+c.w+' × '+c.h+' мм</h3><div class="hinge-head">'+diagram+'<div><p>Петлевая стойка — '+side+' при виде спереди.</p><p>'+esc(member)+' · '+esc(color)+' · '+c.h+' мм · '+quantity+' шт.</p><p>'+esc(hinges[c.hinge])+' · '+positions.length+' шт. на фасад</p></div></div>'+table(header,rows)+detail+'<small>Эскиз условный. Положение петель из заявки подлежит согласованию перед присадкой.</small></section>';
}
export function render(order){
 const glass=new Map(),rails=new Map(),cards=[],hingeSheets=[];
 const positions=quoteStore.groupFacades(order.items);
 let facadeCount=0;
 for(const item of positions.filter(i=>i.type==='facade')){
   const c=item.config,p=profiles.find(p=>p.id===c?.profile),g=catalog.find(g=>g.id===c?.glass);
   if(!p||!colors[c.color]||!Array.isArray(c.hinges)||!Object.hasOwn(hinges,c.hinge)||!['left','right'].includes(c.side)||!['horizontal','vertical'].includes(c.reed)||(!g&&c.glass!=='none')||validate(c).errors.length)throw Error('Проверьте сохранённую конфигурацию фасада.');
   const quantity=item.members.length;
   facadeCount+=quantity;
   const cut=g&&glassCut(c),name=g?.title||'Без наполнения',color=colors[c.color][0];
   if(cut){const row=[name,cut.width+' × '+cut.height+' × 4 мм',reedSlugs.includes(g.slug)?c.reed==='horizontal'?'Горизонтально':'Вертикально':'—'];const key=JSON.stringify(row);if(!glass.has(key))glass.set(key,{row,n:0});glass.get(key).n+=quantity;}
   const base=profiles.find(q=>q.id===p.baseId)||p,baseStock=p.series==='MZ'?6000:5500;
   const add=(label,stock,parts,handle=false,singleGrip=false)=>{const key=label+'|'+color;if(!rails.has(key))rails.set(key,{label,color,stock,parts:[],handle,singleGrip});for(let i=0;i<quantity;i++)rails.get(key).parts.push(...parts);};
   if(c.hinges.length)hingeSheets.push({name:item.title,html:hingeSheet(item,p,base,color,quantity)});
   const rail=profileLabel(base);
   if(c.handle&&p.id==='13'){
     const span=Math.min(250,c.h-80),end=(c.h-span)/2;
     add(rail,baseStock,[c.w,c.w,c.h,end,end]);add(handleProfileLabel('MZ 13-01'),2850,[span],true);
   }else if(p.baseId){
     const horizontal=c.w-(p.b-p.baseWidth);
     add(rail,baseStock,[horizontal,horizontal,c.h]);
     add(handleProfileLabel(profileLabel(p)),p.gripLength?2850:5500,[c.h],true,Boolean(p.gripLength));
   }else add(rail,baseStock,[c.w,c.w,c.h,c.h]);
   cards.push('<article>'+sketch(c,p,g)+'<div><h3>'+esc(item.title)+'</h3><p>'+esc(orderProfileLabel(p,c.handle))+' · '+esc(color)+'</p><p>Петли: '+esc(hinges[c.hinge])+' · '+c.hinges.length+' шт.'+(c.hinges.length?' · '+(c.side==='left'?'слева':'справа'):'')+'</p><p>Стекло: '+esc(name)+'</p><p>Количество: '+quantity+' шт.</p></div></article>');
 }
 const groups=[...rails.values()].sort((a,b)=>Number(a.handle)-Number(b.handle)).map(group=>({group,bars:planCuts(group)}));
 const profileRows=groups.map(({group:g,bars})=>[g.label,g.color,g.stock+' мм',bars?bars.length+' шт.':'Уточнить раскрой']);
 const contact=[['Имя',order.name],['Телефон',order.phone],['Email',order.email],['Комментарий',order.comment]].filter(([,v])=>v).map(([k,v])=>'<p>'+k+': '+esc(v)+'</p>').join('');
 const sheets=[];
 function sheet(label,html){sheets.push({label,html});}
 sheet('Заявка «Мой расчёт»','<h1>Заявка «Мой расчёт»</h1>'+contact+'<h2>Состав заявки</h2>'+positions.map(i=>'<p><b>'+esc(i.title)+'</b></p><pre>'+esc(i.summary)+'</pre>').join(''));
 if(cards.length){
   const showDirection=[...glass.values()].some(g=>g.row[2]!=='—');
   const glassTable=glass.size?table(['Вид стекла','Ш × В × толщина',...(showDirection?['Рифление']:[]),'Количество'],[...glass.values()].map(g=>[...g.row.slice(0,showDirection?3:2),g.n+' шт.'])):'<p>Стекло не заказано.</p>';
   sheet('Ведомость материалов','<h1>'+title+'</h1><p>Фасады в заявке: '+facadeCount+' шт.</p>'+cards.join('')+'<h2>Материалы для цеха</h2><h3>Стекло в раскрой</h3>'+glassTable+'<h3>Профиль к закупке</h3>'+table(['Артикул','Цвет','Длина палки','Количество'],profileRows));
   sheet('Карта раскроя',cutSheet(groups,facadeCount));
   for(const entry of hingeSheets)sheet('Присадка · '+entry.name,entry.html);
 }
 const options=sheets.map((s,i)=>'<option value="'+i+'">'+esc(s.label)+'</option>').join('');
 const forms=sheets.map((s,i)=>'<section class="print-form" data-sheet="'+i+'">'+s.html+'</section>').join('');
 return `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>*{box-sizing:border-box}body{max-width:920px;margin:32px auto;padding:0 20px;color:#183039;font:16px/1.5 system-ui}h1,h2,h3{line-height:1.18}h1{font-size:clamp(24px,4vw,38px)}article{display:flex;align-items:center;gap:20px;border-top:1px solid #bccbd0;break-inside:avoid}article svg{width:min(36%,255px);flex:none}svg text{text-anchor:middle;font:14px sans-serif}p{margin:6px 0}.scroll{overflow-x:auto}table{border-collapse:collapse;width:100%}td,th{padding:9px;text-align:left;border-bottom:1px solid #ccd7db}th{background:#eef3f4}pre{white-space:pre-wrap;font:inherit}small{color:#53646c}.hinge-head{display:flex;align-items:center;gap:18px}.hinge-layout{width:110px;flex:none}.hinge-detail{display:block;width:min(100%,440px)}
 .print-tools{padding:12px 0;border-bottom:1px solid #ccd7db}.print-tools select,.print-tools button{padding:7px;font:inherit}
 @page{size:A4;margin:13mm}@media print{.print-tools{display:none}.print-form+.print-form{break-before:page}.skip-print{display:none}.scroll{overflow:visible}tr{break-inside:avoid}h2,h3{break-after:avoid}body{margin:0;padding:0;font-size:11pt}article svg{max-width:110px}article p{margin:2px 0}article h3{margin:6px 0}td,th{padding:5px}pre{overflow-wrap:anywhere}}
 </style><main><div class="print-tools"><label>Печатная форма <select id="sheet"><option value="">Весь комплект</option>${options}</select></label> <button type="button" id="print">Печать</button></div>${forms}</main>
 <script>
 const selector=document.getElementById('sheet');
 function selectSheet(){for(const form of document.querySelectorAll('[data-sheet]'))form.classList.toggle('skip-print',selector.value!==''&&selector.value!==form.dataset.sheet);}
 selector.onchange=selectSheet;
 document.getElementById('print').onclick=()=>{selectSheet();window.print();};
 </script></html>`;
}
