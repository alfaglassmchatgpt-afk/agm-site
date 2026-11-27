import assert from 'node:assert/strict';
import {saveSessionRate,restoreSessionRate} from './session-rate.mjs';
const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
saveSessionRate(storage,'2026-11-27','2026-11-25',90);
assert.deepEqual(restoreSessionRate(storage,'2026-11-27',{date:'2026-11-27'},false),{date:'2026-11-25',rate:90});
assert.equal(restoreSessionRate(storage,'2026-11-27',{date:'2026-11-26',rate:99},true).rate,null);
assert.equal(restoreSessionRate(storage,'2026-11-28',{date:'2026-11-25',rate:99},true).rate,null);
memory.clear();assert.equal(restoreSessionRate(storage,'2026-11-27',{date:'2026-11-25',rate:99},true).rate,null);
console.log('PASS reset preservation, date scope, midnight expiry, new-session expiry');
