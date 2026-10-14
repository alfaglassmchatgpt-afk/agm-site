import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {Reflector} from './vendor/Reflector.js';
import {profiles,colors,glasses,validate,source} from './data.js';
import {sections,svgSection,sectionNotes} from './sections.js';
import {railGeometry,sampleGeometry} from './profile-mesh.js';
import {profileMetal} from './metal.js';
import {FacadeProject} from './project.js';
import {studioEnvironment,glassMaterial,backdrop} from './glass-render.js';
const catalogue=await fetch('./glass-catalog.json').then(r=>{if(!r.ok)throw new Error('Не удалось загрузить каталог стекла');return r.json();});
const glassItems=Object.fromEntries(catalogue.items.map(m=>[m.id,m]));
Object.keys(glasses).forEach(k=>delete glasses[k]);
for(const item of catalogue.items)glasses[item.id]=[item.title,item.color];
const $=s=>document.querySelector(s), s={profile:'01',w:450,h:900,color:'00',glass:'zerkalo-serebro__standard',glassOpaque:true,backdrop:true,hinge:'narrow',side:'left',origin:'top',hinges:[100,450,800],handle:false,mask:false,reed:'vertical',view:'3d'};
const defaults=structuredClone(s), project=new FacadeProject(defaults);
const pair=()=>project.partner();
const previewSide=()=>s.side;
const scene=new T.Scene();scene.background=new T.Color('#e7eef0');
const camera=new T.PerspectiveCamera(34,1,5,50000), renderer=new T.WebGLRenderer({antialias:true});
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#e7eef0');$('#scene').append(renderer.domElement);
const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;
scene.add(new T.HemisphereLight(0xffffff,0x748b96,3));const light=new T.DirectionalLight(0xffffff,4);light.position.set(-800,1500,2000);scene.add(light);
const env=studioEnvironment(renderer);scene.environment=env.texture;
// A wall behind the observer is visible only in the planar mirror reflection.
const reflectionStudio=new T.Group();
for(let i=-12;i<=12;i++){
 const panel=new T.Mesh(new T.PlaneGeometry(750,14000),new T.MeshBasicMaterial({color:i%4===0?'#445e6a':i%4===1?'#b4c1c6':'#e9e7e0',side:T.DoubleSide}));
 panel.position.set(i*750,0,12000);reflectionStudio.add(panel);
}
scene.add(reflectionStudio);
let model=new T.Group();scene.add(model);
function fit(){const inspect=s.view==='profile',distance=inspect?Math.max(s.handle?155:125,150/camera.aspect)*1.1:Math.max(s.h,(pair()?s.w*2+40:s.w)/camera.aspect)*2;camera.position.set(inspect?distance*.5:s.view==='3d'?distance*.4:0,inspect?distance*.35:s.view==='3d'?distance*.15:0,s.view==='back'?-distance:distance);orbit.target.set(0,0,0);orbit.update();}
function disposeModel(root){root.traverse(o=>{o.getRenderTarget?.().dispose();o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.normalMap?.dispose();o.material.roughnessMap?.dispose();o.material.dispose();}});}
function build(){
 light.intensity=s.view==='profile'?1:4;scene.remove(model);disposeModel(model);model=new T.Group();scene.add(model);
 const other=pair(), states=other&&s.view!=='profile'?[project.current(),other].sort((a,b)=>a.config.side==='left'?-1:1):[project.current()];
 states.forEach((item,i)=>{const part=buildFacade({...item.config,view:s.view,backdrop:s.backdrop});if(states.length===2)part.position.x=(i===0?-1:1)*(s.w+40)/2;model.add(part);});
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
 const gm=glassMaterial(glassItems[s.glass],w-p.delta,h-p.delta,s.reed,renderer);
 if(s.backdrop&&!glassItems[s.glass].mirror){model.add(backdrop(w,h));}
 box(w-p.delta,h-p.delta,4,0,0,q.glassY+2-d,gm);
 if(glassItems[s.glass].mirror){
   const mirror=new Reflector(new T.PlaneGeometry(w-p.delta,h-p.delta),{textureWidth:1024,textureHeight:1024,color:glassItems[s.glass].color==='#d7eeea'?'#858585':glassItems[s.glass].color,clipBias:.003});
   mirror.position.z=q.glassY+4-d+.1;model.add(mirror);
 }
 if(s.mask&&['07','17'].includes(p.id)){const mask=new T.MeshStandardMaterial({color:'#373d3c'});const z=q.glassY-d+.1;box(b-p.delta/2,h-p.delta,.2,-w/2+(b+p.delta/2)/2,0,z,mask);box(b-p.delta/2,h-p.delta,.2,w/2-(b+p.delta/2)/2,0,z,mask);box(w-p.delta,b-p.delta/2,.2,0,h/2-(b+p.delta/2)/2,z,mask);box(w-p.delta,b-p.delta/2,.2,0,-h/2+(b+p.delta/2)/2,z,mask);}
 const hm=new T.MeshStandardMaterial({color:'#909b9f',metalness:.7,roughness:.25});s.hinges.forEach(v=>{const x=(s.side==='left'?-1:1)*(w/2-b/2);box(p.b>20?34:14,48,9,x,h/2-v,-d-3,hm);box(42,16,6,x+(s.side==='left'?-20:20),h/2-v,-d-8,hm);});
 return model;
}
new ResizeObserver(()=>{const r=$('#view').getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();fit();}).observe($('#view'));
renderer.setAnimationLoop(()=>{orbit.update();renderer.render(scene,camera);});
function controls(){const p=profiles.find(p=>p.id===s.profile);$('#profiles').innerHTML=profiles.map(p=>`<button data-profile="${p.id}" class="${s.profile===p.id?'active':''}">MZ ${p.id}<small>${p.b} мм</small></button>`).join('');$('#profiles').querySelectorAll('button').forEach(b=>b.onclick=()=>{s.profile=b.dataset.profile;s.handle=false;s.mask=false;s.hinge=profiles.find(p=>p.id===s.profile).b<20?'narrow':'cup';if(!profiles.find(p=>p.id===s.profile).colors.includes(s.color))s.color='00';controls();update();if(s.view==='profile')fit();});
 const cs=s.handle?['00','21','25']:p.colors;$('#colors').innerHTML=cs.map(k=>`<button title="${colors[k][0]}" aria-label="${colors[k][0]}" data-color="${k}" class="${s.color===k?'active':''}" style="background:${colors[k][1]}"></button>`).join('');$('#colors').querySelectorAll('button').forEach(b=>b.onclick=()=>{s.color=b.dataset.color;controls();update();if(s.view==='profile')fit();});
 $('#color-name').textContent=`${colors[s.color][0]} · ${s.color}. Наличие уточняется.`;$('#profile-name').textContent=`MZ ${p.id}`;$('#profile-dims').textContent=`${p.b} × ${p.d} мм · схема сечения`;
 $('#section-svg').innerHTML=svgSection(p.id,colors[s.color][1]);
 $('#handle-wrap').hidden=!p.handle;$('#handle').checked=s.handle;$('#mask-wrap').hidden=!['07','17'].includes(p.id);$('#mask').checked=s.mask;$('#reed-wrap').hidden=!glassItems[s.glass].pitch||glassItems[s.glass].pattern==='grid';
 const item=glassItems[s.glass];$('#glass-link').href='https://alfaglass.ru/materialy/'+item.slug+'/';$('#glass-note').textContent=item.texturePending?'Точная фактура пока не воспроизведена — показаны только базовые цвет и прозрачность.':item.pitch?`Рельеф с шагом ${item.pitch.toFixed(2)} мм; масштаб сохраняется при изменении размера. Оптика приблизительная.`:'Студийная визуализация. Оттенок и отражение ориентировочные.';$('#glass-count').textContent=`${new Set(catalogue.items.map(i=>i.slug)).size} материалов · 4 мм · снимок общего каталога`;$('#backdrop').disabled=item.mirror;$('#backdrop').checked=s.backdrop;
 $('#hinge').innerHTML=(p.b<20?[['narrow','Специальная для узкого профиля'],['mzf','MZF 63 · подбор присадки'],...(p.id==='07'?[['blum','BLUM 71B950A']]:[])]:[['cup','Чашка 35 мм · модель уточнить']]).map(([v,l])=>`<option value="${v}">${l}</option>`).join('');$('#hinge').value=s.hinge;hingeFields();}
