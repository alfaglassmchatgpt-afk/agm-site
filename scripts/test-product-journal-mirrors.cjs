const assert=require('node:assert/strict'),fs=require('node:fs');global.window=global;
require('../src/previews/product-journal/mirror-catalog.js');
const model=require('../src/previews/product-journal/shelf-model.js'),order=require('../src/themes/alfa-glass-home-2026/agm-configurator/model.js');
const materials=JSON.parse(fs.readFileSync('src/themes/alfa-glass-home-2026/agm-configurator/materials.json','utf8'));
assert.equal(Object.keys(model.presets).length,12);
for(const [id,preset] of Object.entries(model.presets)){
 assert(!preset.material.includes('sostarennye')&&!preset.material.includes('gezella'));
 const s={...preset,thickness:'4'};assert.deepEqual(model.validate(s,materials[s.material],order),[],id);
 assert(model.validate({...s,shape:'rectangle',width:799,height:600},materials[s.material],order).length);
}
const arch={...model.presets['silver-arch'],width:2000,height:800,thickness:'4'};
assert(model.validate(arch,materials[arch.material],order).some(e=>e.includes('арки')));
(async()=>{const {outline}=await import('../src/themes/alfa-glass-home-2026/agm-configurator/shelf-geometry.js');for(const id of ['silver-oval','silver-arch'])assert(!/NaN|undefined/.test(outline(model.presets[id])));console.log('12 mirror presets, minimum dimensions, arch geometry, ellipse and excluded materials: PASS');})();
