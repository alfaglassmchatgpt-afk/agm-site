const MAX=2*1024*1024;
function validateProject(input){
 if(!input||input.format!=='alfaglass-facade-project'||input.schemaVersion!==1||!Array.isArray(input.items)||!input.items.length||input.items.length>200)throw Error('Неподдерживаемый формат проекта.');
 if(Buffer.byteLength(JSON.stringify(input))>MAX)throw Error('Проект слишком большой.');
 const reject=o=>{if(!o||typeof o!=='object')return;for(const k of Object.keys(o)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Недопустимое поле проекта.');reject(o[k]);}};reject(input);
 const numbers=new Set();for(const i of input.items){if(i?.number!=null&&(!Number.isSafeInteger(i.number)||i.number<1||i.number>999999))throw Error('Некорректный номер фасада.');const n=String(i?.number??(/^facade-(\d+)$/.exec(i?.id)?.[1]||i?.id));if(numbers.has(n))throw Error('Повторяющийся номер фасада.');numbers.add(n);}
 const ids=new Set();
 for(const i of input.items){const c=i.config;if(!i||typeof i.id!=='string'||ids.has(i.id)||typeof i.name!=='string'||i.name.length>150||!c||!Number.isInteger(c.w)||!Number.isInteger(c.h)||c.w<200||c.h<200||c.w>6000||c.h>6000||!Array.isArray(c.hinges)||c.hinges.length>6||c.hinges.some(n=>!Number.isInteger(n)||n<=0||n>=c.h)||typeof c.profile!=='string'||typeof c.glass!=='string')throw Error('Некорректная конфигурация проекта.');ids.add(i.id);}
 for(const i of input.items){const l=i.layout;if(!l)continue;if(typeof l!=='object'||(l.anchor?(!ids.has(l.anchor)||l.anchor===i.id||!['left','right','above','below'].includes(l.direction)||!Number.isInteger(l.gap)||l.gap<0||l.gap>2000000):(!Number.isFinite(l.x)||!Number.isFinite(l.y)||Math.abs(l.x)>2000000||Math.abs(l.y)>2000000)))throw Error('Некорректное расположение фасада');const seen=new Set([i.id]);let cursor=i;while(cursor.layout?.anchor){cursor=input.items.find(v=>v.id===cursor.layout.anchor);if(!cursor||seen.has(cursor.id))throw Error('Циклическое расположение фасадов');seen.add(cursor.id);}}
 const clean=JSON.parse(JSON.stringify(input));clean.signature=null;if(!ids.has(clean.activeId))clean.activeId=clean.items[0].id;clean.nextId=Math.max(Number.isSafeInteger(clean.nextId)?clean.nextId:1,...clean.items.map(i=>(i.number||0)+1),...clean.items.map(i=>Number(/^facade-(\d+)$/.exec(i.id)?.[1]||0)+1));return clean;
}
module.exports={validateProject,MAX};
