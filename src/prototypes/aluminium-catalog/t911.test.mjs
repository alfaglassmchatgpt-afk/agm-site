import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dimensions} from './t911-rules.mjs';
test('catalogue dimensions and open alignment',()=>{const d=dimensions(3200,2400);assert.equal(d.door,810.25);assert.equal(d.glassHeight,2278);assert.equal(d.passage,1579.5);assert.equal(-d.door/2-d.travel,-d.b/2+d.door/2);assert.equal(d.travel*2,d.passage);});
test('door width boundary and invalid inputs',()=>{assert.equal(dimensions(4759,2400).door,1200);for(const b of [4800,2399,3200.5,NaN])assert.throws(()=>dimensions(b,2400));assert.throws(()=>dimensions(3200,0));});
