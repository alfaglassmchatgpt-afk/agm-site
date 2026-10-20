import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {Reflector} from './vendor/Reflector.js';
import {profiles,colors,glasses,validate,source} from './data.js?v=20261015-defaults';
import {sections,svgSection,sectionNotes} from './sections.js';
import {railGeometry,sampleGeometry} from './profile-mesh.js';
import {profileMetal} from './metal.js';
import {FacadeProject} from './project.js?v=20261015-groups';
import {transparentSlugs,transparentItems,matteSlugs,matteItems,stopsolSlugs,stopsolItems,reedSlugs,reedItems,patternedSlugs,patternedItems} from './glass-groups.js?v=estriado-20261020';
import {ProjectConfirmation} from './confirmation.js';
import {studioEnvironment,studioBackdrop,refractionSurround,moruOptics,estriadoOptics,glassMaterial,glassEdgeMaterial,stopsolGlassOptics,sampleCabinet,satinContactMap} from './glass-render.js?v=silvit-photo-20261020';
const catalogue=await fetch('./glass-catalog.json?v=silvit-20261020').then(r=>{if(!r.ok)throw new Error('Не удалось загрузить каталог стекла');return r.json();});
const glassItems=Object.fromEntries(catalogue.items.map(m=>[m.id,m]));
Object.keys(glasses).forEach(k=>delete glasses[k]);
glassItems.none={id:'none',title:'Без наполнения',color:'none',mirror:false};
glasses.none=['Без наполнения','none'];
for(const item of catalogue.items)glasses[item.id]=[item.title,item.color];
const $=s=>document.querySelector(s), s={profile:profiles[0].id,w:350,h:600,color:profiles[0].colors[0],glass:'none',glassOpaque:false,backdrop:false,hinge:'none',side:'left',origin:'top',hinges:[],handle:false,mask:false,reed:'vertical',view:'3d'};
const defaults=structuredClone(s), project=new FacadeProject(defaults), confirmation=new ProjectConfirmation();
const pair=()=>project.partner();
const previewSide=()=>s.side;
const scene=new T.Scene();scene.background=studioBackdrop();
const camera=new T.PerspectiveCamera(34,1,5,50000), renderer=new T.WebGLRenderer({antialias:true});
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
renderer.setPixelRatio((innerWidth>900?2:Math.min(devicePixelRatio,1.5)));renderer.setClearColor('#e4e1da');$('#scene').append(renderer.domElement);
const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;
scene.add(new T.HemisphereLight(0xfffaf2,0x8c8880,.8));const light=new T.DirectionalLight(0xfff5e7,3.4);light.position.set(-900,1200,1400);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-3000,right:3000,top:3000,bottom:-3000,near:1,far:10000});light.shadow.bias=-.0002;light.shadow.normalBias=2;light.shadow.radius=18;light.shadow.blurSamples=8;scene.add(light);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.VSMShadowMap;const fill=new T.DirectionalLight(0xf5f7ff,.7);fill.position.set(1200,400,500);scene.add(fill);
const env=studioEnvironment(renderer);scene.environment=env.texture;
const coatingLights=new T.Group();coatingLights.visible=false;
for(const [x,w,color] of [[-1100,180,'#f4f2ec'],[-850,60,'#454b50'],[-600,160,'#f4f2ec'],[-370,45,'#454b50'],[-120,140,'#deded9'],[140,40,'#454b50']]){
 const card=new T.Mesh(new T.PlaneGeometry(w,3000),new T.MeshBasicMaterial({color,side:T.DoubleSide}));card.position.set(x,0,1600);coatingLights.add(card);
}
scene.add(coatingLights);
let showSampleCabinet=false;
let model=new T.Group();scene.add(model);
function fit(){const inspect=s.view==='profile',distance=inspect?Math.max(s.handle?155:125,150/camera.aspect)*1.1:Math.max(s.h,(pair()?s.w*2+40:s.w)/camera.aspect)*2;camera.position.set(inspect?distance*.5:s.view==='3d'?distance*.4:0,inspect?distance*.35:s.view==='3d'?distance*.15:0,s.view==='back'?-distance:distance);orbit.target.set(0,0,0);orbit.update();}
function disposeModel(root){const materials=new Set(),textures=new Set();root.traverse(o=>{o.getRenderTarget?.().dispose();o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m)materials.add(m);});for(const m of materials){for(const key of ['map','normalMap','roughnessMap','bumpMap'])if(m[key])textures.add(m[key]);m.dispose();}for(const texture of textures)texture.dispose();}
function build(){
 light.intensity=s.view==='profile'?1:3.4;scene.remove(model);disposeModel(model);model=new T.Group();scene.add(model);
 const extent=Math.max(s.h,s.w*(pair()?2:1))*1.4;Object.assign(light.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent});light.shadow.camera.updateProjectionMatrix();
 const other=pair(), states=other&&s.view!=='profile'?[project.current(),other].sort((a,b)=>a.config.side==='left'?-1:1):[project.current()];
 states.forEach((item,i)=>{const part=buildFacade({...item.config,view:s.view,backdrop:s.backdrop});part.traverse(o=>{if(o.isMesh&&!(Array.isArray(o.material)?o.material.some(m=>m.transmission):o.material?.transmission)){o.castShadow=true;o.receiveShadow=true;}});if(states.length===2)part.position.x=(i===0?-1:1)*(s.w+40)/2;model.add(part);if(showSampleCabinet&&['3d','front'].includes(s.view)){const cabinet=sampleCabinet(item.config.w,item.config.h,showSampleCabinet);cabinet.position.x=part.position.x;model.add(cabinet);}});
 if(!showSampleCabinet&&states.some(item=>(reedSlugs.includes(glassItems[item.config.glass].slug)||['krezet','diamant','gothic','kathedral-klein','kathedralaqualite','krepi','silvit'].includes(glassItems[item.config.glass].slug)))&&['3d','front','back'].includes(s.view)){
  model.add(refractionSurround(s.w*states.length,s.h));
 }
}
function buildFacade(s){
 const model=new T.Group();
 const box=(w,h,d,x,y,z,mat)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);model.add(m);return m;};
 const p=profiles.find(p=>p.id===s.profile),mat=profileMetal(s.color);
 const w=s.w,h=s.h,b=p.b,d=p.d,q=sections[p.id];mat.side=T.DoubleSide;
 if(s.view==='profile'){
   const id=s.handle&&p.id==='13'?'13-01':p.id;
   const mesh=new T.Mesh(sampleGeometry(id),mat);model.add(mesh);
   const edges=new T.LineSegments(new T.EdgesGeometry(mesh.geometry,28),new T.LineBasicMaterial({color:'#5e7784',transparent:true,opacity:.35}));if(!['13','13-01'].includes(id))model.add(edges);else{edges.geometry.dispose();edges.material.dispose();}
   return model;
 }
 for(const side of ['left','right','top','bottom']){
   // Handle extrusion replaces only a central part of the opposite vertical rail.
   if(s.handle&&p.id==='13'&&side===(s.side==='left'?'right':'left')){
     const span=Math.min(250,h-80),a=(h-span)/2;
     // Cut the regular extrusion at square planes so the pieces do not overlap.
     for(const [start,end] of [[0,a/h],[(a+span)/h,1]])model.add(new T.Mesh(railGeometry(p.id,w,h,side,{start,end}),mat));
     const g=railGeometry('13-01',w,span,side,{miter:false});model.add(new T.Mesh(g,mat));
   }else model.add(new T.Mesh(railGeometry(p.id,w,h,side),mat));
 }
 if(s.glass!=='none'){
 const gm=glassMaterial(glassItems[s.glass],w-p.delta,h-p.delta,s.reed,renderer,Math.max(0,b-p.delta/2));

 const edge=glassEdgeMaterial(glassItems[s.glass],gm);
 if(glassItems[s.glass].matte&&!glassItems[s.glass].opaque&&b>20&&b>p.delta/2)gm.roughnessMap=satinContactMap(w-p.delta,h-p.delta,b-p.delta/2);
 box(w-p.delta,h-p.delta,4,0,0,q.glassY+2-d,edge?[edge,edge,edge,edge,gm,gm]:gm);
 const moruCoating=moruOptics[glassItems[s.glass].slug]?.coating;
 if(stopsolGlassOptics[glassItems[s.glass].slug]||moruCoating){
   const coating=new Reflector(new T.PlaneGeometry(w-p.delta,h-p.delta),{textureWidth:1024,textureHeight:1024,color:moruCoating||stopsolGlassOptics[glassItems[s.glass].slug].coating,clipBias:.003});
   coating.material.fragmentShader=coating.material.fragmentShader.replace('blendOverlay( base.rgb, color ), 1.0','blendOverlay( base.rgb, color ), 0.32');
   if(moruCoating){
    coating.material.vertexShader=coating.material.vertexShader.replace('varying vec4 vUv;', 'varying vec4 vUv; varying vec2 ribUV;').replace('void main() {','void main() { ribUV = uv;');
    coating.material.fragmentShader=coating.material.fragmentShader.replace('varying vec4 vUv;', 'varying vec4 vUv; varying vec2 ribUV;')
      .replace('vec4 base = texture2DProj( tDiffuse, vUv );', 'vec4 sampleUV = vUv; sampleUV.'+(s.reed==='horizontal'?'y':'x')+' += sin(ribUV.'+(s.reed==='horizontal'?'y':'x')+' * '+(((s.reed==='horizontal'?h:w)-p.delta)/12).toFixed(6)+' * 6.2831853) * 0.012 * vUv.w; vec4 base = texture2DProj(tDiffuse, sampleUV);')
      .replace('color ), 0.32','color ), 0.42');
   }
   coating.material.transparent=true;coating.material.depthWrite=false;
   const reflect=coating.onBeforeRender;
   coating.onBeforeRender=function(...args){coatingLights.visible=true;try{reflect.apply(this,args);}finally{coatingLights.visible=false;}};
   coating.position.z=q.glassY+4-d+.15;model.add(coating);
 }
 if(glassItems[s.glass].mirror){
   const mirror=new Reflector(new T.PlaneGeometry(w-p.delta,h-p.delta),{textureWidth:1024,textureHeight:1024,color:glassItems[s.glass].color==='#d7eeea'?'#858585':glassItems[s.glass].color,clipBias:.003});
   mirror.position.z=q.glassY+4-d+.1;model.add(mirror);
 }
 if(s.mask&&['07','17'].includes(p.id)){const mask=new T.MeshStandardMaterial({color:'#373d3c'});const z=q.glassY-d+.1;box(b-p.delta/2,h-p.delta,.2,-w/2+(b+p.delta/2)/2,0,z,mask);box(b-p.delta/2,h-p.delta,.2,w/2-(b+p.delta/2)/2,0,z,mask);box(w-p.delta,b-p.delta/2,.2,0,h/2-(b+p.delta/2)/2,z,mask);box(w-p.delta,b-p.delta/2,.2,0,-h/2+(b+p.delta/2)/2,z,mask);}
 }
 const hm=new T.MeshStandardMaterial({color:'#909b9f',metalness:.7,roughness:.25});s.hinges.forEach(v=>{const x=(s.side==='left'?-1:1)*(w/2-b/2);box(p.b>20?34:14,48,9,x,h/2-v,-d-3,hm);box(42,16,6,x+(s.side==='left'?-20:20),h/2-v,-d-8,hm);});
 return model;
}
new ResizeObserver(()=>{const r=$('#view').getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();fit();}).observe($('#view'));
renderer.setAnimationLoop(()=>{orbit.update();renderer.render(scene,camera);});
function controls(){glassChoices();const p=profiles.find(p=>p.id===s.profile);$('#profiles').innerHTML=profiles.map(p=>`<button data-profile="${p.id}" class="${s.profile===p.id?'active':''}">MZ ${p.id}<small>${p.b} мм</small></button>`).join('');$('#profiles').querySelectorAll('button').forEach(b=>b.onclick=()=>{s.profile=b.dataset.profile;s.handle=false;s.mask=false;s.hinge=s.hinges.length?(profiles.find(p=>p.id===s.profile).b<20?'narrow':'cup'):'none';if(!profiles.find(p=>p.id===s.profile).colors.includes(s.color))s.color='00';controls();update();if(s.view==='profile')fit();});
 const cs=s.handle?['00','21','25']:p.colors;$('#colors').innerHTML=cs.map(k=>`<button title="${colors[k][0]}" aria-label="${colors[k][0]}" data-color="${k}" class="${s.color===k?'active':''}" style="background:${colors[k][1]}"></button>`).join('');$('#colors').querySelectorAll('button').forEach(b=>b.onclick=()=>{s.color=b.dataset.color;controls();update();if(s.view==='profile')fit();});
 $('#color-name').textContent=`${colors[s.color][0]} · ${s.color}. Наличие уточняется.`;$('#profile-name').textContent=`MZ ${p.id}`;$('#profile-dims').textContent=`${p.b} × ${p.d} мм · схема сечения`;
 $('#section-svg').innerHTML=svgSection(p.id,colors[s.color][1]);
 $('#handle-wrap').hidden=!p.handle;$('#handle').checked=s.handle;$('#mask-wrap').hidden=s.glass==='none'||!['07','17'].includes(p.id);$('#mask').checked=s.mask;$('#reed-wrap').hidden=!glassItems[s.glass].pitch||glassItems[s.glass].pattern==='grid';
 const item=glassItems[s.glass];$('#glass-card-access').hidden=s.glass==='none';$('#glass-link').setAttribute('aria-label','Посмотреть '+item.title+' в каталоге — новая вкладка');$('#glass-link').href='https://alfaglass.ru/materialy/'+item.slug+'/';$('#glass-note').textContent=s.glass==='none'?'Только алюминиевая рамка по указанным размерам, без стекла.':item.texturePending?'Точная фактура пока не воспроизведена — показаны только базовые цвет и прозрачность.':item.pitch?`${item.pitchEstimated?"Приблизительный шаг":"Рельеф с шагом"} ${item.pitch.toFixed(2)} мм; масштаб сохраняется при изменении размера. Оптика приблизительная.`:'Студийная визуализация. Оттенок и отражение ориентировочные.';$('#glass-count').textContent=`${transparentItems(catalogue.items).length+matteItems(catalogue.items).length+stopsolItems(catalogue.items).length+reedItems(catalogue.items).length+patternedItems(catalogue.items).length+1} материалов · 4 мм`;
 $('#hinge').innerHTML=[['none','Без петель и присадок'],...(p.b<20?[['narrow','Специальная для узкого профиля'],['mzf','MZF 63 · подбор присадки'],...(p.id==='07'?[['blum','BLUM 71B950A']]:[])]:[['cup','Чашка 35 мм · модель уточнить']])].map(([v,l])=>`<option value="${v}">${l}</option>`).join('');$('#hinge').value=s.hinge;$('#count').value=s.hinges.length;for(const id of ['side','origin','even'])$('#'+id).disabled=!s.hinges.length;hingeFields();}
