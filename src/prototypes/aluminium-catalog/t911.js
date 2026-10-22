import * as THREE from 'three';
import {glassMaterial,studioEnvironment} from './glass-render.js';
import {buildApartment} from './t911-room.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {dimensions,partitionMaterialAllowed,checkGlassSize} from './t911-rules.mjs';
const $=id=>document.getElementById(id),view=$('partition-view');
let scene,camera,renderer,controls,assembly,room,studioFloor,studioGrid,movers=[],d,materials=[],limits={},progress=0,target=0,animating=false,last=0;
function box(w,h,z,color,x,y,depth,opacity=1){const material=new THREE.MeshStandardMaterial({color,roughness:.62,metalness:opacity===1?.18:0,transparent:opacity<1,opacity,depthWrite:opacity===1});const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,z),material);m.position.set(x,y,depth);return m;}
function release(){if(!assembly)return;const textures=new Set();assembly.traverse(o=>{o.geometry?.dispose();if(o.material){for(const v of Object.values(o.material))if(v?.isTexture)textures.add(v);o.material.dispose();}});textures.forEach(t=>t.dispose());scene.remove(assembly);}
function rebuild(){
 try{d=dimensions(Number($('opening-width').value),Number($('opening-height').value));}catch(e){$('partition-warning').textContent='Введите целые размеры: ширина 2400–4759 мм, высота 1000–4000 мм. Показана последняя корректная модель.';return;}
 const select=$('partition-glass');
 for(const option of select.options){if(!option.value)continue;const m=materials.find(x=>x.id===option.value);const result=checkGlassSize(d.glassWidth,d.glassHeight,limits[m.slug]);option.disabled=result.status==='exceeded';option.textContent=m.title+(option.disabled?' — не подходит по размеру':'');}
 if(select.selectedOptions[0]?.disabled)select.value='';
 release();assembly=new THREE.Group();scene.add(assembly);movers=[];
 const c=$('partition-color').value,glass=materials.find(m=>m.id===$('partition-glass').value)||{color:'#b9d8df'},w=d.door/1000,h=d.height/1000,B=d.b/1000;
 function panel(x,z,moving){const g=new THREE.Group();g.position.set(x,0,z);if(glass.slug){const mat=glassMaterial(glass,d.glassWidth,d.glassHeight,'vertical',renderer,0,.001);mat.side=THREE.DoubleSide;const pane=new THREE.Mesh(new THREE.PlaneGeometry(w-.041,h-.05),mat);pane.position.y=h/2+.01;g.add(pane);}for(const side of [-1,1])g.add(box(.0205,h,.04,c,side*(w/2-.01025),h/2+.01,0));for(const y of [.0225,h-.0025])g.add(box(w,.025,.04,c,0,y,0));assembly.add(g);if(moving)movers.push(g);return g;}
 panel(-B/2+w/2,-.05,false);panel(B/2-w/2,-.05,false);panel(-w/2,0,true);panel(w/2,0,true);
 assembly.add(box(B,.055,.11,c,0,d.h/1000-.0275,-.025));
 for(const side of [-1,1])assembly.add(box(.025,.015,.035,'#555555',side*(B/2-w+.03),.0075,0));
 $('partition-warning').textContent=Math.abs(d.ratio-2.5)>.15?'Пропорция двери '+d.ratio.toFixed(2)+':1. Рекомендация каталога — 2,5:1; габариты согласуем отдельно.':'Размеры в диапазоне макета. Массу полного полотна и комплектацию нужно проверить перед изготовлением.';
 $('partition-dimensions').textContent=`Дверь: ${d.door} × ${d.height} мм · Стекло: ${d.glassWidth} × ${d.glassHeight} мм · Максимальный проход: ${d.passage} мм`;
 $('glass-link').hidden=!glass.slug;if(glass.slug)$('glass-link').href='https://alfaglass.ru/materialy/'+glass.slug+'/';
 refreshRoom();
 controls.target.set(0,h/2,0);camera.position.set(B*.65,h*.7,B*1.25);controls.update();update();
}
function refreshRoom(){
 if(room){room.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});scene.remove(room);room=null;}
 const apartment=$('partition-scene').value==='apartment';studioFloor.visible=studioGrid.visible=!apartment;
 if(apartment){room=buildApartment(d.b/1000,d.h/1000);scene.add(room);}
 scene.background=new THREE.Color(apartment?'#e9e4dc':'#eef3f5');
}
function update(){if(!d)return;const w=d.door/1000,travel=d.travel/1000*progress; movers[0].position.x=-w/2-travel;movers[1].position.x=w/2+travel;
 $('opening-progress').value=Math.round(progress*100);$('opening-value').textContent=Math.round(progress*100)+'%';$('animate-door').textContent=progress>.99?'Закрыть':'Открыть';
 const B=d.b,W=d.door,T=d.travel*progress; $('partition-scheme').innerHTML=`<svg viewBox="0 0 ${B} 260" role="img" aria-label="Вид сверху: крайние полотна неподвижны"><g fill="#c1d9de" stroke="#425a65" stroke-width="8"><rect x="0" y="40" width="${W}" height="40"/><rect x="${B-W}" y="40" width="${W}" height="40"/></g><g fill="#08799d"><rect x="${B/2-W-T}" y="110" width="${W}" height="40"/><rect x="${B/2+T}" y="110" width="${W}" height="40"/></g></svg>`;
}
async function init(){try{
 const response=await fetch('./glass-catalog.json');if(!response.ok)throw Error('Каталог недоступен');materials=(await response.json()).items.filter(partitionMaterialAllowed);$('partition-glass').replaceChildren(new Option('Выберите подходящее стекло',''),...materials.map(x=>new Option(x.title,x.id)));
 const clear=materials.find(x=>x.title==='Стекло обычное М1');if(clear)$('partition-glass').value=clear.id;
 const limitResponse=await fetch('./glass-limits.json');if(!limitResponse.ok)throw Error('Размеры материалов недоступны');limits=await limitResponse.json();
 scene=new THREE.Scene();scene.background=new THREE.Color('#eef3f5');camera=new THREE.PerspectiveCamera(38,1,.01,100);renderer=new THREE.WebGLRenderer({antialias:true});renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.setPixelRatio(Math.min(devicePixelRatio,2));view.append(renderer.domElement);controls=new OrbitControls(camera,renderer.domElement);controls.minDistance=1;controls.maxDistance=18;
 scene.add(new THREE.HemisphereLight(0xffffff,0x83949a,3));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(2,5,4);scene.add(light);const floor=box(20,.015,20,'#d0c7b6',0,-.02,0);scene.add(floor);studioFloor=floor;const grid=new THREE.GridHelper(10,20,0xb1a690,0xc3baa9);grid.position.y=-.011;scene.add(grid);studioGrid=grid;scene.environment=studioEnvironment(renderer).texture;
 new ResizeObserver(()=>{const {width,height}=view.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}).observe(view);
 $('partition-scene').addEventListener('change',refreshRoom);
 for(const id of ['opening-width','opening-height','partition-color','partition-glass'])$(id).addEventListener(id.startsWith('opening-')?'input':'change',()=>{animating=false;rebuild();});
 $('opening-progress').addEventListener('input',e=>{animating=false;progress=Number(e.target.value)/100;update();});
 $('animate-door').onclick=()=>{target=animating?1-target:progress>.5?0:1;animating=true;};
 $('front-view').onclick=()=>{camera.position.set(0,d.height/2000,d.b/1000*1.6);controls.target.set(0,d.height/2000,0);controls.update();};
 rebuild();renderer.setAnimationLoop(t=>{const dt=Math.min((t-last)/1000,.05);last=t;if(animating){const step=dt*.45;progress+=Math.sign(target-progress)*Math.min(Math.abs(target-progress),step);if(Math.abs(progress-target)<.001){progress=target;animating=false;}update();}controls.update();renderer.render(scene,camera);});
 }catch(e){$('partition-warning').textContent='Не удалось загрузить 3D-модель. Обновите страницу или проверьте локальные файлы.';console.error(e);}}
init();
