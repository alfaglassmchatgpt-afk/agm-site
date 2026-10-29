(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AGMQuoteStore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const prefix='agm-quote-v1:', types=['material','mirror','facade','partition'];
 const clone=x=>JSON.parse(JSON.stringify(x));
 function create(storage,notify=()=>{}){
  const key=(type,id)=>prefix+type+':'+encodeURIComponent(id);
  function all(){
   const items=[];
   for(let n=0;n<storage.length;n++){
    const k=storage.key(n);if(!k.startsWith(prefix))continue;
    const value=JSON.parse(storage.getItem(k));
    if(value.version!==1||!types.includes(value.type)||typeof value.id!=='string')throw Error('Не удалось прочитать сохранённый расчёт. Не очищайте данные браузера.');
    items.push(value);
   }
   return items.sort((a,b)=>a.created-b.created||a.id.localeCompare(b.id));
  }
  function put(entry){
   if(!types.includes(entry.type)||!entry.id||typeof entry.summary!=='string'||!Array.isArray(entry.errors))throw Error('Некорректная позиция расчёта.');
   const k=key(entry.type,entry.id),old=storage.getItem(k);
   storage.setItem(k,JSON.stringify({...clone(entry),version:1,created:old?JSON.parse(old).created:Date.now()}));notify();
  }
  function remove(type,id){storage.removeItem(key(type,id));notify();}
  // Only write edited entries. Another page/tab cannot overwrite unrelated positions.
  function sync(entries,previous=[]){
   const before=new Map(previous.map(e=>[e.type+':'+e.id,e]));
   for(const e of entries)if(JSON.stringify(e)!==JSON.stringify(before.get(e.type+':'+e.id)))put(e);
   for(const e of previous)if(!entries.some(x=>x.type===e.type&&x.id===e.id))remove(e.type,e.id);
   return clone(entries);
  }
  function migrate(name,entries){
   const marker='agm-quote-migrated:'+name;if(storage.getItem(marker))return;
   const current=all();for(const entry of entries)if(!current.some(e=>e.type===entry.type&&e.id===entry.id))put(entry);
   storage.setItem(marker,'1');
  }
  function payload(){
   const items=all();if(!items.length)throw Error('Добавьте хотя бы одно изделие.');
   const invalid=items.find(i=>i.errors.length);if(invalid)throw Error(invalid.title+': '+invalid.errors[0]);
   return items.map(({type,title,summary})=>({type,title,summary}));
  }
  return {all,put,remove,sync,migrate,payload};
 }
 return {create,prefix,types};
});
