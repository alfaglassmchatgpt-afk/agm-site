(async()=>{
 const form=document.querySelector('#tile-order'),error=document.querySelector('#tile-error'),button=form.querySelector('button');
 const sizes=['100x50','50x50','250x65','65x65'];let quote,id;
 function values(){const size=form.elements.size.value,packs=Number(form.elements.packs.value);if(!sizes.includes(size)||!Number.isInteger(packs)||packs<1||packs>499)throw Error('Выберите размер и целое количество пачек от 1 до 499.');const [width,height]=size.split('x').map(Number);return {size,packs,width,height,quantity:packs*20,area:width*height*packs*20/1000000};}
 const area=n=>n.toLocaleString('ru-RU',{maximumFractionDigits:4});
 function update(){try{const v=values();document.querySelector('#tile-total').textContent=v.packs+' пач. · '+v.quantity+' плиток · '+area(v.area)+' м²';error.textContent='';}catch(e){error.textContent=e.message;}}
 form.addEventListener('input',update);update();
 form.addEventListener('submit',e=>{e.preventDefault();try{
 const v=values();const entryId=id||crypto.randomUUID();
 const note='Зеркальная плитка с полированным фацетом по периметру. Ширину фацета согласовать.\nУпаковка: '+v.packs+' пач. по 20 шт.\nОбщая площадь без швов: '+area(v.area)+' м².';
 const data=AGMOrderModel.normalize({id:entryId,material:'zerkalo-serebro',base:'standard',thickness:'4',width:v.width,height:v.height,quantity:v.quantity,ops:['cut'],note},quote.materials,()=>entryId);
 if(!data)throw Error('Материал или толщина недоступны в каталоге.');
 const entry=AGMQuoteModel.material(data,quote.materials,quote.operations);if(entry.errors.length)throw Error(entry.errors.join(' '));
 entry.title='Зеркальная плитка с фацетом · Серебро';entry.data.tilePack={size:v.size,packs:v.packs};entry.preview={url:'/assets/tile-silver-pack.png',position:'center',size:'contain',alt:entry.title};entry.editUrl='/mirror-tiles.html?tile-edit='+encodeURIComponent(entryId);quote.store.put(entry);id=entryId;button.textContent='Сохранить изменения в расчёте';quote.open();
 }catch(e){error.textContent=e.message;}});
 try{quote=await AGMQuoteReady;const edit=new URLSearchParams(location.search).get('tile-edit');if(edit){const entry=quote.store.all().find(e=>e.id===edit&&e.data?.tilePack);if(entry){id=entry.id;form.elements.size.value=entry.data.tilePack.size;form.elements.packs.value=entry.data.tilePack.packs;update();}}
 button.disabled=false;button.textContent=id?'Сохранить изменения в расчёте':'Добавить в мой расчёт';}catch(e){error.textContent='Не удалось загрузить каталог: '+e.message;}
})();
