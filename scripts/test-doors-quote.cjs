// Exercises product rules and the real shared store. No network or mail.
const assert=require('node:assert/strict');
const root='../src/themes/alfa-glass-home-2026/';
const model=require(root+'agm-doors/model.js');
const storeModel=require(root+'agm-configurator/quote-store.js');
const materials=require(root+'agm-configurator/materials.json');
const visuals=require(root+'agm-doors/materials-visuals.json');
const options=require(root+'agm-doors/options.json');
const data={id:'door-test',width:'900',height:'2100',quantity:'1',leaves:'1',thickness:'8',glass:'float-steklo-clear-m1',comment:'',...Object.fromEntries(Object.entries(options).map(([k,v])=>[k,v[0].value]))};
const entry=d=>model.entry(d,materials,visuals,options);
assert.deepEqual(entry(data).errors,[]);
for(const d of [{width:'900.5'},{width:''},{height:'3501'},{quantity:'0'},{leaves:'3'},{glass:'zerkalo-serebro'},{glass:'tonirovannoe-steklo-green',thickness:'10'},{glass:'estriado',thickness:'10'},{finish:'unsupported'},{comment:'x'.repeat(3001)}])assert(entry({...data,...d}).errors.length,JSON.stringify(d));
for(const key of Object.keys(visuals)){
 assert(materials[key],key+' exists in shared catalog');
 for(const thickness of model.thicknesses(materials[key]))assert.deepEqual(entry({...data,glass:key,thickness}).errors,[]);
}
const map=new Map();const storage={get length(){return map.size},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
const store=storeModel.create(storage,()=>{});
store.put({id:'mirror-test',type:'mirror',title:'Зеркало',summary:'Ø 600 мм',errors:[],editUrl:'/aluminium/zerkala/'});
store.put(entry(data));store.put(entry({...data,id:'door-test-2',leaves:'2',width:'1800'}));
assert.equal(store.all().length,3);assert.equal(store.payload().filter(i=>i.type==='door').length,2);
store.put(entry({...data,width:'1000'}));assert.equal(store.all().length,3);assert.match(store.all().find(i=>i.id===data.id).summary,/1000 × 2100/);
assert.equal(storeModel.create(storage,()=>{}).all().length,3);
store.put(entry({...data,width:'900.5'}));assert.throws(()=>store.payload());
store.remove('door',data.id);assert.equal(store.all().length,2);assert.equal(store.payload().length,2);
console.log('PASS door validation, 17 materials, multiple doors + mirror, edit/reload/delete and invalid submission blocked');
