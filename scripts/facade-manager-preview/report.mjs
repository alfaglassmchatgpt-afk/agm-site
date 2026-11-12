import {readFileSync} from 'node:fs';
import {profiles,colors,profileLabel,assemblyLabel,glassCut,validate} from '../../src/themes/alfa-glass-home-2026/agm-aluminium-configurator/data.js';
const catalog=JSON.parse(readFileSync(new URL('../../src/themes/alfa-glass-home-2026/agm-aluminium-configurator/glass-catalog.json',import.meta.url))).items;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title='Ведомость материалов для изготовления фасада';
const hinges={none:'Без петель',mf20:'Скрытые MF 20',mzf:'MZF 63',blum:'BLUM 71B950A',cup:'Чашка 35 мм · модель уточнить',narrow:'Для узкого рамочного профиля'};
function table(headers,rows){return '<div class="scroll"><table><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function sketch(c,p,g){
 const scale=Math.min(205/c.w,208/c.h),w=c.w*scale,h=c.h*scale,x=(320-w)/2,y=(278-h)/2;
 const pins=c.hinges.map((v,i)=>'<circle r="3.6" fill="#147097" cx="'+(c.side==='left'?x+5:x+w-5)+'" cy="'+(p.series==='MF-20'?(i?y+h-5:y+5):y+v*scale)+'"/>').join('');
 const ribs=g?.pitch?'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="url(#reed-'+c.reed+')"/>':'';
 const pattern='<defs><pattern id="reed-'+c.reed+'" width="6" height="6" patternUnits="userSpaceOnUse"><path d="'+(c.reed==='horizontal'?'M0 1H6':'M1 0V6')+'" stroke="#586970" opacity=".45"/></pattern></defs>';
 const handleHeight=(c.handle?Math.min(250,c.h-80):p.gripLength||c.h)*scale;
 const handleX=c.side==='left'?x+w:x;
 const handle=(c.handle||p.baseId)?'<line x1="'+handleX+'" x2="'+handleX+'" y1="'+(139-handleHeight/2)+'" y2="'+(139+handleHeight/2)+'" stroke="#5c5147" stroke-width="5"/>':'';
 return '<svg role="img" aria-label="Эскиз фасада '+c.w+' на '+c.h+' мм" viewBox="0 0 320 278">'+pattern+'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+(g?.color||'white')+'" stroke="'+colors[c.color][1]+'" stroke-width="5"/>'+ribs+pins+handle+'<path fill="none" stroke="#57727e" d="M'+x+' '+(y-7)+'v-5h'+w+'v5 M'+(x-7)+' '+y+'h-5v'+h+'h5"/><text x="160" y="'+(y-17)+'">'+c.w+' мм</text><text transform="translate('+(x-18)+' 139) rotate(-90)">'+c.h+' мм</text></svg>';
}
function stockCount(g){
 const usable=g.stock-(g.stock===2850?0:100),bins=[];
 for(const len of g.parts.sort((a,b)=>b-a)){
   if(len>usable)return 'Уточнить раскрой';
   let i=g.singleGrip?-1:bins.findIndex(left=>left>=len);
   if(i<0){i=bins.length;bins.push(usable);}
   bins[i]=Math.max(0,bins[i]-len-4);
 }
 return bins.length+' шт.';
}
export function render(order){
 const glass=new Map(),rails=new Map(),cards=[];
 for(const item of order.items.filter(i=>i.type==='facade')){
   const c=item.config,p=profiles.find(p=>p.id===c?.profile),g=catalog.find(g=>g.id===c?.glass);
   if(!p||!colors[c.color]||!Array.isArray(c.hinges)||!Object.hasOwn(hinges,c.hinge)||!['left','right'].includes(c.side)||!['horizontal','vertical'].includes(c.reed)||(!g&&c.glass!=='none')||validate(c).errors.length)throw Error('Проверьте сохранённую конфигурацию фасада.');
   const cut=g&&glassCut(c),name=g?.title||'Без наполнения',color=colors[c.color][0];
   if(cut){const row=[name,cut.width+' × '+cut.height+' × 4 мм',g.pitch?c.reed==='horizontal'?'Горизонтально':'Вертикально':'—'];const key=JSON.stringify(row);if(!glass.has(key))glass.set(key,{row,n:0});glass.get(key).n++;}
   const base=profiles.find(q=>q.id===p.baseId)||p,baseStock=p.series==='MZ'?6000:5500;
   const add=(label,stock,parts,handle=false,singleGrip=false)=>{const key=label+'|'+color;if(!rails.has(key))rails.set(key,{label,color,stock,parts:[],handle,singleGrip});rails.get(key).parts.push(...parts);};
   const rail=profileLabel(base);
   if(c.handle&&p.id==='13'){
     const span=Math.min(250,c.h-80),end=(c.h-span)/2;
     add(rail,baseStock,[c.w,c.w,c.h,end,end]);add('MZ 13-01',2850,[span],true);
   }else if(p.baseId){
     const horizontal=c.w-(p.b-p.baseWidth);
     add(rail,baseStock,[horizontal,horizontal,c.h]);
     add(profileLabel(p),p.gripLength?2850:5500,[c.h],true,Boolean(p.gripLength));
   }else add(rail,baseStock,[c.w,c.w,c.h,c.h]);
   cards.push('<article>'+sketch(c,p,g)+'<div><h3>'+esc(item.title)+'</h3><p>'+esc(assemblyLabel(p)+(c.handle&&p.id==='13'?' + MZ 13-01':''))+' · '+esc(color)+'</p><p>Петли: '+esc(hinges[c.hinge])+' · '+c.hinges.length+' шт.'+(c.hinges.length?' · '+(c.side==='left'?'слева':'справа'):'')+'</p><p>Стекло: '+esc(name)+'</p><p>Количество: 1 шт.</p></div></article>');
 }
 const profileRows=[...rails.values()].sort((a,b)=>Number(a.handle)-Number(b.handle)).map(g=>[g.label+(g.handle?' · ручка':''),g.color,g.stock+' мм',stockCount(g)]);
 const contact=[['Имя',order.name],['Телефон',order.phone],['Email',order.email],['Комментарий',order.comment]].filter(([,v])=>v).map(([k,v])=>'<p>'+k+': '+esc(v)+'</p>').join('');
 return '<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+title+'</title><style>*{box-sizing:border-box}body{max-width:920px;margin:32px auto;padding:0 20px;color:#183039;font:16px/1.5 system-ui}h1,h2,h3{line-height:1.18}h1{font-size:clamp(24px,4vw,38px)}article{display:flex;align-items:center;gap:20px;border-top:1px solid #bccbd0;break-inside:avoid}article svg{width:min(36%,255px);flex:none}svg text{text-anchor:middle;font:14px sans-serif}p{margin:6px 0}.scroll{overflow-x:auto}table{border-collapse:collapse;width:100%}td,th{padding:9px;text-align:left;border-bottom:1px solid #ccd7db}th{background:#eef3f4}pre{white-space:pre-wrap;font:inherit}small{color:#53646c}@media print{details{display:none}body{margin:0}}</style><main><h2>Заявка «Мой расчёт»</h2>'+contact+'<details open><summary>Состав заявки · '+order.items.length+'</summary>'+order.items.map(i=>'<p><b>'+esc(i.title)+'</b></p><pre>'+esc(i.summary)+'</pre>').join('')+'</details>'+(cards.length?'<h1>'+title+'</h1><p>Фасады в заявке: '+cards.length+' шт.</p>'+cards.join('')+'<h2>Материалы для цеха</h2><h3>Стекло в раскрой</h3>'+(glass.size?table(['Вид стекла','Ш × В × толщина','Рифление','Количество'],[...glass.values()].map(g=>[...g.row,g.n+' шт.'])):'<p>Стекло не заказано.</p>')+'<h3>Профиль к закупке</h3>'+table(['Артикул','Цвет','Длина палки','Количество'],profileRows)+'<small>Пропил 4 мм. Торцовка палок 6 и 5,5 м — по 50 мм с каждого конца. Профиль-ручка 2,85 м — без торцовки. Для MF с центральным хватом предусмотрена одна стойка с хватом на заготовку. Эскиз показывает габариты и сторону петель; присадку согласуют по модели петли.</small>':'')+'</main></html>';
}

