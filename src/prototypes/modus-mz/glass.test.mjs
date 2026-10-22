import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {textureRepeat,glassMaterial,moruOptics} from './glass-render.js';
import {validate} from './data.js';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const catalog=await read('./glass-catalog.json');
const shared=await read('../../themes/alfa-glass-home-2026/agm-configurator/materials.json');
test('every offered variant has 4 mm in the shared catalogue',()=>{
  assert.equal(new Set(catalog.items.map(m=>m.id)).size,catalog.items.length);
  for(const item of catalog.items){assert.equal(item.thickness,4);if(item.verifiedSource){assert.ok(item.verifiedSource.thicknesses.includes(4));assert.equal(new URL(item.verifiedSource.url).hostname,'alfaglass.ru');continue;}const m=shared[item.slug];assert.ok(m);assert.ok((m.variantThicknesses?.[item.variant]??m.thicknesses).includes('4'));assert.ok(item.variant in m.variants);}
  for(const slug of catalog.excludedUnknownThickness)assert.ok(!catalog.items.some(m=>m.slug===slug));
});
test('physical texture pitch does not stretch with facade size or orientation',()=>{
  assert.deepEqual(textureRepeat(300,200,2,'vertical'),[150,100]);
  assert.deepEqual(textureRepeat(600,200,2,'vertical'),[300,100]);
  assert.deepEqual(textureRepeat(300,200,2,'horizontal'),[100,150]);
});
test('MORU owner pitch is retained without assigning ribs to flat legacy names',async()=>{
 const refs=await read('../../../docs/facade-glass-visual-references.json');
 for(const slug of refs.moruFlutesPitch.slugs){
  const item=catalog.items.find(i=>i.slug===slug);assert.ok(item);assert.equal(item.pitch,12);
 }
 assert.equal(catalog.items.find(i=>i.slug==='moru-bronze').pitch,null);
 const {moruNormalTexture}=await import('./glass-render.js');
 for(const direction of ['vertical','horizontal']){
  const t=moruNormalTexture(360,600,direction);assert.deepEqual(t.repeat.toArray(),[30,50]);t.dispose();
 }
});
test('Raywall preserves rib pitch and rotates normal direction without stretching',async()=>{
 const {raywallNormalTexture,glassEdgeMaterial}=await import('./glass-render.js');
 const pitch=100/14,vertical=raywallNormalTexture(320,570,pitch,'vertical'),horizontal=raywallNormalTexture(320,570,pitch,'horizontal');
 assert.deepEqual(vertical.repeat.toArray(),[320/pitch,570/pitch]);
 assert.deepEqual(horizontal.repeat.toArray(),vertical.repeat.toArray());
 const index=(64*256+64)*4;
 assert.ok(Math.abs(vertical.image.data[index]-128)>40);
 assert.ok(Math.abs(vertical.image.data[index+1]-128)<10);
 assert.ok(Math.abs(horizontal.image.data[index+1]-128)>40);
 assert.ok(Math.abs(horizontal.image.data[index]-128)<10);
 const item=catalog.items.find(i=>i.slug==='raywall90');
 const face=glassMaterial(item,320,570,'vertical',{capabilities:{getMaxAnisotropy:()=>8}});
 const edge=glassEdgeMaterial(item,face);
 assert.equal(face.thickness,4);assert.equal(edge.normalMap,null);assert.equal(edge.thickness,4);
 const enlarged=raywallNormalTexture(640,1140,pitch,'vertical');
 assert.equal(enlarged.repeat.x,vertical.repeat.x*2);
 for(const t of [vertical,horizontal,enlarged,face.normalMap])t.dispose();face.dispose();edge.dispose();
});
test('optical materials are transmissive or reflective and unknown patterns are not invented',()=>{
  const renderer={capabilities:{getMaxAnisotropy:()=>8}};
  for(const m of catalog.items){const mat=glassMaterial(m,450,900,'vertical',renderer);if(m.mirror||m.opaque)assert.equal(mat.transmission,0);else if(moruOptics[m.slug]?.coating){assert.ok(mat.metalness>0&&mat.metalness<.5);assert.ok(mat.transmission>=.6&&mat.transmission<.9);assert.ok(mat.roughness<.05);}else assert.ok(mat.transmission>=.9);if(m.texturePending)assert.equal(mat.normalMap,null);mat.normalMap?.dispose();mat.dispose();}
});
test('catalogue material opacity participates in MZ07 compatibility',()=>{
  const s={profile:'07',w:450,h:900,glass:'arbitrary-catalogue-slug',hinge:'narrow',hinges:[100,800],mask:false};
  assert.equal(validate({...s,glassOpaque:true}).errors.length,0);
  assert.equal(validate({...s,glassOpaque:false}).errors.length,2);
});
test('owner confirmations remain available and excluded Clearvision stays out',async()=>{
 const decisions=await read('../../../docs/material-confirmations.json');
 for(const [slug,decision] of Object.entries(decisions.materials)){
  if(decision.facadeSelectable){assert.ok(shared[slug].thicknesses.includes('4'));assert.equal(shared[slug].title,decision.title);assert.ok(catalog.items.some(i=>i.slug===slug&&i.thickness===4));}
  else assert.ok(!catalog.items.some(i=>i.slug===slug));
 }
 assert.equal(shared['steklo-kristalvizhn-crystalvision'].title,'Осветлённое стекло Crystalvision');
 assert.equal(shared['zerkalo-gezella'].title,'Двухстороннее зеркало');
});

