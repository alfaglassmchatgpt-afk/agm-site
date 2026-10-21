import * as T from './vendor/three.module.js';
import {sections} from './sections.js?v=mf-series-20261021';

// Small catalogue-unlabelled edge radii are visual estimates, not machining data.
export function softenedContour(points,radius=.18){
  const out=[];
  for(let i=0;i<points.length;i++){
    const a=new T.Vector2(...points[(i+points.length-1)%points.length]),b=new T.Vector2(...points[i]),c=new T.Vector2(...points[(i+1)%points.length]);
    const r=Math.min(radius,a.distanceTo(b)*.2,b.distanceTo(c)*.2);
    const start=b.clone().add(a.sub(b).normalize().multiplyScalar(r));
    const end=b.clone().add(c.sub(b).normalize().multiplyScalar(r));
    for(let j=0;j<=8;j++){const t=j/8;out.push(start.clone().multiplyScalar((1-t)**2).addScaledVector(b,2*t*(1-t)).addScaledVector(end,t*t));}
  }
  return out;
}
export function sectionShape(id){
  const q=sections[id],points=p=>['13','13-01'].includes(id)?softenedContour(p):p.map(v=>new T.Vector2(...v)), shape=new T.Shape(points(q.outline));
  for(const contour of q.holes)shape.holes.push(new T.Path(points(contour)));
  return shape;
}

// A common section builds both the inspection sample and all four frame rails.
// End planes meet at 45 degrees in the face plane, including hollow interiors.
export function railGeometry(id,w,h,side,{start=0,end=1,miter=true}={}){
  const q=sections[id],vertical=side==='left'||side==='right',length=vertical?h:w;
  const geo=new T.ExtrudeGeometry(sectionShape(id),{depth:1,steps:1,bevelEnabled:false});
  const p=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<p.count;i++){
    const u=q.b-p.getX(i),z=p.getY(i),t=p.getZ(i);
    const lo=miter&&start===0?u:length*start;
    const hi=miter&&end===1?length-u:length*end;
    const along=lo+(hi-lo)*t;
    uv.setXY(i,(p.getX(i)+z)/20,along/60);
    let x,y;
    if(side==='left'){x=-w/2+u;y=-h/2+along;}
    if(side==='right'){x=w/2-u;y=h/2-along;}
    if(side==='top'){x=-w/2+along;y=h/2-u;}
    if(side==='bottom'){x=w/2-along;y=-h/2+u;}
    p.setXYZ(i,x,y,z-(q.frameDepth??sections[id==='13-01'?'13':id].d));
  }
  // Side mapping may reflect axes; use DoubleSide material and recompute normals.
  p.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingBox();return geo;
}
export function sampleGeometry(id){
  const q=sections[id],g=new T.ExtrudeGeometry(sectionShape(id),{depth:90,steps:1,bevelEnabled:false});
  const p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+p.getY(i))/20,p.getZ(i)/60);
  g.translate(-q.b/2,-q.d/2,-45);return g;
}
