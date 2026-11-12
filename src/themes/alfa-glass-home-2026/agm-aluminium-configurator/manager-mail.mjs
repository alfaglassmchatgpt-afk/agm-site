import {readFileSync} from 'node:fs';
import store from '../agm-configurator/quote-store.js';
import {render} from './manager-report.mjs';
try{
 const order=JSON.parse(readFileSync(0,'utf8'));
 const {items,customerItems}=order;
 if(!Array.isArray(items)||items.length>1000||items.some(i=>typeof i.title!=='string'||typeof i.summary!=='string'||(i.type==='facade'&&(!Array.isArray(i.config?.hinges)||i.config.hinges.length>6))))throw Error();
 const grouped=store.groupFacades(items);
 if(!Array.isArray(customerItems)||customerItems.length!==grouped.length||grouped.some((i,n)=>['type','title','summary'].some(k=>i[k]!==customerItems[n][k])))throw Error();
 process.stdout.write(render(order));
}catch{process.exitCode=1;}
