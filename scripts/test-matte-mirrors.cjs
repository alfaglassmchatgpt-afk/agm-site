const assert=require('node:assert/strict');
const base='../src/themes/alfa-glass-home-2026/agm-configurator/';
const materials=require(base+'materials.json'),ops=require(base+'operations.json'),M=require(base+'model.js'),Q=require(base+'quote-model.js');
for(const [slug,p] of Object.entries(materials).filter(([s])=>s.startsWith('matovoe-zerkalo-'))){
 assert.deepEqual(p.thicknesses,['4']);assert(!p.operations.includes('temper'));
 const make=(w,h)=>M.normalize({material:slug,base:Object.keys(p.variants)[0],thickness:'4',width:w,height:h,quantity:'1',ops:['cut','polish']},materials,()=>slug);
 for(const [w,h] of [[3210,2250],[2250,3210],[600,900]])assert.equal(Q.material(make(w,h),materials,ops).errors.length,0);
 for(const [w,h] of [[2251,2251],[3211,100],[100,3211],[600.5,900]])assert(Q.material(make(w,h),materials,ops).errors.length);
 assert.equal(M.normalize({...make(600,900),thickness:'6'},materials,()=>slug),null);
}
console.log('PASS: four matte profiles, thickness, sheet rotation, oversize and integer dimensions.');
