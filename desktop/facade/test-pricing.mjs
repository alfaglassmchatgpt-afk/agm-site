import assert from 'node:assert/strict';
import {purchase,planCuts,priceRows,totalRows} from './pricing.mjs';
const settings={rate:80,date:'2026-11-26',fxExtra:.05};
assert.equal(purchase(100,settings,.1),7560);
assert.throws(()=>purchase(100,{...settings,rate:0},.1));
assert.throws(()=>purchase(100,settings,1.2));
let p=planCuts([1000],[{length:5500,cost:110},{length:3000,cost:70}],{kerf:4,trim:50});
assert.equal(p.bars[0].length,3000);assert.equal(p.bars[0].remaining,1896);assert(p.optimal);
p=planCuts([2500,2500],[{length:5500,cost:110},{length:3000,cost:70}]);assert.equal(p.bars.length,1);assert.equal(p.cost,110);
p=planCuts([3000],[{length:3000,cost:70}]);assert.equal(p.complete,false);
p=planCuts([1000,1000],[{length:2850,cost:70}],{singleGrip:true});assert.equal(p.complete,false);
p=planCuts([{length:1000,gripAt:500},{length:1000,gripAt:500}],[{length:2850,cost:70,gripCenter:1425,trim:0}],{singleGrip:true});assert.equal(p.bars.length,2);assert.equal(p.bars[0].start,925);
p=planCuts([{length:1800,gripAt:200}],[{length:2850,cost:70,gripCenter:1425,trim:0}],{singleGrip:true});assert.equal(p.complete,false);
p=planCuts([1000,1000],[{length:3000,cost:70}],{limit:1});assert(p.complete);assert.equal(p.optimal,false);
let rows=priceRows([{id:'p',quantity:2.5,price:20},{id:'g',quantity:1,price:null}],{p:{price:30}});assert.equal(rows[0].sum,75);assert.equal(totalRows(rows).total,null);
rows=priceRows([{id:'p',quantity:2.5,price:20},{id:'g',quantity:1,price:null}],{p:{price:0},g:{excluded:true}});assert.equal(totalRows(rows).total,0);
assert.throws(()=>priceRows([{id:'p',quantity:2,price:20}],{p:{price:-1}}));
// Independent exact bin search for short orders verifies mixed stock cost selection.
function brute(parts,stocks,at=0,bars=[]){if(at===parts.length)return bars.reduce((n,b)=>n+b.cost,0);let best=Infinity;for(let j=0;j<bars.length;j++){const b=bars[j];if(b.left>=parts[at]+4){b.left-=parts[at]+4;best=Math.min(best,brute(parts,stocks,at+1,bars));b.left+=parts[at]+4;}}for(const s of stocks)if(s.length-100>=parts[at]+4){bars.push({left:s.length-100-parts[at]-4,cost:s.cost});best=Math.min(best,brute(parts,stocks,at+1,bars));bars.pop();}return best;}
const stocks=[{length:3000,cost:63},{length:5500,cost:103}];
for(let seed=1;seed<=25;seed++){const parts=Array.from({length:5},(_,i)=>400+(seed*(i+7)*137)%1700);assert.equal(planCuts(parts,stocks).cost,brute(parts,stocks));}
console.log('PASS exchange, discounts, mixed-length optimal cuts, kerf, grip position, search limit, overrides, incomplete totals; 25 independent exhaustive comparisons');
