import {mkdir,copyFile} from 'node:fs/promises';
await mkdir(new URL('./vendor/',import.meta.url),{recursive:true});
for(const [from,to] of [['build/three.module.js','three.module.js'],['build/three.core.js','three.core.js'],['examples/jsm/controls/OrbitControls.js','OrbitControls.js'],['LICENSE','LICENSE.txt']])await copyFile(new URL(`./node_modules/three/${from}`,import.meta.url),new URL(`./vendor/${to}`,import.meta.url));
