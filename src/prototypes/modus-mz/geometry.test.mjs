import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sections} from './sections.js';
import {profiles} from './data.js';
import {railGeometry,sampleGeometry,handleRailGeometries} from './profile-mesh.js';
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

test('MF short handles have a full 250 mm grip and 100 mm inspection extensions',()=>{
 for(const id of ['MF21','MF25','MF31','MF33','MF35'])for(const side of ['left','right']){
  const p=profiles.find(p=>p.id===id),parts=handleRailGeometries(p,p.b,450,side,{miter:false});
  assert.equal(parts.length,id==='MF33'?6:3);
  assert.deepEqual(parts.map(g=>Math.round(g.boundingBox.max.y-g.boundingBox.min.y)),id==='MF33'?[100,100,250,250,100,100]:[100,250,100]);
  for(const g of parts){assert.ok([...g.attributes.position.array].every(Number.isFinite));g.dispose();}
 }
 for(const id of ['MF22','MF32','MF34']){const p=profiles.find(p=>p.id===id),parts=handleRailGeometries(p,350,900,'right',{miter:false});assert.equal(parts.length,2);for(const g of parts){assert.equal(g.boundingBox.max.y-g.boundingBox.min.y,900);g.dispose();}}
});
test('MF35 curved nose stays in the 11.2 mm grip envelope above its hollow base',()=>{
 const q=sections.MF35,top=q.outline.filter(([x,y])=>y>39);
 assert.ok(top.length>6);assert.ok(top.every(([x])=>x>=10&&x<=21.2));
 assert.equal(Math.max(...q.outline.map(v=>v[1])),47.2);
 assert.ok(q.outline.some(([x,y])=>x===14&&y===20.9));
});

test('wide MF frame bodies use 45 degree miters while grips retain square full-height ends',()=>{
 for(const id of ['MF22','MF32','MF34'])for(const side of ['left','right']){
  const p=profiles.find(p=>p.id===id),w=350,h=600,extra=p.b-p.baseWidth;
  const [body,grip]=handleRailGeometries(p,w,h,side),v=body.attributes.position;
  let top=0;
  for(let i=0;i<v.count;i++){
   const u=(side==='left'?v.getX(i)+w/2:w/2-v.getX(i))-extra;
   assert.ok(v.getY(i)<=h/2-u+.001);assert.ok(v.getY(i)>=-h/2+u-.001);
   if(Math.abs(v.getY(i)-(h/2-u))<.001)top++;
  }
  assert.ok(top>0);assert.equal(grip.boundingBox.min.y,-300);assert.equal(grip.boundingBox.max.y,300);
  const offset=(side==='left'?1:-1)*extra/2,rail=railGeometry(p.baseId,w-extra,h,'top'),a=rail.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i)+offset,u=(side==='left'?x+w/2:w/2-x)-extra;assert.ok(a.getY(i)>=h/2-u-.001);}
  for(const g of [body,grip,rail])g.dispose();
 }
});