test('transparent category has exactly the seven approved glasses in order, without Dark Grey',async()=>{
 const {transparentItems}=await import('./glass-groups.js');
 const decisions=await read('../../../docs/facade-glass-categories.json');
 assert.deepEqual(transparentItems(catalog.items).map(({slug,title})=>({slug,title})),decisions.items);
 assert.equal(transparentItems(catalog.items).length,7);
});

test('matte category matches the five live catalogue materials, all matte 4 mm',async()=>{
 const {matteItems}=await import('./glass-groups.js');
 const decisions=await read('../../../docs/facade-glass-categories.json');
 const items=matteItems(catalog.items);
 assert.deepEqual(items.map(({slug,title})=>({slug,title})),decisions.matte.items);
 assert.equal(items.length,5);
 for(const item of items){assert.equal(item.matte,true);assert.equal(item.thickness,4);assert.ok(item.verifiedSource.thicknesses.includes(4));}
});

test('Stopsol category matches all three live Phoenix materials',async()=>{
 const {stopsolItems}=await import('./glass-groups.js');
 const decisions=await read('../../../docs/facade-glass-categories.json');
 const items=stopsolItems(catalog.items);
 assert.deepEqual(items.map(({slug,title})=>({slug,title})),decisions.stopsol.items);
 assert.equal(items.length,3);
 for(const item of items){assert.equal(item.thickness,4);assert.ok(item.verifiedSource.thicknesses.includes(4));assert.equal(item.mirror,false);}
});

test('reed category contains all 14 live products and MORU Grey differs from flat Grey',async()=>{
 const {reedItems}=await import('./glass-groups.js');
 const decisions=await read('../../../docs/facade-glass-categories.json');
 const items=reedItems(catalog.items);
 assert.deepEqual(items.map(({slug,title})=>({slug,title})),decisions.reed.items);
 assert.equal(items.length,14);
 assert.notEqual(items.find(i=>i.slug==='moru-grey').id,catalog.items.find(i=>i.slug==='tonirovannoe-steklo-grey').id);
 for(const item of items){assert.equal(item.thickness,4);assert.ok(item.verifiedSource.thicknesses.includes(4));}
});

test('patterned category includes all nine live products and keeps Krezet pitch',async()=>{
 const {patternedItems}=await import('./glass-groups.js');
 const decisions=await read('../../../docs/facade-glass-categories.json');
 const items=patternedItems(catalog.items);
 assert.deepEqual(items.map(({slug,title})=>({slug,title})),decisions.patterned.items);
 assert.equal(items.length,9);
 assert.equal(items.find(i=>i.slug==='krezet').pitch,2);
 for(const item of items){assert.equal(item.thickness,4);assert.ok(item.verifiedSource.thicknesses.includes(4));}
});

test('clear glass uses neutral faces and keeps the 4 mm optical thickness',async()=>{
 const {glassEdgeMaterial}=await import('./glass-render.js');
 const m1=glassMaterial({slug:'float-steklo-clear-m1',color:'#d7eeea'},350,600,'vertical',{});
 const cv=glassMaterial({slug:'steklo-kristalvizhn-crystalvision',color:'#d7eeea'},350,600,'vertical',{});
 for(const m of [m1,cv]){assert.equal(m.color.getHexString(),'ffffff');assert.equal(m.thickness,4);assert.equal(m.transmission,1);assert.equal(m.clearcoat,0);assert.equal(m.metalness,0);}
 assert.ok(cv.attenuationDistance>m1.attenuationDistance);
 const edge=glassEdgeMaterial({slug:'float-steklo-clear-m1'},m1);assert.notEqual(edge,m1);assert.notEqual(edge.color.getHex(),m1.color.getHex());
 edge.dispose();m1.dispose();cv.dispose();
});

