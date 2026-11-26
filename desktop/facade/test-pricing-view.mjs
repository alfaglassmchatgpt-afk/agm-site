import assert from 'node:assert/strict';
import {drillingTypes,drillingService} from './drilling.mjs';
import {splitFacadeRows,rowsTable} from './pricing-view.mjs';
const rules={drilling:12,specialDrilling:34},config={hinges:[100,500],hinge:'narrow'};
assert.equal(drillingTypes.length,14);
for(const type of drillingTypes){const d=drillingService({drillingType:type.id},config,rules);assert.equal(d.price,type.special?34:12);assert.equal(d.quantity,2);assert.equal(d.name,type.name);}
assert.equal(drillingService({drillingQuantity:0},config,rules).quantity,0);
assert.throws(()=>drillingService({drillingQuantity:1.5},config,rules));
assert.throws(()=>drillingService({drillingType:'invalid'},config,rules));
assert.equal(drillingService({specialDrilling:true},config,rules).price,34);
const items=[{id:'a',name:'Name A'},{id:'b',name:'Name B'}];
const result={rows:[{id:'a:glass',name:'Name A · Glass',quantity:1,sum:10},{id:'b:glass',name:'Name B · Glass',quantity:1,sum:20},{id:'a:assembly',name:'Name A · Assembly',quantity:1,sum:5},{id:'profile:p',name:'Profile',sum:100.01,quantity:3,unit:'м',price:33.34,note:''}],plans:[{key:'p',parts:[{owner:'a',length:1000},{owner:'b',length:2000}]}]};
const a=splitFacadeRows(result,items,'a'),b=splitFacadeRows(result,items,'b');assert.equal(a.filling.length,1);assert.equal(a.filling[0].name,'Glass');assert.equal(a.frame[0].name,'Assembly');assert.equal(a.frame[1].sum+b.frame[0].sum,100.01);assert.equal(a.frame[1].quantity,1);assert.equal(b.frame[0].quantity,2);
assert(!rowsTable(a.frame).includes('Name A'));assert(!rowsTable(a.frame).includes('Name B'));
const whole={rows:[{...result.rows[3],unit:'хлыст',quantity:2,sum:200}],plans:[{key:'p',complete:true,parts:result.plans[0].parts,bars:[{parts:[{owner:'a',length:1000}]},{parts:[{owner:'b',length:2000}]}]}]};
assert.equal(splitFacadeRows(whole,items,'a').frame[0].quantity,1);assert.equal(splitFacadeRows(whole,items,'b').frame[0].sum,100);
console.log('PASS all drilling types, counts, legacy selection, per-facade groups, names, shared cost reconciliation and short-handle bars');
