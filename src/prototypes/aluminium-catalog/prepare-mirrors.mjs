// Local preview only. Generated media are supplied separately and never committed.
import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../..');
const out=path.join(root,'.local/aluminium-catalog');
const source=process.argv[2];
if(!source)throw Error('Pass the local directory containing approved generated exec-*.png images.');
await mkdir(path.join(out,'assets/mirrors'),{recursive:true});
for(const file of ['mirrors.html','mirrors.css','mirrors.js'])await copyFile(path.join(here,file),path.join(out,file));
const images={
curved:['756906c8-348c-4ba9-9e39-340759c9f98f','0eea3309-95b9-4ffd-8300-cd5863656543','1fe28ac4-b09e-4416-ac19-0ef0e739b9bc','2d686d9c-1943-4c0d-9727-bdbbd9fcf7ae','7dd8b2c8-860b-4d8d-b80f-c7edc10546f0','966bbe49-04e7-4fdd-8a3b-bbc4f0536ba4'],
'straight-3':['c7e92e9c-8778-4a5a-8081-b7f49b4c019f','71a67789-7a11-4a5c-8413-353e0eda505f','ba6fd527-85e7-42ec-8da8-39dc0bd4fad8'],
'straight-8':['cc16b4b3-b747-4330-aab7-ce560271a40c','3da7472a-ea4d-4441-9432-3415c5fafeef','e156fa21-0238-423f-9421-09bdc76f4409'],
'straight-15':['bb4fb71c-52aa-4e53-a4c3-3f40197c40f1','f6a45c24-5954-452d-8087-2076086d5b02','d4207d69-08ff-4284-874f-38a478ef4d6d'],
'straight-20':['731acbf4-89de-4a72-af3c-a374f8f0ca43','3fcac2c9-c5a4-4c46-898a-b09aa4147a60','1ba0e7f1-0fe5-40c5-8aa1-4f6c9cc07c4d'],
'straight-50':['cc9fa994-041c-4c77-b628-aeb2fd1fc28c','d7595594-6eab-4cd8-8941-081c9a31b1da','a82a36e3-a4c1-4d09-bdb1-0f133329d90b']};
for(const [group,ids] of Object.entries(images))for(const [i,id] of ids.entries())await copyFile(path.join(source,'exec-'+id+'.png'),path.join(out,'assets/mirrors',group+'-'+(i+1)+'.png'));
// Reuse the actual common configurator; no second cart, validation or exporter.
const shared=path.join(root,'src/themes/alfa-glass-home-2026/agm-configurator');
await mkdir(path.join(out,'shared-order'),{recursive:true});
for(const file of ['style.css','app.js','model.js'])await copyFile(path.join(shared,file),path.join(out,'shared-order',file));
const materials=JSON.parse(await readFile(path.join(shared,'materials.json'),'utf8'));
const variants=Object.fromEntries([3,8,15,20,50].map(w=>['straight-'+w,'Прямолинейная рама · лицо '+w+' мм']));
variants.curved='Криволинейная рама · лицо 9 мм';
materials['mirror-frame-preview']={title:'Зеркало в алюминиевой раме',variants,thicknesses:['unknown'],operations:['frame'],policy:'mirror',note:'Форму и цвет укажите в пожеланиях. Размеры в полях относятся к полотну; наружный габарит с рамой можно указать в пожеланиях. Толщину зеркала согласуем.'};
const data={current:'mirror-frame-preview',materials,operations:JSON.parse(await readFile(path.join(shared,'operations.json'),'utf8')),operationAssetsUrl:'shared-order/',processingUrl:'#'};
const choices=Object.entries({base:['Рама',variants],thickness:['Толщина зеркала',{unknown:'Согласовать'}]}).map(([name,[label,options]])=>'<fieldset class="choice"><legend>'+label+'</legend><div class="options">'+Object.entries(options).map(([value,title],i)=>`<label class="option"><input type="radio" name="${name}" value="${value}" ${i===0?'checked':''}><span>${title}</span></label>`).join('')+'</div></fieldset>').join('');
const component=(await readFile(path.join(shared,'component.html'),'utf8')).replace('__AGM_CHOICES__',choices);
await writeFile(path.join(out,'mirror-order.html'),'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Мой расчёт — локальный прототип</title><link rel="stylesheet" href="shared-order/style.css"><style>body{margin:0;padding:22px;font:15px/1.5 Arial,sans-serif}.agm-order{color:var(--ink);background:var(--paper)}body:has(.agm-order){background:transparent}.agm-order .workspace{margin:0}.agm-order .cart-panel{position:static}</style></head><body>'+component+'<script id="agm-order-data" type="application/json">'+JSON.stringify(data).replaceAll('<','\\u003c')+'</script><script src="shared-order/model.js"></script><script src="shared-order/app.js"></script></body></html>');
console.log('Mirror preview ready in .local/aluminium-catalog/mirrors.html; production untouched.');
