const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../src/themes/alfa-glass-home-2026/agm-configurator');
const model=require(root+'/model.js'),materials=JSON.parse(fs.readFileSync(root+'/materials.json')),operations=JSON.parse(fs.readFileSync(root+'/operations.json'));
assert.equal(Object.keys(materials).length,41);
assert.deepEqual(materials['moru-ultra'].thicknesses,materials['moru-crystal'].thicknesses);
assert.deepEqual(materials['moru-ultra'].operations,materials['moru-crystal'].operations);
assert.equal(materials['moru-ultra'].variants.standard,'Ultra — ультраосветлённое');
assert.deepEqual(materials['moru-crystal'].thicknesses,['4','5','6','8','10']);
for(const thickness of materials['moru-crystal'].thicknesses){
 const item=model.normalize({material:'moru-crystal',base:'standard',thickness,ops:['temper','laminate','bevel','facade']},materials,()=> 'moru');
 assert.ok(item);assert.equal(item.thickness,thickness);
 assert.deepEqual(item.ops,['temper','laminate','bevel','facade']);
}
for(const [slug,m] of Object.entries(materials)){
 assert.ok(m.thicknesses.length&&Object.keys(m.variants).length);
 assert.equal(new Set(m.operations).size,m.operations.length);
 for(const op of m.operations)assert.ok(operations.some(o=>o.id===op));
 if(m.policy==='mirror'||m.policy==='painted')assert.ok(!m.operations.includes('temper'));
 const item=model.normalize({material:slug,base:Object.keys(m.variants)[0],thickness:m.thicknesses[0],ops:operations.map(o=>o.id)},materials,()=>slug);
 assert.ok(item);assert.ok(item.ops.every(op=>m.operations.includes(op)));
 assert.ok(!(item.ops.includes('polish')&&item.ops.includes('grind')));
 assert.equal(m.operations.includes('frame'),m.policy==='mirror');
 assert.equal(m.operations.includes('facade'),m.policy!=='mirror');
 const migrated=model.normalize({material:slug,base:Object.keys(m.variants)[0],thickness:m.thicknesses[0],ops:['frame'],width:'450',height:'700'},materials,()=>slug);
 assert.deepEqual(migrated.ops,[m.policy==='mirror'?'frame':'facade']);
 assert.equal(migrated.width,'450');
}
const legacy=model.normalize({base:'tint_bronze',thickness:'6',ops:['temper','bevel'],width:'700',height:'1200',quantity:'2'},materials,()=> 'legacy');
assert.equal(legacy.material,'tonirovannye-zerkala');assert.deepEqual(legacy.ops,['bevel']);assert.equal(legacy.width,'700');
const flutes=model.normalize({material:'riflenoe-steklo-flutes',base:'standard',thickness:'6',ops:['temper','paint','bevel']},materials,()=> 'flutes');
assert.deepEqual(flutes.ops,['temper','paint']);
assert.equal(model.normalize({material:'__proto__',base:'standard',thickness:'4'},materials,()=>''),null);
assert.equal(model.normalize({material:'riflenoe-steklo-flutes',base:'standard',thickness:'20'},materials,()=>''),null);
assert.equal(model.normalize(null,materials,()=>''),null);
const tinted=materials['tonirovannye-zerkala'];
assert.equal(Object.keys(tinted.variants).length,7);
for(const base of Object.keys(tinted.variants)){
 for(const thickness of ['4','6']){
  const item=model.normalize({material:'tonirovannye-zerkala',base,thickness},materials,()=>base);
  assert.equal(!!item,thickness==='4'||['tint_bronze','tint_grey'].includes(base));
 }
}
assert.equal(model.normalize({material:'tonirovannye-zerkala',base:'tint_silver',thickness:'6'},materials,()=> 'old').material,'zerkalo-serebro');
assert.equal(model.normalize({material:'tonirovannye-zerkala',base:'tint_dichroic',thickness:'4'},materials,()=> 'old'),null);
for(const value of ['1','200','10000',6]) assert.equal(model.wholeMillimetres(value),true);
for(const value of ['',0,-1,'0.1','200.01','200,1','abc',Infinity]) assert.equal(model.wholeMillimetres(value),false);
const fractional=model.normalize({material:'zerkalo-serebro',base:'standard',thickness:'4',width:'200.1',height:'300'},materials,()=> 'fraction');
assert.equal(fractional.width,'200.1'); // Preserve saved measurements; require correction rather than silently rounding.
assert.equal(model.wholeMillimetres(fractional.width),false);
console.log('PASS: 41 profiles, operation allowlists, MORU CRYSTAL/ULTRA profiles, mirror/painted heat exclusions, legacy migration, invalid stored entries and whole millimetres.');
