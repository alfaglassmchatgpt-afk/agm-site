import * as T from './vendor/three.module.js';

// Studio illumination, not a photograph or a claim about a client's interior.
export function studioEnvironment(renderer){
  const studio=new T.Scene();studio.background=new T.Color('#bcbab4');
  const panel=(w,h,x,y,z,color)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));m.position.set(x,y,z);studio.add(m);return m;};
  panel(1800,2000,-1200,200,1200,'#f8f4e9');
  panel(450,2200,900,100,1200,'#ffffff');
  panel(90,2400,500,100,1100,'#55534e');
  panel(2800,1800,0,1200,-1500,'#e8e5df');
  const floor=panel(5000,5000,0,-1400,0,'#777d7c');floor.rotation.x=-Math.PI/2;
  const target=new T.WebGLCubeRenderTarget(512,{type:T.HalfFloatType});
  new T.CubeCamera(1,8000,target).update(renderer,studio);
  const pmrem=new T.PMREMGenerator(renderer),result=pmrem.fromCubemap(target.texture);
  studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});target.dispose();pmrem.dispose();
  return result;
}
export function textureRepeat(width,height,pitch,direction){
  return direction==='horizontal'?[height/pitch,width/pitch]:[width/pitch,height/pitch];
}
function reliefTexture(pattern){
  const n=128,bytes=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const sx=Math.sin(2*Math.PI*x/n)*.55,sy=pattern==='grid'?Math.sin(2*Math.PI*y/n)*.55:0;
    const length=Math.sqrt(sx*sx+sy*sy+1),i=(y*n+x)*4;
    bytes[i]=Math.round((sx/length*.5+.5)*255);bytes[i+1]=Math.round((sy/length*.5+.5)*255);bytes[i+2]=Math.round((1/length*.5+.5)*255);bytes[i+3]=255;
  }
  const texture=new T.DataTexture(bytes,n,n);texture.wrapS=texture.wrapT=T.RepeatWrapping;
  texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;
  return texture;
}
export function glassMaterial(item,width,height,direction,renderer){
  const mat=new T.MeshPhysicalMaterial({
    color:item.color,metalness:item.mirror?1:0,roughness:item.mirror?.055:item.matte?.38:.055,
    transmission:item.mirror||item.opaque?0:1,thickness:4,ior:1.5,envMapIntensity:item.mirror?1.25:1,
    attenuationColor:new T.Color(item.color),attenuationDistance:250,
    side:T.FrontSide,clearcoat:item.mirror?1:.2,clearcoatRoughness:.06
  });
  if(item.pitch&&item.pattern){
    const texture=reliefTexture(item.pattern),[rx,ry]=textureRepeat(width,height,item.pitch,direction);
    texture.repeat.set(rx,ry);if(direction==='horizontal')texture.rotation=Math.PI/2;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mat.normalMap=texture;mat.normalScale.set(.35,.35);
  }
  return mat;
}
// Procedural surface maps: no external images or client assets.
function surfaceMap(kind){
  const n=512,bytes=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const noise=(Math.sin(x*127.1+y*311.7)*43758.5453)%1;
    const grain=kind==='wood'?Math.sin(x*.17+Math.sin(y*.016)*2+Math.sin(x*.04))*.12:Math.sin(x*.03+y*.02)*Math.sin(y*.06)*.025;
    const v=Math.round(218+grain*95+noise*7),i=(y*n+x)*4;
    bytes[i]=bytes[i+1]=bytes[i+2]=v;bytes[i+3]=255;
  }
  const map=new T.DataTexture(bytes,n,n);map.wrapS=map.wrapT=T.RepeatWrapping;map.generateMipmaps=true;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.needsUpdate=true;return map;
}
function roundedBlock(w,h,d,r){
  r=Math.min(r,w/4,h/4,d/4);const shape=new T.Shape();
  shape.moveTo(-w/2+r,-h/2+r);shape.lineTo(w/2-r,-h/2+r);shape.lineTo(w/2-r,h/2-r);shape.lineTo(-w/2+r,h/2-r);shape.closePath();
  const g=new T.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:4,steps:1,curveSegments:16});g.translate(0,0,-d/2+r);return g;
}
export function backdrop(width,height){
  const group=new T.Group();group.name='Detailed neutral studio';
  const add=(geometry,color,x,y,z,roughness=.65)=>{
    const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness}));
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const scale=Math.min(width/350,height/600),base=-height*.22,depth=-190*scale;
  const plinthHeight=base+height/2+24;
  const plinth=add(roundedBlock(width*.84,plinthHeight,140*scale,3*scale),'#8b7560',0,base-plinthHeight/2,depth,.64);
  plinth.material.map=surfaceMap('wood');plinth.material.bumpMap=plinth.material.map;plinth.material.bumpScale=.35*scale;
  add(roundedBlock(width*.86,9*scale,145*scale,2*scale),'#d4c9b7',0,base+4.5*scale,depth,.48);
  const top=base+9*scale;
  const books=[[-.28,120,19,'#373f3d'],[-.205,143,23,'#a18b70'],[-.12,112,21,'#e6dfd0']];
  for(const [x,h,w,color] of books){
    // Separate covers, page block and curved spine; deliberately no invented lettering.
    const px=width*x;
    add(roundedBlock((w-3)*scale,(h-4)*scale,67*scale,1*scale),'#ded7c7',px,top+h*scale/2,depth,.93);
    for(const side of [-1,1])add(roundedBlock(1.5*scale,h*scale,72*scale,.4*scale),color,px+side*(w-1.5)*scale/2,top+h*scale/2,depth,.78);
    add(roundedBlock(w*scale,h*scale,4*scale,1.1*scale),color,px,top+h*scale/2,depth+35*scale,.72);
    for(let j=0;j<2;j++)add(new T.BoxGeometry((w-5)*scale,1*scale,.5*scale),'#c7b792',px,top+(h-16-j*5)*scale,depth+37.2*scale,.5);
    for(let j=1;j<7;j++)add(new T.BoxGeometry(.4*scale,(h-8)*scale,.4*scale),'#bcb5a5',px+(j-4)*2*scale,top+h*scale/2,depth-33.6*scale,.9);
  }
  const outline=[[0,0],[24,0],[31,7],[35,36],[31,66],[19,88],[14,115],[11,115],[11,91],[26,62],[29,32],[23,7],[0,7]].map(([r,y])=>new T.Vector2(r*scale,y*scale));
  const curve=new T.SplineCurve(outline);
  const vase=add(new T.LatheGeometry(curve.getPoints(100),96),'#cbbfa9',width*.20,top,depth,.38);
  vase.material.bumpMap=surfaceMap('stone');vase.material.bumpScale=.18*scale;
  // A restrained branch provides fine edges for judging diffusion through glass.
  for(let b=0;b<3;b++){
    const start=new T.Vector3(width*.20,top+80*scale,depth),end=new T.Vector3(width*(.20+(b-1)*.10),top+(200-b*16)*scale,depth-(b-1)*15*scale);
    const mid=start.clone().lerp(end,.5);mid.x+=12*scale;
    const stem=new T.CatmullRomCurve3([start,mid,end]);
    add(new T.TubeGeometry(stem,24,.8*scale,6,false),'#625c45',0,0,0,.9);
    for(let k=1;k<=4;k++){
      const point=stem.getPoint(k/5),leaf=add(new T.SphereGeometry(1,20,12),'#6d7460',point.x+(k%2?6:-6)*scale,point.y,point.z,.8);
      leaf.scale.set(5*scale,12*scale,1.2*scale);leaf.rotation.z=(k%2?-.7:.7);
    }
  }
  const wall=add(new T.PlaneGeometry(30000,30000),'#bdb7aa',0,0,-650*scale,.95);wall.castShadow=false;
  const floor=add(new T.PlaneGeometry(30000,30000),'#c4bdb1',0,-height/2-24,0,.85);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  floor.material.bumpMap=surfaceMap('stone');floor.material.bumpMap.repeat.set(60,60);floor.material.bumpScale=.3;
  return group;
}
