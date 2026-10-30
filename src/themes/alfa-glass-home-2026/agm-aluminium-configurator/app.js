import {connectFacadeQuote} from './quote.js?v=20261029';
import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {Reflector} from './vendor/Reflector.js';
import {profiles,colors,glasses,validate,source,profileSeries,profileLabel,assemblyLabel,glassCut,defaultHinge} from './data.js?v=mf-series-20261021';
import {sections,svgSection,sectionNotes} from './sections.js?v=mf-frame45-20261021';
import {railGeometry,sampleGeometry,handleRailGeometries} from './profile-mesh.js?v=mf-frame45-20261021';
import {profileMetal} from './metal.js';
import {FacadeProject} from './project.js?v=20261015-groups';
import {transparentSlugs,transparentItems,matteSlugs,matteItems,stopsolSlugs,stopsolItems,reedSlugs,reedItems,patternedSlugs,patternedItems,lacobelSlugs,lacobelItems,matelacSlugs,matelacItems,mirrorSlugs,mirrorItems} from './glass-groups.js?v=photobox-camera-20261020';
import {ProjectConfirmation} from './confirmation.js';
import {studioEnvironment,studioBackdrop,refractionSurround,fitPhotoboxToCamera,moruOptics,estriadoOptics,glassMaterial,glassEdgeMaterial,stopsolGlassOptics,sampleCabinet,satinContactMap} from './glass-render.js?v=photobox-camera-20261020';
const catalogue=await fetch('./glass-catalog.json?v=photobox-camera-20261020').then(r=>{if(!r.ok)throw new Error('Не удалось загрузить каталог стекла');return r.json();});
const glassItems=Object.fromEntries(catalogue.items.map(m=>[m.id,m]));
Object.keys(glasses).forEach(k=>delete glasses[k]);
glassItems.none={id:'none',title:'Без наполнения',color:'none',mirror:false};
glasses.none=['Без наполнения','none'];
for(const item of catalogue.items)glasses[item.id]=[item.title,item.color];
const $=s=>document.querySelector(s), s={profile:profiles[0].id,w:350,h:600,color:profiles[0].colors[0],glass:'none',glassOpaque:false,backdrop:false,hinge:'none',side:'left',origin:'top',hinges:[],handle:false,mask:false,reed:'vertical',view:'3d'};
const defaults=structuredClone(s), project=new FacadeProject(defaults), confirmation=new ProjectConfirmation();
const quote=await window.AGMQuoteReady;
const sharedProject=connectFacadeQuote(project,confirmation,quote);
Object.assign(s,structuredClone(project.current().config));
$('#width').value=s.w;$('#height').value=s.h;
for(const id of ['side','reed','origin','count'])$('#'+id).value=id==='count'?s.hinges.length:s[id];
function saveProject(addAll=false){try{sharedProject.save(addAll);}catch(error){const p=document.createElement('p');p.textContent='Не удалось сохранить проект: '+error.message;$('#messages').append(p);}}
const pair=()=>project.partner();
const previewSide=()=>s.side;
const scene=new T.Scene();scene.background=studioBackdrop();
const camera=new T.PerspectiveCamera(34,1,5,50000), renderer=new T.WebGLRenderer({antialias:true});
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
renderer.setPixelRatio((innerWidth>900?2:Math.min(devicePixelRatio,1.5)));renderer.setClearColor('#e4e1da');$('#scene').append(renderer.domElement);
const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;
// Modified drag rotates the product, independently of camera and photobox.
const productRotation=new T.Quaternion();let productGroup=null,productDrag=null;
const surface=renderer.domElement;
surface.addEventListener('pointerdown',e=>{
 if(productDrag||e.pointerType==='touch'||e.button!==0||!(e.shiftKey||e.ctrlKey||e.metaKey))return;
 e.preventDefault();e.stopImmediatePropagation();
 const damping=orbit.enableDamping;orbit.enableDamping=false;orbit.update();orbit.enableDamping=damping;
 orbit.enabled=false;productDrag={id:e.pointerId,x:e.clientX,y:e.clientY};surface.setPointerCapture(e.pointerId);
},true);
surface.addEventListener('pointermove',e=>{
 if(!productDrag||e.pointerId!==productDrag.id)return;
 e.preventDefault();e.stopImmediatePropagation();
 const dx=e.clientX-productDrag.x,dy=e.clientY-productDrag.y;
 const axis=new T.Vector3(dy,dx,0),angle=axis.length()*.006;
 if(angle){axis.normalize().applyQuaternion(camera.quaternion);productRotation.premultiply(new T.Quaternion().setFromAxisAngle(axis,angle)).normalize();productGroup?.quaternion.copy(productRotation);}
 productDrag.x=e.clientX;productDrag.y=e.clientY;
},true);
function endProductDrag(e){if(!productDrag||(e.pointerId!==undefined&&e.pointerId!==productDrag.id))return;e.stopImmediatePropagation?.();const id=productDrag.id;productDrag=null;orbit.enabled=true;if(surface.hasPointerCapture(id))surface.releasePointerCapture(id);}
for(const event of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(event,endProductDrag,true);
window.addEventListener('blur',endProductDrag);

scene.add(new T.HemisphereLight(0xfffaf2,0x8c8880,.8));const light=new T.DirectionalLight(0xfff5e7,3.4);light.position.set(-900,1200,1400);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-3000,right:3000,top:3000,bottom:-3000,near:1,far:10000});light.shadow.bias=-.0002;light.shadow.normalBias=2;light.shadow.radius=18;light.shadow.blurSamples=8;scene.add(light);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.VSMShadowMap;const fill=new T.DirectionalLight(0xf5f7ff,.7);fill.position.set(1200,400,500);scene.add(fill);
const env=studioEnvironment(renderer);scene.environment=env.texture;
const coatingLights=new T.Group();coatingLights.visible=false;
for(const [x,w,color] of [[-1100,180,'#f4f2ec'],[-850,60,'#454b50'],[-600,160,'#f4f2ec'],[-370,45,'#454b50'],[-120,140,'#deded9'],[140,40,'#454b50']]){
 const card=new T.Mesh(new T.PlaneGeometry(w,3000),new T.MeshBasicMaterial({color,side:T.DoubleSide}));card.position.set(x,0,1600);coatingLights.add(card);
}
scene.add(coatingLights);
let showSampleCabinet=false;
let showPhotobox=false;
let model=new T.Group();scene.add(model);
function fit(){const inspect=s.view==='profile',distance=inspect?(profiles.find(p=>p.id===s.profile).series!=='MZ'?Math.max(450,150/camera.aspect)*1.45:Math.max(s.handle?155:125,150/camera.aspect)*1.1):Math.max(s.h,(pair()?s.w*2+40:s.w)/camera.aspect)*2;camera.position.set(inspect?(profiles.find(p=>p.id===s.profile).series!=='MZ'?-distance*.85:distance*.5):s.view==='3d'?distance*.4:0,inspect?distance*(profiles.find(p=>p.id===s.profile).series!=='MZ'?.55:.35):s.view==='3d'?distance*.15:0,s.view==='back'?-distance:distance);orbit.target.set(0,0,0);orbit.update();}
function disposeModel(root){const materials=new Set(),textures=new Set();root.traverse(o=>{o.getRenderTarget?.().dispose();o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m)materials.add(m);});for(const m of materials){for(const key of ['map','normalMap','roughnessMap','bumpMap'])if(m[key])textures.add(m[key]);m.dispose();}for(const texture of textures)texture.dispose();}
function build(){
 light.intensity=s.view==='profile'?1:3.4;scene.remove(model);disposeModel(model);model=new T.Group();scene.add(model);productGroup=new T.Group();productGroup.name="product-assembly";productGroup.quaternion.copy(productRotation);model.add(productGroup);
 const extent=Math.max(s.h,s.w*(pair()?2:1))*1.4;Object.assign(light.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent});light.shadow.camera.updateProjectionMatrix();
 const other=pair(), states=other&&s.view!=='profile'?[project.current(),other].sort((a,b)=>a.config.side==='left'?-1:1):[project.current()];
 states.forEach((item,i)=>{const part=buildFacade({...item.config,view:s.view,backdrop:s.backdrop});part.traverse(o=>{if(o.isMesh&&!(Array.isArray(o.material)?o.material.some(m=>m.transmission):o.material?.transmission)){o.castShadow=true;o.receiveShadow=true;}});if(states.length===2)part.position.x=(i===0?-1:1)*(s.w+40)/2;productGroup.add(part);if(showSampleCabinet&&['3d','front'].includes(s.view)){const cabinet=sampleCabinet(item.config.w,item.config.h,showSampleCabinet);cabinet.position.x=part.position.x;productGroup.add(cabinet);}});
 if(showPhotobox&&['3d','front','back'].includes(s.view))model.add(refractionSurround(s.w*states.length,s.h,renderer));
}
function buildFacade(s){
 const model=new T.Group();
 const box=(w,h,d,x,y,z,mat)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);model.add(m);return m;};
 const p=profiles.find(p=>p.id===s.profile),mat=profileMetal(s.color);
 const base=profiles.find(v=>v.id===(p.baseId||p.id)),w=s.w,h=s.h,b=base.b,d=base.d,q=sections[base.id],cut=glassCut(s);mat.side=T.DoubleSide;
 if(s.view==='profile'){
   const id=s.handle&&p.id==='13'?'13-01':p.id;
   if(p.series!=='MZ'){
     const geometries=p.baseId?handleRailGeometries(p,p.b,450,'right',{miter:false}):[railGeometry(p.id,p.b,450,'right',{miter:false})];
     for(const g of geometries)model.add(new T.Mesh(g,mat));
     return model;
   }
   const mesh=new T.Mesh(sampleGeometry(id),mat);model.add(mesh);
   const edges=new T.LineSegments(new T.EdgesGeometry(mesh.geometry,28),new T.LineBasicMaterial({color:'#5e7784',transparent:true,opacity:.35}));if(!['13','13-01'].includes(id))model.add(edges);else{edges.geometry.dispose();edges.material.dispose();}
   return model;
 }
 for(const side of ['left','right','top','bottom']){
   if(p.series!=='MZ'){
     const opening=side===(s.side==='left'?'right':'left');
     if(p.baseId&&opening){
       for(const g of handleRailGeometries(p,w,h,side))model.add(new T.Mesh(g,mat));
     }else{
       const extra=p.b-base.b,frameWidth=w-extra,offset=(s.side==='left'?-1:1)*extra/2;
       const rail=new T.Mesh(railGeometry(base.id,frameWidth,h,side),mat);rail.position.x=offset;model.add(rail);
     }
     continue;
   }
   // Handle extrusion replaces only a central part of the opposite vertical rail.
   if(s.handle&&p.id==='13'&&side===(s.side==='left'?'right':'left')){
     const span=Math.min(250,h-80),a=(h-span)/2;
     // Cut the regular extrusion at square planes so the pieces do not overlap.
     for(const [start,end] of [[0,a/h],[(a+span)/h,1]])model.add(new T.Mesh(railGeometry(p.id,w,h,side,{start,end}),mat));
     const g=railGeometry('13-01',w,span,side,{miter:false});model.add(new T.Mesh(g,mat));
   }else model.add(new T.Mesh(railGeometry(p.id,w,h,side),mat));
 }
 if(s.glass!=='none'){
 const gm=glassMaterial(glassItems[s.glass],cut.width,cut.height,s.reed,renderer,Math.max(0,b-p.delta/2));

 const edge=glassEdgeMaterial(glassItems[s.glass],gm);
 if(glassItems[s.glass].matte&&!glassItems[s.glass].opaque&&b>20&&b>p.delta/2)gm.roughnessMap=satinContactMap(cut.width,cut.height,b-p.delta/2);
 // Box face order: +X, -X, +Y, -Y, front +Z, back -Z.
 const mirrorBack=glassItems[s.glass].mirror?new T.MeshStandardMaterial({color:'#474a51',metalness:0,roughness:.85}):null;
 const glassFaces=mirrorBack?[edge||gm,edge||gm,edge||gm,edge||gm,gm,mirrorBack]:edge?[edge,edge,edge,edge,gm,gm]:gm;
 const glassBody=box(cut.width,cut.height,4,cut.offsetX,0,q.glassY+2-d,glassFaces);
 const moruCoating=moruOptics[glassItems[s.glass].slug]?.coating;
 const glossyPaint=glassItems[s.glass].slug.startsWith('lacobel-');
 if(stopsolGlassOptics[glassItems[s.glass].slug]||moruCoating||glossyPaint){
   const coating=new Reflector(new T.PlaneGeometry(cut.width,cut.height),{textureWidth:1024,textureHeight:1024,color:glossyPaint?'#ffffff':moruCoating||stopsolGlassOptics[glassItems[s.glass].slug].coating,clipBias:.003});
   coating.material.fragmentShader=coating.material.fragmentShader.replace('blendOverlay( base.rgb, color ), 1.0','blendOverlay( base.rgb, color ), 0.32');
   if(glossyPaint)coating.material.fragmentShader=coating.material.fragmentShader.replace('blendOverlay( base.rgb, color ), 0.32','base.rgb, 0.11');
   if(moruCoating){
    coating.material.vertexShader=coating.material.vertexShader.replace('varying vec4 vUv;', 'varying vec4 vUv; varying vec2 ribUV;').replace('void main() {','void main() { ribUV = uv;');
    coating.material.fragmentShader=coating.material.fragmentShader.replace('varying vec4 vUv;', 'varying vec4 vUv; varying vec2 ribUV;')
      .replace('vec4 base = texture2DProj( tDiffuse, vUv );', 'vec4 sampleUV = vUv; sampleUV.'+(s.reed==='horizontal'?'y':'x')+' += sin(ribUV.'+(s.reed==='horizontal'?'y':'x')+' * '+((s.reed==='horizontal'?cut.height:cut.width)/12).toFixed(6)+' * 6.2831853) * 0.012 * vUv.w; vec4 base = texture2DProj(tDiffuse, sampleUV);')
      .replace('color ), 0.32','color ), 0.42');
   }
   coating.material.transparent=true;coating.material.depthWrite=false;
   const reflect=coating.onBeforeRender;
   coating.onBeforeRender=function(...args){coatingLights.visible=!showPhotobox;try{reflect.apply(this,args);}finally{coatingLights.visible=false;}};
   coating.position.x=cut.offsetX;coating.position.z=q.glassY+4-d+.15;model.add(coating);
 }
 if(glassItems[s.glass].mirror){
   const mirror=new Reflector(new T.PlaneGeometry(cut.width,cut.height),{textureWidth:1024,textureHeight:1024,color:glassItems[s.glass].color==='#d7eeea'?'#858585':glassItems[s.glass].color,clipBias:.003});
   mirror.material.polygonOffset=true;mirror.material.polygonOffsetFactor=-1;mirror.material.polygonOffsetUnits=-4;
   // Neutral reflected studio panels make the mirror readable even without a cabinet.
   const mirrorRender=mirror.onBeforeRender;
   mirror.onBeforeRender=function(...args){coatingLights.visible=!showPhotobox;glassBody.visible=false;try{mirrorRender.apply(this,args);}finally{glassBody.visible=true;coatingLights.visible=false;}};
   // Multiply the reflected scene by a uniform coating tint; retain actual image contrast.
   if(mirrorSlugs.includes(glassItems[s.glass].slug)){
    mirror.material.fragmentShader=mirror.material.fragmentShader.replace('blendOverlay( base.rgb, color )',glassItems[s.glass].slug==='tonirovannye-zerkala'?'color * mix(vec3(dot(base.rgb, vec3(.2126,.7152,.0722))),base.rgb,0.25)':'color * base.rgb');
   }
   mirror.position.x=cut.offsetX;mirror.position.z=q.glassY+4-d+.1;model.add(mirror);
 }
 if(s.mask&&['07','17'].includes(p.id)){const mask=new T.MeshStandardMaterial({color:'#373d3c'});const z=q.glassY-d+.1;box(b-p.delta/2,cut.height,.2,-w/2+(b+p.delta/2)/2,0,z,mask);box(b-p.delta/2,cut.height,.2,w/2-(b+p.delta/2)/2,0,z,mask);box(cut.width,b-p.delta/2,.2,0,h/2-(b+p.delta/2)/2,z,mask);box(cut.width,b-p.delta/2,.2,0,-h/2+(b+p.delta/2)/2,z,mask);}
 }
 const hm=new T.MeshStandardMaterial({color:'#909b9f',metalness:.7,roughness:.25});s.hinges.forEach((v,i)=>{if(p.series==='MF-20'){const x=(s.side==='left'?-1:1)*(w/2-30),y=(i===0?1:-1)*(h/2-12);box(42,18,9,x,y,-d-3,hm);return;}const x=(s.side==='left'?-1:1)*(w/2-b/2);box(defaultHinge(p)==='cup'?34:14,48,9,x,h/2-v,-d-3,hm);box(42,16,6,x+(s.side==='left'?-20:20),h/2-v,-d-8,hm);});
 return model;
}
new ResizeObserver(()=>{const r=$('#view').getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();fit();}).observe($('#view'));
renderer.setAnimationLoop(()=>{orbit.update();const room=model.getObjectByName('photobox-surround');if(room)fitPhotoboxToCamera(room,camera);else if(camera.near!==5||camera.far!==50000){camera.near=5;camera.far=50000;camera.updateProjectionMatrix();}renderer.render(scene,camera);});
function selectProfile(id){s.profile=id;s.handle=false;s.mask=false;const p=profiles.find(p=>p.id===id);if(s.hinges.length){s.hinge=defaultHinge(p);if(p.series==='MF-20')s.hinges=[100,s.h-100];}if(!p.colors.includes(s.color))s.color=p.colors[0];controls();update();fit();}
function controls(){glassChoices();const p=profiles.find(p=>p.id===s.profile);
 $('#profile-series').innerHTML=profileSeries.map(series=>`<button type="button" data-series="${series}" aria-pressed="${p.series===series}" class="${p.series===series?'active':''}">${series}</button>`).join('');
 $('#profile-series').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(b.dataset.series!==p.series)selectProfile(profiles.find(v=>v.series===b.dataset.series).id);});
 const mf=p.series!=='MZ',baseId=p.baseId||p.id;
 $('#profiles').innerHTML=profiles.filter(v=>v.series===p.series&&(!mf||!v.baseId)).map(v=>`<button data-profile="${v.id}" class="${(mf?(p.baseId||p.id)===v.id:s.profile===v.id)?'active':''}">${profileLabel(v)}<small>${v.baseId?'Профиль-ручка':'Основной профиль'} · ${v.b} мм</small></button>`).join('');$('#profiles').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(!mf)selectProfile(b.dataset.profile);});
 $('#mf-handles-wrap').hidden=!mf;
 $('#mf-handles').innerHTML=mf?`<button data-integrated-handle="${baseId}" class="${!p.baseId?'active':''}" aria-pressed="${!p.baseId}">Без ручки</button>`+profiles.filter(v=>v.series===p.series&&v.baseId).map(v=>`<button data-integrated-handle="${v.id}" class="${p.id===v.id?'active':''}" aria-pressed="${p.id===v.id}">${profileLabel(v)}<small>${v.gripLength?'Хват 250 мм':'Во всю высоту'}</small></button>`).join(''):'';
 $('#mf-handles').querySelectorAll('button').forEach(b=>b.onclick=()=>selectProfile(b.dataset.integratedHandle));
 $('#series-note').textContent=p.series==='MZ'?'':`${assemblyLabel(p)}. ${p.note}${p.gripLength?' Хват 250 мм, по центру высоты.':p.baseId?' Ручка по всей высоте.':''}`;
 const cs=s.handle?['00','21','25']:p.colors;$('#colors').innerHTML=cs.map(k=>`<button title="${colors[k][0]}" aria-label="${colors[k][0]}" data-color="${k}" class="${s.color===k?'active':''}" style="background:${colors[k][1]}"></button>`).join('');$('#colors').querySelectorAll('button').forEach(b=>b.onclick=()=>{s.color=b.dataset.color;controls();update();if(s.view==='profile')fit();});
 $('#color-name').textContent=`${colors[s.color][0]} · ${s.color}. Наличие уточняется.`;$('#profile-name').textContent=assemblyLabel(p);$('#profile-dims').textContent=`${p.b} × ${p.d} мм · схема сечения`;
 $('#section-svg').innerHTML=svgSection(p.id,colors[s.color][1]);
 $('#handle-wrap').hidden=!p.handle;$('#handle').checked=s.handle;$('#mask-wrap').hidden=s.glass==='none'||!['07','17'].includes(p.id);$('#mask').checked=s.mask;$('#reed-wrap').hidden=!glassItems[s.glass].pitch||glassItems[s.glass].pattern==='grid';
 const item=glassItems[s.glass];$('#glass-card-access').hidden=s.glass==='none';$('#glass-link').setAttribute('aria-label','Посмотреть '+item.title+' в каталоге — новая вкладка');$('#glass-link').href='https://alfaglass.ru/materialy/'+item.slug+'/';$('#glass-note').textContent=s.glass==='none'?'Только алюминиевая рамка по указанным размерам, без стекла.':item.texturePending?'Точная фактура пока не воспроизведена — показаны только базовые цвет и прозрачность.':item.pitch?`${item.pitchEstimated?"Приблизительный шаг":"Рельеф с шагом"} ${item.pitch.toFixed(2)} мм; масштаб сохраняется при изменении размера. Оптика приблизительная.`:'Студийная визуализация. Оттенок и отражение ориентировочные.';$('#glass-count').textContent=`${transparentItems(catalogue.items).length+matteItems(catalogue.items).length+stopsolItems(catalogue.items).length+reedItems(catalogue.items).length+patternedItems(catalogue.items).length+lacobelItems(catalogue.items).length+matelacItems(catalogue.items).length+mirrorItems(catalogue.items).length+1} материалов · 4 мм`;
 $('#hinge').innerHTML=[['none','Без петель и присадок'],...(p.series==='MF-20'?[['mf20','Скрытые MF 20 · комплект 2 шт.']]:p.series==='MF-30'?[['narrow','Для узкого рамочного профиля']]:p.b<20?[['narrow','Специальная для узкого профиля'],['mzf','MZF 63 · подбор присадки'],...(p.id==='07'?[['blum','BLUM 71B950A']]:[])]:[['cup','Чашка 35 мм · модель уточнить']])].map(([v,l])=>`<option value="${v}">${l}</option>`).join('');$('#hinge').value=s.hinge;$('#count').innerHTML=(p.series==='MF-20'?[0,2]:[0,2,3,4,5,6]).map(n=>`<option>${n}</option>`).join('');$('#count').value=s.hinges.length;$('#side').disabled=!s.hinges.length&&!p.baseId;for(const id of ['origin','even'])$('#'+id).disabled=!s.hinges.length||p.series==='MF-20';hingeFields();}
