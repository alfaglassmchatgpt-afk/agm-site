export function resetFacade(project){
 const item=project.current();
 // Detach before updating, so resetting one leaf never propagates to its copies.
 if(item.pairId)for(const peer of project.items)if(peer.id!==item.id&&peer.pairId===item.pairId)peer.pairId=null;
 const group=item.linkId;item.pairId=null;item.linkId=null;delete item.baseName;delete item.copiedFrom;
 if(group){const peers=project.items.filter(i=>i.linkId===group);if(peers.length===1){peers[0].linkId=null;delete peers[0].baseName;}}
 item.config=structuredClone(project.defaults);
 item.name='Фасад '+(item.number??item.id.replace('facade-',''));
 return item;
}
