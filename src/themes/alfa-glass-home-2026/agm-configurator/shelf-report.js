import {outline} from './shelf-geometry.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function image(s){
 if(!['rectangle','circle','semicircle','quarter','trapezoid'].includes(s.shape) || !['width','height','diameter','topWidth'].every(k=>Number.isInteger(s[k])&&s[k]>0&&s[k]<=20000) || !Array.isArray(s.radii)||s.radii.length!==4||!s.radii.every(r=>Number.isInteger(r)&&r>=0&&r<=5000))throw Error('Проверьте параметры схемы изделия.');
 const w=s.shape==='circle'||s.shape==='semicircle'?s.diameter:s.shape==='quarter'?s.diameter/2:s.width;
 const h=s.shape==='circle'?s.diameter:s.shape==='semicircle'||s.shape==='quarter'?s.diameter/2:s.height;
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650" viewBox="0 0 400 260"><rect width="400" height="260" fill="white"/><path d="'+outline(s)+'" fill="#e3f1f1" stroke="#21565c" stroke-width="1.5"/><g fill="#20363b" font-family="Arial" font-size="11" text-anchor="middle"><text x="200" y="25">'+(s.productKind==='mirror'?'Вид спереди':'Вид сверху')+' · размеры в мм</text><text x="200" y="222">Ширина '+w+' мм × '+(s.productKind==='mirror'?'высота':'глубина')+' '+h+' мм</text><text x="200" y="244">'+(s.shape==='trapezoid'?'Верхнее основание '+s.topWidth+' мм':s.shape==='rectangle'?'':'Диаметр исходного круга '+s.diameter+' мм')+'</text></g></svg>';
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try {const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=650;canvas.getContext('2d').drawImage(img,0,0);return canvas.toDataURL('image/png');}finally{URL.revokeObjectURL(url);}
}
export async function prepare(items){
 if(items.filter(i=>i.shelf).length>20)throw Error('В одной заявке допускается до 20 схем изделий.');
 for(const item of items)if(item.shelf)item.shelfImage=await image(item.shelf);
 return items;
}
export function documentHtml(items){return '<!doctype html><html lang="ru"><meta charset="utf-8"><title>Изделия — заявка менеджеру</title><style>body{max-width:850px;margin:30px auto;padding:20px;font:16px/1.5 Arial;color:#20363b}img{width:100%;max-width:650px}pre{white-space:pre-wrap;font:inherit}article{break-inside:avoid;margin-bottom:40px}@media print{article+article{break-before:page}}</style><h1>Изделия — заявка на расчёт</h1><p>Согласовательные схемы. Проверить размеры, обработку и крепления перед изготовлением.</p>'+items.filter(i=>i.shelfImage).map((i,n)=>'<article><h2>'+(n+1)+'. '+esc(i.title)+'</h2><img alt="Схема изделия с размерами" src="'+i.shelfImage+'"><pre>'+esc(i.summary)+'</pre></article>').join('')+'</html>';}
