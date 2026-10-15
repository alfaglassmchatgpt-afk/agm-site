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
// Visual presets, not measured spectral data. Millimetres match the facade geometry.
export const clearGlassOptics={
  'float-steklo-clear-m1':{attenuation:'#a9d3b4',distance:20,edge:'#739c80'},
  'steklo-kristalvizhn-crystalvision':{attenuation:'#edf5f2',distance:500,edge:'#c9ded7'}
};
// Matched visually to the live sample cards; not laboratory transmittance values.
export const tintedGlassOptics={
  'moru-bronze':{attenuation:'#b3916d',distance:8,edge:'#63503a'},
  'tonirovannoe-steklo-grey':{attenuation:'#a0a3a4',distance:5,edge:'#53585a'},
  'tonirovannoe-steklo-black':{attenuation:'#45464a',distance:5,edge:'#25282b'},
  'tonirovannoe-steklo-green':{attenuation:'#77b89c',distance:6,edge:'#316a51'},
  'tonirovannoe-steklo-blue':{attenuation:'#668ea8',distance:6,edge:'#304f65'}
};
// Satin faces blur transmitted detail; colours follow catalogue sample renders.
export const matteGlassOptics={
  'steklo-matovoe-matelux':{attenuation:'#c5dfce',distance:45,edge:'#739c80'},
  'steklo-matovoe-osvetlyonnoe':{attenuation:'#f0f5f3',distance:500,edge:'#c9ded7'},
  'moru-bronze-mat':{attenuation:'#b3916d',distance:8,edge:'#63503a'},
  'moru-grey-mat':{attenuation:'#a0a3a4',distance:5,edge:'#53585a'},
  'moru-dark-grey-mat':{attenuation:'#55585c',distance:5,edge:'#303438'}
};
export function glassMaterial(item,width,height,direction,renderer){
  const mat=new T.MeshPhysicalMaterial({
    color:item.color,metalness:item.mirror?1:0,roughness:item.mirror?.055:item.matte?.38:.055,
    transmission:item.mirror||item.opaque?0:1,thickness:4,ior:1.5,envMapIntensity:item.mirror?1.25:1,
    attenuationColor:new T.Color(item.color),attenuationDistance:250,
    side:T.FrontSide,clearcoat:item.mirror?1:.2,clearcoatRoughness:.06
  });
  const clear=clearGlassOptics[item.slug]||tintedGlassOptics[item.slug];
  if(clear){
    // Keep face neutral: tint comes from bulk absorption, not a coloured surface coating.
    mat.color.set('#ffffff');mat.attenuationColor.set(clear.attenuation);mat.attenuationDistance=clear.distance;
    mat.roughness=.012;mat.ior=1.52;mat.clearcoat=0;mat.envMapIntensity=1;mat.thickness=4;
  }
  const satin=matteGlassOptics[item.slug];
  if(satin){
    mat.color.set('#ffffff');mat.attenuationColor.set(satin.attenuation);mat.attenuationDistance=satin.distance;
    mat.transmission=.96;mat.roughness=.55;mat.ior=1.52;mat.clearcoat=0;mat.metalness=0;mat.thickness=4;
  }
  if(item.pitch&&item.pattern){
    const texture=reliefTexture(item.pattern),[rx,ry]=textureRepeat(width,height,item.pitch,direction);
    texture.repeat.set(rx,ry);if(direction==='horizontal')texture.rotation=Math.PI/2;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mat.normalMap=texture;mat.normalScale.set(.35,.35);
  }
  return mat;
}
export function glassEdgeMaterial(item,face){
  const preset=clearGlassOptics[item.slug]||tintedGlassOptics[item.slug]||matteGlassOptics[item.slug];if(!preset)return null;
  const edge=face.clone();edge.color.set(preset.edge);edge.roughness=.08;edge.transmission=.85;return edge;
}
