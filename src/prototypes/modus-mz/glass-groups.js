export const glassGroups=['Стекло','Рифлёное стекло','Узорчатое стекло','Окрашенное стекло','Зеркала','Состаренные зеркала'];
const flat=new Set(['moru-bronze-mat','moru-grey-mat','moru-dark-grey-mat','moru-grey','moru-dark-grey','moru-bronze']);
const patterned=new Set(['diamant','hithicross','gothic','silvit','kathedral-klein','monumental-atlantic','krepi','kathedralaqualite','krezet']);
export function glassGroup(item){
 if(item.slug.startsWith('sostarenn'))return 5;
 if(['steklo-lacobel','steklo-matelak'].includes(item.slug))return 3;
 if(item.mirror)return 4;
 if(flat.has(item.slug)||['float-steklo-clear-m1','steklo-kristalvizhn-crystalvision','steklo-matovoe-matelux','steklo-solnczezashhitnoe-stopsol','dihroichnoe-steklo'].includes(item.slug))return 0;
 if(patterned.has(item.slug))return 2;
 return 1;
}
export const pendingGlass=[];

// Owner-approved first category; other memberships remain provisional.
export const transparentSlugs=["float-steklo-clear-m1", "steklo-kristalvizhn-crystalvision", "moru-bronze", "tonirovannoe-steklo-grey", "tonirovannoe-steklo-black", "tonirovannoe-steklo-green", "tonirovannoe-steklo-blue"];
export function transparentItems(items){return transparentSlugs.map(slug=>items.find(i=>i.slug===slug)).filter(Boolean);}

export const matteSlugs=["steklo-matovoe-matelux", "steklo-matovoe-osvetlyonnoe", "moru-bronze-mat", "moru-grey-mat", "moru-dark-grey-mat"];
export function matteItems(items){return matteSlugs.map(slug=>items.find(i=>i.slug===slug)).filter(Boolean);}

export const stopsolSlugs=["steklo-solnczezashhitnoe-stopsol", "stopsol-phoenix-bronze", "stopsol-phoenix-gray"];
export function stopsolItems(items){return stopsolSlugs.map(slug=>items.find(i=>i.slug===slug)).filter(Boolean);}

export const reedSlugs=["estriado", "estriado-crystal", "estriado-ultra", "flutelite-s", "flutes-moru-ultra-mat", "moru-magnetron-bronze", "moru-magnetron-grey", "moru-bronze-toned", "moru-grey", "raywall90", "vison-sun", "riflenoe-steklo-flutes", "moru-crystal", "moru-ultra"];
export function reedItems(items){return reedSlugs.map(slug=>items.find(i=>i.slug===slug)).filter(Boolean);}

export const patternedSlugs=["kathedral-klein", "krezet", "diamant", "gothic", "hithicross", "kathedralaqualite", "krepi", "monumental-atlantic", "silvit"];
export function patternedItems(items){return patternedSlugs.map(slug=>items.find(i=>i.slug===slug)).filter(Boolean);}
