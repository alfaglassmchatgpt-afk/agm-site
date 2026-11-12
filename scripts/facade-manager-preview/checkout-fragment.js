if(local){
 const endpoint='/local-preview/facade-order';
 const specs=new Map(store.all().filter(i=>i.type==='facade').map(i=>[i.id,i.data.config]));
 const positions=store.all().map(({type,title,summary,id})=>({type,title,summary,...(type==='facade'?{config:specs.get(id)}:{})}));
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,items:positions})});
 if(!response.ok)throw Error('Локальная проверка: '+await response.text());
 const html=await response.text();
 const old=dialog.querySelector('[data-manager-preview]');
 if(old){URL.revokeObjectURL(old.href);old.remove();}
 const link=el('a',positions.some(i=>i.type==='facade')?'Открыть заявку и ведомость для менеджера':'Открыть заявку для менеджера');
 link.href=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));link.target='_blank';link.rel='noopener';link.dataset.managerPreview='';
 feedback.textContent='Локальная заявка сформирована. ';
 feedback.after(link);return;
}
