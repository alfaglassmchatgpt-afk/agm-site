import * as T from 'three';
// Illustrative, open-sided apartment stage: camera can orbit without crossing opaque walls.
export function buildApartment(opening,height){
 const room=new T.Group(),width=Math.max(opening+2,6.4),H=Math.max(height+.3,2.8);
 function block(w,h,d,x,y,z,color,r=.8){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:r}));m.position.set(x,y,z);room.add(m);return m;}
 function cylinder(r,h,x,y,z,color){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,40),new T.MeshStandardMaterial({color,roughness:.7}));m.position.set(x,y,z);room.add(m);return m;}
 // Plank geometry keeps the floor crisp at every camera distance.
 for(let i=0;i<32;i++)for(let j=0;j<5;j++)block(width/32-.006,.035,1.59,(i+.5)*width/32-width/2,-.035,(j+.5)*1.6-4,['#bca17b','#c4ab86','#b69a74','#ceb693'][(i*7+j*3)%4]);
 block(width,H,.08,0,H/2,-4,'#eee7dc');
 // Opening reveals and lintel; no ceiling plane to obstruct an outside camera.
 const reveal=(width-opening)/2;for(const sign of [-1,1])block(reveal,H,.18,sign*(opening/2+reveal/2),H/2,0,'#e6ded1');
 if(H>height)block(opening,H-height,.18,0,height+(H-height)/2,0,'#e6ded1');
 // Kitchen against the far wall, subtly separated fronts and warm timber backsplash.
 for(let i=0;i<5;i++){const x=(i-2)*.62;block(.6,.86,.58,x,.43,-3.64,'#a8b0a2');block(.6,.04,.62,x,.88,-3.64,'#ebe5da');block(.34,.016,.025,x,.72,-3.335,'#454b43');block(.59,.64,.32,x,1.98,-3.78,'#e0d8c9');}
 block(3.1,.67,.03,0,1.25,-3.94,'#c3a583');block(.63,.012,.45,-.62,.907,-3.63,'#242c2d');
 cylinder(.11,.18,.65,1.0,-3.6,'#8a5a3b');cylinder(.08,.13,.95,.975,-3.6,'#e2d7c4');
 // Dining table and upholstered chairs behind the glass.
 block(1.7,.065,.85,.55,.76,-1.95,'#b58e64');for(const x of [-.15,1.25])for(const z of [-2.25,-1.65])block(.055,.73,.055,x,.365,z,'#514b40');
 for(const x of [-.05,1.12]){block(.43,.09,.44,x,.44,-2.62,'#746d5d');block(.43,.48,.065,x,.71,-2.83,'#746d5d');for(const dx of [-.16,.16])block(.035,.4,.035,x+dx,.2,-2.6,'#3e423b');}
 cylinder(.13,.26,.55,.925,-1.95,'#d3d6c5');
 // Lounge on the near side, leaving a clear central path.
 const loungeStart=room.children.length;
 block(2.25,.32,.95,-1,.24,2.6,'#b4b1a4');block(2.25,.58,.18,-1,.65,3.02,'#aaa89c');for(const x of [-2.02,.02])block(.22,.45,.95,x,.55,2.6,'#aaa89c');
 for(const x of [-1.65,-1,-.35])block(.6,.12,.68,x,.46,2.52,'#cecbc0');
 block(2.75,.012,2.15,-.7,.002,2,'#dcd6ca');cylinder(.45,.045,-.45,.43,1.4,'#8e6d4f');cylinder(.25,.4,-.45,.2,1.4,'#665545');
 block(.22,.025,.17,-.5,.47,1.4,'#3e605e');cylinder(.06,.13,-.25,.515,1.36,'#eee2ce');
 const lounge=new T.Group();for(const obj of room.children.slice(loungeStart)){room.remove(obj);obj.position.x+=1;obj.position.z-=2.6;lounge.add(obj);}lounge.rotation.y=Math.PI/2;lounge.position.set(-width/2+.6,0,1.8);room.add(lounge);
 // Wall art and tall plant provide readable colour and detail through patterned glass.
 block(.95,1.2,.035,-2.35,1.65,-3.93,'#625c4c');block(.86,1.1,.04,-2.35,1.65,-3.9,'#cbb598');block(.48,.65,.045,-2.28,1.65,-3.87,'#976a4b');
 cylinder(.23,.42,2.4,.21,-2.9,'#b19b80');for(let i=0;i<9;i++){const a=i*2.4;const leaf=new T.Mesh(new T.SphereGeometry(1,16,12),new T.MeshStandardMaterial({color:i%2?'#546e49':'#7e8b60',roughness:.9}));leaf.scale.set(.17,.48,.09);leaf.position.set(2.4+Math.cos(a)*.24,.8+(i%3)*.25,-2.9+Math.sin(a)*.22);leaf.rotation.z=Math.cos(a)*.65;room.add(leaf);}
 // Hanging pendant; soft light, no mirror-like glare on ribbed glass.
 cylinder(.28,.16,.55,H-.65,-1.95,'#ddc6a0');cylinder(.008,.5,.55,H-.32,-1.95,'#514b42');
 const lamp=new T.PointLight(0xffe3b9,15,7,2);lamp.position.set(.55,H-.8,-1.95);room.add(lamp);
 return room;
}
