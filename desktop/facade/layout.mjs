export function facadeNumber(item){return String(item.number??(/^facade-(\d+)$/.exec(item.id)?.[1]||item.id));}
// Positions are in millimetres, independent of manufacturing parameters.
export function placements(items){
 const found=new Map(),visiting=new Set();
 function get(item){
  if(found.has(item.id))return found.get(item.id);
  if(visiting.has(item.id))throw Error('Циклическое расположение фасадов');
  visiting.add(item.id);const l=item.layout,w=item.config.w,h=item.config.h;let x=0,y=0;
  if(l?.anchor){const a=items.find(i=>i.id===l.anchor);if(a){const p=get(a),g=l.gap??3;x=p.x;y=p.y;
   if(l.direction==='right'){x+=a.config.w+g;}
   if(l.direction==='left'){x-=w+g;}
   if(l.direction==='above'){y+=a.config.h+g;}
   if(l.direction==='below'){y-=h+g;}
   // Side-by-side panels align at their top; vertical panels align at their left.
   if(['left','right'].includes(l.direction))y+=a.config.h-h;
  }}else if(l){x=l.x||0;y=l.y||0;}else{const index=items.indexOf(item);if(index){const a=items[index-1],p=get(a);x=p.x+a.config.w+3;y=p.y+a.config.h-h;}}
  visiting.delete(item.id);const result={x,y,w,h};found.set(item.id,result);return result;
 }
 items.forEach(get);return found;
}
export function bounds(items){const p=[...placements(items).values()];const left=Math.min(...p.map(p=>p.x)),right=Math.max(...p.map(p=>p.x+p.w)),bottom=Math.min(...p.map(p=>p.y)),top=Math.max(...p.map(p=>p.y+p.h));return {w:right-left,h:top-bottom,cx:(left+right)/2,cy:(bottom+top)/2};}
export function bake(items){const p=placements(items);for(const item of items){const {x,y}=p.get(item.id);item.layout={x,y};}}
export function attach(items,item,anchor,direction,gap=3){
 if(!['left','right','above','below'].includes(direction)||item.id===anchor.id)throw Error('Неверное направление');
 item.layout={anchor:anchor.id,direction,gap};
 // Find the next free slot in the requested direction, without moving existing panels.
 for(let step=0;step<items.length;step++){const p=placements(items),r=p.get(item.id);const hit=items.filter(i=>i.id!==item.id).map(i=>p.get(i.id)).filter(a=>r.x<a.x+a.w&&r.x+r.w>a.x&&r.y<a.y+a.h&&r.y+r.h>a.y);if(!hit.length)return;
 const shift=Math.max(...hit.map(a=>direction==='right'?a.x+a.w-r.x:direction==='left'?r.x+r.w-a.x:direction==='above'?a.y+a.h-r.y:r.y+r.h-a.y));item.layout.gap+=shift+gap;
 }

}
export function overlaps(items){const p=placements(items),out=[];for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=p.get(items[i].id),b=p.get(items[j].id);if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y)out.push([facadeNumber(items[i]),facadeNumber(items[j])]);}return out;}

// Count non-overlapping panels along each axis; differing widths/heights do not create extra rows.
export function layoutLimit(items){
 const rects=[...placements(items).values()];
 const count=(axis,size)=>{let edge=-Infinity,n=0;for(const r of [...rects].sort((a,b)=>(a[axis]+a[size])-(b[axis]+b[size]))){if(r[axis]>=edge){n++;edge=r[axis]+r[size];}}return n;};
 const columns=count('x','w'),rows=count('y','h');
 return columns>8?'Не более 8 фасадов в ширину. Добавьте фасад во второй ряд.':rows>2?'Не более 2 фасадов в высоту. Добавьте фасад слева или справа.':items.length>16?'В проекте не более 16 фасадов: 8 в ширину и 2 в высоту.':'';
}
export function addChecked(project,add,kind,direction='right',gap=3){
 const snapshot={items:structuredClone(project.items),activeId:project.activeId,nextId:project.nextId};
 try{while(project.items.some(i=>facadeNumber(i)===String(project.nextId)))project.nextId++;if(project.nextId>999999)throw Error('Достигнут максимальный номер фасада.');const anchor=project.current(),sourcePair=project.partner?.(),sourcePositions=placements(project.items),item=add(kind);
 const added=project.items.filter(i=>!snapshot.items.some(old=>old.id===i.id));
 if(added.length===2&&sourcePair){
  // Unplaced copies must not act as obstacles through legacy fallback positions.
  const pending=new Set(added.map(i=>i.id));
  const place=(item,anchor,direction,gap)=>{pending.delete(item.id);attach(project.items.filter(i=>!pending.has(i.id)),item,anchor,direction,gap);};
  const sources=[anchor,sourcePair].sort((a,b)=>sourcePositions.get(a.id).x-sourcePositions.get(b.id).x),left=added.find(i=>i.copiedFrom===sources[0].id),right=added.find(i=>i.copiedFrom===sources[1].id),lp=sourcePositions.get(sources[0].id),rp=sourcePositions.get(sources[1].id);
  if(Math.abs(lp.x-rp.x)<1){const sorted=[...sources].sort((a,b)=>sourcePositions.get(b.id).y-sourcePositions.get(a.id).y),top=added.find(i=>i.copiedFrom===sorted[0].id),bottom=added.find(i=>i.copiedFrom===sorted[1].id);if(direction==='below'){place(top,sorted[1],direction,gap);place(bottom,top,'below',gap);}else if(direction==='above'){place(bottom,sorted[0],direction,gap);place(top,bottom,'above',gap);}else{place(top,sorted[0],direction,gap);place(bottom,top,'below',gap);}}
  else if(direction==='left'){place(right,sources[0],'left',gap);place(left,right,'left',gap);}
  else{place(left,direction==='right'?sources[1]:sources[0],direction,gap);place(right,left,'right',Math.max(0,rp.x-lp.x-lp.w));}
  for(const i of added)delete i.copiedFrom;
 }else attach(project.items,item,anchor,direction,gap);const error=layoutLimit(project.items);if(error)throw Error(error);return item;}
 catch(error){Object.assign(project,snapshot);throw error;}
}

export function setFacadeNumber(project,item,value){
 if(!Number.isSafeInteger(value)||value<1||value>999999)throw Error('Номер — целое число от 1 до 999999.');
 if(project.items.some(other=>other.id!==item.id&&facadeNumber(other)===String(value)))throw Error('Фасад с номером '+value+' уже есть. Укажите другой номер.');
 item.number=value;if(/^Фасад \d+$/.test(item.name))item.name='Фасад '+value;
 project.nextId=Math.max(project.nextId,value+1);
}
