import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {textureRepeat,glassMaterial} from './glass-render.js';
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
test('optical materials are transmissive or reflective and unknown patterns are not invented',()=>{
  const renderer={capabilities:{getMaxAnisotropy:()=>8}};
  for(const m of catalog.items){const mat=glassMaterial(m,450,900,'vertical',renderer);assert.equal(mat.transmission,m.mirror||m.opaque?0:1);if(m.texturePending)assert.equal(mat.normalMap,null);mat.normalMap?.dispose();mat.dispose();}
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
