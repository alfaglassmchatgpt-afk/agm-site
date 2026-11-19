(async()=>{
 const form=document.querySelector('#tile-order'),error=document.querySelector('#tile-error'),button=form.querySelector('[type=submit]'),dialog=document.querySelector('#tile-dialog');
 const sizes=['100x50','50x50','250x65','65x65'];let quote,id,color='silver';
 const finishes={silver:{title:'Серебро',material:'zerkalo-serebro',base:'standard'},bronze:{title:'Бронза',material:'tonirovannye-zerkala',base:'tint_bronze'},graphite:{title:'Графит',material:'tonirovannye-zerkala',base:'tint_grey'}};
 function selectColor(value){if(!Object.hasOwn(finishes,value))throw Error('Неизвестный оттенок плитки.');color=value;document.querySelector('#tile-dialog-title').textContent='Ваш комплект · '+finishes[color].title;}
 function values(){const size=form.elements.size.value,packs=Number(form.elements.packs.value);if(!sizes.includes(size)||!Number.isInteger(packs)||packs<1||packs>499)throw Error('Выберите размер и целое количество пачек от 1 до 499.');const [width,height]=size.split('x').map(Number);return {size,packs,width,height,quantity:packs*20,area:width*height*packs*20/1000000};}
 const area=n=>n.toLocaleString('ru-RU',{maximumFractionDigits:4});
 function update(){try{const v=values();document.querySelector('#tile-total').textContent=v.packs+' пач. · '+v.quantity+' плиток · '+area(v.area)+' м²';error.textContent='';}catch(e){error.textContent=e.message;}}
 function selectKind(kind,selected){const choices=kind==='square'?['50x50','65x65']:['100x50','250x65'];form.elements.size.replaceChildren(...choices.map(s=>new Option(s.replace('x',' × ')+' мм',s)));form.elements.size.value=selected||choices[0];}
 document.querySelector('[data-tile-close]').onclick=()=>dialog.close();
 document.querySelectorAll('[data-tile-kind]').forEach(b=>b.onclick=()=>{id=undefined;selectColor(b.dataset.tileColor||'silver');selectKind(b.dataset.tileKind);form.elements.packs.value=1;button.textContent='Добавить в мой расчёт';update();dialog.showModal();});
 form.addEventListener('input',update);selectKind('rectangle');update();
 form.addEventListener('submit',e=>{e.preventDefault();try{
 const v=values();const entryId=id||crypto.randomUUID();
 const note='Зеркальная плитка с полированным фацетом по периметру ≈ 5 мм.\nУпаковка: '+v.packs+' пач. по 20 шт.\nОбщая площадь без швов: '+area(v.area)+' м².';
 const data=AGMOrderModel.normalize({id:entryId,material:finishes[color].material,base:finishes[color].base,thickness:'4',width:v.width,height:v.height,quantity:v.quantity,ops:['cut'],note},quote.materials,()=>entryId);
 if(!data)throw Error('Материал или толщина недоступны в каталоге.');
 const entry=AGMQuoteModel.material(data,quote.materials,quote.operations);if(entry.errors.length)throw Error(entry.errors.join(' '));
 entry.title='Зеркальная плитка с фацетом · '+finishes[color].title;entry.data.tilePack={size:v.size,packs:v.packs,color};entry.preview={url:'/assets/tile-'+color+'-'+(v.width===v.height?'square':'rect')+'-reflection.png',position:'center',size:'contain',alt:entry.title};entry.editUrl='/mirror-tiles.html?tile-edit='+encodeURIComponent(entryId);quote.store.put(entry);id=entryId;button.textContent='Сохранить изменения в расчёте';dialog.close();quote.open();
 }catch(e){error.textContent=e.message;}});
 try{quote=await AGMQuoteReady;const edit=new URLSearchParams(location.search).get('tile-edit');if(edit){const entry=quote.store.all().find(e=>e.id===edit&&e.data?.tilePack);if(entry){id=entry.id;selectColor(entry.data.tilePack.color||'silver');selectKind(['50x50','65x65'].includes(entry.data.tilePack.size)?'square':'rectangle',entry.data.tilePack.size);form.elements.packs.value=entry.data.tilePack.packs;update();dialog.showModal();}}
 button.disabled=false;button.textContent=id?'Сохранить изменения в расчёте':'Добавить в мой расчёт';}catch(e){error.textContent='Не удалось загрузить каталог: '+e.message;}
})();
