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

export const retiredFillings=new Set(["tonirovannoe-steklo-blue__standard", "flutelite-s__standard", "krepi__bronze", "flutes-moru-bronze__standard", "flutes-moru-grey__standard", "raywall__standard", "zerkalo-gezella__standard", "moru-dark-grey__standard", "moru-dark-grey-mat__standard", "steklo-lacobel__standard", "steklo-matelak__standard", "tonirovannoe-v-masse-steklo-moru__standard"]);
export const suppliedHinges=[{"id": "hinge-5", "name": "Петли MF10 винты / суппорты / заглушки  в комплете"}, {"id": "hinge-7", "name": "Петли MF20"}, {"id": "hinge-11", "name": "SALICE AIR PUSH для MF20 совместно с врезным толкателем"}, {"id": "hinge-14", "name": "Петли MF50"}, {"id": "hinge-16", "name": "Петли MF70"}, {"id": "hinge-18", "name": "Петля MZF12 для MF10 / MF20"}, {"id": "hinge-21", "name": "Петля накладная MZF 60 для MZ01 / 02 / 07 / MF30"}, {"id": "hinge-23", "name": "Петля накладная MZF 63 для MZ01 / 02 / 07 / MF30"}, {"id": "hinge-25", "name": "Петля Накладная Hettich Sensys 8631i для MZ01 / 02 / 07 / MF30"}, {"id": "hinge-32", "name": "Blum 71T950A петля накладная clip top  для MZ01 / 02 / 07 / MF30"}, {"id": "hinge-34", "name": "Blum 70T950A.TL петля накладная clip top БЕЗ ПРУЖИНЫ для MZ01 / 02 / 07 / MF30 совместно с врезным толкателем"}];

export function hardwareSummary(c){
 const drilling=drillingTypes.find(t=>t.id===c.drillingType)?.name;
 const supply=suppliedHinges.find(t=>t.id===c.suppliedHinge)?.name;
 return [...(drilling?[drilling+'; количество: '+c.hinges.length]:[]),...(c.suppliedHinge?["Петли в комплекте: "+(supply?supply+'; количество: '+(c.suppliedHingeCount||0):'Без петель')]:[])];
}
export function installPublicHardware({state:s,allowed,change}){
 if(window.alfaDesktop)return ()=>{};
 const old=document.querySelector('#hinge'),section=old.closest('section');
 section.querySelector('h2').textContent='Присадки';old.closest('label').style.setProperty('display','none','important');
 const label=document.createElement('label');label.textContent='Под какую петлю';
 const select=document.createElement('select');select.id='drilling-type';label.append(select);section.querySelector('h2').after(label);
 const panel=document.createElement('section');panel.innerHTML='<h2>Петли</h2><label>Комплектация<select id="supplied-hinge"></select></label><label>Количество петель<input id="supplied-hinge-count" type="number" min="0" max="100" step="1" value="0"></label><p class="hint">Совместимость петель и присадки подтвердим при согласовании заказа.</p>';section.after(panel);
 const supply=panel.querySelector('select'),qty=panel.querySelector('input');
 supply.innerHTML='<option value="none">Без петель</option>'+suppliedHinges.map(t=>'<option value="'+t.id+'">'+t.name+'</option>').join('');
 const mapping=t=>t==='mf20'?'mf20':t==='cup35'?'cup':t==='blum'?(allowed().includes('blum')?'blum':'custom'):t==='none'?'none':'custom';
 function render(){
  const opts=allowed(),types=drillingTypes.filter(t=>opts.includes(mapping(t.id)));
  select.innerHTML='<option value="auto" disabled>По выбранной модели петли</option><option value="none">Без присадок</option>'+types.map(t=>'<option value="'+t.id+'">'+t.name+'</option>').join('')+(opts.includes('custom')?'<option value="custom">Другая петля — указать модель</option>':'');
  if(s.drillingType&&!types.some(t=>t.id===s.drillingType)&&!['none','custom','auto'].includes(s.drillingType))s.drillingType='auto';
  select.value=s.hinge==='none'?'none':s.drillingType||'auto';
  document.querySelector('#custom-hinge-wrap').hidden=s.hinge!=='custom'||(s.drillingType&&s.drillingType!=='custom'&&s.drillingType!=='auto');
  supply.value=s.suppliedHinge||'none';qty.value=s.suppliedHingeCount||0;qty.disabled=supply.value==='none';
 }
 select.onchange=()=>{const t=select.value;if(t==='auto')return;s.drillingType=t;s.hinge=mapping(t);s.customHinge=drillingTypes.find(x=>x.id===t)?.name||'';if(t==='none')s.hinges=[];else if(!s.hinges.length)s.hinges=[100,s.h-100];change();};
 supply.onchange=()=>{s.suppliedHinge=supply.value;s.suppliedHingeCount=supply.value==='none'?0:s.suppliedHingeCount||s.hinges.length||2;change();};
 qty.onchange=()=>{const n=Number(qty.value);if(!Number.isInteger(n)||n<1||n>100){qty.value=s.suppliedHingeCount||2;return;}s.suppliedHingeCount=n;change();};
 return render;
}
