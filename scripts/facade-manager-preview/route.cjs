const fs=require('node:fs'),path=require('node:path');
module.exports=function(req,res,u,root,prefix){
 if(u===prefix+'agm-configurator/quote-ui.js'){
   const js=fs.readFileSync(path.join(root,'agm-configurator/quote-ui.js'),'utf8');
   const replacement=fs.readFileSync(path.join(__dirname,'checkout-fragment.js'),'utf8');
   res.setHeader('Content-Type','text/javascript;charset=utf-8');
   res.end(js.replace(/if\(local\)\{feedback.textContent='Проверка пройдена:[^\n]+/,()=>replacement));return true;
 }
 if(u!=='/local-preview/facade-order')return false;
 if(req.method!=='POST'||req.headers.origin!=='http://'+req.headers.host){res.writeHead(403).end();return true;}
 (async()=>{
   let body='',bytes=0;req.setEncoding('utf8');
   for await(const chunk of req){bytes+=Buffer.byteLength(chunk);if(bytes>1048576)throw Error('Слишком большой заказ');body+=chunk;}
   const data=JSON.parse(body);
   if(!data.name?.trim()||!(/^[78]\d{10}$/).test(data.phone.replace(/\D/g,''))||data.consent!=='1'||data.website||!data.items?.length)throw Error('Проверьте поля заявки');
   const {render}=await import('./report.mjs');
   render({...data,items:data.managerItems||data.items});
   res.setHeader('Content-Type','application/json;charset=utf-8');res.end(JSON.stringify({ok:true}));
 })().catch(e=>res.writeHead(400,{'Content-Type':'text/plain;charset=utf-8'}).end(e.message));
 return true;
};
