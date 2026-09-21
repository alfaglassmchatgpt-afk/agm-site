const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../src/themes/alfa-glass-home-2026/agm-configurator');
const model=require(root+'/model.js'),materials=JSON.parse(fs.readFileSync(root+'/materials.json')),operations=JSON.parse(fs.readFileSync(root+'/operations.json'));
assert.equal(Object.keys(materials).length,39);
for(const [slug,m] of Object.entries(materials)){
 assert.ok(m.thicknesses.length&&Object.keys(m.variants).length);
 assert.equal(new Set(m.operations).size,m.operations.length);
 for(const op of m.operations)assert.ok(operations.some(o=>o.id===op));
 if(m.policy==='mirror'||m.policy==='painted')assert.ok(!m.operations.includes('temper'));
 const item=model.normalize({material:slug,base:Object.keys(m.variants)[0],thickness:m.thicknesses[0],ops:operations.map(o=>o.id)},materials,()=>slug);
 assert.ok(item);assert.ok(item.ops.every(op=>m.operations.includes(op)));
 assert.ok(!(item.ops.includes('polish')&&item.ops.includes('grind')));
}
const legacy=model.normalize({base:'tint_bronze',thickness:'6',ops:['temper','bevel'],width:'700',height:'1200',quantity:'2'},materials,()=> 'legacy');
assert.equal(legacy.material,'tonirovannye-zerkala');assert.deepEqual(legacy.ops,['bevel']);assert.equal(legacy.width,'700');
const flutes=model.normalize({material:'riflenoe-steklo-flutes',base:'standard',thickness:'6',ops:['temper','paint','bevel']},materials,()=> 'flutes');
assert.deepEqual(flutes.ops,['temper','paint']);
assert.equal(model.normalize({material:'__proto__',base:'standard',thickness:'4'},materials,()=>''),null);
assert.equal(model.normalize({material:'riflenoe-steklo-flutes',base:'standard',thickness:'20'},materials,()=>''),null);
assert.equal(model.normalize(null,materials,()=>''),null);
console.log('PASS: 39 profiles, operation allowlists, mirror/painted heat exclusions, legacy migration and invalid stored entries.');
