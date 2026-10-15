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
export const colors={'00':['Серебро','#b6bec1'],'04':['Инокс','#91948d'],'06':['Шампань','#bfac8e'],'07':['Коньяк','#79503a'],'11':['Белый матовый','#eeeae4'],'16':['Белый глянец','#faf8f2'],'18':['Титан','#7d7b74'],'21':['Латунь','#b49b64'],'25':['Чёрный браш','#323331'],'26':['Чёрный матовый','#242729'],'29':['Серебро браш','#bfc5c4'],'28':['Кофе','#67594f']};
export const glasses={clear:['Прозрачное М1','#c4e0dc'],bronze:['Тонированное — бронза','#b29676'],grey:['Тонированное — серое','#819096'],satin:['Матовое','#d6dfdc'],reeded:['Рифлёное — демонстрация','#c2d7cf'],opaque:['Окрашенное непрозрачное','#b9ad9b'],mirror:['Зеркало — серебро','#b7c5cb']};
export function validate(s){const p=profiles.find(p=>p.id===s.profile), errors=[],warnings=[];
 if(!Number.isInteger(s.w)||!Number.isInteger(s.h)||s.w<200||s.h<200||s.w>6000||s.h>6000)errors.push('Введите целые размеры от 200 до 6000 мм. Значения выше 6000 мм в прототипе не поддерживаются.');
 if(s.h>p.h||s.w>p.w)warnings.push(`За пределами рекомендации MODUS: ${p.h} × ${p.w} мм (высота × ширина). Требуется согласование.`);
 if(s.glass!=='none'&&s.hinges.length&&p.id==='07'&&!(s.glassOpaque??['opaque','mirror'].includes(s.glass))&&s.hinge!=='blum')errors.push('Для прозрачного наполнения MZ 07 каталог указывает BLUM 71B950A. Выберите эту петлю либо непрозрачное стекло.');
 if(s.glass!=='none'&&['07','17'].includes(p.id)&&!(s.glassOpaque??['opaque','mirror'].includes(s.glass))&&!s.mask)errors.push('Для MZ 07/17 область приклейки стекла к профилю должна быть непрозрачной. Подтвердите непрозрачную зону.');
 if(s.hinges.some(v=>!Number.isInteger(v)||v<=0||v>=s.h))errors.push('Центры петель задаются целыми миллиметрами внутри высоты фасада.');
 if(new Set(s.hinges).size!==s.hinges.length)errors.push('Две петли не могут иметь одинаковую координату.');
 if(s.hinges.some((v,i)=>s.hinges.some((q,j)=>j!==i&&Math.abs(v-q)<60)))warnings.push('Петли расположены близко. Порог 60 мм используется только как демонстрационная проверка, не норма MODUS.');
 if(s.hinges.some(v=>v<80||s.h-v<80))warnings.push('Петля близко к углу. Допустимый отступ зависит от присадки и сборочного уголка; нужна проверка технолога.');
 if(s.hinges.length)warnings.push('Количество и координаты петель — пожелание к заказу. Несущая способность и производственная присадка пока не рассчитаны.');
 return {errors,warnings};
}
