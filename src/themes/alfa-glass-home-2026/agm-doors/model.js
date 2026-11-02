/* Door specification adapter for the existing shared basket. No submission logic. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AGMDoors=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const labels={fittings:'Фитинги',finish:'Отделка',closer:'Возврат',handle:'Ручка',lock:'Запирание',install:'Установка',delivery:'Доставка'};
 const integer=(v,min,max)=>String(v).trim()!==''&&Number.isInteger(Number(v))&&Number(v)>=min&&Number(v)<=max;
 function thicknesses(material){return (material?.thicknesses||[]).filter(v=>['8','10'].includes(String(v))).map(String);}
 function entry(i,materials,visuals,options){
  const errors=[],m=materials[i.glass],lines=[];
  // Retain original form input bounds. These are enquiry bounds, not fabrication approval.
  if(!integer(i.width,400,4000))errors.push('Ширина проёма: целое число от 400 до 4000 мм.');
  if(!integer(i.height,1000,3500))errors.push('Высота проёма: целое число от 1000 до 3500 мм.');
  if(!integer(i.quantity,1,Number.MAX_SAFE_INTEGER))errors.push('Количество проёмов должно быть целым положительным числом.');
  if(!['1','2'].includes(String(i.leaves)))errors.push('Выберите одну или две створки.');
  if(!m||!visuals[i.glass])errors.push('Выберите материал из каталога.');
  if(!thicknesses(m).includes(String(i.thickness)))errors.push('Выбранная толщина недоступна для этого стекла.');
  for(const [key,label] of Object.entries(labels)){
   const option=options[key]?.find(o=>o.value===i[key]);
   if(!option)errors.push('Проверьте поле «'+label+'».');
   lines.push(label+': '+(option?.label||'не выбрано'));
  }
  if(typeof i.comment!=='string'||i.comment.length>3000)errors.push('Комментарий — не более 3000 символов.');
  const summary=['Проём: '+i.width+' × '+i.height+' мм; створок: '+i.leaves,
   'Количество проёмов: '+i.quantity,'Стекло: '+(m?.title||'не выбрано')+'; '+i.thickness+' мм',
   ...lines,i.comment?'Пожелания: '+i.comment:'',
   'Размеры полотен, безопасное исполнение стекла, обработку кромки и совместимость фурнитуры подтвердим по проекту. Цена — после согласования.'].filter(Boolean).join('\n');
  return {id:i.id,type:'door',title:'Маятниковая дверь из стекла',summary,errors,data:{...i},editUrl:'/dveri-iz-stekla/?quote-edit='+encodeURIComponent(i.id)};
 }
 return {entry,thicknesses};
});
