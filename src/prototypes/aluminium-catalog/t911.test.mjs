import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dimensions} from './t911-rules.mjs';
test('catalogue dimensions and open alignment',()=>{const d=dimensions(3200,2400);assert.equal(d.door,810.25);assert.equal(d.glassHeight,2278);assert.equal(d.passage,1579.5);assert.equal(-d.door/2-d.travel,-d.b/2+d.door/2);assert.equal(d.travel*2,d.passage);});
test('door width boundary and invalid inputs',()=>{assert.equal(dimensions(4759,2400).door,1200);for(const b of [4800,2399,3200.5,NaN])assert.throws(()=>dimensions(b,2400));assert.throws(()=>dimensions(3200,0));});

import {partitionMaterialAllowed,checkGlassSize} from './t911-rules.mjs';
test('exclude one-sided materials including Russian names',()=>{for(const m of [{mirror:true},{slug:'steklo-matelak'},{title:'Мателак 9003'},{title:'Лакобель',id:'painted'},{id:'lacobel-1013'}])assert.equal(partitionMaterialAllowed({thickness:4,...m}),false);assert.equal(partitionMaterialAllowed({thickness:4,id:'moru'}),true);});
test('check actual infill against paired sheet formats',()=>{assert.equal(checkGlassSize(783.25,2278,{formats:[[2000,1600]]}).status,'exceeded');assert.equal(checkGlassSize(783.25,2278,{formats:[[2440,1830]]}).status,'conditional');assert.equal(checkGlassSize(2100,2500,{formats:[[3300,2000],[2440,2100]]}).status,'exceeded');assert.equal(checkGlassSize(1000,3000,null).status,'unknown');});
