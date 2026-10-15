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
