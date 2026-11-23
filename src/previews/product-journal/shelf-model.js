(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.AGMShelfModel = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const presets = globalThis.AGMCatalogProduct ? Object.fromEntries(globalThis.AGMCatalogProduct.items.map(i=>[i.id,i.preset])) : {
    clear: {material: 'float-steklo-clear-m1', shape: 'rectangle'},
    ultra: {material: 'steklo-osvetlyonnoe-clearvision', shape: 'rectangle', radii: [20,20,20,20]},
    bronze: {material: 'moru-bronze', shape: 'quarter', diameter: 800},
    grey: {material: 'tonirovannoe-steklo-grey', shape: 'trapezoid'},
    black: {material: 'tonirovannoe-steklo-black', shape: 'semicircle', diameter: 400},
    satin: {material: 'steklo-matovoe-matelux', shape: 'rectangle', radii: [0,0,20,20]}
  };
  const shapes = {rectangle:'Прямоугольник', ellipse:'Овал', arch:'Арка', circle:'Круг', semicircle:'Полукруг', quarter:'Четверть круга', trapezoid:'Трапеция'};
  function dimensions(s) {
    if (s.shape === 'circle') return [s.diameter,s.diameter];
    if (s.shape === 'semicircle') return [s.diameter,s.diameter/2];
    if (s.shape === 'quarter') return [s.diameter/2,s.diameter/2];
    return [s.width,s.height];
  }

  function cornerIndices(s) {
    if(['circle','ellipse','arch'].includes(s.shape)) return [];
    if(s.shape==='semicircle') return [0,1];
    if(s.shape==='quarter') return [0,1,3];
    return [0,1,2,3];
  }
  function radiusLimit(s) {
    const [w,h]=dimensions(s);
    if(s.shape==='circle') return 0;
    if(s.shape==='quarter'||s.shape==='semicircle') return Math.max(0,Math.floor(h/5));
    if(s.shape==='trapezoid'){
      const inset=(w-s.topWidth)/2, side=Math.hypot(inset,h);
      const cot=(side+inset)/Math.max(1,h);
      return Math.max(0,Math.floor(Math.min(s.topWidth/(2*cot),h/2,side/(cot+1/cot))-1));
    }
    return Math.max(0,Math.floor((Math.min(w,h)-1)/2));
  }

  function straight(s) { return s.shape==='rectangle' && (s.radii||[]).every(r=>Number(r)===0); }
  function availableOperations(s, material, orderModel) {
    return orderModel.operations(material,s.thickness).filter(op=>['polish','grind','bevel','drill'].includes(op) && (op!=='bevel'||straight(s)));
  }
  function validate(s, material, orderModel) {
    const errors = [];
    if (!material) return ['Материал отсутствует в каталоге.'];
    if (!shapes[s.shape]) return ['Выберите форму изделия.'];
    if(s.shape==='arch' && s.height<s.width/2) errors.push('Для арки высота должна быть не меньше половины ширины.');
    const [w,h] = dimensions(s);
    if (![w,h].every(v=>Number.isInteger(v)&&v>0)) errors.push('Размеры должны быть целыми положительными миллиметрами. Для полукруга и четверти круга задайте чётный диаметр.');
    if(s.productKind==='mirror'){
      if(['rectangle','circle'].includes(s.shape)?(w<300||h<300):(Math.min(w,h)<600 || Math.max(w,h)<800)) errors.push('Прямоугольное зеркало — от 300 × 300 мм; овал и арка — от 800 × 600 мм, круг — от Ø 300 мм.');
    } else if (s.shape === 'circle') {
      if (s.diameter<300) errors.push('Минимальный диаметр круглой полки — 300 мм.');
    } else if (Math.min(w,h)<180 || Math.max(w,h)<400) errors.push('Минимальные габариты полки — 180 × 400 мм, с поворотом.');
    const max = material.maxSize || {width:10000,height:10000};
    if (Math.min(w,h)>Math.min(max.width,max.height)||Math.max(w,h)>Math.max(max.width,max.height)) errors.push('Размер превышает формат материала.');
    const minQuantity=s.productKind==='mirror'?1:3;
    if (!Number.isInteger(s.quantity)||s.quantity<minQuantity||s.quantity>9999) errors.push('Количество — от '+minQuantity+' до 9999 штук.');
    if (!orderModel.thicknesses(material,s.base||'standard').includes(s.thickness)) errors.push('Толщина недоступна в каталоге материала.');
    if (cornerIndices(s).length && (s.radii.length!==4 || cornerIndices(s).some(i=>!Number.isInteger(s.radii[i])||s.radii[i]<0||s.radii[i]>radiusLimit(s)))) errors.push('Радиусы углов — от 0 до '+radiusLimit(s)+' мм. 0 означает угол без скругления.');
    if (s.shape==='trapezoid' && (!Number.isInteger(s.topWidth)||s.topWidth<1||s.topWidth>s.width)) errors.push('Верхнее основание трапеции должно быть от 1 мм до ширины нижнего.');
    if(s.productKind==='mirror' && (s.ops||[]).some(op=>!availableOperations(s,material,orderModel).includes(op))) errors.push('Обработка недоступна для формы или материала.');
    if (![straight(s)?'cut':'shape',...(s.ops||['polish'])].every(op=>orderModel.operations(material,s.thickness).includes(op))) errors.push('Обработка недоступна для выбранного материала.');
    return errors;
  }
  return {presets,shapes,dimensions,cornerIndices,radiusLimit,straight,availableOperations,validate};
});
