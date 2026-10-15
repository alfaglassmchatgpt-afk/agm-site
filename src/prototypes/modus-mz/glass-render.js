import * as T from './vendor/three.module.js';

// Studio illumination, not a photograph or a claim about a client's interior.
export function studioEnvironment(renderer){
  const studio=new T.Scene();studio.background=new T.Color('#aebbc0');
  const panel=(w,h,x,y,z,color)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));m.position.set(x,y,z);studio.add(m);return m;};
  panel(1800,2000,-1200,200,1200,'#f8f4e9');
  panel(450,2200,900,100,1200,'#ffffff');
  panel(90,2400,500,100,1100,'#38464e');
  panel(2800,1800,0,1200,-1500,'#e5eaf0');
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
  const group=new T.Group(),material=new T.MeshStandardMaterial({color:'#bec4bb',roughness:.9});
  // Explicitly optional optical test background, not parts of the facade.
  for(const [i,color] of ['#d5b68a','#819399','#3c565e'].entries()){
    const m=new T.Mesh(new T.BoxGeometry(width*.17,height*.5,70),material.clone());
    m.material.color.set(color);m.position.set((i-1)*width*.26,-height*.05,-220-i*60);group.add(m);
  }
  material.dispose();return group;
}
