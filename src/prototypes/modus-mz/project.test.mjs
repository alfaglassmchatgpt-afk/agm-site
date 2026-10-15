import test from 'node:test';
import assert from 'node:assert/strict';
import {FacadeProject} from './project.js';
const base={w:450,h:900,side:'left',profile:'13',hinges:[100,450,800],glass:'mirror'};
test('mirror pair synchronizes from either member but retains names',()=>{
 const p=new FacadeProject(base),first=p.current();first.name='First';const second=p.add('mirror');second.name='Second';
 assert.equal(second.config.side,'right');assert.equal(p.partner().id,first.id);
 p.update({...second.config,w:500,hinges:[120,500,800]});assert.equal(first.config.w,500);assert.equal(first.config.side,'left');assert.equal(first.name,'First');
 p.activeId=first.id;p.update({...first.config,side:'right',h:1000});assert.equal(second.config.side,'left');assert.equal(second.config.h,1000);assert.equal(second.name,'Second');
 second.config.hinges[0]=200;assert.equal(first.config.hinges[0],120);
 assert.throws(()=>p.add('mirror'));
});
test('copy and new facade are independent; arbitrary additions and stable selection',()=>{
 const p=new FacadeProject(base),first=p.current();p.add('mirror');const duplicate=p.add('copy');
 assert.equal(duplicate.pairId,null);assert.equal(p.partner(),undefined);p.update({...duplicate.config,w:700});assert.equal(first.config.w,450);
 const fresh=p.add('new');assert.equal(fresh.config.w,450);fresh.config.hinges[0]=20;assert.equal(base.hinges[0],100);
 for(let i=0;i<30;i++)p.add('new');assert.equal(p.items.length,34);assert.equal(new Set(p.items.map(i=>i.id)).size,34);
 p.activeId=duplicate.id;assert.equal(p.current().config.w,700);const pair=p.add('mirror');assert.equal(pair.config.w,700);assert.notEqual(pair.pairId,first.pairId);
});
test('removal keeps one facade, unlinks pair and supports undo',()=>{
 const p=new FacadeProject(base),first=p.current();assert.equal(p.remove(),false);
 const second=p.add('mirror');assert.equal(p.remove(),true);assert.equal(p.items.length,1);assert.equal(first.pairId,null);assert.equal(p.partner(),undefined);
 p.update({...first.config,w:510});assert.equal(p.undoRemove(),true);assert.equal(p.current().id,second.id);assert.equal(p.current().config.w,510);assert.equal(p.partner().id,first.id);
 p.remove();p.add('mirror');assert.equal(p.undoRemove(),true);assert.equal(p.current().pairId,null);assert.equal(p.items.length,3);
 const third=p.add('new');p.remove();p.add('new');assert.equal(new Set(p.items.map(i=>i.id)).size,p.items.length);assert.ok(!p.items.some(i=>i.id===third.id));
});
test('navigation lists each mirror pair once alongside independent facades',()=>{
 const p=new FacadeProject(base),first=p.current();const second=p.add('mirror');assert.equal(p.items.length,2);assert.equal(p.groups().length,1);assert.equal(p.groups()[0].members.length,2);
 const single=p.add('copy');assert.equal(p.groups().length,2);p.add('mirror');assert.equal(p.groups().length,2);assert.deepEqual(p.groups().map(g=>g.members.length),[2,2]);
 p.activeId=second.id;p.remove();assert.equal(p.groups().length,2);assert.deepEqual(p.groups().map(g=>g.members.length),[1,2]);p.undoRemove();assert.deepEqual(p.groups().map(g=>g.members.length),[2,2]);
});
