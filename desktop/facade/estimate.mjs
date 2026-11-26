import {edgeService,syncLinkedFillings} from './filling.mjs';
import {drillingService} from './drilling.mjs';
import {profiles,glassCut} from './data.js';
import {purchase,planCuts,priceRows,totalRows,money} from './pricing.mjs';
export function estimate(items,catalog,settings,overrides={},choices={}){
 choices=syncLinkedFillings(items,structuredClone(choices));
 const rows=[],plans=[],warnings=[],groups=new Map(),rules=catalog.rules;
 const add=(id,name,quantity,unit,price,note='')=>rows.push({id,name,quantity,unit,price,note});
 const find=id=>catalog.items.find(x=>x.id===id);
 const stockCost=x=>purchase(x.usd,settings,x.discount??rules.discount);
 const service=code=>catalog.glass.items.find(x=>x.code===code&&x.enabled)?.priceKopecks/100;
 const rate=code=>Number.isFinite(service(code))?service(code):null;
 function rail(article,color,parts,owner,whole=false,single=false){const key=article+'|'+color;const g=groups.get(key)||{article,color,parts:[],whole,single};g.parts.push(...parts.map(length=>({length,owner,gripAt:choices[owner]?.gripAt??length/2})));groups.set(key,g);}
 for(const item of items){const c=item.config,p=profiles.find(p=>p.id===c.profile),prefix=item.id,choice=choices[prefix]||{},base=p.baseId||p.id,article=p.series==='MZ'?'MZ'+base:base;
  if(p.baseId){rail(article,c.color,[c.w-(p.b-p.baseWidth),c.w-(p.b-p.baseWidth),c.h],prefix);rail(p.id,c.color,[c.h],prefix,true,!!p.gripLength);}
  else if(p.id==='13'&&c.handle){const span=Math.min(250,c.h-80),end=(c.h-span)/2;rail(article,c.color,[c.w,c.w,c.h,end,end],prefix);rail('MZ13-01',c.color,[span],prefix,true);}
  else rail(article,c.color,[c.w,c.w,c.h,c.h],prefix);
  const cut=glassCut(c),area=cut.width*cut.height/1e6,perimeter=2*(cut.width+cut.height)/1000;
  const cornerId=p.series==='MF-20'?'facade-44':p.series==='MF-30'?'facade-89':p.b<20?'facade-257':'facade-256',corner=find(cornerId);
  add(prefix+':corner',item.name+' · '+(corner?.name||'Уголки'),p.series==='MF-20'?1:4,p.series==='MF-20'?'компл.':'шт.',corner?stockCost(corner)*rules.materialFactor:null,'Винты входят в комплект уголков; отдельно не начисляются');
  if(c.glass!=='none'&&!['10','12'].includes(p.id)){const sealId=['07','17'].includes(p.id)?'facade-261':c.sealColor==='Чёрный'?'facade-260':c.sealColor==='Серый'?'facade-259':c.sealColor==='Прозрачный'?'facade-258':null,seal=find(sealId);
   add(prefix+':seal',item.name+' · уплотнитель',perimeter+(c.sealExtra||0)/1000,'м',seal?stockCost(seal)*rules.materialFactor:null,seal?.name||'Выберите цвет уплотнителя');}
  if(c.hinges.length){const auto=c.hinge==='mf20'?'hinge-7':c.hinge==='mzf'?'hinge-23':null,h=find(choice.hinge||auto);
   add(prefix+':hinges',item.name+' · '+(h?.name||'Петли — выберите модель'),c.hinges.length,'шт.',h?stockCost(h)/h.pack*rules.hingeFactor:null,'Цена комплекта поделена на '+(h?.pack||1));

  }
  const drill=drillingService(choice,c,rules);if(drill.quantity)add(prefix+':drilling',item.name+' · '+drill.name,drill.quantity,'шт.',drill.price);
  add(prefix+':assembly',item.name+' · сборка',1,'шт.',rules.assembly);
  add(prefix+':packing',item.name+' · картон',c.w*c.h/1e6,'м²',rate(rules.packagingCode));
  if(c.glass!=='none'){
   const code=choice.glass||catalog.materialMap?.[c.glass],material=catalog.glass.items.find(x=>x.code===code&&x.enabled&&x.kind==='material');
   add(prefix+':glass',item.name+' · '+(material?.name||'Наполнение — выберите строку прайса'),area,'м²',material?.priceKopecks==null?null:material.priceKopecks/100);
   add(prefix+':cutting',item.name+' · резка наполнения',perimeter,'м',rate(choice.cutting||rules.cuttingCode));
   if(/зеркало|мателак.*сильвер/i.test(material?.name||''))add(prefix+':film',item.name+' · защитная плёнка 80 мкм',area,'м²',rate(rules.filmCode));
   const edging=edgeService(choice.edge,catalog.glass);if(edging.type!=='none')add(prefix+':edge',item.name+' · '+edging.name,perimeter,'м',edging.price,edging.price==null?'Ставка не найдена в прайсе; укажите конечную цену вручную':'По периметру наполнения');
   if(p.bond)add(prefix+':bond',item.name+' · вклейка',perimeter,'м',rules.bond);
   if(Math.max(cut.width,cut.height)>2500||Math.min(cut.width,cut.height)>1000){add(prefix+':size-review',item.name+' · наценка за размер: согласовать',1,'шт.',null,'Правило наценки за размер в прайсе требует уточнения');}
  }
 }
 for(const [key,g] of groups){const variants=catalog.items.filter(x=>x.article===g.article&&x.color===g.color&&x.length&&x.enabled!==false);
  const options=(settings.stocks?.[key]||variants).map(x=>({...x,cost:stockCost(x),trim:x.trim??(x.length===2850?0:settings.trim),gripCenter:x.gripCenter??settings.grips?.[x.id]}));
  const plan=planCuts(g.parts,options,{kerf:settings.kerf,trim:settings.trim,singleGrip:g.single});plans.push({...g,key,...plan});
  if(!plan.complete){warnings.push(g.article+': '+plan.error);add('profile:'+key,g.article+' · '+g.color,g.whole?g.parts.length:g.parts.reduce((n,p)=>n+p.length,0)/1000,g.whole?'хлыст':'м',null,plan.error);continue;}
  if(!plan.optimal)warnings.push(g.article+': найден допустимый экономичный раскрой; абсолютный минимум не доказан');
  // Allocate each bar's metre cost only to the parts actually consumed by this order.
  const usageCost=plan.bars.reduce((n,b)=>n+b.cost/b.length*b.parts.reduce((a,p)=>a+p.length,0),0),quantity=g.whole?plan.bars.length:g.parts.reduce((n,p)=>n+p.length,0)/1000;
  add('profile:'+key,g.article+' · '+g.color,quantity,g.whole?'хлыст':'м',(g.whole?plan.cost:usageCost)*rules.materialFactor/quantity,g.whole?'Оплата целых хлыстов':'Только расход деталей; отходы клиенту не начисляются');
 }
 for(const x of settings.extraRows||[])add(x.id,x.name,Number(x.quantity),x.unit,Number(x.price));
 const priced=priceRows(rows,overrides),total=totalRows(priced);return {rows:priced,plans,warnings,...total,complete:total.complete&&plans.every(p=>p.complete),total:total.complete&&plans.every(p=>p.complete)?total.total:null,settings,revision:catalog.revision};
}
