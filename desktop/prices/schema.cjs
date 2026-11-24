function validate(d){
 if(!d||d.schemaVersion!==1||d.currency!=='RUB'||!Array.isArray(d.items)||d.items.length>5000||!/^\d{4}-\d{2}-\d{2}$/.test(d.effectiveDate))throw Error('Неверный формат прайса');
 const codes=new Set();for(const r of d.items){if(!r||typeof r.code!=='string'||!r.code||codes.has(r.code)||typeof r.name!=='string'||!r.name.trim()||typeof r.group!=='string'||!['material','service','rule'].includes(r.kind)||typeof r.unit!=='string'||typeof r.enabled!=='boolean'||(r.priceKopecks!==null&&(!Number.isSafeInteger(r.priceKopecks)||r.priceKopecks<0||r.priceKopecks>1e11)))throw Error('Проверьте код, название и цену позиции');codes.add(r.code);}return d;
}module.exports={validate};
