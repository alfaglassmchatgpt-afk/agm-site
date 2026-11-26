export const edgeTypes=[{id:'none',name:'Без обработки'},{id:'polished',name:'Полированная кромка'},{id:'ground',name:'Шлифованная кромка'},{id:'blunted',name:'Притупление кромки'}];
export function edgeType(value){
 if(value==null||value==='')return 'none';
 if(value==='1067')return 'polished';
 if(value==='1062')return 'ground';
 return edgeTypes.some(x=>x.id===value)?value:null;
}
export function edgeService(value,glass){
 const type=edgeType(value);if(type===null)return {type:null,name:'Проверьте ранее выбранную обработку кромки',price:null};
 const name=edgeTypes.find(x=>x.id===type).name;if(type==='none')return {type,name,price:0};
 const code=type==='polished'?'1067':type==='ground'?'1062':null;
 const row=glass.items.find(x=>x.kind==='service'&&x.enabled&&(code?x.code===code:/^(притупление|затупление) кромки/i.test(x.name)));
 return {type,name,price:row&&Number.isSafeInteger(row.priceKopecks)&&row.priceKopecks>=0?row.priceKopecks/100:null};
}
// The same relation is used by the 3D editor (including linked copies of pairs).
export function syncLinkedFillings(items,choices,overrides={},change=null){
 if(change){choices[change.id]||={};choices[change.id][change.key]=change.value;}
 const groups=new Map();
 for(const item of items){const group=item.linkId||item.pairId;if(!group)continue;const list=groups.get(group)||[];list.push(item);groups.set(group,list);}
 for(const members of groups.values())for(const key of ['glass','edge']){
  const edited=change?.key===key&&members.some(i=>i.id===change.id)?change.id:null;
  const source=edited||members.find(i=>choices[i.id]?.[key]!==undefined)?.id;
  if(!source)continue;const value=choices[source][key];
  for(const item of members){choices[item.id]||={};if(choices[item.id][key]!==value){choices[item.id][key]=value;delete overrides[item.id+':'+key];if(key==='glass')delete overrides[item.id+':film'];}}
 }
 if(change){delete overrides[change.id+':'+change.key];if(change.key==='glass')delete overrides[change.id+':film'];}
 return choices;
}