test('tinted flat glass stays transmissive, neutral on the face, and distinct from MORU',async()=>{
 const {tintedGlassOptics,glassEdgeMaterial}=await import('./glass-render.js');
 assert.equal(Object.keys(tintedGlassOptics).length,5);assert.equal(tintedGlassOptics['moru-grey'],undefined);
 const absorption=new Set();
 for(const slug of Object.keys(tintedGlassOptics)){
  const item=catalog.items.find(i=>i.slug===slug);assert.ok(item);
  const mat=glassMaterial(item,350,600,'vertical',{});assert.equal(mat.transmission,1);assert.equal(mat.thickness,4);assert.equal(mat.metalness,0);assert.equal(mat.color.getHexString(),'ffffff');assert.equal(mat.normalMap,null);
  absorption.add(mat.attenuationColor.getHex());const edge=glassEdgeMaterial(item,mat);assert.ok(edge);edge.dispose();mat.dispose();
 }
 assert.equal(absorption.size,5);
});
test('flat satin glass blurs transmission without becoming opaque or changing thickness',async()=>{
 const {matteGlassOptics}=await import('./glass-render.js');
 assert.equal(Object.keys(matteGlassOptics).length,5);
 for(const slug of Object.keys(matteGlassOptics)){
  const item=catalog.items.find(i=>i.slug===slug);assert.ok(item);
  const mat=glassMaterial(item,350,600,'vertical',{});
  assert.ok(mat.transmission>.9);assert.ok(mat.roughness>=.5);assert.equal(mat.thickness,4);assert.equal(mat.clearcoat,0);assert.equal(mat.metalness,0);assert.equal(mat.normalMap,null);mat.dispose();
 }
});
test('Stopsol retains transmission and a smooth reflective coating for all three colours',async()=>{
 const {stopsolGlassOptics}=await import('./glass-render.js');assert.equal(Object.keys(stopsolGlassOptics).length,3);
 for(const slug of Object.keys(stopsolGlassOptics)){
  const item=catalog.items.find(i=>i.slug===slug);const mat=glassMaterial(item,350,600,'vertical',{});
  assert.equal(item.mirror,false);assert.equal(mat.thickness,4);assert.equal(mat.transmission,1);assert.ok(mat.metalness>0&&mat.metalness<1);assert.ok(mat.roughness<.05);assert.equal(mat.normalMap,null);mat.dispose();
 }
});
test('sample cabinet follows facade dimensions while props keep millimetre dimensions',async()=>{
 const {sampleCabinet}=await import('./glass-render.js');
 for(const [w,h] of [[350,600],[600,1200],[200,200]]){
  const g=sampleCabinet(w,h);assert.equal(g.userData.width,w);assert.equal(g.userData.height,h);assert.equal(g.userData.bookHeight,210);
  const spheres=g.children.filter(o=>o.geometry?.type==='SphereGeometry');assert.ok(spheres.length);for(const ball of spheres){assert.equal(ball.geometry.parameters.radius,30);assert.equal(ball.scale.x,1);}
  for(const o of g.children){o.geometry?.dispose();o.material?.dispose();}
 }
});
test('kitchen contents retain physical sizes and omit bottles in short cabinets',async()=>{
 const {sampleCabinet}=await import('./glass-render.js');
 for(const [w,h] of [[350,600],[600,1200],[200,200]]){
  const g=sampleCabinet(w,h,'kitchen');assert.equal(g.userData.width,w);assert.equal(g.userData.height,h);
  const bottles=g.children.filter(o=>o.name==='bottle-240mm');if(h===200)assert.equal(bottles.length,0);else assert.ok(bottles.length);
  for(const b of bottles){assert.equal(b.scale.y,1);b.geometry.computeBoundingBox();assert.equal(b.geometry.boundingBox.max.y,230);}
  assert.ok(g.children.some(o=>o.name==='plate-130mm'));
  for(const o of g.children){o.geometry?.dispose();o.material?.dispose();}
 }
});
test('satin contact mask retains centre blur and follows physical rail overlap',async()=>{
 const {satinContactMap}=await import('./glass-render.js');
 for(const w of [326,576]){
  const map=satinContactMap(w,576,38),n=map.image.width,pixel=x=>map.image.data[(128*n+x)*4+1];
  assert.ok(pixel(0)<60);assert.equal(pixel(128),255);
  assert.ok(pixel(Math.floor(30/w*n))<60);assert.equal(pixel(Math.ceil(45/w*n)),255);map.dispose();
 }
});

test('metre scene converts optical distances while facade defaults remain millimetres',()=>{const item=catalog.items.find(x=>x.slug==='float-steklo-clear-m1');const renderer={capabilities:{getMaxAnisotropy:()=>8}};const mm=glassMaterial(item,800,2200,'vertical',renderer);const metre=glassMaterial(item,800,2200,'vertical',renderer,0,.001);assert.equal(mm.thickness,4);assert.equal(metre.thickness,.004);assert.equal(metre.attenuationDistance,mm.attenuationDistance*.001);mm.dispose();metre.dispose();});
