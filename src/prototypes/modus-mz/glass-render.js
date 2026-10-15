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
// Artistic coating approximation: partially reflective, still transmissive.
export const stopsolGlassOptics={
 'steklo-solnczezashhitnoe-stopsol':{attenuation:'#d2ded7',distance:60,edge:'#819989',coating:'#e3e7e4'},
 'stopsol-phoenix-bronze':{attenuation:'#b3916d',distance:10,edge:'#63503a',coating:'#c7ad91'},
 'stopsol-phoenix-gray':{attenuation:'#949b9f',distance:8,edge:'#53585a',coating:'#aeb6bb'}
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
  const coating=stopsolGlassOptics[item.slug];
  if(coating){
    mat.color.set(coating.coating);mat.attenuationColor.set(coating.attenuation);mat.attenuationDistance=coating.distance;
    mat.metalness=.38;mat.transmission=1;mat.roughness=.025;mat.clearcoat=0;mat.ior=1.52;mat.envMapIntensity=1.3;
  }
  if(item.pitch&&item.pattern){
    const texture=reliefTexture(item.pattern),[rx,ry]=textureRepeat(width,height,item.pitch,direction);
    texture.repeat.set(rx,ry);if(direction==='horizontal')texture.rotation=Math.PI/2;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mat.normalMap=texture;mat.normalScale.set(.35,.35);
  }
  return mat;
}
export function glassEdgeMaterial(item,face){
  const preset=clearGlassOptics[item.slug]||tintedGlassOptics[item.slug]||matteGlassOptics[item.slug]||stopsolGlassOptics[item.slug];if(!preset)return null;
  const edge=face.clone();edge.color.set(preset.edge);edge.roughness=.08;edge.transmission=.85;edge.metalness=0;return edge;
}

// Millimetres, same coordinate system as the facade. Props are never scaled.
export function sampleCabinet(width,height,kind='books'){
 const g=new T.Group();g.name='sample-cabinet';
 const wood=new T.MeshStandardMaterial({color:'#9a8064',roughness:.7});
 const box=(w,h,d,x,y,z,material=wood)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
 const bottom=-height/2+18,inside=width-36;
 box(width,height,12,0,0,-344);
 for(const x of [-width/2+9,width/2-9])box(18,height,300,x,0,-188);
 for(const y of [-height/2+9,height/2-9])box(inside,18,300,0,y,-188);
 const rows=Math.max(1,Math.floor((height-36)/280)),step=(height-36)/rows;
 const colours=['#46616b','#c6bba3','#815e4b','#68806b','#b59b73'];
 for(let row=0;row<rows;row++){
  const base=bottom+row*step;
  if(row)box(inside,18,280,0,base-9,-198);
  // 30 x 210 x 140 mm books; omit if the compartment is too short.
  if(kind==='books'&&step>230){
   const count=Math.min(6,Math.floor((inside-90)/34));
   for(let j=0;j<count;j++){
    const x=-inside/2+25+j*34;
    const cover=new T.MeshStandardMaterial({color:colours[(j+row)%5],roughness:.8});
    box(30,210,140,x,base+105,-190,cover);
    for(const y of [30,180])box(23,3,1,x,base+y,-119,new T.MeshStandardMaterial({color:'#e6dcc7',roughness:.8}));
   }
  }
  // 60 mm ceramic sphere gives a consistent small reference object.
  if(kind==='books'&&step>90&&inside>140){
   const ball=new T.Mesh(new T.SphereGeometry(30,32,24),new T.MeshStandardMaterial({color:'#e3d9c5',roughness:.3}));ball.position.set(inside/2-50,base+30,-190);ball.castShadow=true;g.add(ball);
  }
  if(kind==='kitchen'){
   const ceramic=new T.MeshStandardMaterial({color:'#e9dfcc',roughness:.25});
   const lathe=(points,x,y,z,mat,name)=>{const m=new T.Mesh(new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),48),mat);m.position.set(x,y,z);m.name=name;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
   // Real-size 240 mm bottles, including shoulders, neck and cap.
   if(row%2===1&&step>265){
    const count=Math.min(4,Math.floor((inside-20)/80));
    for(let j=0;j<count;j++){
     const x=(j-(count-1)/2)*80;
     lathe([[0,0],[32,0],[34,5],[34,160],[31,175],[13,199],[12,230],[0,230]],x,base,-200,new T.MeshStandardMaterial({color:j%2?'#765736':'#344d36',roughness:.18,metalness:.05}),'bottle-240mm');
     lathe([[0,0],[13,0],[13,10],[0,10]],x,base+230,-200,new T.MeshStandardMaterial({color:'#b8a276',roughness:.45}),'bottle-cap');
     box(42,55,1,x,base+95,-165,ceramic);
    }
   }else{
    if(inside>=150&&step>95){
     const x=-inside/2+72;
     for(let j=0;j<4;j++)lathe([[0,0],[42,0],[60,6],[65,11],[63,14],[44,6],[0,5]],x,base+j*14,-205,ceramic,'plate-130mm');
    }
    if(inside>=255&&step>115){
     const x=inside/2-64;
     lathe([[0,0],[29,0],[33,5],[37,80],[33,80],[29,8],[0,8]],x,base,-190,ceramic,'cup-80mm');
     const handle=new T.Mesh(new T.TorusGeometry(23,5,12,32),ceramic);handle.position.set(x+39,base+43,-190);handle.castShadow=true;g.add(handle);
    }
   }
  }
  const led=new T.MeshBasicMaterial({color:'#ffe0a3'});
  box(inside-16,3,6,0,base+step-22,-70,led);
  const light=new T.PointLight('#ffe2b4',55,450,1);light.position.set(0,base+step-45,-120);g.add(light);
 }
 g.userData={width,height,depth:312,bookHeight:210,sphereDiameter:60};return g;
}

// Contact-zone approximation: reduce blur only where glass overlaps the rail.
// Distances are in mm; the open centre keeps the original satin roughness.
export function satinContactMap(width,height,overlap){
 const n=256,bytes=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const edge=Math.min((x+.5)/n*width,(n-x-.5)/n*width,(y+.5)/n*height,(n-y-.5)/n*height);
  const t=T.MathUtils.clamp((edge-overlap+1)/2,0,1),value=Math.round(255*(.18+.82*t*t*(3-2*t))),i=(y*n+x)*4;
  bytes[i]=bytes[i+1]=bytes[i+2]=value;bytes[i+3]=255;
 }
 const map=new T.DataTexture(bytes,n,n);map.magFilter=T.LinearFilter;map.minFilter=T.LinearFilter;map.needsUpdate=true;return map;
}
