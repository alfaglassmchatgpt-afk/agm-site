(function(root,factory){const model=factory();if(typeof module==='object'&&module.exports)module.exports=model;else root.AGMOrderModel=model;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clean=(v,n=500)=>typeof v==='string'?v.slice(0,n):'';
  const widths=['5','10','15','20','25','30','35'];
  const thicknesses=(m,base)=>m.variantThicknesses?.[base]||m.thicknesses;
  const operations=(m,thickness)=>m.operations.filter(op=>!m.operationThicknesses?.[op]||m.operationThicknesses[op].includes(String(thickness)));
  function normalize(i,materials,newId){
    if(!i||typeof i!=='object')return null;
    // Import the former mirror-only cart without touching its original storage key.
    let material=i.material||(typeof i.base==='string'&&i.base.startsWith('tint_')?'tonirovannye-zerkala':'zerkalo-serebro');
    if(material==='tonirovannye-zerkala'&&i.base==='tint_silver'){material='zerkalo-serebro';i={...i,base:'standard'};}
    if(!Object.prototype.hasOwnProperty.call(materials,material))return null;
    const m=materials[material];
    if(!Object.prototype.hasOwnProperty.call(m.variants,i.base)||!thicknesses(m,i.base).includes(String(i.thickness)))return null;
    const hole=h=>({diameter:clean(h?.diameter,12),count:typeof h?.count==='string'?clean(h.count,5):'1',unknown:!!h?.unknown});
    let ops=Array.isArray(i.ops)?[...new Set(i.ops.map(x=>m.policy==='craft'&&['craft_holes','craft_cutouts'].includes(x)?'drill':x==='frame'&&m.operations.includes('facade')?'facade':x).filter(x=>operations(m,i.thickness).includes(x)))]:[];
    if(ops.includes('polish')&&ops.includes('grind'))ops=ops.filter(x=>x!=='grind');
    return {id:clean(i.id,100)||newId(),material,base:i.base,thickness:String(i.thickness),width:clean(String(i.width||''),12),height:clean(String(i.height||''),12),quantity:clean(String(i.quantity??'1'),5),unknown:!!i.unknown,ops,packaging:!!i.packaging,note:clean(i.note,2000),bevel:{width:widths.includes(i.bevel?.width)?i.bevel.width:'',scope:i.bevel?.scope==='sides'?'sides':'all',sides:clean(i.bevel?.sides)},drill:{rows:Array.isArray(i.drill?.rows)&&i.drill.rows.length?i.drill.rows.slice(0,20).map(hole):[hole({})],location:clean(i.drill?.location,1000)}};
  }
  const wholeMillimetres=v=>Number.isInteger(Number(v))&&Number(v)>=1;
  const fitsFormat=(i,m)=>!m.maxSize||(!i.unknown&&wholeMillimetres(i.width)&&wholeMillimetres(i.height)&&Number(i.width)<=m.maxSize.width&&Number(i.height)<=m.maxSize.height);
  return {normalize,thicknesses,operations,wholeMillimetres,fitsFormat};
});
