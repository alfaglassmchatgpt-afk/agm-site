const assert=require('node:assert/strict'),fs=require('node:fs');global.window=global;
require('../src/previews/product-journal/mirror-catalog.js');
const model=require('../src/previews/product-journal/shelf-model.js'),order=require('../src/themes/alfa-glass-home-2026/agm-configurator/model.js');
const materials=JSON.parse(fs.readFileSync('src/themes/alfa-glass-home-2026/agm-configurator/materials.json','utf8'));
assert.equal(Object.keys(model.presets).length,12);
for(const [id,preset] of Object.entries(model.presets)){
 assert(!preset.material.includes('sostarennye')&&!preset.material.includes('gezella'));
 const s={...preset,thickness:'4'};assert.deepEqual(model.validate(s,materials[s.material],order),[],id);
 assert(model.validate({...s,shape:'rectangle',width:299,height:300},materials[s.material],order).length);
}
const rect={...model.presets['silver-rect'],width:300,height:300,quantity:1,thickness:'4'};
assert.deepEqual(model.validate(rect,materials[rect.material],order),[]);
assert(model.validate({...rect,quantity:0},materials[rect.material],order).length);
const arch={...model.presets['silver-arch'],width:2000,height:800,thickness:'4'};
assert(model.validate(arch,materials[arch.material],order).some(e=>e.includes('арки')));
(async()=>{const {outline}=await import('../src/themes/alfa-glass-home-2026/agm-configurator/shelf-geometry.js');for(const id of ['silver-oval','silver-arch'])assert(!/NaN|undefined/.test(outline(model.presets[id])));console.log('12 mirror presets, minimum dimensions, arch geometry, ellipse and excluded materials: PASS');})();

const circle={...rect,shape:'circle',diameter:300,ops:['grind']};
assert.deepEqual(model.validate(circle,materials[rect.material],order),[]);
assert(model.validate({...circle,diameter:299},materials[rect.material],order).length);
assert(model.availableOperations(rect,materials[rect.material],order).includes('bevel'));
for(const curved of [circle,{...rect,radii:[1,0,0,0]},{...rect,shape:'ellipse'},{...rect,shape:'arch'}]){
 assert(!model.availableOperations(curved,materials[rect.material],order).includes('bevel'));
 assert(model.validate({...curved,ops:['bevel']},materials[rect.material],order).length);
}
const quote=require('../src/themes/alfa-glass-home-2026/agm-configurator/quote-model.js');
const operations=JSON.parse(fs.readFileSync('src/themes/alfa-glass-home-2026/agm-configurator/operations.json','utf8'));
const data=order.normalize({...rect,base:'standard',ops:['cut','bevel','drill','film'],bevel:{width:'10'},drill:{rows:[{diameter:'8',count:'2'}]}},materials,()=> 'mirror-test');
const result=quote.material(data,materials,operations);
assert.deepEqual(result.errors,[]);assert(result.summary.includes('Фацет: 10 мм'));assert(result.summary.includes('Ø 8 мм'));
console.log('Mirror processing, curved bevel rejection, 300 mm circle and shared order summary: PASS');