function hingeFields(){ $('#hinges').innerHTML=s.hinges.map((v,i)=>`<div class="hinge-row"><b>${i+1}</b><input aria-label="Положение петли ${i+1}" type="range" min="1" max="${s.h-1}" value="${s.origin==='top'?v:s.h-v}" data-i="${i}"><input aria-label="Петля ${i+1}, мм" type="number" step="1" value="${s.origin==='top'?v:s.h-v}" data-i="${i}"></div>`).join('');$('#hinges').querySelectorAll('input').forEach(el=>el.oninput=()=>{s.hinges[+el.dataset.i]=s.origin==='top'?+el.value:s.h-+el.value;el.parentElement.querySelectorAll('input').forEach(other=>{if(other!==el)other.value=el.value;});update();});}
let geometry;
function drawing(){const scale=Math.min(480/s.h,470/s.w),w=s.w*scale,h=s.h*scale,x=(760-w)/2,y=(620-h)/2;geometry={scale,x,y,w,h};const p=profiles.find(p=>p.id===s.profile),hx=previewSide()==='left'?x+10:x+w-10;
 $('#drawing').innerHTML=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glasses[s.glass][1]}" stroke="${colors[s.color][1]}" stroke-width="${Math.max(3,p.b*scale)}"/><path d="M${x} ${y-18}H${x+w} M${x-22} ${y}V${y+h}" class="dimension"/><text x="380" y="${y-26}" text-anchor="middle" class="dimtext">${s.w} мм</text><text x="${x-30}" y="310" transform="rotate(-90 ${x-30} 310)" text-anchor="middle" class="dimtext">${s.h} мм</text>${s.hinges.map((v,i)=>`<g><circle class="hinge-dot" data-i="${i}" cx="${hx}" cy="${y+v*scale}" r="10" fill="#087ca7" stroke="white" stroke-width="3"/><text x="${previewSide()==='left'?hx+18:hx-18}" y="${y+v*scale+4}" text-anchor="${previewSide()==='left'?'start':'end'}" class="dimtext">${i+1} · ${s.origin==='top'?v:s.h-v} мм</text></g>`).join('')}`;}
