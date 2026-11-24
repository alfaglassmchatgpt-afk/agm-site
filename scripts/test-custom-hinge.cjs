const assert=require('node:assert/strict');
(async()=>{
 const root='../src/themes/alfa-glass-home-2026/agm-aluminium-configurator/';
 const {hingeOptions,validate}=await import(root+'data.js');
 const {glasses}=await import(root+'data.js?v=mf-series-20261021');glasses.none=['Без наполнения',''];
 const {facadeEntry}=await import(root+'quote.js');
 const {render}=await import(root+'manager-report.mjs');
 const c={profile:'01',w:400,h:1600,color:'00',glass:'none',hinge:'custom',customHinge:'Test <hinge>',hinges:[100,1500],side:'left',reed:'vertical'};
 assert(hingeOptions(c).includes('custom'));
 assert.equal(validate(c).errors.length,0);
 assert(validate({...c,customHinge:' '}).errors.length);
 assert(validate({...c,customHinge:'x'.repeat(121)}).errors.length);
 assert(!hingeOptions({...c,w:6000}).includes('custom'));
 const item={id:'facade-1',name:'Фасад 1',config:c};
 assert.match(facadeEntry(item,true).summary,/Test <hinge>/);
 const html=render({items:[{type:'facade',title:'Фасад 1',config:c}]});
 assert(html.includes('Test &lt;hinge&gt;'));
 assert(!html.includes('Test <hinge>'));
 console.log('PASS: custom hinge, validation, customer summary, escaped manager report');
})();