function hingeFields(){ $('#hinges').innerHTML=s.hinges.map((v,i)=>`<div class="hinge-row"><b>${i+1}</b><input aria-label="Положение петли ${i+1}" type="range" min="1" max="${s.h-1}" value="${s.origin==='top'?v:s.h-v}" data-i="${i}"><input aria-label="Петля ${i+1}, мм" type="number" step="1" value="${s.origin==='top'?v:s.h-v}" data-i="${i}"></div>`).join('');$('#hinges').querySelectorAll('input').forEach(el=>el.oninput=()=>{s.hinges[+el.dataset.i]=s.origin==='top'?+el.value:s.h-+el.value;el.parentElement.querySelectorAll('input').forEach(other=>{if(other!==el)other.value=el.value;});update();});}
let geometry;
function drawing(){const scale=Math.min(480/s.h,470/s.w),w=s.w*scale,h=s.h*scale,x=(760-w)/2,y=(620-h)/2;geometry={scale,x,y,w,h};const p=profiles.find(p=>p.id===s.profile),hx=previewSide()==='left'?x+10:x+w-10;
 const item=glassItems[s.glass],ribbed=reedSlugs.includes(item.slug),horizontal=s.reed==='horizontal';
 // Schematic spacing has a screen minimum so fine ribs remain readable at overview scale.
 const step=Math.max(4,(item.pitch||8)*scale),inset=Math.max(3,p.b*scale)/2;
 const stripes=ribbed?`<defs><pattern id="drawing-ribs" patternUnits="userSpaceOnUse" width="${step}" height="${step}"><path d="${horizontal?'M0 .5H'+step:'M.5 0V'+step}" stroke="#426473" stroke-opacity=".38" stroke-width=".7"/></pattern></defs><rect data-rib-direction="${horizontal?'horizontal':'vertical'}" x="${x+inset}" y="${y+inset}" width="${Math.max(0,w-2*inset)}" height="${Math.max(0,h-2*inset)}" fill="url(#drawing-ribs)" pointer-events="none"><title>Направление рифления; частота полос на схеме условная</title></rect>`:'';
 $('#drawing').innerHTML=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glasses[s.glass][1]}" stroke="${colors[s.color][1]}" stroke-width="${Math.max(3,p.b*scale)}"/>${stripes}<path d="M${x} ${y-18}H${x+w} M${x-22} ${y}V${y+h}" class="dimension"/><text x="380" y="${y-26}" text-anchor="middle" class="dimtext">${s.w} мм</text><text x="${x-30}" y="310" transform="rotate(-90 ${x-30} 310)" text-anchor="middle" class="dimtext">${s.h} мм</text>${s.hinges.map((v,i)=>`<g><circle class="hinge-dot" data-i="${i}" cx="${hx}" cy="${y+v*scale}" r="10" fill="#087ca7" stroke="white" stroke-width="3"/><text x="${previewSide()==='left'?hx+18:hx-18}" y="${y+v*scale+4}" text-anchor="${previewSide()==='left'?'start':'end'}" class="dimtext">${i+1} · ${s.origin==='top'?v:s.h-v} мм</text></g>`).join('')}`;}
