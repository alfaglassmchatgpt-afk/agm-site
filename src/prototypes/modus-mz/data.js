export const source='https://modusline.ru/site/files/1/fasadnye-profili-1.pdf';
// Dimensions in millimetres. Source: MODUS facade technical catalog, pp.63–66.
// Section outlines and hinge meshes are schematic, not machining geometry.
export const profiles=[
 {id:'01',b:19,d:20.5,lip:19,delta:30,h:2200,w:450,colors:['00','04','06','07','11','16','18','21','25','26','29','28']},
 {id:'02',b:19,d:20.5,lip:8,delta:5,h:2200,w:450,colors:['00','04','11','21','25']},
 {id:'04',b:50,d:20.6,lip:15,delta:24,h:2500,w:550,colors:['00','04','11','16','18','21','25','26'],note:'Цвета сверены с актуальной карточкой: шампань и коньяк в PDF указаны, но в карточке отсутствуют.'},
 {id:'07',b:19,d:20.5,lip:3.2,delta:2,h:1500,w:450,colors:['00','11','21','25'],bond:true},
 {id:'09',b:45,d:21,lip:6,delta:5,h:2500,w:550,colors:['00']},
 {id:'10',b:50,d:20,lip:1.2,delta:3,h:2500,w:550,colors:['00','04','06','07','11','21','25'],bond:true,edge:true},
 {id:'12',b:45,d:20,lip:1.2,delta:3,h:2500,w:550,colors:['00','04','06','07','11','18','21','25','26'],bond:true,edge:true},
 {id:'13',b:45,d:20.4,lip:8,delta:5,h:2500,w:550,colors:['00','04','06','07','11','16','18','21','25','26','29','28'],handle:true},
 {id:'17',b:45,d:20.2,lip:3.2,delta:3,h:1500,w:450,colors:['00','04','11','21','25'],bond:true}
];
// MF catalogue printed pp.67–72. A handle variant replaces only the opening rail.
profiles.forEach(p=>p.series='MZ');
const mfRows=[
 ['MF20','MF-20',25,26.6,7,25,null,0],['MF21','MF-20',25,42.5,7,25,'MF20',250],
 ['MF22','MF-20',50,26.6,33,25,'MF20',0],['MF25','MF-20',25,47.2,7,25,'MF20',250],
 ['MF30','MF-30',21.2,22.5,7,21.2,null,0],['MF31','MF-30',21.2,38.9,7,21.2,'MF30',250],
 ['MF32','MF-30',42.4,22.5,29,21.2,'MF30',0],['MF33','MF-30',45.2,22.5,31,21.2,'MF30',250],
 ['MF34','MF-30',45.2,22.5,31,21.2,'MF30',0],['MF35','MF-30',21.2,47.2,7,21.2,'MF30',250]
];
profiles.push(...mfRows.map(([id,series,b,d,deltaW,baseWidth,baseId,gripLength])=>({id,series,b,d,baseWidth,baseId,gripLength,lip:7.5,delta:7,deltaW,deltaH:7,h:2100,w:500,maxWeight:20,colors:['MF20','MF21','MF30','MF31'].includes(id)?['18','21','26']:['21','26'],note:series==='MF-20'?'Скрытые петли MF 20: две, сверху и снизу; открывание 105°. Присадка только в основном профиле MF 20.':'Петли для узких рамочных профилей. Присадка согласуется по выбранной модели.'})));
export const profileSeries=['MZ','MF-20','MF-30'];
export const profileLabel=p=>p.series==='MZ'?`MZ ${p.id}`:p.id.replace('MF','MF ');
export const assemblyLabel=p=>p.baseId?`${p.baseId.replace('MF','MF ')} + ${profileLabel(p)}`:profileLabel(p);
export function glassCut(s){const p=profiles.find(p=>p.id===s.profile),dw=p.deltaW??p.delta,dh=p.deltaH??p.delta;return {width:s.w-dw,height:s.h-dh,thickness:4,offsetX:(s.side==='right'?1:-1)*(dw-dh)/2};}
export const defaultHinge=p=>p.series==='MF-20'?'mf20':p.series==='MF-30'||p.b<20?'narrow':'cup';
export const colors={'00':['Серебро','#b6bec1'],'04':['Инокс','#91948d'],'06':['Шампань','#bfac8e'],'07':['Коньяк','#79503a'],'11':['Белый матовый','#eeeae4'],'16':['Белый глянец','#faf8f2'],'18':['Титан','#7d7b74'],'21':['Латунь','#b49b64'],'25':['Чёрный браш','#323331'],'26':['Чёрный матовый','#242729'],'29':['Серебро браш','#bfc5c4'],'28':['Кофе','#67594f']};
export const glasses={clear:['Прозрачное М1','#c4e0dc'],bronze:['Тонированное — бронза','#b29676'],grey:['Тонированное — серое','#819096'],satin:['Матовое','#d6dfdc'],reeded:['Рифлёное — демонстрация','#c2d7cf'],opaque:['Окрашенное непрозрачное','#b9ad9b'],mirror:['Зеркало — серебро','#b7c5cb']};
export function validate(s){const p=profiles.find(p=>p.id===s.profile), errors=[],warnings=[];
 if(!Number.isInteger(s.w)||!Number.isInteger(s.h)||s.w<200||s.h<200||s.w>6000||s.h>6000)errors.push('Введите целые размеры от 200 до 6000 мм. Значения выше 6000 мм в прототипе не поддерживаются.');
 if(s.h>p.h||s.w>p.w)warnings.push(`За пределами рекомендации MODUS: ${p.h} × ${p.w} мм (высота × ширина). Требуется согласование.`);
 if(s.glass!=='none'&&s.hinges.length&&p.id==='07'&&!(s.glassOpaque??['opaque','mirror'].includes(s.glass))&&s.hinge!=='blum')errors.push('Для прозрачного наполнения MZ 07 каталог указывает BLUM 71B950A. Выберите эту петлю либо непрозрачное стекло.');
 if(s.glass!=='none'&&['07','17'].includes(p.id)&&!(s.glassOpaque??['opaque','mirror'].includes(s.glass))&&!s.mask)errors.push('Для MZ 07/17 область приклейки стекла к профилю должна быть непрозрачной. Подтвердите непрозрачную зону.');
 if(p.series==='MF-20'&&s.hinges.length&&(s.hinge!=='mf20'||s.hinges.length!==2))errors.push('MF-20: используются только две скрытые петли серии MF 20.');
 if(p.series==='MF-30'&&s.hinges.length&&s.hinge!=='narrow')errors.push('MF-30: выберите петлю для узкого рамочного профиля.');
 if(p.gripLength&&s.h<p.gripLength+2*p.baseWidth)errors.push('В модели не хватает места для хвата 250 мм и угловых соединений. Увеличьте высоту фасада; нестандартный вариант требует согласования.');
 if(p.maxWeight)warnings.push('Максимальный вес двери — 20 кг. Полная масса с профилем и фурнитурой проверяется при согласовании.');
 if(p.series==='MF-20'&&s.hinges.length)warnings.push('Петли показаны условно сверху и снизу; производственную присадку определяют чертежи MF 20.');
 if(s.hinges.some(v=>!Number.isInteger(v)||v<=0||v>=s.h))errors.push('Центры петель задаются целыми миллиметрами внутри высоты фасада.');
 if(new Set(s.hinges).size!==s.hinges.length)errors.push('Две петли не могут иметь одинаковую координату.');
 if(s.hinges.some((v,i)=>s.hinges.some((q,j)=>j!==i&&Math.abs(v-q)<60)))warnings.push('Петли расположены близко. Порог 60 мм используется только как демонстрационная проверка, не норма MODUS.');
 if(p.series!=='MF-20'&&s.hinges.some(v=>v<80||s.h-v<80))warnings.push('Петля близко к углу. Допустимый отступ зависит от присадки и сборочного уголка; нужна проверка технолога.');
 if(s.hinges.length)warnings.push('Количество и координаты петель — пожелание к заказу. Несущая способность и производственная присадка пока не рассчитаны.');
 return {errors,warnings};
}