let drag=null;$('#drawing').onpointerdown=e=>{if(e.target.dataset.i!==undefined){drag=+e.target.dataset.i;$('#drawing').setPointerCapture(e.pointerId);}};$('#drawing').onpointermove=e=>{if(drag===null)return;const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform($('#drawing').getScreenCTM().inverse());s.hinges[drag]=Math.max(1,Math.min(s.h-1,Math.round((pt.y-geometry.y)/geometry.scale)));hingeFields();update();};$('#drawing').onpointerup=$('#drawing').onpointercancel=()=>drag=null;
function update(){project.update(s);const p=profiles.find(p=>p.id===s.profile),v=validate(s);$('#export').disabled=project.items.some(item=>validate(item.config).errors.length>0);$('#messages').innerHTML=[...v.errors.map(t=>`<div class="message error">${t}</div>`),...v.warnings.map(t=>`<div class="message">${t}</div>`)].join('');$('#model-title').textContent=`MODUS MZ ${s.view==='profile'&&s.handle?'13-01':p.id}`;$('#model-size').textContent=s.view==='profile'?`Сечение ${sections[s.handle?'13-01':p.id].b} × ${sections[s.handle?'13-01':p.id].d} мм · отрезок 90 мм`:`${s.w} × ${s.h} мм`;$('#fact-profile').textContent=`${p.b} × ${p.d} мм`;$('#fact-glass').textContent=`${s.w-p.delta} × ${s.h-p.delta} × 4`;$('#fact-limit').textContent=`${p.h} × ${p.w} мм`;$('#summary-title').textContent=`MZ ${p.id} / ${s.w} × ${s.h} мм`;$('#summary-line').textContent=`${colors[s.color][0]} · ${glasses[s.glass][0]} · ${s.hinges.length} петли`;renderProject();for(const item of project.items){if(item.id===project.activeId)continue;const errors=validate(item.config).errors;if(errors.length){const note=document.createElement('div');note.className='message error';note.textContent=item.name+': '+errors.join(' ');$('#messages').append(note);}}if(Number.isInteger(s.w)&&Number.isInteger(s.h)&&s.w>=200&&s.h>=200&&s.w<=6000&&s.h<=6000){build();drawing();}}
$('#glass').innerHTML=Object.entries(glasses).map(([v,a])=>`<option value="${v}">${a[0]}</option>`).join('');$('#glass').value=s.glass;
['width','height'].forEach((id,i)=>$('#'+id).oninput=e=>{s[i?'h':'w']=Number(e.target.value);update();if(s.w>=200&&s.h>=200)fit();});
for(const id of ['glass','hinge','side','reed','origin'])$('#'+id).onchange=e=>{s[id]=e.target.value;s.glassOpaque=glassItems[s.glass].mirror;controls();update();};
$('#count').onchange=e=>{s.hinges=Array(+e.target.value).fill(0);even();};function even(){const n=s.hinges.length;s.hinges=s.hinges.map((_,i)=>Math.round(100+i*(s.h-200)/Math.max(1,n-1)));hingeFields();update();}$('#even').onclick=even;
$('#handle').onchange=e=>{s.handle=e.target.checked;if(s.handle&&!['00','21','25'].includes(s.color))s.color='00';controls();update();if(s.view==='profile')fit();};$('#mask').onchange=e=>{s.mask=e.target.checked;update();};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{s.view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(t=>t.classList.toggle('active',t===b));$('#drawing').toggleAttribute('hidden',s.view!=='drawing');$('#scene').style.visibility=s.view==='drawing'?'hidden':'visible';$('#gesture').textContent=s.view==='drawing'?'Перемещайте синие точки · координаты в миллиметрах':s.view==='profile'?'Отрезок 90 мм · вращайте, чтобы рассмотреть открытый торец':'Вращайте мышью или пальцем · колесо — масштаб';update();fit();});$('#reset').onclick=fit;
function renderProject(){
 $('#remove-facade').hidden=project.items.length<2;$('#undo-remove').hidden=project.removals.length===0;
 $('#facade-navigation').hidden=project.items.length<2;
 const select=$('#facade-select');select.replaceChildren();
 for(const item of project.items){const option=document.createElement('option');option.value=item.id;option.textContent=item.name+(item.pairId?' · пара':'');select.append(option);}select.value=project.activeId;
 if(document.activeElement!==$('#facade-name'))$('#facade-name').value=project.current().name;
 $('#project-note').textContent=pair()?'Связанная пара: размеры, материалы и петли меняются у обоих. Имена индивидуальные. В 3D показаны оба фасада; зазор 40 мм только для просмотра. Схема — выбранный фасад.':'Самостоятельный фасад: изменения не затрагивают остальные позиции.';
 $('#kit-summary').textContent=`Фасадов в проекте: ${project.items.length}. Выбран: ${project.current().name}.`;
 $('#add-mirror').disabled=!!pair();$('#mirror-note').hidden=!pair();
}
function activate(id){project.activeId=id;const view=s.view;Object.assign(s,structuredClone(project.current().config),{view});
 $('#width').value=s.w;$('#height').value=s.h;for(const id of ['glass','side','reed','origin','count'])$('#'+id).value=id==='count'?s.hinges.length:s[id];controls();update();fit();}
