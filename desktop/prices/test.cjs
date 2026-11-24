const assert=require('node:assert/strict'),{validate}=require('./schema.cjs');
const row={code:'test',name:'Test material',group:'Test',kind:'material',unit:'m2',enabled:true,priceKopecks:12345};
const price={schemaVersion:1,currency:'RUB',effectiveDate:'2026-11-24',items:[row]};
validate(price);validate({...price,items:[{...row,priceKopecks:null}]});
for(const amount of [-1,NaN,1.5,Infinity,'100'])assert.throws(()=>validate({...price,items:[{...row,priceKopecks:amount}]}));
assert.throws(()=>validate({...price,items:[row,row]}));assert.throws(()=>validate({...price,schemaVersion:2}));
console.log('PASS integer money, missing rate, duplicate IDs and schema version');