function hingeFields(){if(profiles.find(p=>p.id===s.profile).series==='MF-20'){$('#hinges').textContent=s.hinges.length?'Две скрытые петли: сверху и снизу. Размеры присадки — по чертежу MODUS.':'';return;} $('#hinges').innerHTML=s.hinges.map((v,i)=>`<div class="hinge-row"><b>${i+1}</b><input aria-label="Положение петли ${i+1}" type="range" min="1" max="${s.h-1}" value="${s.origin==='top'?v:s.h-v}" data-i="${i}"><input aria-label="Петля ${i+1}, мм" type="number" step="1" value="${s.origin==='top'?v:s.h-v}" data-i="${i}"></div>`).join('');$('#hinges').querySelectorAll('input').forEach(el=>el.oninput=()=>{s.hinges[+el.dataset.i]=s.origin==='top'?+el.value:s.h-+el.value;el.parentElement.querySelectorAll('input').forEach(other=>{if(other!==el)other.value=el.value;});update();});}
let geometry;
function drawing(){const scale=Math.min(480/s.h,470/s.w),w=s.w*scale,h=s.h*scale,x=(760-w)/2,y=(620-h)/2;geometry={scale,x,y,w,h};const p=profiles.find(p=>p.id===s.profile),hx=previewSide()==='left'?x+10:x+w-10;
 const baseWidth=p.baseWidth??p.b,handleSide=s.side==='left'?'right':'left';
 const mfFrame=p.series==='MZ'?'':`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glasses[s.glass][1]}"/><g fill="${colors[s.color][1]}"><rect x="${x}" y="${y}" width="${w}" height="${baseWidth*scale}"/><rect x="${x}" y="${y+h-baseWidth*scale}" width="${w}" height="${baseWidth*scale}"/><rect x="${x}" y="${y}" width="${(handleSide==='left'?p.b:baseWidth)*scale}" height="${h}"/><rect x="${x+w-(handleSide==='right'?p.b:baseWidth)*scale}" y="${y}" width="${(handleSide==='right'?p.b:baseWidth)*scale}" height="${h}"/></g>`;
 const item=glassItems[s.glass],ribbed=reedSlugs.includes(item.slug),horizontal=s.reed==='horizontal';
 // Schematic spacing has a screen minimum so fine ribs remain readable at overview scale.
 const step=Math.max(4,(item.pitch||8)*scale),inset=Math.max(3,p.b*scale)/2;
 const stripes=ribbed?`<defs><pattern id="drawing-ribs" patternUnits="userSpaceOnUse" width="${step}" height="${step}"><path d="${horizontal?'M0 .5H'+step:'M.5 0V'+step}" stroke="#426473" stroke-opacity=".38" stroke-width=".7"/></pattern></defs><rect data-rib-direction="${horizontal?'horizontal':'vertical'}" x="${x+inset}" y="${y+inset}" width="${Math.max(0,w-2*inset)}" height="${Math.max(0,h-2*inset)}" fill="url(#drawing-ribs)" pointer-events="none"><title>Направление рифления; частота полос на схеме условная</title></rect>`:'';
 $('#drawing').innerHTML=`${mfFrame||`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glasses[s.glass][1]}" stroke="${colors[s.color][1]}" stroke-width="${Math.max(3,p.b*scale)}"/>`}${stripes}<path d="M${x} ${y-18}H${x+w} M${x-22} ${y}V${y+h}" class="dimension"/><text x="380" y="${y-26}" text-anchor="middle" class="dimtext">${s.w} мм</text><text x="${x-30}" y="310" transform="rotate(-90 ${x-30} 310)" text-anchor="middle" class="dimtext">${s.h} мм</text>${p.series==='MF-20'?s.hinges.map((v,i)=>`<circle cx="${hx}" cy="${i?y+h-6:y+6}" r="7" fill="#087ca7"/>`).join(''):s.hinges.map((v,i)=>`<g><circle class="hinge-dot" data-i="${i}" cx="${hx}" cy="${y+v*scale}" r="10" fill="#087ca7" stroke="white" stroke-width="3"/><text x="${previewSide()==='left'?hx+18:hx-18}" y="${y+v*scale+4}" text-anchor="${previewSide()==='left'?'start':'end'}" class="dimtext">${i+1} · ${s.origin==='top'?v:s.h-v} мм</text></g>`).join('')}`;}
