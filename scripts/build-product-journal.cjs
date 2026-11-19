// Build a selective release. Does not publish or replace the live material registry.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const output=path.resolve(process.argv[2]||path.join(root,'.local/journal-release-20261119/package'));
const media=path.resolve(process.argv[3]||path.join(root,'.local/product-journal/assets'));
const theme='wp-content/themes/alfa-glass-home-2026/';
const asset='/'+theme+'agm-product-journal/';
const routes={'index.html':'/izdeliya/steklyannye-polki/','mirrors.html':'/izdeliya/zerkala-na-zakaz/','mirror-tiles.html':'/izdeliya/zerkalnaya-plitka/'};
const descriptions={
 'index.html':'Стеклянные полки на заказ по вашим размерам: формы, оттенки, полированная кромка. Подберите стекло и отправьте заявку в Альфа Гласс.',
 'mirrors.html':'Зеркала на заказ по вашим размерам: серебро, осветлённые и тонированные зеркала, разные формы и обработка кромки. Каталог Альфа Гласс.',
 'mirror-tiles.html':'Зеркальная плитка с фацетом: кирпичики и квадраты разных оттенков, упаковки по 20 штук. Подберите комплект для интерьера в Альфа Гласс.'
};
function write(relative,data){const target=path.join(output,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);}
for(const file of ['index.html','mirrors.html','mirror-tiles.html','app.js','mirror-catalog.js','shelf-model.js','shelf-editor.js','tile-order.js','style.css','brand.css','brand.js']){
 let text=fs.readFileSync(path.join(root,'src/previews/product-journal',file),'utf8');
 text=text.replaceAll('shared/','../agm-configurator/');
 if(file.endsWith('.html')){
  text=text.replace(/<meta name="robots"[^>]*>/,'').replace(/<title>.*?<\/title>/,'');
  text=text.replace('<head>','<head><base href="'+asset+'">');
  text=text.replace('</head>','<meta name="description" content="'+descriptions[file]+'"></head>');
  text=text.replaceAll('href="/#top"','href="'+routes[file]+'#top"');
  for(const [from,to] of Object.entries(routes))text=text.replaceAll('href="/'+from+'"','href="'+to+'"');
  text=text.replaceAll('href="/"','href="'+routes['index.html']+'"');
 }
 if(file==='shelf-editor.js')text=text.replace("(mirror?'/mirrors.html':'/')","(mirror?'"+routes['mirrors.html']+"':'"+routes['index.html']+"')");
 if(file==='tile-order.js')text=text.replaceAll('/mirror-tiles.html?',routes['mirror-tiles.html']+'?');
 if(file==='app.js')text=text.replace("link.href='#'+item.id","link.href=location.pathname+'#'+item.id");
 text=text.replaceAll("'/assets/","'"+asset+'assets/');
 text=text.replaceAll('"/assets/','"'+asset+'assets/');
 write(theme+'agm-product-journal/'+file,text);
}
// Copy only media actually referenced by the prepared catalogue, including CSS backgrounds.
const oldManifest=path.join(path.dirname(output),'manifest.json');
if(!fs.existsSync(oldManifest))throw Error('Provide the reviewed media manifest before packaging.');
const manifest=JSON.parse(fs.readFileSync(oldManifest,'utf8'));
for(const relative of Object.keys(manifest).filter(x=>x.startsWith(theme+'agm-product-journal/assets/'))){
 const source=path.join(media,path.basename(relative));
 if(!fs.existsSync(source))throw Error('Missing approved asset: '+path.basename(relative));
 write(relative,fs.readFileSync(source));
}
for(const file of ['quote-ui.js','quote-store.js','shelf-geometry.js','shelf-report.js'])write(theme+'agm-configurator/'+file,fs.readFileSync(path.join(root,'src/themes/alfa-glass-home-2026/agm-configurator',file)));
write(theme+'page-agm-product-journal.php',fs.readFileSync(path.join(root,'src/themes/alfa-glass-home-2026/page-agm-product-journal.php')));
write('wp-content/mu-plugins/agm-shelf-mail.php',fs.readFileSync(path.join(root,'src/mu-plugins/agm-shelf-mail.php')));
const hashes={};
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else hashes[path.relative(output,p).replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');}}
walk(output);fs.writeFileSync(oldManifest,JSON.stringify(hashes,null,2)+'\n');
console.log('Prepared '+Object.keys(hashes).length+' files. Live request-handler merge and full backup are required before publication.');
