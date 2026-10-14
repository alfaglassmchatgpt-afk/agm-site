import * as T from './vendor/three.module.js';
import {colors} from './data.js';

// Procedural finish, not a measured manufacturer's coating sample.
export function profileMetal(color){
  const painted=['11','16','26'].includes(color),brushed=['25','29'].includes(color);
  const mat=new T.MeshPhysicalMaterial({color:colors[color][1],metalness:painted?.08:.92,
    roughness:color==='16'?.16:painted?.48:brushed?.38:.27,
    clearcoat:painted?.25:.12,clearcoatRoughness:.25,envMapIntensity:1.1,side:T.DoubleSide});
  if(!painted){
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
