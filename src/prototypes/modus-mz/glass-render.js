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
// A quiet studio sweep gives transparent surfaces a background to refract.
export function studioBackdrop(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;
 const ctx=canvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,1024,300);
 for(const [at,color] of [[0,'#929eaa'],[.28,'#c2c9cc'],[.55,'#ece9e0'],[.8,'#bec6c9'],[1,'#8998a4']])gradient.addColorStop(at,color);
 ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,1024);
 const shade=ctx.createLinearGradient(0,0,0,1024);shade.addColorStop(0,'rgba(255,255,255,.12)');shade.addColorStop(1,'rgba(42,52,64,.17)');
 ctx.fillStyle=shade;ctx.fillRect(0,0,1024,1024);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}
// Physical studio surround: included in the transmission pass, unlike a flat
// background colour. The diagonal soft bands reveal both rib orientations.
export function refractionSurround(width,height){
 const radius=Math.max(width,height)*.8+400,wallHeight=Math.max(height*5,3000);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
 const ctx=canvas.getContext('2d'),data=ctx.createImageData(512,512);
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const wave=.5+.5*Math.sin(2*Math.PI*(x+y)/512);
  const i=(y*512+x)*4;
  data.data[i]=155+wave*66;data.data[i+1]=169+wave*55;
  data.data[i+2]=179+wave*43;data.data[i+3]=255;
 }
 ctx.putImageData(data,0,0);
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
 map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(2*Math.PI*radius/350,wallHeight/350);
 const mesh=new T.Mesh(new T.CylinderGeometry(radius,radius,wallHeight,96,1,true),
  new T.MeshBasicMaterial({map,side:T.BackSide,toneMapped:false}));
 mesh.name='refraction-studio-surround';return mesh;
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
// Raywall 90T: 14 ribs / 100 mm confirmed by the owner.
// Facet angle and micro-relief are visual estimates from the approved sample.
export function raywallNormalTexture(width,height,pitch,direction){
  const n=256,bytes=new Uint8Array(n*n*4),horizontal=direction==='horizontal';
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const u=(horizontal?y:x)/n;
    const slope=.46*Math.tanh(3*Math.sin(2*Math.PI*u));
    const grain=.008*Math.sin(x*1.73+y*2.91)*Math.sin(x*.73-y*1.31);
    const nx=(horizontal?grain:slope+grain),ny=(horizontal?slope+grain:grain);
    const length=Math.hypot(nx,ny,1),i=(y*n+x)*4;
    bytes[i]=Math.round(127.5*(nx/length+1));bytes[i+1]=Math.round(127.5*(ny/length+1));
    bytes[i+2]=Math.round(127.5*(1/length+1));bytes[i+3]=255;
  }
  const texture=new T.DataTexture(bytes,n,n);
  texture.wrapS=texture.wrapT=T.RepeatWrapping;
  texture.repeat.set(width/pitch,height/pitch);
  texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}
