// Isolated in-memory storage only. No browser data, requests or contact information.
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../src/themes/alfa-glass-home-2026');
const Store=require(root+'/agm-configurator/quote-store.js'),Model=require(root+'/agm-configurator/quote-model.js'),Material=require(root+'/agm-configurator/model.js');
const materials=require(root+'/agm-configurator/materials.json'),ops=require(root+'/agm-configurator/operations.json');
class Memory {constructor(){this.map=new Map()}get length(){return this.map.size}key(n){return [...this.map.keys()][n]}getItem(k){return this.map.get(k)??null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}
const memory=new Memory(),a=Store.create(memory),b=Store.create(memory);
const ordinary=Material.normalize({id:'sample-material',material:'zerkalo-serebro',base:'standard',thickness:'4',width:'600',height:'900',quantity:'2',ops:['polish','temper']},materials,()=>''),m=Model.material(ordinary,materials,ops);
assert(!ordinary.ops.includes('temper'),'Classic mirrors must never gain tempering');
const framed={id:'sample-framed',shape:'Круг',diameter:'800',profile:'9',color:'Медь',quantity:'1',lighting:true};
const f=Model.mirror(framed);assert.equal(f.errors.length,0);
a.migrate('materials',[m]);a.migrate('mirrors',[f]);
assert.equal(b.all().length,2);assert.equal(b.payload().length,2);
assert.match(b.payload().find(i=>i.type==='mirror').summary,/Подсветка: Да/);
// Scoped changes from another page must preserve the other kind of product.
a.sync([{...m,summary:m.summary+'\nКомментарий: образец'}],[m]);assert.equal(b.all().length,2);
b.remove('mirror',f.id);a.migrate('mirrors',[f]);assert.equal(a.all().length,1,'Migration cannot resurrect deletion');
a.put(f);const before=a.all();a.sync([m],[m]);assert.equal(b.all().length,2,'Unchanged stale editor is not a replacement of the basket');
a.remove('material',m.id);a.sync([m],[m]);assert.equal(a.all().length,1,'Unchanged stale position must not resurrect');
a.put(m);
assert(Model.mirror({...framed,diameter:'800.5'}).errors.length);
assert(Model.mirror({...framed,diameter:'1201'}).errors.length);
assert(Model.mirror({...framed,shape:'Прямоугольник',width:'3150',height:'2000',profile:'3',color:'Чёрный матовый'}).errors.length===0);
assert(Model.mirror({...framed,shape:'Овал',width:'2000',height:'2000'}).errors.length);
assert(Model.material({...ordinary,width:'1.5'},materials,ops).errors.length);
a.put(Model.mirror({...framed,diameter:''}));assert.throws(()=>a.payload(),/миллиметрами/);a.put(f);
// No 30-position truncation when importing a larger existing quote.
const many=Store.create(new Memory());many.migrate('materials',Array.from({length:40},(_,n)=>({...m,id:'legacy-'+n})));assert.equal(many.payload().length,40);
const broken=new Memory();broken.setItem(Store.prefix+'material:bad','{');assert.throws(()=>Store.create(broken).all());
const full=new Memory();full.setItem=()=>{throw Error('quota')};assert.throws(()=>Store.create(full).put(m),/quota/);
(async()=>{
 global.localStorage=new Memory();global.location={search:''};
 const mod=await import(pathToFileURL(root+'/agm-aluminium-configurator/quote.js'));
 const {FacadeProject}=await import(pathToFileURL(root+'/agm-aluminium-configurator/project.js'));
 const {ProjectConfirmation}=await import(pathToFileURL(root+'/agm-aluminium-configurator/confirmation.js'));
 const {profiles,glasses}=await import(pathToFileURL(root+'/agm-aluminium-configurator/data.js')+'?v=mf-series-20261021');
 glasses.none=['Без наполнения','none'];
 const defaults={profile:profiles[0].id,w:350,h:600,color:profiles[0].colors[0],glass:'none',hinge:'none',side:'left',origin:'top',hinges:[],handle:false,mask:false,reed:'vertical',view:'3d'};
 const project=new FacadeProject(defaults),confirmation=new ProjectConfirmation(),connection=mod.connectFacadeQuote(project,confirmation,{store:a});
 confirmation.confirm(project.items,true);connection.save(true);connection.save(true);
 assert.equal(a.payload().length,3,'Adding a facade twice updates one entry');
 const restored=new FacadeProject(defaults),review=new ProjectConfirmation();mod.connectFacadeQuote(restored,review,{store:b});assert.deepEqual(restored.items,project.items);
 project.items[0].config.w=400;connection.save();assert.throws(()=>a.payload(),/Подтвердите/);
 confirmation.confirm(project.items,true);connection.save();assert.equal(a.payload().length,3);assert.match(a.payload().find(i=>i.type==='facade').summary,/400 × 600/);
 a.remove('facade',project.items[0].id);connection.save();assert.equal(a.all().length,2,'Removed facade is not auto-added by its open editor');
 assert(!JSON.stringify([...memory.map]).includes('phone'));
 console.log('PASS: mixed basket, migration, edits/deletes, reload, facade confirmation, limits, storage failures; no network calls.');
})().catch(e=>{console.error(e);process.exitCode=1});
