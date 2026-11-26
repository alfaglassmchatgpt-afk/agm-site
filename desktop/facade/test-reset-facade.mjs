import assert from 'node:assert/strict';
import {resetFacade} from './reset-facade.mjs';
const defaults={w:350,h:600,hinges:[]};
const a={id:'facade-1',number:7,name:'Custom',pairId:'p',linkId:'g',baseName:'Custom',config:{w:800},layout:{col:2,row:1}},b={id:'facade-2',name:'Other',pairId:'p',linkId:'g',config:{w:800}},c={id:'facade-3',name:'Copy',pairId:null,linkId:'g',config:{w:800}};
const project={defaults,items:[a,b,c],current:()=>a};
resetFacade(project);assert.equal(a.name,'Фасад 7');assert.equal(a.number,7);assert.deepEqual(a.layout,{col:2,row:1});assert.deepEqual(a.config,defaults);assert.equal(a.linkId,null);assert.equal(b.pairId,null);assert.equal(b.linkId,'g');assert.equal(c.linkId,'g');assert.equal(b.config.w,800);assert.equal(b.name,'Other');a.config.hinges.push(50);assert.equal(defaults.hinges.length,0);
console.log('PASS reset defaults/name, keep number/position, detach selected, preserve peers, clone defaults');
