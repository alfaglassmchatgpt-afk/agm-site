document.addEventListener('DOMContentLoaded', async () => {
  'use strict';
  const root=document.querySelector('#triplex-builder');
  if(!root)return;
  const quote=await window.AGMQuoteReady;
  if(!quote)return;
  const assets=root.dataset.assets;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const glass=[
    ['flutes-moru-ultra','МОРУ осветлённое','moru-ultra-sample-v1.png'],
    ['float-steklo-clear-m1','Прозрачное','clear-m1-4mm-v2.png'],
    ['steklo-osvetlyonnoe-clearvision','Осветлённое','clear-extra-clear-4mm-v2.png'],
    ['tonirovannoe-steklo-grey','Серое','tinted-grey-v1.png'],
    ['steklo-matovoe-osvetlyonnoe','Матовое осветлённое','matte-lowiron-4mm-v1.png'],
    ['flutes-moru-bronze','МОРУ бронза','moru-bronze-v1.png']
  ].filter(([id])=>quote.materials[id]?.operations.includes('laminate')).map(([id,name,img])=>({id,name,img:'agm-glass/assets/generated/'+img,thicknesses:quote.materials[id].thicknesses.filter(t=>Number(t)>=4)}));
  const woods=[['oak','Светлый дуб'],['walnut','Орех'],['cherry','Вишня'],['ebony','Эбен'],['zebrano','Зебрано']];
  const colors=[['Голубой','#79bccb'],['Чёрный','#20262b'],['Оранжевый','#e59732'],['Фиолетовый','#794193'],['Зелёный','#138349'],['Голубой джейд','#278b9c'],['Серый','#8b8b7d'],['Бронза','#a08557'],['Синий','#1859a2'],['Голубой прозрачный','#46a9bd'],['Тёмно-серый','#414946'],['Жёлтый','#e7cc2c'],['Светло-зелёный','#9bbf57'],['Красный','#be2636'],['Фуксия','#ae2d78']];
  const kinds=[['clear','Прозрачное'],['color','Цветное'],['matte','Матовое'],['mesh','Металлическая сетка'],['wood','Шпон']];
  let layers=[{glass:glass[0].id,thickness:'4'},{fill:'clear',value:''},{glass:'float-steklo-clear-m1',thickness:'4'}],active=0;
  const form=root.querySelector('form'),status=root.querySelector('.tb-status');
  const spec=i=>glass.find(g=>g.id===i.glass);
  function fillName(i){return i.fill==='clear'?'Прозрачная EVA-плёнка':i.fill==='color'?'EVA-плёнка · '+i.value:i.fill==='matte'?'Матовый эффект · по образцу':i.fill==='mesh'?'Сетка · '+i.value:'Шпон · '+(woods.find(w=>w[0]===i.value)?.[1]||'выбрать');}
  function name(i){return i.glass?spec(i).name+' · '+i.thickness+' мм':fillName(i);}
  function thumbnail(i){
    let img=i.glass?spec(i).img:i.fill==='wood'?'agm-landings/assets/triplex-veneer-'+i.value+'-v1.png':null;
    if(img)return '<span class="tb-thumb"><img src="'+esc(assets+img)+'" alt="'+esc(name(i))+'" loading="lazy"></span>';
    const color=i.fill==='color'?(colors.find(c=>c[0]===i.value)?.[1]||'#79bccb'):i.fill==='matte'?'#cfd5d3':'';
    return '<span class="tb-thumb"><span class="tb-filling '+(i.fill==='mesh'?'mesh':'')+'"'+(color?' style="background:'+color+'"':'')+'></span></span>';
  }
  function render(){
    root.querySelector('.tb-layers').innerHTML=layers.map((i,n)=>'<div class="tb-layer"><button type="button" class="tb-layer-choice" data-layer="'+n+'" aria-pressed="'+(n===active)+'"><small>'+ (i.glass?(n/2+1)+'. Стекло':'Между стёклами')+'</small>'+thumbnail(i)+'<strong>'+esc(name(i))+'</strong><em>Изменить ↗</em></button>'+(i.glass&&n>2?'<button type="button" class="tb-remove" data-remove="'+n+'">Убрать стекло и наполнение</button>':'')+'</div>').join('');
    root.querySelector('.tb-composition').innerHTML=layers.map(i=>'<div class="'+(i.glass?'':'tb-inter')+'">'+(i.glass?'<span class="tb-dot"></span>':'↳ ')+esc(name(i))+'</div>').join('');
    const sum=layers.filter(i=>i.glass).reduce((a,i)=>a+Number(i.thickness),0);
    root.querySelector('.tb-thickness').textContent='Стёкла: '+sum+' мм + наполнение. Итоговую толщину уточним.';
    const i=layers[active];
    root.querySelector('#tb-picker-title').textContent=i.glass?'Выберите стекло № '+(active/2+1):'Что будет между стёклами?';
    root.querySelector('.tb-options').innerHTML=i.glass?glass.map(g=>'<button type="button" class="tb-option" data-glass="'+g.id+'" aria-pressed="'+(g.id===i.glass)+'">'+thumbnail({glass:g.id,thickness:g.thicknesses[0]})+'<strong>'+esc(g.name)+'</strong></button>').join(''):kinds.map(([id,title])=>'<button type="button" class="tb-option" data-fill="'+id+'" aria-pressed="'+(id===i.fill)+'">'+thumbnail({fill:id,value:id==='wood'?'oak':id==='mesh'?'Латунь':id==='color'?'Зелёный':''})+'<strong>'+title+'</strong></button>').join('');
    const options=i.glass?spec(i).thicknesses.map(v=>[v,v+' мм']):i.fill==='wood'?woods:i.fill==='color'?colors.map(([v])=>[v,v]):i.fill==='mesh'?['Латунь','Медь','Нержавейка'].map(v=>[v,v]):[];
    root.querySelector('.tb-extra').innerHTML=(options.length?'<span>'+(i.glass?'Толщина:':i.fill==='wood'?'Порода:':i.fill==='mesh'?'Металл:':'Цвет:')+'</span>':'')+options.map(([v,label])=>'<button type="button" class="tb-chip" data-value="'+esc(v)+'" aria-pressed="'+(v===(i.glass?i.thickness:i.value))+'">'+esc(label)+'</button>').join('')+(!i.glass&&['wood','mesh'].includes(i.fill)?'<p class="tb-footnote">Необходимые склеивающие EVA-плёнки учитываются с обеих сторон включения.</p>':'');
  }
  root.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-layer'))active=Number(b.dataset.layer);
    else if(b.hasAttribute('data-remove')){layers.splice(Number(b.dataset.remove)-1,2);active=0;}
    else if(b.dataset.glass){const g=glass.find(g=>g.id===b.dataset.glass);layers[active]={glass:g.id,thickness:g.thicknesses.includes(layers[active].thickness)?layers[active].thickness:g.thicknesses[0]};}
    else if(b.dataset.fill)layers[active]={fill:b.dataset.fill,value:({wood:'oak',mesh:'Латунь',color:'Зелёный'})[b.dataset.fill]||''};
    else if(b.hasAttribute('data-value'))layers[active][layers[active].glass?'thickness':'value']=b.dataset.value;
    else if(b.classList.contains('tb-add')){layers.push({fill:'clear',value:''},{glass:'float-steklo-clear-m1',thickness:'4'});active=layers.length-1;}
    else if(b.dataset.preset){const p=b.dataset.preset;layers=[{glass:p==='moru'?glass[0].id:'steklo-osvetlyonnoe-clearvision',thickness:'4'},{fill:p==='mesh'?'mesh':p==='color'?'color':p==='wood'?'wood':'clear',value:p==='mesh'?'Латунь':p==='color'?'Зелёный':p==='wood'?'oak':''},{glass:p==='moru'?'tonirovannoe-steklo-grey':'float-steklo-clear-m1',thickness:'4'}];active=1;}
    else return;
    status.textContent='';render();
    if(b.classList.contains('tb-add'))root.querySelector('[data-layer="'+active+'"]').scrollIntoView({block:'nearest',inline:'nearest'});
  });
  form.elements.unknown.addEventListener('change',()=>{['width','height'].forEach(k=>{form.elements[k].disabled=form.elements.unknown.checked;form.elements[k].required=!form.elements.unknown.checked;});});
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const composition=layers.map(name).join(' / ');
    const note='Состав триплекса: '+composition+'\nНазначение: '+form.elements.purpose.value+'\nСостав и итоговая толщина требуют согласования.'+(layers.some(i=>['wood','mesh'].includes(i.fill))?' Включения с EVA-плёнкой с обеих сторон.':'')+(form.elements.note.value?'\nПожелания: '+form.elements.note.value:'');
    if(note.length>2000){status.textContent='Состав слишком длинный для одной позиции. Разделите его на несколько заявок на согласование.';return;}
    const item=AGMOrderModel.normalize({id:crypto.randomUUID(),material:'dekorativnyy-triplex',base:'custom',thickness:'unknown',width:form.elements.width.value,height:form.elements.height.value,quantity:form.elements.quantity.value,unknown:form.elements.unknown.checked,ops:[],note},quote.materials,()=>crypto.randomUUID());
    const entry=AGMQuoteModel.material(item,quote.materials,quote.operations);
    if(entry.errors.length){status.textContent=entry.errors[0];return;}
    entry.editUrl='/triplex/?quote-edit='+encodeURIComponent(item.id);
    try{quote.store.put(entry);document.dispatchEvent(new CustomEvent('agm:quote-editors-refresh'));status.textContent='Добавлено. Можно собрать ещё одно сочетание.';quote.open();}catch(err){status.textContent='Не удалось сохранить: '+err.message;}
  });
  render();root.hidden=false;
  // Keep the existing editor and its logic available for stored positions and fallback.
  const legacy=document.querySelector('#material-request');
  if(!new URLSearchParams(location.search).has('quote-edit')){
    if(legacy)legacy.hidden=true;
    document.querySelectorAll('a[href="#material-request"],a[href$="/triplex/#material-request"]').forEach(a=>{a.href='#triplex-builder';});
    if(location.hash==='#material-request')root.scrollIntoView();
  }
});
