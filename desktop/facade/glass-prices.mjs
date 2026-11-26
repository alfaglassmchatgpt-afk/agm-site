export function refreshGlassPrices(current,latest){
 const glass=latest?.glass;
 if(!glass||glass.schemaVersion!==1||glass.currency!=='RUB'||!Array.isArray(glass.items))throw Error('Неверный локальный прайс стекла');
 const valid=new Set(glass.items.filter(x=>x.kind==='material'&&x.enabled&&x.thicknessMm===4&&x.unit==='м2'&&Number.isSafeInteger(x.priceKopecks)&&x.priceKopecks>=0).map(x=>x.code));
 const materialMap=Object.fromEntries(Object.entries(latest.materialMap||{}).filter(([,code])=>valid.has(code)));
 return {...current,glass:structuredClone(glass),materialMap,materialMapRevision:latest.materialMapRevision};
}
export function fillMissingGlassMappings(saved,latest){
 // Attach new identities to unchanged historical rates; never silently reprice an order.
 if(saved.glass?.revision!==latest.glass?.revision||saved.glass?.sourceSha256!==latest.glass?.sourceSha256)return saved;
 const refreshed=refreshGlassPrices(saved,latest);
 return {...saved,materialMap:{...refreshed.materialMap,...saved.materialMap}};
}
