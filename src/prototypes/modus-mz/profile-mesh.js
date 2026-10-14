import * as T from './vendor/three.module.js';
import {sections} from './sections.js';

export function sectionShape(id){
  const q=sections[id], shape=new T.Shape(q.outline.map(p=>new T.Vector2(...p)));
  for(const points of q.holes)shape.holes.push(new T.Path(points.map(p=>new T.Vector2(...p))));
  return shape;
}

// A common section builds both the inspection sample and all four frame rails.
// End planes meet at 45 degrees in the face plane, including hollow interiors.
export function railGeometry(id,w,h,side,{start=0,end=1,miter=true}={}){
  const q=sections[id],vertical=side==='left'||side==='right',length=vertical?h:w;
  const geo=new T.ExtrudeGeometry(sectionShape(id),{depth:1,steps:1,bevelEnabled:false});
  const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const u=q.b-p.getX(i),z=p.getY(i),t=p.getZ(i);
    const lo=miter&&start===0?u:length*start;
    const hi=miter&&end===1?length-u:length*end;
    const along=lo+(hi-lo)*t;
    let x,y;
    if(side==='left'){x=-w/2+u;y=-h/2+along;}
    if(side==='right'){x=w/2-u;y=h/2-along;}
    if(side==='top'){x=-w/2+along;y=h/2-u;}
    if(side==='bottom'){x=w/2-along;y=-h/2+u;}
    p.setXYZ(i,x,y,z-sections[id==='13-01'?'13':id].d);
  }
  // Side mapping may reflect axes; use DoubleSide material and recompute normals.
  p.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingBox();return geo;
}
export function sampleGeometry(id){
  const q=sections[id],g=new T.ExtrudeGeometry(sectionShape(id),{depth:90,steps:1,bevelEnabled:false});
  g.translate(-q.b/2,-q.d/2,-45);return g;
}
