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
