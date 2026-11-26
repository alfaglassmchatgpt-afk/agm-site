const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),out=path.join(__dirname,'bundle');
fs.mkdirSync(out,{recursive:true});
const source=path.join(root,'src/themes/alfa-glass-home-2026');
const dest=path.join(out,'agm-aluminium-configurator');
fs.cpSync(path.join(source,'agm-aluminium-configurator'),dest,{recursive:true});
fs.mkdirSync(path.join(out,'agm-configurator'),{recursive:true});
fs.copyFileSync(path.join(source,'agm-configurator/quote-store.js'),path.join(out,'agm-configurator/quote-store.js'));
fs.cpSync(path.join(root,'.local/facade-desktop-assets'),out,{recursive:true});
fs.writeFileSync(path.join(out,'package.json'),JSON.stringify({type:'module'}));
// quote-store is UMD; give Node report code a CJS module while retaining browser use.
fs.copyFileSync(path.join(out,'agm-configurator/quote-store.js'),path.join(out,'agm-configurator/quote-store.cjs'));
const report=path.join(dest,'manager-report.mjs');fs.writeFileSync(report,fs.readFileSync(report,'utf8').replace('../agm-configurator/quote-store.js','../agm-configurator/quote-store.cjs'));
let html=fs.readFileSync(path.join(dest,'index.html'),'utf8');
html=html.replace(/<script[^>]+src="[^\"]*(?:model.js|quote-model.js|quote-ui.js|al-request.js)[^\"]*"[^>]*><\/script>/g,'').replace(/<link[^>]+href="[^\"]*(?:quote.css|partition-actions.css)[^\"]*"[^>]*>/g,'');
html=html.replace(/<b>0\d<\/b>\s*/g,'').replace(/<a id="manager-login"[\s\S]*?<\/a>/,'').replace('3D-подбор · проект можно скачать','Рабочее место менеджера · расчёт заказа');
html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>РФ АГМ — Расчёт фасадов АльфаГласс М</title>');
html=html.replace('<body>','<body><nav class="desktop-tools"><strong>РФ АГМ · Расчёт фасадов АльфаГласс М</strong><button id="desktop-new">Новый проект</button><button id="desktop-open">Открыть</button><button id="desktop-save">Сохранить</button><button id="desktop-client">Для клиента</button><button id="desktop-production">Для производства</button><button id="desktop-catalog">Каталог MODUS</button><button id="desktop-pricing">Расчёт</button><button id="desktop-update">Обновления</button><span id="desktop-status" role="status"></span></nav>');
html=html.replace('</head>','<link rel="stylesheet" href="desktop.css"><link rel="stylesheet" href="layout.css"><script src="desktop-boot.js" defer></script></head>');
html=html.replace('Добавить в мой расчёт','Документ для клиента').replace('Скачать проект ↓','Сохранить проект').replace(/<strong>Дальше — в «Мой расчёт»<\/strong>/,'<strong>Проект сохраняется на этом компьютере</strong>');
html=html.replace(/<dialog id="al-request"[\s\S]*?<\/dialog>/,'');
fs.writeFileSync(path.join(dest,'index.html'),html);
const app=path.join(dest,'app.js');fs.appendFileSync(app,"\nconst {installDesktop}=await import('./desktop-adapter.js');installDesktop({project,state:s,activate,update,validate,facadeEntry});\n");
// Shared source already includes the layout integration.
for(const f of ['desktop-boot.js','desktop-adapter.js','desktop.css','layout.mjs','pricing.mjs','estimate.mjs','pricing-ui.js','glass-prices.mjs','drilling.mjs','pricing-view.mjs'])fs.copyFileSync(path.join(__dirname,f),path.join(dest,f));
fs.copyFileSync(path.join(root,'.local/modus-mz/fasadnye-profili.pdf'),path.join(out,'modus.pdf'));
fs.copyFileSync(path.join(__dirname,'reports.mjs'),path.join(dest,'desktop-reports.mjs'));
console.log('Prepared offline bundle from shared source');
