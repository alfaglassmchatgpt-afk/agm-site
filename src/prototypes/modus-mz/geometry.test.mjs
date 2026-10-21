import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sections} from './sections.js';
import {profiles} from './data.js';
import {railGeometry,sampleGeometry} from './profile-mesh.js';
test('catalogue section envelopes and nonzero hollow extrusions',()=>{
  for(const p of profiles){
    const q=sections[p.id];assert.equal(q.b,p.b);assert.equal(q.d,p.d);
    const g=sampleGeometry(p.id);g.computeBoundingBox();const b=g.boundingBox;
    assert.ok(Math.abs(b.max.x-b.min.x-p.b)<.001);
    assert.ok(Math.abs(b.max.y-b.min.y-p.d)<.001);
    assert.ok(q.holes.length>0);
    assert.ok([...g.attributes.position.array].every(Number.isFinite));g.dispose();
  }
});
test('mitered frame rails stay inside the facade envelope',()=>{
  for(const p of profiles)for(const side of ['left','right','top','bottom']){
    const g=railGeometry(p.id,450,900,side),b=g.boundingBox;
    assert.ok(b.min.x>=-225.001&&b.max.x<=225.001);
    assert.ok(b.min.y>=-450.001&&b.max.y<=450.001);
    const depth=sections[p.id].frameDepth??p.d;assert.ok(b.max.z<=p.d-depth+.001&&b.min.z>=-depth-.001);g.dispose();
  }
});
test('handle sample uses its own 37 mm section; glass is within front depth',()=>{
  assert.equal(sections['13-01'].d,37);
  for(const p of profiles)assert.ok(sections[p.id].glassY+4<=p.d+.001);
});
test('split rails have square inner ends for the handle segment',()=>{
  for(const side of ['left','right']){
    const g=railGeometry('13',450,900,side,{start:0,end:325/900});
    const b=g.boundingBox;
    if(side==='left')assert.ok(Math.abs(b.max.y+125)<.001);
    else assert.ok(Math.abs(b.min.y-125)<.001);
    g.dispose();
  }
});

test('MZ13-01 grip stays at the outer edge on either side of the facade',()=>{
  for(const w of [200,450,550])for(const side of ['left','right']){
    const g=railGeometry('13-01',w,250,side,{miter:false}),p=g.attributes.position;
    let gripVertices=0;
    for(let i=0;i<p.count;i++)if(p.getZ(i)>.3){
      gripVertices++;
      const distanceFromEdge=side==='left'?p.getX(i)+w/2:w/2-p.getX(i);
      assert.ok(distanceFromEdge>=-.001&&distanceFromEdge<=10.001,
        `${side}: grip displaced ${distanceFromEdge} mm from outer edge`);
    }
    assert.ok(gripVertices>0);g.dispose();
  }
});
