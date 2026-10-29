import {profiles,colors,glasses,validate,assemblyLabel,glassCut} from './data.js?v=mf-series-20261021';

// Product-specific serialization; storage and checkout live in the shared configurator.
export function facadeEntry(item,confirmed){
 const c=item.config,p=profiles.find(p=>p.id===c.profile),cut=c.glass==='none'?null:glassCut(c);
 return {id:item.id,type:'facade',title:'Фасад · '+item.name,data:structuredClone(item),
  editUrl:'/wp-content/themes/alfa-glass-home-2026/agm-aluminium-configurator/index.html?quote-edit='+encodeURIComponent(item.id),
  errors:[...validate(c).errors,...(confirmed?[]:['Подтвердите изменённую конфигурацию фасадов.'])],
  summary:[c.w+' × '+c.h+' мм; количество: 1','Профиль: MODUS '+assemblyLabel(p),'Цвет: '+colors[c.color][0],'Заполнение: '+glasses[c.glass][0],
   cut?'Стекло: '+cut.width+' × '+cut.height+' × 4 мм':'Без наполнения',
   'Петли: '+({none:'Без петель',mf20:'Скрытые MF 20',narrow:'Для узкого профиля',mzf:'MZF 63',blum:'BLUM 71B950A',cup:'Чашка 35 мм — модель уточнить'}[c.hinge]||c.hinge)+'; сторона: '+(c.side==='left'?'слева':'справа')+'; координаты от верха, мм: '+c.hinges.join(', '),
   'Ручка MZ 13-01: '+(c.handle?'да':'нет')+'; направление рифления: '+(c.reed==='vertical'?'вертикальное':'горизонтальное'),
   'Маскировка зоны вклейки: '+(c.mask?'да':'нет'),...validate(c).warnings,'Параметры предварительные; производственный чертёж согласовать.'].join('\n')};
}

export function connectFacadeQuote(project,confirmation,quote){
 const key='agm-facade-editor-v1';
 let previous=[];
 const validData=i=>i&&typeof i.id==='string'&&typeof i.name==='string'&&i.config&&profiles.some(p=>p.id===i.config.profile)&&glasses[i.config.glass]&&colors[i.config.color]&&Array.isArray(i.config.hinges);
 const existing=quote.store.all().filter(e=>e.type==='facade');
 const saved=JSON.parse(localStorage.getItem(key)||'null');
 if(saved){
  if(!Array.isArray(saved.items)||!saved.items.length||!saved.items.every(validData))throw Error('Сохранённый проект фасадов требует проверки. Исходные данные не удалены.');
  project.items=saved.items;project.nextId=saved.nextId;project.activeId=saved.activeId;confirmation.signature=saved.signature;
 }else if(existing.length){project.items=existing.map(e=>e.data);}
 for(const entry of existing){
  if(!validData(entry.data))throw Error('Проверьте сохранённый фасад.');
  const n=project.items.findIndex(i=>i.id===entry.id);if(n>=0)project.items[n]=structuredClone(entry.data);else project.items.push(structuredClone(entry.data));
 }
 project.nextId=Math.max(Number(project.nextId)||1,...project.items.map(i=>(Number(i.id.replace('facade-',''))||0)+1));
 const selected=new URLSearchParams(location.search).get('quote-edit');
 project.activeId=project.items.find(i=>i.id===(selected||project.activeId))?.id||project.items[0].id;
 const confirmed=()=>confirmation.check(project.items,!project.items.some(i=>validate(i.config).errors.length));
 previous=existing.map(e=>facadeEntry(e.data,!e.errors.length));
 function save(addAll=false){
  localStorage.setItem(key,JSON.stringify({items:project.items,nextId:project.nextId,activeId:project.activeId,signature:confirmation.signature}));
  const currentIds=new Set(quote.store.all().filter(e=>e.type==='facade').map(e=>e.id));
  const entries=project.items.filter(i=>addAll||currentIds.has(i.id)).map(i=>facadeEntry(i,confirmed()));
  previous=quote.store.sync(entries,previous);
 }
 return {save};
}
