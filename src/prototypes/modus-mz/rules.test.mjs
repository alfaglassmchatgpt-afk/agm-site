import {test} from 'node:test';
import assert from 'node:assert/strict';
import {profiles,validate} from './data.js';
const base={profile:'01',w:450,h:900,glass:'clear',hinge:'narrow',hinges:[100,450,800],mask:false};
test('catalogue envelope and integer dimensions',()=>{assert.equal(profiles.filter(p=>p.series==='MZ').length,9);assert.equal(validate(base).errors.length,0);assert.ok(validate({...base,w:450.5}).errors.length);assert.ok(validate({...base,w:199}).errors.length);assert.ok(validate({...base,h:2300}).warnings.some(s=>s.includes('2200')));});
test('MZ07 transparent glass needs specified hinge and masked bonding area',()=>{const s={...base,profile:'07'};assert.equal(validate(s).errors.length,2);assert.equal(validate({...s,hinge:'blum',mask:true}).errors.length,0);assert.equal(validate({...s,glass:'opaque'}).errors.length,0);assert.equal(validate({...s,glass:'mirror'}).errors.length,0);});
test('hinges cannot overlap or fall outside facade',()=>{assert.ok(validate({...base,hinges:[100,100]}).errors.length);assert.ok(validate({...base,hinges:[0,900]}).errors.length);assert.ok(validate({...base,hinges:[100.1]}).errors.length);});
test('all glass deductions leave positive cut size at minimum dimensions',()=>{for(const p of profiles)assert.ok(200-p.delta>0);assert.equal(profiles.find(p=>p.id==='01').delta,30);assert.equal(profiles.find(p=>p.id==='17').h,1500);});
test('empty frame does not require glass bonding or hinges',()=>{
 for(const p of profiles)assert.equal(validate({...base,profile:p.id,w:350,h:600,glass:'none',glassOpaque:false,hinge:'none',hinges:[],mask:false}).errors.length,0);
});
