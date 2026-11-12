const copy=value=>structuredClone(value);
const opposite=side=>side==='left'?'right':'left';
export function numberFacades(items){
 const pairs=new Map();
 for(const item of items){
  if(item.pairId&&!pairs.has(item.pairId))pairs.set(item.pairId,pairs.size+1);
  const number=/^facade-(\d+)$/.exec(item.id)?.[1];
  if(!number)continue;
  const generated=!item.name||/^Фасад \d+$/.test(item.name)||/^Пара \d+ · (левая|правая) створка$/.test(item.name)||/ — (копия|пара)$/.test(item.name);
  if(generated)item.name=item.pairId?'Пара '+pairs.get(item.pairId)+' · '+(item.config.side==='left'?'левая':'правая')+' створка':'Фасад '+number;
 }
}
export class FacadeProject {
 constructor(defaults){this.defaults=copy(defaults);this.items=[];this.removals=[];this.nextId=1;this.activeId=null;this.add('new');}
 remove(){
 if(this.items.length<2)return false;
 const index=this.items.findIndex(item=>item.id===this.activeId),item=this.current(),other=this.partner();
 this.removals.push({item:copy(item),index,partnerId:other?.id});
 if(other)other.pairId=null;
 this.items.splice(index,1);this.activeId=this.items[Math.min(index,this.items.length-1)].id;numberFacades(this.items);return true;
 }
 undoRemove(){
 const saved=this.removals.pop();if(!saved)return false;
 const item=saved.item;
 if(item.pairId){
 // Re-link only when the original partner is still free; preserve its latest settings.
 const partner=this.items.find(i=>i.id===saved.partnerId);
 if(partner&&!partner.pairId){partner.pairId=item.pairId;item.config={...copy(partner.config),side:opposite(partner.config.side)};}else item.pairId=null;
 }
 this.items.splice(Math.min(saved.index,this.items.length),0,item);this.activeId=item.id;numberFacades(this.items);return true;
 }
 groups(){
 const groups=[];
 for(const item of this.items){const existing=item.pairId&&groups.find(group=>group.pairId===item.pairId);if(existing)existing.members.push(item);else groups.push({id:item.id,pairId:item.pairId,members:[item]});}
 return groups;
 }
 current(){return this.items.find(item=>item.id===this.activeId);}
 partner(){const item=this.current();return item?.pairId?this.items.find(other=>other.id!==item.id&&other.pairId===item.pairId):undefined;}
 update(config){const item=this.current();item.config=copy(config);const other=this.partner();if(other)other.config={...copy(config),side:opposite(config.side)};numberFacades(this.items);}
 add(kind){const source=this.current();if(kind==='mirror'&&this.partner())throw new Error('Фасад уже связан с парой');
 const id=`facade-${this.nextId++}`, config=copy(kind==='new'?this.defaults:source.config);
 const item={id,name:`Фасад ${this.nextId-1}`,pairId:null,config};
 if(kind==='mirror'){item.config.side=opposite(config.side);source.pairId=item.pairId=source.id;}
 this.items.push(item);this.activeId=id;numberFacades(this.items);return item;
 }
}
