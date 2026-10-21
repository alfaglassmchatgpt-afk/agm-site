import {test} from 'node:test';
import assert from 'node:assert/strict';
import {profiles,glassCut,validate,defaultHinge} from './data.js';
import {FacadeProject} from './project.js';
const state={w:350,h:600,side:'left',glass:'clear',hinge:'none',hinges:[],mask:false};
test('MF glass cuts follow catalogue combinations, mirror offset swaps sides',()=>{
 const expected={MF20:343,MF21:343,MF22:317,MF25:343,MF30:343,MF31:343,MF32:321,MF33:319,MF34:319,MF35:343};
 for(const [profile,width] of Object.entries(expected)){const l=glassCut({...state,profile}),r=glassCut({...state,profile,side:'right'});assert.equal(l.width,width);assert.equal(l.height,593);assert.equal(l.thickness,4);assert.equal(l.offsetX,-r.offsetX);}
});
test('MF20 rejects cup hinges and extra hinges, MF30 uses narrow hinges',()=>{
 assert.ok(validate({...state,profile:'MF20',hinge:'cup',hinges:[1,599]}).errors.length);
 assert.ok(validate({...state,profile:'MF20',hinge:'mf20',hinges:[1,300,599]}).errors.length);
 assert.equal(validate({...state,profile:'MF20',hinge:'mf20',hinges:[1,599]}).errors.length,0);
 assert.equal(defaultHinge(profiles.find(p=>p.id==='MF30')),'narrow');
 assert.ok(validate({...state,profile:'MF30',hinge:'cup',hinges:[100,500]}).errors.length);
});
test('MF pairs retain assembly and opposite opening with correct glass cut',()=>{
 const project=new FacadeProject({...state,profile:'MF22'});project.add('mirror');assert.equal(project.groups().length,1);assert.equal(project.current().config.profile,'MF22');assert.equal(project.current().config.side,'right');assert.equal(glassCut(project.current().config).offsetX,13);assert.equal(glassCut(project.partner().config).offsetX,-13);
});