let drag=null;$('#drawing').onpointerdown=e=>{if(e.target.dataset.i!==undefined){drag=+e.target.dataset.i;$('#drawing').setPointerCapture(e.pointerId);}};$('#drawing').onpointermove=e=>{if(drag===null)return;const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform($('#drawing').getScreenCTM().inverse());s.hinges[drag]=Math.max(1,Math.min(s.h-1,Math.round((pt.y-geometry.y)/geometry.scale)));hingeFields();update();};$('#drawing').onpointerup=$('#drawing').onpointercancel=()=>drag=null;
function update(){project.update(s);const p=profiles.find(p=>p.id===s.profile),v=validate(s);$('#export').disabled=project.items.some(item=>validate(item.config).errors.length>0);$('#messages').innerHTML=[...v.errors.map(t=>`<div class="message error">${t}</div>`),...v.warnings.map(t=>`<div class="message">${t}</div>`)].join('');$('#model-title').textContent=`MODUS MZ ${s.view==='profile'&&s.handle?'13-01':p.id}`;$('#model-size').textContent=s.view==='profile'?`Сечение ${sections[s.handle?'13-01':p.id].b} × ${sections[s.handle?'13-01':p.id].d} мм · отрезок 90 мм`:`${s.w} × ${s.h} мм`;$('#fact-profile').textContent=`${p.b} × ${p.d} мм`;$('#fact-glass').textContent=s.glass==='none'?'Без наполнения':`${s.w-p.delta} × ${s.h-p.delta} × 4`;$('#fact-limit').textContent=`${p.h} × ${p.w} мм`;$('#summary-title').textContent=`MZ ${p.id} / ${s.w} × ${s.h} мм`;$('#summary-line').textContent=`${colors[s.color][0]} · ${glasses[s.glass][0]} · ${s.hinges.length?s.hinges.length+' петли':'Без петель и присадок'}`;renderProject();for(const item of project.items){if(item.id===project.activeId)continue;const errors=validate(item.config).errors;if(errors.length){const note=document.createElement('div');note.className='message error';note.textContent=item.name+': '+errors.join(' ');$('#messages').append(note);}}if(Number.isInteger(s.w)&&Number.isInteger(s.h)&&s.w>=200&&s.h>=200&&s.w<=6000&&s.h<=6000){build();drawing();}}
function glassChoices(){
 $('#glass-selected').textContent='Выбрано: '+glassItems[s.glass].title;
 $('#glass-categories').querySelectorAll('[data-glass]').forEach(b=>{const active=b.dataset.glass===s.glass;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 for(const [category,slugs,title] of [['transparent',transparentSlugs,'Стекло прозрачное'],['matte',matteSlugs,'Стекло матовое'],['stopsol',stopsolSlugs,'Стопсол Феникс'],['reed',reedSlugs,'Рифлёное стекло'],['patterned',patternedSlugs,'Узорчатое стекло']]){
  const active=slugs.includes(glassItems[s.glass].slug),button=$('#'+category+'-toggle');
  button.classList.toggle('active',active);button.querySelector('.category-title').textContent=active?glassItems[s.glass].title:title;
 }
}
const materialCategories=[['transparent',transparentItems],['matte',matteItems],['stopsol',stopsolItems],['reed',reedItems],['patterned',patternedItems]];
for(const [category,items] of materialCategories){
 for(const item of items(catalogue.items)){
  const b=document.createElement('button');b.type='button';b.dataset.glass=item.id;b.dataset.category=category;b.textContent=item.title;$('#'+category+'-materials').append(b);
 }
 $('#'+category+'-toggle').onclick=()=>{
  const list=$('#'+category+'-materials');list.hidden=!list.hidden;$('#'+category+'-toggle').setAttribute('aria-expanded',String(!list.hidden));
 };
}
$('#glass-categories').querySelectorAll('[data-glass]').forEach(b=>b.onclick=()=>{
 s.glass=b.dataset.glass;s.glassOpaque=!!(glassItems[s.glass].mirror||glassItems[s.glass].opaque);controls();update();
 for(const [category] of materialCategories){$('#'+category+'-materials').hidden=true;$('#'+category+'-toggle').setAttribute('aria-expanded','false');}
 if(b.dataset.category)$('#'+b.dataset.category+'-toggle').focus({preventScroll:true});
});
glassChoices();
['width','height'].forEach((id,i)=>$('#'+id).oninput=e=>{s[i?'h':'w']=Number(e.target.value);update();if(s.w>=200&&s.h>=200)fit();});
for(const id of ['hinge','side','reed','origin'])$('#'+id).onchange=e=>{s[id]=e.target.value;if(id==='hinge'){if(s.hinge==='none')s.hinges=[];else if(!s.hinges.length)s.hinges=[100,s.h-100];}s.glassOpaque=!!(glassItems[s.glass].mirror||glassItems[s.glass].opaque);controls();update();};
$('#count').onchange=e=>{s.hinges=Array(+e.target.value).fill(0);if(!s.hinges.length)s.hinge='none';else if(s.hinge==='none')s.hinge=profiles.find(p=>p.id===s.profile).b<20?'narrow':'cup';even();controls();};function even(){const n=s.hinges.length;s.hinges=s.hinges.map((_,i)=>Math.round(100+i*(s.h-200)/Math.max(1,n-1)));hingeFields();update();}$('#even').onclick=even;
$('#handle').onchange=e=>{s.handle=e.target.checked;if(s.handle&&!['00','21','25'].includes(s.color))s.color='00';controls();update();if(s.view==='profile')fit();};$('#mask').onchange=e=>{s.mask=e.target.checked;update();};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{s.view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(t=>t.classList.toggle('active',t===b));$('#drawing').toggleAttribute('hidden',s.view!=='drawing');$('#scene').style.visibility=s.view==='drawing'?'hidden':'visible';$('#gesture').textContent=s.view==='drawing'?'Перемещайте синие точки · координаты в миллиметрах':s.view==='profile'?'Отрезок 90 мм · вращайте, чтобы рассмотреть открытый торец':'Вращайте мышью или пальцем · колесо — масштаб';update();fit();});$('#reset').onclick=fit;
for(const [id,kind] of [['sample-cabinet','books'],['kitchen-cabinet','kitchen']])$('#'+id).onclick=()=>{showSampleCabinet=showSampleCabinet===kind?false:kind;$('#sample-cabinet').setAttribute('aria-pressed',String(showSampleCabinet==='books'));$('#kitchen-cabinet').setAttribute('aria-pressed',String(showSampleCabinet==='kitchen'));$('#cabinet-scale').textContent=kind==='kitchen'?'Глубина 312 мм · бутылки 240 мм · посуда в масштабе':'Глубина 312 мм · книги 210 мм · шар Ø60 мм';build();};
function confirmationControls(){
 const valid=!project.items.some(item=>validate(item.config).errors.length),confirmed=confirmation.check(project.items,valid);
 $('#confirm-project').disabled=!valid||confirmed;$('#send-project').disabled=!confirmed;
 $('#confirm-project').textContent=confirmed?'Конфигурация подтверждена':'Подтвердить конфигурацию';
 $('#confirmation-status').textContent=confirmed?'Все фасады проекта подтверждены. Изменение параметров потребует повторного подтверждения.':valid?'Проверьте все фасады и подтвердите конфигурацию, чтобы перейти к отправке.':'Исправьте ошибки в фасадах проекта перед подтверждением.';
 return confirmed;
}
function renderProject(){
 confirmationControls();
 $('#remove-facade').hidden=project.items.length<2;$('#undo-remove').hidden=project.removals.length===0;
 $('#facade-navigation').hidden=project.items.length<2;
 const select=$('#facade-select');select.replaceChildren();
 const groups=project.groups(),activeGroup=groups.find(group=>group.members.some(item=>item.id===project.activeId));
 for(const group of groups){const option=document.createElement('option');option.value=group.id;option.textContent=group.members[0].name+(group.members.length===2?' · пара (2 створки)':'');select.append(option);}select.value=activeGroup.id;
 if(document.activeElement!==$('#facade-name'))$('#facade-name').value=project.current().name;
 $('#project-note').textContent=pair()?'Связанная пара: размеры, материалы и петли меняются у обоих. Имена индивидуальные. В 3D показаны оба фасада; зазор 40 мм только для просмотра. Схема — выбранный фасад.':'Самостоятельный фасад: изменения не затрагивают остальные позиции.';
 $('#kit-summary').textContent=`Фасадов в проекте: ${project.items.length}. Выбран: ${project.current().name}.`;
 $('#add-mirror').disabled=!!pair();$('#mirror-note').hidden=!pair();
}
function activate(id){project.activeId=id;const view=s.view;Object.assign(s,structuredClone(project.current().config),{view});
 $('#width').value=s.w;$('#height').value=s.h;for(const id of ['side','reed','origin','count'])$('#'+id).value=id==='count'?s.hinges.length:s[id];controls();update();fit();}
$('#facade-select').onchange=e=>activate(e.target.value);
$('#facade-name').oninput=e=>{project.current().name=e.target.value.trim()||'Без названия';renderProject();};
$('#remove-facade').onclick=()=>{project.update(s);if(project.remove())activate(project.activeId);};
$('#undo-remove').onclick=()=>{project.update(s);if(project.undoRemove())activate(project.activeId);};
$('#add-facade').onclick=()=>$('#add-dialog').showModal();
$('#close-add').onclick=()=>$('#add-dialog').close();
for(const kind of ['mirror','copy','new'])$('#add-'+kind).onclick=()=>{project.update(s);const item=project.add(kind);$('#add-dialog').close();activate(item.id);};
$('#theme').onclick=()=>document.body.classList.toggle('dark');
$('#profile-details').onclick=()=>{const p=profiles.find(p=>p.id===s.profile);$('#detail-title').textContent=`MODUS MZ ${p.id}`;$('#detail-body').innerHTML=svgSection(p.id,colors[s.color][1],true)+(s.handle?svgSection('13-01',colors[s.color][1],true):'')+`<p class="section-source">${sectionNotes}</p><p>Габарит сечения ${p.b} × ${p.d} мм. Стекло 4 мм. Минимальный фасад 200 × 200 мм. Рекомендуемые максимальные размеры: высота ${p.h}, ширина ${p.w} мм.</p><p>Для стекла из внешней ширины и высоты вычитается по ${p.delta} мм. ${p.edge?'Кромки стекла дополнительно обрабатываются; заполнение вклеивается.':''}</p><p>${p.note||'Цвета указаны по каталогу; доступность проверяется при заказе.'}</p><p>Сечения построены по каталогу, неуказанные толщины и радиусы оценочные. Петли условные. Чертежи обработки на странице 65 относятся к сборочным уголкам, а не к присадке петель. Для производства необходима выбранная модель петли и согласованный чертёж.</p>`;$('#details').showModal();};$('#close-details').onclick=()=>$('#details').close();
$('#confirm-project').onclick=()=>{project.update(s);confirmation.confirm(project.items,!project.items.some(item=>validate(item.config).errors.length));confirmationControls();};
$('#send-project').onclick=()=>{project.update(s);if(!confirmationControls())return;
 $('#send-items').replaceChildren();for(const item of project.items){const line=document.createElement('li');line.textContent=`${item.name}: ${item.config.w} × ${item.config.h} мм · MZ ${item.config.profile} · ${glasses[item.config.glass][0]}`;$('#send-items').append(line);}
 $('#send-dialog').showModal();};
$('#close-send').onclick=()=>$('#send-dialog').close();
$('#export').onclick=()=>{project.update(s);if(project.items.some(item=>validate(item.config).errors.length))return;
 const items=project.items.map(item=>{const c=item.config,p=profiles.find(p=>p.id===c.profile),g=glassItems[c.glass];return {...structuredClone(item),quantity:1,material:c.glass==='none'?null:{slug:g.slug,variant:g.variant,title:g.title,thickness:4,catalogueSnapshot:catalogue.snapshot},glassCut:c.glass==='none'?null:{width:c.w-p.delta,height:c.h-p.delta,thickness:4},warnings:validate(c).warnings};});
 const blob=new Blob([JSON.stringify({status:'prototype-not-for-production',source,items},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='modus-mz-project.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
// Explicit review link only; the ordinary configurator still starts empty.
if(['raywall-optics','raywall-studio'].includes(new URLSearchParams(location.search).get('preview'))){
 s.glass='raywall90__standard';showSampleCabinet='kitchen';project.update(s);
 if(new URLSearchParams(location.search).get('preview')==='raywall-studio')showSampleCabinet=false;
 $('#kitchen-cabinet').setAttribute('aria-pressed',String(!!showSampleCabinet));
 $('#cabinet-scale').textContent='Глубина 312 мм · бутылки 240 мм · посуда в масштабе';
}
controls();update();fit();

if(new URLSearchParams(location.search).get('preview')==='moru-studio'){s.glass='moru-ultra__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='estriado-studio'){s.glass='estriado__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='vision-sun-studio'){s.glass='vison-sun__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='flutelite-studio'){s.glass='flutelite-s__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='krezet-studio'){s.glass='krezet__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='diamant-studio'){s.glass='diamant__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='gothic-studio'){s.glass='gothic__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='kathedral-studio'){s.glass='kathedral-klein__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='aqualite-studio'){s.glass='kathedralaqualite__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='krepi-studio'){s.glass='krepi__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='silvit-studio'){s.glass='silvit__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}
