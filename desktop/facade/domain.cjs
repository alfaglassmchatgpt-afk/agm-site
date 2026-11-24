const MAX=2*1024*1024;
function validateProject(input){
 if(!input||input.format!=='alfaglass-facade-project'||input.schemaVersion!==1||!Array.isArray(input.items)||!input.items.length||input.items.length>200)throw Error('Неподдерживаемый формат проекта.');
 if(Buffer.byteLength(JSON.stringify(input))>MAX)throw Error('Проект слишком большой.');
 const reject=o=>{if(!o||typeof o!=='object')return;for(const k of Object.keys(o)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Недопустимое поле проекта.');reject(o[k]);}};reject(input);
 const ids=new Set();
 for(const i of input.items){const c=i.config;if(!i||typeof i.id!=='string'||ids.has(i.id)||typeof i.name!=='string'||i.name.length>150||!c||!Number.isInteger(c.w)||!Number.isInteger(c.h)||c.w<200||c.h<200||c.w>6000||c.h>6000||!Array.isArray(c.hinges)||c.hinges.length>6||c.hinges.some(n=>!Number.isInteger(n)||n<=0||n>=c.h)||typeof c.profile!=='string'||typeof c.glass!=='string')throw Error('Некорректная конфигурация проекта.');ids.add(i.id);}
 const clean=JSON.parse(JSON.stringify(input));clean.signature=null;if(!ids.has(clean.activeId))clean.activeId=clean.items[0].id;clean.nextId=Math.max(Number.isSafeInteger(clean.nextId)?clean.nextId:1,...clean.items.map(i=>Number(/^facade-(\d+)$/.exec(i.id)?.[1]||0)+1));return clean;
}
module.exports={validateProject,MAX};
