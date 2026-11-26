import assert from 'node:assert/strict';
import {removableFilm} from './filling.mjs';
const glass={items:[{kind:'service',enabled:true,name:'Оклейка по лицу (быстросъемная)',priceKopecks:12300}]};
for(const name of ['STOPSOL Phoenix','Стопсол','MORU с магнетронным напылением Grey'])assert.deepEqual(removableFilm({name},glass),{required:true,price:123,note:'б/с плёнка учтена'});
for(const name of ['MORU Crystal','MORU тонированное в массе Bronze','Зеркало серебро'])assert.equal(removableFilm({name},glass).price,0);
assert.equal(removableFilm({name:'Stopsol'},{items:[]}).price,null);
assert.equal(removableFilm({name:'Stopsol'},{items:[{...glass.items[0],enabled:false}]}).price,null);
console.log('PASS coating classification, plain/tinted exclusions, missing/disabled film rate');
