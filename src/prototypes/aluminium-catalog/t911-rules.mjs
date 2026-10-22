export function dimensions(b,h){
 if(!Number.isInteger(b)||!Number.isInteger(h)||b<2400||b>4759||h<1000||h>4000) throw new RangeError('Размеры вне диапазона макета');
 const door=(b+41)/4, height=h-70, passage=b-2*door;
 return {b,h,door,height,passage,travel:b/2-door,glassWidth:door-27,glassHeight:height-52,ratio:height/door};
}

export function partitionMaterialAllowed(m){return !m.mirror && m.thickness===4 && !/lacobel|matelac|matelak|лакобель|мателак/i.test([m.id,m.slug,m.title].join(' '));}
export function checkGlassSize(w,h,record){
 if(!record?.formats?.length)return {status:'unknown',message:'Размер листа не указан в карточке. Допустимый размер заполнения нужно уточнить.'};
 const matching=record.formats.filter(([a,b])=>(w<=a&&h<=b)||(w<=b&&h<=a));
 const text=record.formats.map(f=>f.join(' × ')).join('; ');
 if(!matching.length)return {status:'exceeded',message:`Не подходит по размеру: заполнение ${w} × ${h} мм превышает форматы листа ${text} мм. Уменьшите размеры или выберите другое стекло.`};
 return {status:'conditional',message:`По габаритам помещается в лист ${matching.map(f=>f.join(' × ')).join('; ')} мм. Проверьте направление рисунка, наличие формата в толщине 4 мм и припуск на обработку. Формат листа не равен гарантированному размеру готовой детали.`};
}