let drag=null;$('#drawing').onpointerdown=e=>{if(e.target.dataset.i!==undefined){drag=+e.target.dataset.i;$('#drawing').setPointerCapture(e.pointerId);}};$('#drawing').onpointermove=e=>{if(drag===null)return;const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform($('#drawing').getScreenCTM().inverse());s.hinges[drag]=Math.max(1,Math.min(s.h-1,Math.round((pt.y-geometry.y)/geometry.scale)));hingeFields();update();};$('#drawing').onpointerup=$('#drawing').onpointercancel=()=>drag=null;
function update(){if(profiles.find(p=>p.id===s.profile).series==='MF-20'&&s.hinges.length)s.hinges=[1,s.h-1];project.update(s);const p=profiles.find(p=>p.id===s.profile),v=validate(s);$('#export').disabled=project.items.some(item=>validate(item.config).errors.length>0);$('#messages').innerHTML=[...v.errors.map(t=>`<div class="message error">${t}</div>`),...v.warnings.map(t=>`<div class="message">${t}</div>`)].join('');$('#model-title').textContent='MODUS '+(s.view==='profile'&&s.handle?'MZ 13-01':assemblyLabel(p));$('#model-size').textContent=s.view==='profile'?(p.series!=='MZ'?(p.gripLength?'Хват 250 мм · профиль по 100 мм сверху и снизу':'Образец профиля 450 мм'):`Сечение ${sections[s.handle?'13-01':p.id].b} × ${sections[s.handle?'13-01':p.id].d} мм · отрезок 90 мм`):`${s.w} × ${s.h} мм`;$('#fact-profile').textContent=`${p.b} × ${p.d} мм`;$('#fact-glass').textContent=s.glass==='none'?'Без наполнения':`${glassCut(s).width} × ${glassCut(s).height} × 4`;$('#fact-limit').textContent=`${p.h} × ${p.w} мм`;$('#summary-title').textContent=`${assemblyLabel(p)} / ${s.w} × ${s.h} мм`;$('#summary-line').textContent=`${colors[s.color][0]} · ${glasses[s.glass][0]} · ${s.hinges.length?s.hinges.length+' петли':'Без петель и присадок'}`;renderProject();for(const item of project.items){if(item.id===project.activeId)continue;const errors=validate(item.config).errors;if(errors.length){const note=document.createElement('div');note.className='message error';note.textContent=item.name+': '+errors.join(' ');$('#messages').append(note);}}if(Number.isInteger(s.w)&&Number.isInteger(s.h)&&s.w>=200&&s.h>=200&&s.w<=6000&&s.h<=6000){build();drawing();}saveProject();}
function glassChoices(){
 $('#glass-selected').textContent='Выбрано: '+glassItems[s.glass].title;
 $('#glass-categories').querySelectorAll('[data-glass]').forEach(b=>{const active=b.dataset.glass===s.glass;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 for(const [category,slugs,title] of [['transparent',transparentSlugs,'Стекло прозрачное'],['matte',matteSlugs,'Стекло матовое'],['stopsol',stopsolSlugs,'Стопсол Феникс'],['reed',reedSlugs,'Рифлёное стекло'],['patterned',patternedSlugs,'Узорчатое стекло'],['lacobel',lacobelSlugs,'Окрашенное стекло Lacobel'],['matelac',matelacSlugs,'Матовое окрашенное Matelac'],['mirrors',mirrorSlugs,'Зеркала']]){
  const active=slugs.includes(glassItems[s.glass].slug),button=$('#'+category+'-toggle');
  button.classList.toggle('active',active);button.querySelector('.category-title').textContent=active?glassItems[s.glass].title:title;
 }
}
const materialCategories=[['transparent',transparentItems],['matte',matteItems],['stopsol',stopsolItems],['reed',reedItems],['patterned',patternedItems],['lacobel',lacobelItems],['matelac',matelacItems],['mirrors',mirrorItems]];
for(const [category,items] of materialCategories){
 for(const item of items(catalogue.items)){
  const b=document.createElement('button');b.type='button';b.dataset.glass=item.id;b.dataset.category=category;b.textContent=item.title;if(['lacobel','matelac','mirrors'].includes(category)){const chip=document.createElement('span');chip.className='painted-chip';chip.style.backgroundColor=item.color;chip.setAttribute('aria-hidden','true');b.prepend(chip);}$('#'+category+'-materials').append(b);
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
$('#count').onchange=e=>{s.hinges=Array(+e.target.value).fill(0);if(!s.hinges.length)s.hinge='none';else if(s.hinge==='none')s.hinge=defaultHinge(profiles.find(p=>p.id===s.profile));even();controls();};function even(){const n=s.hinges.length;s.hinges=s.hinges.map((_,i)=>Math.round(100+i*(s.h-200)/Math.max(1,n-1)));hingeFields();update();}$('#even').onclick=even;
$('#handle').onchange=e=>{s.handle=e.target.checked;if(s.handle&&!['00','21','25'].includes(s.color))s.color='00';controls();update();if(s.view==='profile')fit();};$('#mask').onchange=e=>{s.mask=e.target.checked;update();};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{s.view=b.dataset.view;productRotation.identity();document.querySelectorAll('[data-view]').forEach(t=>t.classList.toggle('active',t===b));$('#drawing').toggleAttribute('hidden',s.view!=='drawing');$('#scene').style.visibility=s.view==='drawing'?'hidden':'visible';$('#gesture').textContent=s.view==='drawing'?'Перемещайте синие точки · координаты в миллиметрах':s.view==='profile'?'Вращайте образец · Shift/Ctrl + мышь — поворот изделия':'Shift/Ctrl + мышь — вращать изделие · мышь — камера · ПКМ — сдвиг · колесо — масштаб';update();fit();});$('#reset').onclick=()=>{productRotation.identity();productGroup?.quaternion.identity();fit();};
$('#photobox-toggle').onclick=()=>{showPhotobox=!showPhotobox;$('#photobox-toggle').setAttribute('aria-pressed',String(showPhotobox));build();};
for(const [id,kind] of [['sample-cabinet','books'],['kitchen-cabinet','kitchen']])$('#'+id).onclick=()=>{showSampleCabinet=showSampleCabinet===kind?false:kind;$('#sample-cabinet').setAttribute('aria-pressed',String(showSampleCabinet==='books'));$('#kitchen-cabinet').setAttribute('aria-pressed',String(showSampleCabinet==='kitchen'));build();};
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
$('#facade-name').oninput=e=>{project.current().name=e.target.value.trim()||'Без названия';renderProject();saveProject();};
$('#remove-facade').onclick=()=>{project.update(s);if(project.remove())activate(project.activeId);};
$('#undo-remove').onclick=()=>{project.update(s);if(project.undoRemove())activate(project.activeId);};
$('#add-facade').onclick=()=>$('#add-dialog').showModal();
$('#close-add').onclick=()=>$('#add-dialog').close();
for(const kind of ['mirror','copy','new'])$('#add-'+kind).onclick=()=>{project.update(s);const item=project.add(kind);$('#add-dialog').close();activate(item.id);};

$('#profile-details').onclick=()=>{const p=profiles.find(p=>p.id===s.profile);$('#detail-title').textContent='MODUS '+assemblyLabel(p);$('#detail-body').innerHTML=svgSection(p.id,colors[s.color][1],true)+(s.handle?svgSection('13-01',colors[s.color][1],true):'')+`<p class="section-source">${sectionNotes}</p><p>Габарит сечения ${p.b} × ${p.d} мм. Стекло 4 мм. Минимальный размер в модели — 200 × 200 мм; это не производственный допуск. Рекомендуемые максимальные размеры: высота ${p.h}, ширина ${p.w} мм.</p><p>Для стекла: из ширины вычитается ${p.deltaW??p.delta} мм, из высоты — ${p.deltaH??p.delta} мм. ${p.edge?'Кромки стекла дополнительно обрабатываются; заполнение вклеивается.':''}</p><p>${p.note||'Цвета указаны по каталогу; доступность проверяется при заказе.'}</p><p>Сечения построены по каталогу, неуказанные толщины и радиусы оценочные. Петли условные. Чертежи обработки на странице 65 относятся к сборочным уголкам, а не к присадке петель. Для производства необходима выбранная модель петли и согласованный чертёж.</p>`;$('#details').showModal();};$('#close-details').onclick=()=>$('#details').close();
$('#confirm-project').onclick=()=>{project.update(s);confirmation.confirm(project.items,!project.items.some(item=>validate(item.config).errors.length));confirmationControls();saveProject();};
$('#send-project').onclick=event=>{project.update(s);if(!confirmationControls()){event.preventDefault();event.stopImmediatePropagation();return;}saveProject(true);quote.open();};
$('#export').onclick=()=>{project.update(s);if(project.items.some(item=>validate(item.config).errors.length))return;
 const items=project.items.map(item=>{const c=item.config,p=profiles.find(p=>p.id===c.profile),g=glassItems[c.glass];return {...structuredClone(item),quantity:1,series:p.series,baseProfile:p.baseId||p.id,integratedHandle:p.baseId?{id:p.id,length:p.gripLength||c.h}:null,profileAssembly:assemblyLabel(p),material:c.glass==='none'?null:{slug:g.slug,variant:g.variant,title:g.title,thickness:4,catalogueSnapshot:catalogue.snapshot},glassCut:c.glass==='none'?null:glassCut(c),hingePlacement:p.series==='MF-20'&&c.hinges.length?{type:'top-bottom',count:2,coordinatesAreSchematic:true}:null,warnings:validate(c).warnings};});
 const blob=new Blob([JSON.stringify({status:'prototype-not-for-production',source,items},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='modus-facades-project.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
// Explicit review link only; the ordinary configurator still starts empty.
if(['raywall-optics','raywall-studio'].includes(new URLSearchParams(location.search).get('preview'))){
 s.glass='raywall90__standard';showSampleCabinet='kitchen';project.update(s);
 if(new URLSearchParams(location.search).get('preview')==='raywall-studio')showSampleCabinet=false;
 $('#kitchen-cabinet').setAttribute('aria-pressed',String(!!showSampleCabinet));

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

if(new URLSearchParams(location.search).get('preview')==='atlantic-studio'){s.glass='monumental-atlantic__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='hithicross-studio'){s.glass='hithicross__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='dichroic-studio'){s.glass='dihroichnoe-steklo__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='painted-studio'){s.glass='lacobel-1014__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='mirrors-studio'){s.glass='zerkalo-serebro__standard';showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get('preview')==='photobox-studio'){s.glass='zerkalo-serebro__standard';showPhotobox=true;$('#photobox-toggle').setAttribute('aria-pressed','true');showSampleCabinet=false;project.update(s);controls();update();fit();}

if(new URLSearchParams(location.search).get("preview")==="mf-series"){selectProfile("MF20");}

if(new URLSearchParams(location.search).get("preview")==="mf-handles"){selectProfile("MF31");document.querySelector('[data-view="profile"]').click();}

if(new URLSearchParams(location.search).get("preview")==="mf20-handles"){selectProfile("MF21");document.querySelector('[data-view="profile"]').click();}
