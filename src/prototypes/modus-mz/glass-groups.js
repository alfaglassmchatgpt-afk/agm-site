export const glassGroups=['Стекло','Рифлёное стекло','Узорчатое стекло','Окрашенное стекло','Зеркала','Состаренные зеркала'];
const flat=new Set(['moru-bronze-mat','moru-grey-mat','moru-dark-grey-mat','moru-grey','moru-dark-grey','moru-bronze']);
const patterned=new Set(['diamant','hithicross','gothic','silvit','kathedral-klein','monumental-atlantic','krepi','kathedralaqualite','krezet']);
export function glassGroup(item){
 if(item.slug.startsWith('sostarenn'))return 5;
 if(item.mirror)return 4;
 if(flat.has(item.slug))return 0;
 if(patterned.has(item.slug))return 2;
 return 1;
}
// Informational placeholders only: these materials have no confirmed 4 mm entry in the snapshot.
export const pendingGlass=[
 {group:0,title:'М1',slug:'float-steklo-clear-m1'},
 {group:0,title:'Осветлённое Clearvision / Optiwhite',slug:'steklo-osvetlyonnoe-clearvision'},
 {group:0,title:'Ультраосветлённое Crystalvision',slug:'steklo-kristalvizhn-crystalvision'},
 {group:0,title:'Матовое Matelux',slug:'steklo-matovoe-matelux'},
 {group:0,title:'Стопсол',slug:'steklo-solnczezashhitnoe-stopsol'},
 {group:0,title:'Дихроичное стекло',slug:'dihroichnoe-steklo'},
 {group:3,title:'Lacobel',slug:'steklo-lacobel'},
 {group:3,title:'Matelac',slug:'steklo-matelak'}
];
