// Service identities from the owner's nomenclature; rates stay in the private price data.
export const drillingTypes=[
 ['cup35','Присадка Ø35 мм для широкого алюминиевого профиля'],
 ['aero','Присадка под петлю АЭРО / AIR Soft Close 105°',true],
 ['aventos','Присадка под крепление AVENTOS HK-XS'],
 ['suspension','Присадка под навесы для зеркал в раме'],
 ['blum','Присадка под петлю BLUM Clip top'],
 ['fgv','Присадка под петлю FGV Omnia L'],
 ['harmony','Присадка под петлю HARMONY'],
 ['helios','Присадка под петлю HELIOS'],
 ['hettich8638','Присадка под петлю Hettich Sensys 8638'],
 ['makmart','Присадка под петлю MAKMART Корсо / Corso'],
 ['mf20','Присадка под петлю MODUS MF20',true],
 ['salice','Присадка под петлю Salice Air',true],
 ['secret','Присадка под петлю SECRET MAXI',true],
 ['sensys8661','Присадка под петлю Sensys 8661']
].map(([id,name,special=false])=>({id,name,special}));
export function drillingService(choice,config,rules){
 if(choice.drillingType==='none')return {name:'Без присадок',quantity:0,price:0};
 const type=drillingTypes.find(t=>t.id===choice.drillingType);
 const quantity=choice.drillingQuantity??config.hinges.length;
 if(!Number.isInteger(quantity)||quantity<0||quantity>100)throw Error('Количество присадок: целое число от 0 до 100');
 if(choice.drillingType&&choice.drillingType!=='auto'&&!type)throw Error('Неизвестный тип присадки');
 const special=type?type.special:choice.specialDrilling||config.hinge==='mf20';
 return {name:type?.name||'Присадка под петли',quantity,price:special?rules.specialDrilling:rules.drilling};
}
