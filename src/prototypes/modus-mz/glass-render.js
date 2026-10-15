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
  const target=new T.WebGLCubeRenderTarget(256,{type:T.HalfFloatType});
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
export function backdrop(width,height){
  const group=new T.Group();group.name='Neutral studio';
  // Scenery only: no effect on facade dimensions or production data.
  const add=(geometry,color,x,y,z)=>{
    const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.82}));
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const scale=Math.min(width/350,height/600),base=-height*.28,depth=-180*scale;
  // Low limestone shelf, books and a ceramic vase give clear/blurred glass a readable reference.
  const plinthHeight=base+height/2+24;
  add(new T.BoxGeometry(width*.8,plinthHeight,110*scale),'#c6bcae',0,base-plinthHeight/2,depth);
  const books=[[-.27,112,'#55544f'],[-.20,132,'#c1b7a8'],[-.13,104,'#ece7dc']];
  for(const [x,h,color] of books){
    add(new T.BoxGeometry(18*scale,h*scale,65*scale),color,width*x,base+h*scale/2,depth);
    add(new T.BoxGeometry(13*scale,2*scale,1*scale),'#d9d2c5',width*x,base+h*scale*.78,depth+33*scale);
  }
  const points=[[0,0],[23,0],[30,8],[34,35],[29,62],[18,80],[16,105],[12,105],[12,81],[0,8]].map(([r,y])=>new T.Vector2(r*scale,y*scale));
  add(new T.LatheGeometry(points,48),'#ded5c6',width*.19,base,depth);
  // Matte cyclorama: neutral wall and floor, softly lit from the left.
  add(new T.PlaneGeometry(30000,30000),'#e1ded7',0,0,-650*scale);
  const floor=add(new T.PlaneGeometry(30000,30000),'#d2cec6',0,-height/2-24,0);floor.rotation.x=-Math.PI/2;
  return group;
}
