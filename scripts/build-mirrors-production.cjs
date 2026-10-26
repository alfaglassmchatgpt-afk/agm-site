// Build the approved mirror prototype for the existing WordPress Aluminium template.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),theme=path.join(root,'src/themes/alfa-glass-home-2026'),out=path.join(theme,'agm-aluminium-catalog'),proto=path.join(root,'src/prototypes/aluminium-catalog');
let html=fs.readFileSync(path.join(proto,'mirrors.html'),'utf8');
html=html.replace('<head>','<head><base href="/wp-content/themes/alfa-glass-home-2026/agm-aluminium-catalog/">').replace('<meta name="robots" content="noindex,nofollow">','').replace(/<title>.*?<\/title>/,'').replace('<span class="prototype-label">ЛОКАЛЬНЫЙ ПРОТОТИП</span>','');
for(const [file,url] of Object.entries({'index.html':'/aluminium/','facades.html':'/aluminium/fasady/','partitions.html':'/aluminium/peregorodki/','mirrors.html':'/aluminium/zerkala/'}))html=html.replaceAll('href="'+file+'"','href="'+url+'"');
html=html.replace('class="site-logo" href="/aluminium/"','class="site-logo" href="/"').replaceAll('href="#','href="/aluminium/zerkala/#').replaceAll('shared-order/','../agm-configurator/').replaceAll('.png','.webp').replace('Приложите эскиз с размерами к заявке.','Опишите контур в заявке; эскиз с размерами согласуем с вами отдельно.');
html=html.replace(/mirrors\.css(?:\?v=[^"]+)?/, 'mirrors.css?v=20261026-audit');
html=html.replace('</head>','<link rel="stylesheet" href="partition-actions.css?v=20261026-audit"><script src="mirror-request.js?v=20261026-audit" defer></script><script src="al-request.js?v=20261026-audit" defer></script></head>');
html=html.replace('</body>',fs.readFileSync(path.join(out,'al-request.html'),'utf8')+'</body>');
fs.writeFileSync(path.join(out,'mirrors.html'),html);
for(const f of ['mirrors.css','mirrors.js'])fs.writeFileSync(path.join(out,f),fs.readFileSync(path.join(proto,f),'utf8').replaceAll('.png','.webp'));
