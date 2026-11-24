import {FacadeProject as Base,numberFacades as baseNames} from './project-base.js';
const copy=v=>structuredClone(v);
const stem=item=>item.baseName||item.name?.replace(/^(левая|правая) створка\s+/i,'')||'Фасад';
export function numberFacades(items){
 baseNames(items);
 for(const item of items){if(item.pairId&&!item.linkId)item.linkId=item.pairId;if(item.linkId&&item.baseName)item.name=(item.config.side==='left'?'Левая':'Правая')+' створка '+item.baseName;}
}
export function renameLinked(project,item,name){const base=name.trim().replace(/^(левая|правая) створка\s+/i,'')||'Без названия';if(item.linkId){for(const peer of project.items.filter(i=>i.linkId===item.linkId))peer.baseName=base;numberFacades(project.items);}else{item.name=base;delete item.baseName;}}
export class FacadeProject extends Base {
 add(kind){
  const source=this.current(),partner=this.partner();
  if(kind==='copy'&&partner){
   const group=source.linkId||source.pairId,base=stem(source),original=[source,partner];
   for(const i of original){i.linkId=group;i.baseName=base;}
   const added=original.map(i=>{const id='facade-'+this.nextId++;return {id,name:i.name,baseName:base,linkId:group,pairId:null,config:copy(i.config),copiedFrom:i.id};});
   added.forEach(i=>i.pairId=added[0].id);this.items.push(...added);this.activeId=added[0].id;numberFacades(this.items);return added[0];
  }
  const base=source?stem(source):'',item=super.add(kind);
  if(kind==='mirror'){source.baseName=item.baseName=base;source.linkId=item.linkId=source.linkId||source.id;numberFacades(this.items);}
  else if(kind==='copy'){item.name=source.linkId?stem(source):source.name;}
  return item;
 }
 update(config){
  const item=this.current(),group=item.linkId;super.update(config);
  if(group){for(const peer of this.items){if(peer.id!==item.id&&peer.linkId===group){const side=peer.pairId===item.pairId?(item.config.side==='left'?'right':'left'):peer.config.side;peer.config={...copy(config),side};}}numberFacades(this.items);}
 }
 remove(){const result=super.remove();numberFacades(this.items);return result;}
 undoRemove(){const result=super.undoRemove();if(result){const item=this.current(),peer=this.items.find(i=>i.id!==item.id&&i.linkId&&i.linkId===item.linkId);if(peer)item.config={...copy(peer.config),side:item.config.side};numberFacades(this.items);}return result;}
}
