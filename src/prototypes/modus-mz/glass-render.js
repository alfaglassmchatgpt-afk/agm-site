import * as T from './vendor/three.module.js';
import {reedSlugs} from './glass-groups.js';

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
export function refractionSurround(width,height,renderer){
 const g=new T.Group();g.name='photobox-surround';
 const radius=Math.max(width,height)*2.8+300,wallHeight=Math.max(height*3,2200);
 g.userData.roomRadius=radius;g.userData.roomHalfHeight=wallHeight/2;
 const points=[[-radius,-radius],[radius,-radius],[radius,radius],[-radius,radius]];
  for(let i=0;i<4;i++){
   const a=points[i],b=points[(i+1)%4],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
   let wallMaterial;
   {
    const names=['forest','mountains','coast','dunes'];
    const wallpaper=new T.TextureLoader().load('./assets/photobox/'+names[i]+'.png',texture=>{
     const imageAspect=texture.image.width/texture.image.height,wallAspect=len/wallHeight;
     if(imageAspect>wallAspect){texture.repeat.x=wallAspect/imageAspect;texture.offset.x=(1-texture.repeat.x)/2;}
     else{texture.repeat.y=imageAspect/wallAspect;texture.offset.y=(1-texture.repeat.y)/2;}
    });
    wallpaper.colorSpace=T.SRGBColorSpace;
    wallMaterial=new T.MeshBasicMaterial({map:wallpaper,side:T.BackSide});
   }
   const wall=new T.Mesh(new T.PlaneGeometry(len,wallHeight),wallMaterial);wall.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);wall.rotation.y=Math.atan2(-(b[1]-a[1]),b[0]-a[0])+Math.PI;g.add(wall);
  }
 const surface=(y,color,ceiling)=>{const m=new T.Mesh(new T.PlaneGeometry(radius*4,radius*4),new T.MeshStandardMaterial({color,roughness:.9}));m.rotation.x=ceiling?Math.PI/2:-Math.PI/2;m.position.y=y;g.add(m);};
 surface(wallHeight/2,'#e9e5df',true);
 const floorMap=new T.TextureLoader().load('./assets/photobox/oak-laminate.png');
 floorMap.colorSpace=T.SRGBColorSpace;floorMap.wrapS=floorMap.wrapT=T.RepeatWrapping;
 // One texture tile represents approximately 2400 x 2400 mm, regardless of facade size.
 floorMap.repeat.set(radius*2/2400,radius*2/2400);
 floorMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const floor=new T.Mesh(new T.PlaneGeometry(radius*2,radius*2),new T.MeshStandardMaterial({map:floorMap,roughness:.78,metalness:0}));
 floor.name='oak-laminate-floor';floor.rotation.x=-Math.PI/2;floor.position.y=-wallHeight/2;g.add(floor);
 const panel=new T.Mesh(new T.PlaneGeometry(radius*.8,radius*.45),new T.MeshBasicMaterial({color:'#e1f1ff'}));panel.rotation.x=Math.PI/2;panel.position.set(0,wallHeight/2-2,0);g.add(panel);
 const lamp=new T.PointLight(0xe1f1ff,wallHeight*wallHeight*.035,wallHeight*4,2);lamp.name='photobox-ceiling-light';lamp.userData.baseIntensity=lamp.intensity;lamp.userData.baseDistance=lamp.distance;lamp.position.set(0,wallHeight/2-40,0);g.add(lamp);
 return g;
}
// Keep the camera inside the room with headroom for rotation and zoom.
// Only the environment scales; facade geometry remains in millimetres.
export function fitPhotoboxToCamera(room,camera){
 const {roomRadius:r,roomHalfHeight:h}=room.userData;
 const margin=Math.max(100,camera.near*4);
 const scale=Math.max(1,(Math.abs(camera.position.x)+margin)/(r*.75),(Math.abs(camera.position.z)+margin)/(r*.75),(Math.abs(camera.position.y)+margin)/(h*.75));
 room.scale.setScalar(scale);
 const floor=room.getObjectByName('oak-laminate-floor');
 floor.material.map.repeat.set(r*2*scale/2400,r*2*scale/2400);
 const lamp=room.getObjectByName('photobox-ceiling-light');
 lamp.intensity=lamp.userData.baseIntensity*scale*scale;lamp.distance=lamp.userData.baseDistance*scale;
 const far=Math.max(50000,camera.position.length()+Math.hypot(r,r,h)*scale*2);
 const near=Math.max(5,camera.position.length()*.01);
 if(Math.abs(camera.far-far)>1||Math.abs(camera.near-near)>.01){camera.far=far;camera.near=near;camera.updateProjectionMatrix();}
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
// Fine nearly triangular ribs from owner photos; slope is a visual approximation.
export function estriadoNormalTexture(width,height,pitch,direction){
  const n=256,bytes=new Uint8Array(n*n*4),horizontal=direction==='horizontal';
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const u=(horizontal?y:x)/n;
    const slope=.38*Math.tanh(6*Math.sin(2*Math.PI*u));
    const grain=.003*Math.sin(x*1.73+y*2.91)*Math.sin(x*.73-y*1.31);
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
export const estriadoOptics={
 'estriado':{attenuation:'#c1dbc9',distance:65,edge:'#91baa5'},
 'estriado-crystal':{attenuation:'#dce9e1',distance:160,edge:'#c5dacf'},
 'estriado-ultra':{attenuation:'#f4f5f4',distance:600,edge:'#e9eceb'}
};
// Four planar facets per square cell; shape is a visual approximation of the approved sample.
export function krezetNormalTexture(width,height,pitch,rounded=false){
 const n=256,bytes=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const u=(x+.5)/n-.5,v=(y+.5)/n-.5;
  const nx=rounded?.27*Math.sin(u*2*Math.PI):(Math.abs(u)>Math.abs(v)?Math.sign(u)*.4:0);
  const ny=rounded?.27*Math.sin(v*2*Math.PI):(Math.abs(v)>=Math.abs(u)?Math.sign(v)*.4:0);
  const len=Math.hypot(nx,ny,1),i=(y*n+x)*4;
  bytes[i]=Math.round(127.5*(1+nx/len));bytes[i+1]=Math.round(127.5*(1+ny/len));
  bytes[i+2]=Math.round(127.5*(1+1/len));bytes[i+3]=255;
 }
 const map=new T.DataTexture(bytes,n,n);map.wrapS=map.wrapT=T.RepeatWrapping;
 map.repeat.set(width/pitch,height/pitch);map.minFilter=T.LinearMipmapLinearFilter;
 map.magFilter=T.LinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
}
// Deterministic irregular facets, estimated from the approved 100 x 150 mm sample.
function diamantNormalTexture(width,height,atlantic=false){
 const n=512,tiles=atlantic?8:16,bytes=new Uint8Array(n*n*4);
 const hash=(x,y,k)=>{const z=Math.sin(x*127.1+y*311.7+k*91.3)*43758.5453;return z-Math.floor(z);};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const u=x/n*tiles,v=y/n*tiles,ix=Math.floor(u),iy=Math.floor(v);let best=1e9,sx=0,sy=0;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
   const gx=ix+i,gy=iy+j,wx=(gx+tiles)%tiles,wy=(gy+tiles)%tiles;
   const d=(u-gx-hash(wx,wy,1))**2+(v-gy-hash(wx,wy,2))**2;
   if(d<best){best=d;sx=wx;sy=wy;}
  }
  const angle=hash(sx,sy,5)*Math.PI*2;
  const ridge=atlantic?.18*Math.sin((u*Math.cos(angle)+v*Math.sin(angle))*48):0;
  const nx=(hash(sx,sy,3)-.5)*(atlantic?.7:1)+ridge*Math.cos(angle),ny=(hash(sx,sy,4)-.5)*(atlantic?.7:1)+ridge*Math.sin(angle),len=Math.hypot(nx,ny,1),k=(y*n+x)*4;
  bytes[k]=Math.round(127.5*(1+nx/len));bytes[k+1]=Math.round(127.5*(1+ny/len));bytes[k+2]=Math.round(127.5*(1+1/len));bytes[k+3]=255;
 }
 const map=new T.DataTexture(bytes,n,n);map.wrapS=map.wrapT=T.RepeatWrapping;
 map.repeat.set(width/(atlantic?100:64),height/(atlantic?100:64));map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
}
// Gothic: broad flowing distortion with narrow wandering veins; approximate approved sample.
function gothicNormalTexture(width,height,silvit=false){
 const n=512,bytes=new Uint8Array(n*n*4),tau=2*Math.PI;
 const heightAt=(u,v)=>{
  if(silvit){
   // Uneven isolated veins, based on the owner's physical sample, not periodic fluting.
   let relief=.001*Math.sin(tau*(37*u+23*v))*Math.sin(tau*(19*u-31*v));
   for(let i=0;i<13;i++){
    const seed=Math.sin((i+1)*127.1)*43758.5453,random=seed-Math.floor(seed);
    const phase=random*tau;
    const centre=(i+.15+.7*random)/13+.014*Math.sin(tau*v*(2+i%3)+phase)+.006*Math.sin(tau*v*(9+i%5)+phase*2);
    let distance=u-centre;distance-=Math.round(distance);
    const width=.0017+.0035*(.5+.5*Math.sin(tau*v*(3+i%4)+phase));
    const interruption=Math.max(0,Math.min(1,2.5*(.35+Math.sin(tau*v*(1+i%3)+phase))));
    relief+=(.012+.024*random)*interruption*Math.exp(-distance*distance/(width*width));
    // Short neighbouring fragments create local splits rather than parallel sinusoidal waves.
    const branch=distance-.012*Math.sin(tau*v*3+phase);
    relief+=.009*Math.max(0,Math.sin(tau*v*7+phase))**4*Math.exp(-branch*branch/(width*width*.5));
   }
   return relief;
  }
  const vein=Math.sin(tau*(u*4+.11*Math.sin(tau*v)+.04*Math.sin(tau*(3*v+u))));
  const fine=Math.sin(tau*(u*37+v*29))*Math.sin(tau*(u*23-v*41));
  return .07*Math.sin(tau*(u*2+v))+.05*Math.sin(tau*(u-v*3))+.023*Math.exp(-vein*vein*180)+.0007*fine;
 };
 const e=1/n;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const u=x/n,v=y/n,nx=(heightAt(u+e,v)-heightAt(u-e,v))/.04,ny=(heightAt(u,v+e)-heightAt(u,v-e))/.04,len=Math.hypot(nx,ny,1),k=(y*n+x)*4;
  bytes[k]=Math.round(127.5*(1+nx/len));bytes[k+1]=Math.round(127.5*(1+ny/len));bytes[k+2]=Math.round(127.5*(1+1/len));bytes[k+3]=255;
 }
 const map=new T.DataTexture(bytes,n,n);map.wrapS=map.wrapT=T.RepeatWrapping;
 map.repeat.set(width/100,height/150);map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
}
function kathedralNormalTexture(width,height,aqualite=false,krepi=false){
 const n=512,bytes=new Uint8Array(n*n*4),tau=2*Math.PI;
 const heightAt=(u,v)=>{
  if(krepi){
   const x=u+.007*Math.sin(tau*(13*u+17*v)),y=v+.009*Math.sin(tau*(19*u-11*v));
   return .002*Math.sin(tau*(71*x+47*y))+.0017*Math.sin(tau*(53*x-79*y))+.001*Math.sin(tau*(97*x+31*y));
  }
  if(aqualite){
   const swell=.26*Math.sin(tau*(u+v))+.18*Math.sin(tau*(2*u-v));
   const x=u+.035*Math.sin(tau*(u+2*v)),y=v+.03*Math.sin(tau*(2*u-v));
   return swell+.012*Math.sin(tau*(27*x+19*y))+.009*Math.sin(tau*(19*x-31*y));
  }
  const x=u+.012*Math.sin(tau*(3*u+5*v)),y=v+.014*Math.sin(tau*(4*u-3*v));
  return .012*Math.sin(tau*(17*x+11*y))+.009*Math.sin(tau*(13*x-19*y))+.006*Math.sin(tau*(29*x+7*y))+.018*Math.sin(tau*(3*u+2*v));
 };
 const e=1/n;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const u=x/n,v=y/n,nx=(heightAt(u+e,v)-heightAt(u-e,v))/.04,ny=(heightAt(u,v+e)-heightAt(u,v-e))/.04,len=Math.hypot(nx,ny,1),k=(y*n+x)*4;
  bytes[k]=Math.round(127.5*(1+nx/len));bytes[k+1]=Math.round(127.5*(1+ny/len));bytes[k+2]=Math.round(127.5*(1+1/len));bytes[k+3]=255;
 }
 const map=new T.DataTexture(bytes,n,n);map.wrapS=map.wrapT=T.RepeatWrapping;
 map.repeat.set(width/100,height/150);map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
}
function raywallRefraction(mat,width,height,overlap,pitch,direction,grid=false,unitScale=1){
  // Screen-space approximation of the air gap to objects behind the glass.
  // Does not change the 4 mm slab or its absorption distance. Not ray tracing.
  mat.onBeforeCompile=shader=>{
    shader.uniforms.ribWorldScale={value:unitScale};
    shader.uniforms.ribPanelSize={value:new T.Vector2(width,height)};
    shader.uniforms.ribContact={value:Math.max(0,overlap)};
    shader.uniforms.ribCycles={value:pitch>0?(direction==='horizontal'?height:width)/pitch:0};
    shader.uniforms.ribHorizontal={value:direction==='horizontal'?1:0};
    shader.uniforms.cellCycles={value:new T.Vector2(width/(pitch||1),height/(pitch||1))};
    shader.uniforms.gridRelief={value:Number(grid)};
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 ribUv;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nribUv = uv;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
      '#include <common>\nvarying vec2 ribUv;\nuniform float ribWorldScale;\nuniform vec2 ribPanelSize;\nuniform float ribContact;\nuniform float ribCycles;\nuniform float ribHorizontal;\nuniform vec2 cellCycles;\nuniform float gridRelief;');
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
       float contactFade = smoothstep(ribContact+2.0,ribContact+12.0,min(edgeDistance.x,edgeDistance.y));
       vec3 offset = (transmissionRay + deviation * (75.0 * ribWorldScale) * viewFade) * contactFade;
       // Do not sample the bright metal rail from the clear opening or smear its edge.
       vec2 safeTravel = max(edgeDistance-vec2(ribContact+1.5),vec2(0.0));
       offset.xy = clamp(offset.xy,-safeTravel*ribWorldScale,safeTravel*ribWorldScale);
       vec3 refractedRayExit = position + offset;`
    );
    shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_pars_fragment>',chunk.replaceAll('getTransmissionSample( refractionCoords, roughness,', 'getTransmissionSample( refractionCoords, roughness * contactFade,'));
    // Restrained illustrative relief also over a contacting rail, without specular glare.
    // Screen derivative fades subpixel ribs to avoid moire when zooming out.
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      float ribPhase = mix(ribUv.x,ribUv.y,ribHorizontal)*ribCycles;
      float ribVisibility = step(0.5,ribCycles)*(1.0-smoothstep(0.3,0.8,fwidth(ribPhase)));
      float ribValley = pow(0.5+0.5*cos(ribPhase*6.2831853),6.0);
      if(gridRelief>0.5){
        vec2 cellPhase=ribUv*cellCycles;
        vec2 cell=fract(cellPhase)-0.5;
        float visibleCell=1.0-smoothstep(0.3,0.8,max(fwidth(cellPhase.x),fwidth(cellPhase.y)));
        float facet=gridRelief>1.5?0.045*(cos(cell.x*6.2831853)+cos(cell.y*6.2831853)):(abs(cell.x)>abs(cell.y)?sign(cell.x)*0.10:sign(cell.y)*0.06);
        outgoingLight *= 1.0+facet*visibleCell;
      }else{outgoingLight *= 1.0-0.22*ribValley*ribVisibility;}
      #include <opaque_fragment>
    `);
  };
  mat.customProgramCacheKey=()=> 'rib-grid-contact-v6';
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
export function glassMaterial(item,width,height,direction,renderer,contactOverlap=0,unitScale=1){
  const mat=new T.MeshPhysicalMaterial({
    color:item.color,metalness:item.mirror?1:0,roughness:item.mirror?.055:item.matte?.38:.055,
    transmission:item.mirror||item.opaque?0:1,thickness:4,ior:1.5,envMapIntensity:item.mirror?1.25:1,
    attenuationColor:new T.Color(item.color),attenuationDistance:250,
    side:T.FrontSide,clearcoat:item.mirror?1:.2,clearcoatRoughness:.06
  });
  if(item.slug.startsWith('lacobel-')||item.slug.startsWith('matelac-')){
    mat.transmission=0;mat.metalness=0;mat.roughness=item.matte?.62:.025;
    mat.clearcoat=item.matte?0:1;mat.clearcoatRoughness=.06;mat.envMapIntensity=item.matte?.35:.65;
  }
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
  if(item.slug==='dihroichnoe-steklo'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#ffffff');mat.attenuationDistance=1000;
    mat.transmission=1;mat.roughness=.035;mat.clearcoat=0;mat.envMapIntensity=.35;
    mat.iridescence=1;mat.iridescenceIOR=1.3;mat.iridescenceThicknessRange=[280,420];
    // Illustrative transmitted colour supplements the thin-film reflection in a neutral studio.
    // View direction drives the tint; this is not a measured spectral coating model.
    mat.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 dichroicUv;').replace('#include <begin_vertex>','#include <begin_vertex>\ndichroicUv=uv;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 dichroicUv;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
        float angleShift=1.-abs(dot(normalize(normal),normalize(vViewPosition)));
        float phase=dichroicUv.x*.40+dichroicUv.y*.08+angleShift*1.8;
        vec3 filmTint=.78+.22*cos(6.2831853*(phase+vec3(0.,.33,.67)));
        outgoingLight*=filmTint;
        #include <opaque_fragment>`);
    };
    mat.customProgramCacheKey=()=> 'dichroic-view-tint-v1';
  }
  if(item.slug==='raywall90'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#c8ddd1');mat.attenuationDistance=80;
    mat.roughness=.08;mat.clearcoat=0;mat.ior=1.52;
    // Inspection mode: remove highlights so the rail behind the glass is legible.
    mat.envMapIntensity=0;mat.specularIntensity=0;mat.transmission=1;
    mat.normalMap=raywallNormalTexture(width,height,item.pitch,direction);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    mat.normalScale.set(1,1);
  }else if(item.slug==='hithicross'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#deebe2');mat.attenuationDistance=180;
    mat.roughness=.12;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.normalMap=krezetNormalTexture(width,height,item.pitch,true);mat.normalScale.set(1,1);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }else if(item.slug==='monumental-atlantic'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#dce8df');mat.attenuationDistance=160;
    mat.roughness=.23;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.normalMap=diamantNormalTexture(width,height,true);mat.normalScale.set(1,1);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }else if(item.slug==='silvit'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#d6e6db');mat.attenuationDistance=140;
    mat.roughness=.19;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.roughness=.11;mat.normalMap=gothicNormalTexture(width,height,true);mat.normalScale.set(.85,.85);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }else if(item.slug==='krepi'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#dce9df');mat.attenuationDistance=160;
    mat.roughness=.48;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.normalMap=kathedralNormalTexture(width,height,false,true);mat.normalScale.set(.7,.7);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }else if(item.slug==='kathedralaqualite'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#d9e8dd');mat.attenuationDistance=160;
    mat.roughness=.27;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.normalMap=kathedralNormalTexture(width,height,true);mat.normalScale.set(1,1);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }else if(item.slug==='kathedral-klein'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#e0ebe3');mat.attenuationDistance=180;
    mat.roughness=.19;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.normalMap=kathedralNormalTexture(width,height);mat.normalScale.set(1,1);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }else if(item.slug==='gothic'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#dce8de');mat.attenuationDistance=160;
    mat.roughness=.22;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.normalMap=gothicNormalTexture(width,height);mat.normalScale.set(1,1);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }else if(item.slug==='diamant'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#deebe1');mat.attenuationDistance=180;
    mat.roughness=.12;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.normalMap=diamantNormalTexture(width,height);mat.normalScale.set(1,1);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }else if(item.slug==='krezet'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#d5e5d9');mat.attenuationDistance=110;
    mat.roughness=.23;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.normalMap=krezetNormalTexture(width,height,item.pitch);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mat.normalScale.set(1,1);
  }else if(item.slug==='flutelite-s'){
    // Owner photos: very fine relief, visible coloured objects, green edge; no frosted veil.
    mat.color.set('#ffffff');mat.attenuationColor.set('#c9dfcf');mat.attenuationDistance=90;
    mat.roughness=.09;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.normalMap=estriadoNormalTexture(width,height,item.pitch,direction);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mat.normalScale.set(1.1,1.1);
  }else if(item.slug==='vison-sun'){
    mat.color.set('#ffffff');mat.attenuationColor.set('#eef3ef');mat.attenuationDistance=450;
    // Owner physical sample supersedes wardrobe render: clear coloured fragments, low haze.
    mat.roughness=.13;mat.ior=1.52;mat.metalness=0;mat.transmission=1;
    mat.normalMap=moruNormalTexture(width,height,direction);
    mat.normalMap.repeat.set(width/item.pitch,height/item.pitch);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mat.normalScale.set(1.2,1.2);
  }else if(estriadoOptics[item.slug]){
    const preset=estriadoOptics[item.slug];
    mat.color.set('#ffffff');mat.attenuationColor.set(preset.attenuation);mat.attenuationDistance=preset.distance;
    mat.roughness=.035;mat.clearcoat=0;mat.ior=1.52;mat.metalness=0;
    mat.envMapIntensity=0;mat.specularIntensity=0;mat.transmission=1;
    mat.normalMap=estriadoNormalTexture(width,height,item.pitch,direction);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    mat.normalScale.set(1,1);
  }else if(moruOptics[item.slug]){
    const preset=moruOptics[item.slug];
    mat.color.set(preset.coating||preset.face||'#ffffff');mat.attenuationColor.set(preset.attenuation);mat.attenuationDistance=preset.distance;
    mat.roughness=preset.matte?.45:preset.coating?.025:.12;mat.clearcoat=0;mat.ior=1.52;
    mat.envMapIntensity=preset.coating?.65:0;mat.specularIntensity=preset.coating?1:0;
    mat.metalness=preset.coating?.25:0;mat.transmission=preset.coating?.7:preset.matte?.96:1;
    mat.normalMap=moruNormalTexture(width,height,direction);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    mat.normalScale.set(1,1);
  }else if(item.slug==='riflenoe-steklo-flutes'){
    mat.normalMap=moruNormalTexture(width,height,direction);
    mat.normalMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mat.normalScale.set(1,1);
  }else if(item.pitch&&item.pattern){
    const texture=reliefTexture(item.pattern),[rx,ry]=textureRepeat(width,height,item.pitch,direction);
    texture.repeat.set(rx,ry);if(direction==='horizontal')texture.rotation=Math.PI/2;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mat.normalMap=texture;mat.normalScale.set(.35,.35);
  }
  if(reedSlugs.includes(item.slug)||['krezet','diamant','gothic','kathedral-klein','kathedralaqualite','krepi','silvit','monumental-atlantic','hithicross'].includes(item.slug)){
    // One contact treatment for the entire category. Unknown relief remains unmodelled.
    if(!moruOptics[item.slug]?.coating){mat.envMapIntensity=0;mat.specularIntensity=0;mat.clearcoat=0;}
    raywallRefraction(mat,width,height,contactOverlap,item.pitch,direction,item.slug==='hithicross'?2:item.slug==='krezet',unitScale);
    if(item.slug==='silvit'){
      const compile=mat.onBeforeCompile;
      mat.onBeforeCompile=shader=>{
        compile(shader);
        shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
          vec2 veinSlope=texture2D(normalMap,vNormalMapUv).xy*2.0-1.0;
          float veinShade=clamp(length(veinSlope)*1.8,0.0,0.45);
          outgoingLight*=1.0-veinShade;
          #include <opaque_fragment>
        `);
      };
      mat.customProgramCacheKey=()=> 'silvit-photo-veins-v2';
    }
  }
  // Optical distances are authored in millimetres; consumers may use metres.
  mat.thickness*=unitScale;mat.attenuationDistance*=unitScale;
  return mat;
}
export function glassEdgeMaterial(item,face){
  if(item.slug==='flutelite-s')return new T.MeshPhysicalMaterial({color:'#a6c9af',roughness:.08,transmission:1,thickness:4,ior:1.52,specularIntensity:0,envMapIntensity:0});
  if(item.slug==='vison-sun')return new T.MeshPhysicalMaterial({color:'#e2eae5',roughness:.08,transmission:1,thickness:4,ior:1.52,specularIntensity:0,envMapIntensity:0});
  if(estriadoOptics[item.slug])return new T.MeshPhysicalMaterial({color:estriadoOptics[item.slug].edge,roughness:.08,transmission:1,thickness:4,ior:1.52,specularIntensity:0,envMapIntensity:0});
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