function raywallRefraction(mat,width,height,overlap){
  // Screen-space approximation of the air gap to objects behind the glass.
  // Does not change the 4 mm slab or its absorption distance. Not ray tracing.
  mat.onBeforeCompile=shader=>{
    shader.uniforms.ribPanelSize={value:new T.Vector2(width,height)};
    shader.uniforms.ribContact={value:Math.max(0,overlap)};
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 ribUv;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nribUv = uv;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
      '#include <common>\nvarying vec2 ribUv;\nuniform vec2 ribPanelSize;\nuniform float ribContact;');
    const chunk=T.ShaderChunk.transmission_pars_fragment.replaceAll(
      'vec3 refractedRayExit = position + transmissionRay;',
      `vec3 flatNormal = normalize(mat3(modelMatrix) * vec3(0.0,0.0,1.0));
       flatNormal *= dot(flatNormal,v) < 0.0 ? -1.0 : 1.0;
       vec3 insideRay = refract(-v,normalize(n),1.0/ior);
       vec3 outsideRay = refract(insideRay,flatNormal,ior);
       vec3 deviation = length(outsideRay) > 0.01 ? outsideRay + v : vec3(0.0);
       deviation = clamp(deviation,vec3(-0.35),vec3(0.35));
       float viewFade = smoothstep(0.15,0.65,abs(dot(flatNormal,v)));
       vec2 edgeDistance = min(ribUv,1.0-ribUv)*ribPanelSize;
       float contactFade = smoothstep(ribContact,ribContact+3.0,min(edgeDistance.x,edgeDistance.y));
       vec3 refractedRayExit = position + transmissionRay + deviation * 75.0 * viewFade * contactFade;`
    );
    shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_pars_fragment>',chunk);
  };
  mat.customProgramCacheKey=()=> 'raywall-screen-refraction-v3';
}
// MORU has rounded ribs rather than Raywall's broad flat facets.
export function moruNormalTexture(width,height,direction){
 const n=256,bytes=new Uint8Array(n*n*4),horizontal=direction==='horizontal';
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const phase=(horizontal?y:x)/n*2*Math.PI,slope=.55*Math.sin(phase);
  const length=Math.hypot(slope,1),i=(y*n+x)*4;
  bytes[i]=Math.round(127.5*(1+(horizontal?0:slope/length)));
  bytes[i+1]=Math.round(127.5*(1+(horizontal?slope/length:0)));
  bytes[i+2]=Math.round(127.5*(1+1/length));bytes[i+3]=255;
 }
 const map=new T.DataTexture(bytes,n,n);map.wrapS=map.wrapT=T.RepeatWrapping;
 map.repeat.set(width/12,height/12);map.magFilter=T.LinearFilter;
 map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
}
// Visual inspection presets, not measured transmission or coating spectra.
export const moruOptics={
 'moru-ultra':{attenuation:'#eef5f2',distance:500,edge:'#e2eeea'},
 'moru-crystal':{attenuation:'#d8e4df',distance:110,edge:'#b4cfc3'},
 'moru-bronze-toned':{attenuation:'#ad8c62',distance:7,edge:'#68533b',face:'#c4ad8b'},
 'moru-grey':{attenuation:'#8c969e',distance:7,edge:'#52616a',face:'#aab5bd'},
 'flutes-moru-ultra-mat':{attenuation:'#eef5f2',distance:500,edge:'#e2eeea',matte:true},
 'moru-magnetron-bronze':{attenuation:'#b3916d',distance:8,edge:'#63503a',coating:'#b3916d'},
 'moru-magnetron-grey':{attenuation:'#a0a3a4',distance:5,edge:'#53585a',coating:'#a0a3a4'}
};
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
export function glassMaterial(item,width,height,direction,renderer,contactOverlap=0){
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
  if(item.slug==='raywall90'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#c8ddd1');mat.attenuationDistance=80;
    mat.roughness=.08;mat.clearcoat=0;mat.ior=1.52;
    // Inspection mode: remove highlights so the rail behind the glass is legible.
    mat.envMapIntensity=0;mat.specularIntensity=0;mat.transmission=1;
    mat.normalMap=raywallNormalTexture(width,height,item.pitch,direction);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    mat.normalScale.set(1,1);raywallRefraction(mat,width,height,contactOverlap);
  }else if(moruOptics[item.slug]){
    const preset=moruOptics[item.slug];
    mat.color.set(preset.coating||preset.face||'#ffffff');mat.attenuationColor.set(preset.attenuation);mat.attenuationDistance=preset.distance;
    mat.roughness=preset.matte?.45:preset.coating?.025:.12;mat.clearcoat=0;mat.ior=1.52;
    mat.envMapIntensity=preset.coating?.65:0;mat.specularIntensity=preset.coating?1:0;
    mat.metalness=preset.coating?.25:0;mat.transmission=preset.coating?.7:preset.matte?.96:1;
    mat.normalMap=moruNormalTexture(width,height,direction);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    mat.normalScale.set(1,1);raywallRefraction(mat,width,height,contactOverlap);
  }else if(item.pitch&&item.pattern){
    const texture=reliefTexture(item.pattern),[rx,ry]=textureRepeat(width,height,item.pitch,direction);
    texture.repeat.set(rx,ry);if(direction==='horizontal')texture.rotation=Math.PI/2;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mat.normalMap=texture;mat.normalScale.set(.35,.35);
  }
  return mat;
}
export function glassEdgeMaterial(item,face){
  if(moruOptics[item.slug])return new T.MeshPhysicalMaterial({color:moruOptics[item.slug].edge,roughness:.08,transmission:1,thickness:4,ior:1.52,specularIntensity:0,envMapIntensity:0});
  if(item.slug==='raywall90')return new T.MeshPhysicalMaterial({color:'#d3e4da',roughness:.08,transmission:1,thickness:4,ior:1.52,specularIntensity:0,envMapIntensity:0});
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
