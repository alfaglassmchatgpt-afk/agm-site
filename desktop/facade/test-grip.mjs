import assert from 'node:assert/strict';
import {profiles,validate} from './bundle/agm-aluminium-configurator/data.js';
import {gripPosition,gripBounds} from './bundle/agm-aluminium-configurator/grip-position.js';
import {handleRailGeometries} from './bundle/agm-aluminium-configurator/profile-mesh.js';
import {FacadeProject} from './bundle/agm-aluminium-configurator/project.js';
const c={profile:'MF31',w:400,h:1000,color:'21',glass:'none',hinge:'none',hinges:[],side:'left',reed:'vertical',gripAt:300};
for(const p of profiles.filter(p=>p.gripLength)){
 assert.equal(gripPosition(p,{h:1000}),500);assert.equal(gripPosition(p,{h:1000,gripAt:0}),gripBounds(p,1000).min);
 assert(validate({...c,profile:p.id,gripAt:1}).errors.some(e=>e.includes('Центр ручки')));
 for(const side of ['left','right']){const a=handleRailGeometries(p,400,1000,side,{gripAt:300}),b=handleRailGeometries(p,400,1000,side,{gripAt:700});const n=a.length/3;for(let i=n;i<2*n;i++){a[i].computeBoundingBox();b[i].computeBoundingBox();assert(Math.abs(b[i].boundingBox.min.y-a[i].boundingBox.min.y-400)<.01);}a.concat(b).forEach(g=>g.dispose());}
}
const project=new FacadeProject(c);project.add('mirror');project.update({...project.current().config,gripAt:650});assert(project.items.every(i=>i.config.gripAt===650));
console.log('PASS five short grips, both sides, bounds, validation and linked pairs');

const {render}=await import('./bundle/agm-aluminium-configurator/desktop-reports.mjs');
const report=render({format:'alfaglass-facade-project',schemaVersion:1,meta:{},items:[{id:'facade-1',name:'Test',config:c}]},'production');assert(report.includes('Центр ручки: 300 мм от низа'));
console.log('PASS production handle coordinate');
