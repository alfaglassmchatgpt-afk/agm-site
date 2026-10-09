const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync('src/mu-plugins/agm-system-theme.js','utf8');
function run(initial={},dark=false,blocked=false){
 const storage=new Map(Object.entries(initial)), events={}, winEvents={}, root={dataset:{},style:{}};
 const button={attributes:{},setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]}};
 const media={matches:dark,addEventListener(n,fn){this.change=fn}};
 const doc={documentElement:root,readyState:'loading',querySelector:()=>null,querySelectorAll:()=>[button],addEventListener(n,fn){events[n]=fn}};
 const window={matchMedia:()=>media,addEventListener(n,fn){winEvents[n]=fn}};
 vm.runInNewContext(code,{window,document:doc,localStorage:{getItem(k){if(blocked)throw Error('blocked');return storage.get(k)||null},setItem(k,v){storage.set(k,v)},removeItem(k){storage.delete(k)}}});
 return {root,media,storage,button,events,winEvents};
}
let t=run({},true);assert.equal(t.root.dataset.theme,'dark');assert.equal(t.root.dataset.themeMode,'system');
t.media.matches=false;t.media.change();assert.equal(t.root.dataset.theme,'light');
t=run({'alfaglass-home-theme':'dark'},false);assert.equal(t.root.dataset.theme,'dark');t.media.change();assert.equal(t.root.dataset.theme,'dark');
t=run({'alfaglass-theme-mode':'system','alfaglass-home-theme':'dark'},false);assert.equal(t.root.dataset.theme,'light');
t=run({'alfaglass-theme-mode':'light'},true);assert.equal(t.root.dataset.theme,'light');
t=run({'alfaglass-theme-mode':'invalid'},true);assert.equal(t.root.dataset.theme,'dark');
t=run({},true,true);assert.equal(t.root.dataset.theme,'dark');
t=run({},false);t.storage.set('alfaglass-theme-mode','dark');t.winEvents.storage({key:'alfaglass-theme-mode'});assert.equal(t.root.dataset.theme,'dark');
t.storage.clear();t.winEvents.storage({key:null});assert.equal(t.root.dataset.themeMode,'system');assert.equal(t.root.dataset.theme,'light');
t.events.DOMContentLoaded();assert.equal(t.button.attributes['aria-haspopup'],'menu');assert.match(t.button.attributes['aria-label'],/Как на устройстве/);
console.log('PASS: system light/dark, live OS changes, legacy choice, explicit choice, invalid state, blocked storage, cross-tab sync, reset, accessibility');
