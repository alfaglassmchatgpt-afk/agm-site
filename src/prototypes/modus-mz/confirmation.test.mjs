import test from 'node:test';
import assert from 'node:assert/strict';
import {ProjectConfirmation} from './confirmation.js';
test('confirmation gates all items, invalidates edits and ignores preview controls',()=>{
 const c=new ProjectConfirmation(),items=[{id:'1',name:'A',pairId:null,config:{w:450,h:900,hinges:[100,800],view:'3d'}}];
 assert.equal(c.check(items,true),false);c.confirm(items,true);assert.equal(c.check(items,true),true);
 items[0].config.view='front';assert.equal(c.check(items,true),true);
 items[0].config.hinges[0]=110;assert.equal(c.check(items,true),false);items[0].config.hinges[0]=100;assert.equal(c.check(items,true),false);
 c.confirm(items,true);items.push({...structuredClone(items[0]),id:'2'});assert.equal(c.check(items,true),false);
 c.confirm(items,true);items[1].name='B';assert.equal(c.check(items,true),false);
 c.confirm(items,true);items.pop();assert.equal(c.check(items,true),false);
 assert.equal(c.confirm(items,false),false);assert.equal(c.check(items,false),false);
});
