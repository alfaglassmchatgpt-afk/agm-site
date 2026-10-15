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

export const sceneOptions=['empty','studio','kitchen','living','wardrobe'];
export function interiorScene(kind,width,height){
  if(kind==='empty')return new T.Group();
  if(kind==='studio')return backdrop(width,height);
  const group=new T.Group();group.name=kind;
  const k=Math.min(width/350,height/600),floor=-height/2-24;
  const block=(w,h,d,x,y,z,color,r=2)=>{
    const mesh=new T.Mesh(roundedBlock(w*k,h*k,d*k,r*k),new T.MeshStandardMaterial({color,roughness:.65}));
    mesh.position.set(x*k,floor+y*k,z*k);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const cylinder=(r,h,x,y,z,color)=>{
    const m=new T.Mesh(new T.CylinderGeometry(r*k,r*k,h*k,48),new T.MeshStandardMaterial({color,roughness:.4}));m.position.set(x*k,floor+y*k,z*k);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;
  };
  const plane=(color,y,z,ground=false)=>{const m=new T.Mesh(new T.PlaneGeometry(30000,30000),new T.MeshStandardMaterial({color,roughness:.9}));m.position.set(0,y,z);if(ground)m.rotation.x=-Math.PI/2;m.receiveShadow=true;group.add(m);};
  plane(kind==='wardrobe'?'#a99d8d':'#ddd8ce',0,-700*k);plane('#c0af98',floor,0,true);
  if(kind==='kitchen'){
    block(820,205,155,0,107,-310,'#b7b5aa');block(850,12,175,0,216,-310,'#eee7d9');
    for(let i=-2;i<=2;i++){block(150,190,6,i*158,108,-229,'#cbc8bd');block(50,3,6,i*158,180,-222,'#56564f',1);}
    for(const y of [350,480]){
      const shelf=block(550,10,100,0,y,-360,'#9a8062');shelf.material.map=surfaceMap('wood');
      for(let i=0;i<3;i++)cylinder(15,32,-140+i*40,y+21,-350,'#eee7dc');
      for(let i=0;i<4;i++)cylinder(30,4,105,y+8+i*4,-350,'#d7d2c7');
    }
    block(70,100,10,100,272,-350,'#ae8a62',5);cylinder(22,53,-60,249,-310,'#565f58');
  }else if(kind==='living'){
    const cabinet=block(560,130,150,0,110,-310,'#927759');cabinet.material.map=surfaceMap('wood');
    for(const x of [-235,235])block(12,55,110,x,27,-310,'#4a4943');
    for(let j=0;j<4;j++)block(65,9,48,-110,180+j*10,-300,['#e2d5bc','#595f58','#b09777','#e2d5bc'][j]);
    cylinder(28,85,100,220,-310,'#c4b398');cylinder(14,35,155,194,-300,'#6b7067');
    block(200,190,8,0,370,-630,'#665c4d');block(180,170,3,0,370,-624,'#ded3bd');
    const art=cylinder(40,3,0,370,-619,'#a58d70');art.rotation.x=Math.PI/2;
    block(175,95,160,-420,100,-350,'#b2afa0',14);block(175,160,35,-420,170,-420,'#b2afa0',14);
    block(180,12,85,270,280,-540,'#9b856a');
  }else if(kind==='wardrobe'){
    const wood='#8d7860';block(580,12,190,0,540,-330,wood);block(580,12,190,0,30,-330,wood);
    for(const x of [-290,290])block(14,520,190,x,280,-330,wood);
    const rail=cylinder(5,500,0,480,-300,'#888984');rail.rotation.z=Math.PI/2;
    for(let i=0;i<5;i++){
      const x=-150+i*70,color=['#ded8cc','#70756b','#b09d85','#4b5051','#c7bda9'][i];
      const shape=new T.Shape();shape.moveTo(-24,0);shape.lineTo(-42,-26);shape.lineTo(-29,-62);shape.lineTo(-22,-50);shape.lineTo(-25,-180);shape.lineTo(25,-180);shape.lineTo(22,-50);shape.lineTo(29,-62);shape.lineTo(42,-26);shape.lineTo(24,0);shape.closePath();
      const g=new T.ExtrudeGeometry(shape,{depth:8,bevelEnabled:true,bevelSize:2,bevelThickness:2,bevelSegments:3,steps:1});g.scale(k,k,k);
      const shirt=new T.Mesh(g,new T.MeshStandardMaterial({color,roughness:1}));shirt.position.set(x*k,floor+455*k,-300*k);shirt.castShadow=true;shirt.receiveShadow=true;group.add(shirt);
      block(1,150,1,x,360,-289,'#bcb6aa',.1);
      const hangerPoints=[new T.Vector3(x-26,451,-300),new T.Vector3(x,474,-300),new T.Vector3(x+26,451,-300),new T.Vector3(x-26,451,-300)].map(v=>new T.Vector3(v.x*k,floor+v.y*k,v.z*k));
      const hanger=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(hangerPoints,false,'catmullrom',0),24,1*k,6,false),new T.MeshStandardMaterial({color:'#776d5e',metalness:.5,roughness:.5}));group.add(hanger);

    }
    for(let j=0;j<3;j++)block(130,20,100,-90,57+j*22,-300,['#c5b6a0','#e0d8ca','#928a7e'][j],5);
    block(145,65,115,110,70,-300,'#696963',4);
  }
  return group;
}
