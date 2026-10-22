import * as T from './vendor/three.module.js';
import {colors} from './data.js';

// Original procedural approximation of the longitudinal MODUS A25/A29 swatches.
// UV x crosses the extrusion, UV y follows it; no baked photographic highlights.
function brushedMaps(){
  const w=256,h=256,values=new Float32Array(w*h);
  const hash=x=>{const v=Math.sin(x*127.1+19.7)*43758.5453;return v-Math.floor(v);};
  const longitudinal=(x,y,segments)=>{
    const v=y/h*segments,k=Math.floor(v),f=v-k,t=f*f*(3-2*f);
    return hash(x*97+(k%segments)*13)*(1-t)+hash(x*97+((k+1)%segments)*13)*t;
  };
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const fade=longitudinal(x,y,32),short=longitudinal(x+513,y,96);
    // Fine interrupted scratches; slowly varying groups, never a regular grating.
    values[y*w+x]=.55*hash(x)*Math.max(0,(fade-.18)/.82)+.3*short+.15*longitudinal(Math.floor(x/5)+901,y,12);
  }
  const diffuse=new Uint8Array(w*h*4),rough=new Uint8Array(w*h*4),normal=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4,v=values[y*w+x];
    const slope=(values[y*w+(x+1)%w]-values[y*w+(x+w-1)%w])*.3;
    diffuse[i]=diffuse[i+1]=diffuse[i+2]=Math.round(160+95*v);diffuse[i+3]=255;
    rough[i]=rough[i+1]=rough[i+2]=Math.round(170+80*(1-v));rough[i+3]=255;
    normal[i]=Math.round(128+slope*127);normal[i+1]=128;normal[i+2]=255;normal[i+3]=255;
  }
  const texture=bytes=>{const t=new T.DataTexture(bytes,w,h);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;};
  return {map:texture(diffuse),roughnessMap:texture(rough),normalMap:texture(normal)};
}

// Procedural finish, not a measured manufacturer's coating sample.
export function profileMetal(color){
  const painted=['11','16','26'].includes(color),brushed=['00','21','25','29'].includes(color);
  const mat=new T.MeshPhysicalMaterial({color:colors[color][1],metalness:painted?.08:.92,
    roughness:color==='16'?.16:painted?.48:brushed?.38:.27,
    clearcoat:painted?.25:.12,clearcoatRoughness:.25,envMapIntensity:1.1,side:T.DoubleSide});
  if(brushed){
    Object.assign(mat,brushedMaps());mat.normalScale.set(.5,.5);
    mat.anisotropy=.2;mat.anisotropyRotation=Math.PI/2;
    mat.roughness=color==='25'?.65:.52;mat.clearcoat=0;mat.envMapIntensity=.5;
  }else if(!painted){
    const n=256,bytes=new Uint8Array(n*4*4);
    for(let x=0;x<n;x++){
      const noise=(Math.sin(x*127.1+19.7)*43758.5453)%1;
      const value=Math.round(220+(brushed?30:12)*noise);
      for(let y=0;y<4;y++){const i=(y*n+x)*4;bytes[i]=bytes[i+1]=bytes[i+2]=value;bytes[i+3]=255;}
    }
    const tex=new T.DataTexture(bytes,n,4);tex.wrapS=tex.wrapT=T.RepeatWrapping;
    tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;
    mat.roughnessMap=tex;
  }
  return mat;
}