$('#facade-select').onchange=e=>activate(e.target.value);
$('#facade-name').oninput=e=>{project.current().name=e.target.value.trim()||'Без названия';renderProject();};
$('#remove-facade').onclick=()=>{project.update(s);if(project.remove())activate(project.activeId);};
$('#undo-remove').onclick=()=>{project.update(s);if(project.undoRemove())activate(project.activeId);};
$('#add-facade').onclick=()=>$('#add-dialog').showModal();
$('#close-add').onclick=()=>$('#add-dialog').close();
for(const kind of ['mirror','copy','new'])$('#add-'+kind).onclick=()=>{project.update(s);const item=project.add(kind);$('#add-dialog').close();activate(item.id);};
$('#backdrop').onchange=e=>{s.backdrop=e.target.checked;update();};
$('#theme').onclick=()=>document.body.classList.toggle('dark');
$('#profile-details').onclick=()=>{const p=profiles.find(p=>p.id===s.profile);$('#detail-title').textContent=`MODUS MZ ${p.id}`;$('#detail-body').innerHTML=svgSection(p.id,colors[s.color][1],true)+(s.handle?svgSection('13-01',colors[s.color][1],true):'')+`<p class="section-source">${sectionNotes}</p><p>Габарит сечения ${p.b} × ${p.d} мм. Стекло 4 мм. Минимальный фасад 200 × 200 мм. Рекомендуемые максимальные размеры: высота ${p.h}, ширина ${p.w} мм.</p><p>Для стекла из внешней ширины и высоты вычитается по ${p.delta} мм. ${p.edge?'Кромки стекла дополнительно обрабатываются; заполнение вклеивается.':''}</p><p>${p.note||'Цвета указаны по каталогу; доступность проверяется при заказе.'}</p><p>Сечения построены по каталогу, неуказанные толщины и радиусы оценочные. Петли условные. Чертежи обработки на странице 65 относятся к сборочным уголкам, а не к присадке петель. Для производства необходима выбранная модель петли и согласованный чертёж.</p>`;$('#details').showModal();};$('#close-details').onclick=()=>$('#details').close();
$('#export').onclick=()=>{project.update(s);if(project.items.some(item=>validate(item.config).errors.length))return;
 const items=project.items.map(item=>{const c=item.config,p=profiles.find(p=>p.id===c.profile),g=glassItems[c.glass];return {...structuredClone(item),quantity:1,material:{slug:g.slug,variant:g.variant,title:g.title,thickness:4,catalogueSnapshot:catalogue.snapshot},glassCut:{width:c.w-p.delta,height:c.h-p.delta,thickness:4},warnings:validate(c).warnings};});
 const blob=new Blob([JSON.stringify({status:'prototype-not-for-production',source,items},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='modus-mz-project.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
controls();update();fit();
