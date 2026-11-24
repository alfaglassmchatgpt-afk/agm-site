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
export function overlaps(items){const p=placements(items),out=[];for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=p.get(items[i].id),b=p.get(items[j].id);if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y)out.push([i+1,j+1]);}return out;}
