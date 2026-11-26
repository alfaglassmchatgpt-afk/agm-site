export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fillTypes=new Set(['glass','cutting','film','edge','bond','size-review']);
export function splitFacadeRows(result,items,selected){
 const item=items.find(i=>i.id===selected),frame=[],filling=[];
 if(!item||!result)return {frame,filling};
 for(const r of result.rows){
  if(r.id.startsWith(selected+':')){const name=r.name.startsWith(item.name+' · ')?r.name.slice(item.name.length+3):r.name;(fillTypes.has(r.id.slice(selected.length+1))?filling:frame).push({...r,name});}
  else if(r.id.startsWith('profile:')){
   const p=result.plans.find(p=>'profile:'+p.key===r.id);if(!p)continue;
   const weights=items.map(i=>({id:i.id,n:r.unit==='хлыст'&&p.complete?p.bars.reduce((n,b)=>n+b.parts.filter(x=>x.owner===i.id).reduce((a,x)=>a+x.length,0)/b.parts.reduce((a,x)=>a+x.length,0),0):p.parts.filter(x=>x.owner===i.id).reduce((n,x)=>n+x.length,0)})).filter(x=>x.n);
   const own=weights.find(x=>x.id===selected);if(!own)continue;const all=weights.reduce((n,x)=>n+x.n,0),share=own.n/all;
   // Allocate integer kopecks; the last facade receives the residual, so totals reconcile.
   let used=0,sum=null;for(let j=0;j<weights.length;j++){const amount=r.sum==null?null:j===weights.length-1?Math.round(r.sum*100)-used:Math.round(r.sum*100*weights[j].n/all);if(amount!=null)used+=amount;if(weights[j].id===selected)sum=amount==null?null:amount/100;}
   frame.push({...r,quantity:r.quantity*share,sum,note:r.note+(weights.length>1?' · Общая строка профиля: цена за единицу меняется для всех фасадов с этим профилем. Стоимость распределена по длинам деталей.':'')});
  }
 }
 return {frame,filling};
}
export function rowsTable(rows){return rows.length?'<div class="rf-price-scroll"><table><thead><tr><th>Позиция</th><th>Количество</th><th>Цена за единицу, ₽</th><th>Сумма, ₽</th><th></th></tr></thead><tbody>'+rows.map(r=>'<tr data-row="'+esc(r.id)+'"><td>'+esc(r.name)+'<small>'+esc(r.note)+'</small>'+(r.manual?'<small>Цена изменена вручную</small>':'')+'</td><td>'+Number(r.quantity.toFixed(4))+' '+esc(r.unit)+'</td><td><input data-price type="number" min="0" step="0.01" value="'+(r.price??'')+'" '+(r.excluded?'disabled':'')+'></td><td>'+(r.excluded?'Исключена':r.sum??'Не рассчитана')+'</td><td><button data-reset>Вернуть расчётную</button><label><input data-exclude type="checkbox" '+(r.excluded?'checked':'')+'> Исключить</label></td></tr>').join('')+'</tbody></table></div>':'<p>Нет позиций.</p>';}
