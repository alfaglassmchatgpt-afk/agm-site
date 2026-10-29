(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./model.js'));else root.AGMQuoteModel=factory(root.AGMOrderModel);})(typeof globalThis!=='undefined'?globalThis:this,function(AGMOrderModel){
 'use strict';
 // Mirror rules below are shared with its editor (inserted from the original implementation).
 const names=['Круг','Овал','Капсула','Скруглённые углы','Свободный контур','Плавная волна','Прямоугольник'];
const straight=['Нержавейка светлая','Нержавейка тёмная','Нержавейка графит','Нержавейка чёрная','Нержавейка золото','Чёрный браш','Чёрный матовый','Латунь браш','Золото браш'];
const curved=['Медь','Чёрный','Серебро','Светлое золото','Розовое золото'];
function perimeter(i){const w=+i.width,h=+i.height,r=+i.radius;if(i.shape==='Круг')return +i.diameter>0?Math.PI*i.diameter:null;if(!(w>0&&h>0))return null;if(i.shape==='Капсула')return h>=w?2*(h-w)+Math.PI*w:null;if(i.shape==='Скруглённые углы')return r>0&&r<=Math.min(w,h)/2?2*(w+h)-8*r+2*Math.PI*r:null;if(i.shape==='Овал'){const a=w/2,b=h/2,q=((a-b)/(a+b))**2;return Math.PI*(a+b)*(1+3*q/(10+Math.sqrt(4-3*q)))}return null}
function mirrorError(i){if(i.shape==='Прямоугольник'&&!['3','8','15','20','50'].includes(String(i.profile)))return 'Выберите ширину профиля.';if(!(i.shape==='Прямоугольник'?straight:curved).includes(i.color))return 'Выберите доступный цвет рамы.';const keys=i.shape==='Круг'?['diameter']:['width','height'];if(i.shape==='Скруглённые углы')keys.push('radius');for(const k of keys)if(!AGMOrderModel.wholeMillimetres(i[k]))return 'Укажите размеры целыми положительными миллиметрами.';if(i.shape==='Прямоугольник'&&(Math.min(+i.width,+i.height)<300||Math.max(+i.width,+i.height)>3150||Math.min(+i.width,+i.height)>2000))return 'Допустимо от 300 × 300 до 3150 × 2000 мм, с поворотом.';if(i.shape==='Круг'&&(+i.diameter<300||+i.diameter>1200))return 'Диаметр круга: от 300 до 1200 мм.';if(i.shape==='Скруглённые углы'&&+i.radius>Math.min(+i.width,+i.height)/2)return 'Радиус не может превышать половину меньшей стороны.';if(i.shape==='Капсула'&&+i.height<+i.width)return 'У вертикальной капсулы высота должна быть не меньше ширины.';for(const k of ['convex','concave'])if(i[k]&&!AGMOrderModel.wholeMillimetres(i[k]))return 'Радиусы задаются целыми положительными миллиметрами.';if(perimeter(i)>4100)return 'Контур превышает длину профиля 4100 мм. Уменьшите размеры зеркала.';if(!AGMOrderModel.wholeMillimetres(i.quantity))return 'Количество должно быть целым положительным числом.';return ''}

 function mirror(i){
  const summary=[i.shape==='Круг'?'Диаметр: '+i.diameter+' мм':'Размеры: '+(i.width||'—')+' × '+(i.height||'—')+' мм',
   ...['radius','convex','concave'].filter(k=>i[k]).map(k=>({radius:'Радиус углов',convex:'Выпуклый радиус',concave:'Вогнутый радиус'}[k])+': '+i[k]+' мм'),
   'Лицевая ширина профиля: '+i.profile+' мм','Цвет: '+i.color,'Подсветка: '+(i.lighting?'Да':'Нет'),'Количество: '+i.quantity,
   perimeter(i)?'Наружный контур ≈ '+Math.round(perimeter(i))+' мм, без припусков':'',i.note||''].filter(Boolean).join('\n');
  return {id:i.id,type:'mirror',title:'Зеркало в раме · '+i.shape,summary,errors:[mirrorError(i)].filter(Boolean),data:i,editUrl:'/aluminium/zerkala/?quote-edit='+encodeURIComponent(i.id)};
 }
 function material(i,materials,operations){
  const m=materials[i.material],op=new Map(operations.map(x=>[x.id,x.title])),errors=[];
  if(!m)return {id:i.id,type:'material',title:'Материал требует уточнения',summary:'Профиль материала отсутствует в каталоге.',errors:['Выберите материал заново.'],data:i,editUrl:'/materialy/'};
  if(!AGMOrderModel.thicknesses(m,i.base).includes(i.thickness))errors.push('Выберите доступную толщину.');
  if(i.ops.some(id=>!AGMOrderModel.operations(m,i.thickness).includes(id)))errors.push('Обработка недоступна для выбранного материала.');
  if(!Number.isInteger(Number(i.quantity))||Number(i.quantity)<1||Number(i.quantity)>9999)errors.push('Укажите количество от 1 до 9999.');
  if(!i.unknown&&(!AGMOrderModel.wholeMillimetres(i.width)||!AGMOrderModel.wholeMillimetres(i.height)||Number(i.width)>10000||Number(i.height)>10000))errors.push('Укажите размеры целыми числами от 1 до 10000 мм либо выберите уточнение размеров.');
  const extra=[];
  if(i.ops.includes('bevel')){
   if(!['5','10','15','20','25','30','35'].includes(i.bevel.width))errors.push('Выберите ширину фацета.');
   if(i.bevel.scope==='sides'&&!i.bevel.sides.trim())errors.push('Укажите стороны фацета.');
   extra.push('Фацет: '+i.bevel.width+' мм; '+(i.bevel.scope==='all'?'по всему периметру':i.bevel.sides));
  }
  if(i.ops.includes('drill')){
   for(const r of i.drill.rows){
    if(!r.unknown&&!AGMOrderModel.wholeMillimetres(r.diameter))errors.push('Укажите целый диаметр отверстий или консультацию.');
    if(!Number.isInteger(Number(r.count))||Number(r.count)<1||Number(r.count)>9999)errors.push('Проверьте количество отверстий.');
    extra.push('Отверстия: '+(r.unknown?'диаметр уточнить':'Ø '+r.diameter+' мм')+' — '+r.count+' шт. на изделие; всего '+(Number(r.count)*Number(i.quantity))+' шт.');
   }
   extra.push('Расположение отверстий: '+(i.drill.location||'по чертежу / уточнить'));
  }
  return {id:i.id,type:'material',title:m.title,summary:[m.variants[i.base]+', '+(i.thickness==='unknown'?'толщина уточняется':i.thickness+' мм'),'Размеры: '+(i.unknown?'уточнить':(i.width||'—')+' × '+(i.height||'—')+' мм'),'Количество: '+i.quantity+' шт.','Обработки: '+(i.ops.map(id=>op.get(id)||id).join(', ')||'не выбраны'),...extra,'Упаковка в картон: '+(i.packaging?'да':'нет'),i.note?'Комментарий: '+i.note:''].filter(Boolean).join('\n'),errors,data:i,editUrl:'/materialy/'+i.material+'/?quote-edit='+encodeURIComponent(i.id)};
 }
 return {names,straight,curved,perimeter,mirrorError,mirror,material};
});
