import {copyFile,mkdir} from 'node:fs/promises';
await mkdir(new URL('./vendor/',import.meta.url),{recursive:true});
for(const file of ['three.module.js','three.core.js','OrbitControls.js','LICENSE.txt'])await copyFile(new URL('../modus-mz/vendor/'+file,import.meta.url),new URL('./vendor/'+file,import.meta.url));
await copyFile(new URL('../modus-mz/glass-catalog.json',import.meta.url),new URL('./glass-catalog.json',import.meta.url));
