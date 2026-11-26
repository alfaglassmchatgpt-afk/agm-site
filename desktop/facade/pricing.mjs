// Monetary inputs are private data. This module contains no supplier prices.
export const money=n=>Math.round((n+Number.EPSILON)*100)/100;
const positive=(n,label,zero=false)=>{if(!Number.isFinite(n)||n<(zero?0:Number.MIN_VALUE))throw Error('Проверьте '+label);return n;};
export function purchase(usd,settings,discount){
 positive(usd,'цену USD',true);positive(settings.rate,'курс ЦБ');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(settings.date||''))throw Error('Укажите дату покупки');
 if(!Number.isFinite(discount)||discount<0||discount>1)throw Error('Проверьте скидку');
 return usd*settings.rate*(1+positive(settings.fxExtra,'надбавку к курсу',true))*(1-discount);
}
// Bounded exhaustive search; best feasible solution is retained if the limit is hit.
// No claim of optimality is made when the search budget is exhausted.
export function planCuts(parts,stocks,{kerf=4,trim=50,singleGrip=false,limit=60000}={}){
 positive(kerf,'пропил',true);positive(trim,'торцовку',true);
 const sorted=parts.map(p=>typeof p==='number'?{length:p}:p).sort((a,b)=>b.length-a.length);
 sorted.forEach(p=>positive(p.length,'длину детали'));
 stocks=stocks.map(s=>({...s,cost:positive(s.cost,'цену хлыста',true),length:positive(s.length,'длину хлыста'),trim:s.trim??trim}));
 const fits=(p,s)=>{if(!singleGrip)return p.length+kerf<=s.length-2*s.trim;
  if(!Number.isFinite(s.gripCenter)||!Number.isFinite(p.gripAt))return false;
  const start=s.gripCenter-p.gripAt;
  return start>=s.trim+kerf&&start+p.length+kerf<=s.length-s.trim&&p.gripAt>=125&&p.gripAt<=p.length-125;
 };
 if(sorted.some(p=>!stocks.some(s=>fits(p,s))))return {bars:[],complete:false,optimal:false,error:singleGrip?'Укажите положение заводского хвата и ручки на фасаде; проверьте длину хлыста':'Деталь не помещается ни в один доступный хлыст'};
 let best=null,nodes=0,exhausted=false;const memo=new Map();
 const score=bars=>({cost:bars.reduce((n,b)=>n+b.cost,0),waste:bars.reduce((n,b)=>n+b.remaining,0)});
 function visit(index,bars,cost){
  if(++nodes>limit){exhausted=true;return;}
  if(best&&cost>best.cost+1e-8)return;
  if(index===sorted.length){const s=score(bars);if(!best||s.cost<best.cost-1e-8||(Math.abs(s.cost-best.cost)<1e-8&&s.waste<best.waste))best={...s,bars:structuredClone(bars)};return;}
  const key=index+'|'+bars.map(b=>b.remaining).sort((a,b)=>a-b).join(',');
  if(memo.has(key)&&memo.get(key)<cost-1e-8)return;memo.set(key,cost);
  const p=sorted[index],used=new Set();
  if(!singleGrip)for(let j=0;j<bars.length;j++){const b=bars[j];if(b.remaining<p.length+kerf||used.has(b.remaining))continue;used.add(b.remaining);b.remaining-=p.length+kerf;b.parts.push(p);visit(index+1,bars,cost);b.parts.pop();b.remaining+=p.length+kerf;}
  for(const s of [...stocks].filter(s=>fits(p,s)).sort((a,b)=>a.cost-b.cost||a.length-b.length)){
   const b={...s,remaining:s.length-2*s.trim-p.length-kerf*(singleGrip?2:1),parts:[p]};
   if(singleGrip)b.start=s.gripCenter-p.gripAt;
   bars.push(b);visit(index+1,bars,cost+s.cost);bars.pop();
  }
 }
 // Fast complete seed prevents a search limit from losing a feasible plan.
 const seed=[];for(const p of sorted){let b=singleGrip?null:seed.filter(b=>b.remaining>=p.length+kerf).sort((a,b)=>a.remaining-b.remaining)[0];if(b){b.parts.push(p);b.remaining-=p.length+kerf;}else{const s=stocks.filter(s=>fits(p,s)).sort((a,b)=>a.cost-b.cost||a.length-b.length)[0];b={...s,remaining:s.length-2*s.trim-p.length-kerf*(singleGrip?2:1),parts:[p]};if(singleGrip)b.start=s.gripCenter-p.gripAt;seed.push(b);}}
 best={...score(seed),bars:structuredClone(seed)};visit(0,[],0);
 return {...best,cost:money(best.cost),complete:true,optimal:!exhausted,nodes};
}
export function priceRows(rows,overrides={}){
 return rows.map(r=>{const o=overrides[r.id]||{},manual=o.price!==undefined&&o.price!==null&&o.price!=='';
  const price=manual?positive(Number(o.price),'ручную цену',true):r.price;
  positive(r.quantity,'количество',true);if(price!=null)positive(price,'цену',true);
  return {...r,price:price==null?null:money(price),manual,excluded:o.excluded===true,sum:o.excluded?0:price==null?null:money(r.quantity*money(price))};
 });
}
export function totalRows(rows){const complete=rows.every(r=>r.excluded||r.sum!=null);return {complete,total:complete?money(rows.reduce((n,r)=>n+r.sum,0)):null,known:money(rows.reduce((n,r)=>n+(r.sum||0),0))};}
