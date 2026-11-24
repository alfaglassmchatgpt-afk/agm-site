const {app,BrowserWindow,ipcMain,dialog,Menu}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path');
const {validate}=require('./schema.cjs');let win,folder;
app.setName('ALFAGLASS Prices');
function trusted(e){if(e.sender!==win.webContents||e.senderFrame!==win.webContents.mainFrame)throw Error('Invalid caller');}
async function read(){try{return JSON.parse(await fs.readFile(path.join(folder,'current.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function persist(data){validate(data);const stamp=new Date().toISOString().replace(/[:.]/g,'-');data={...data,revision:stamp,status:'draft'};const content=JSON.stringify(data,null,2);await fs.writeFile(path.join(folder,stamp+'.json'),content,{flag:'wx'});await fs.writeFile(path.join(folder,'current.tmp'),content);await fs.rename(path.join(folder,'current.tmp'),path.join(folder,'current.json'));return data;}
app.whenReady().then(async()=>{
folder=path.join(app.getPath('userData'),'price-revisions');await fs.mkdir(folder,{recursive:true});
const seed=process.argv.find(a=>a.startsWith('--price-file='));if(seed&&!await read())await persist(JSON.parse(await fs.readFile(seed.slice(13),'utf8')));
win=new BrowserWindow({width:1500,height:1000,backgroundColor:'#f3f6f7',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});Menu.setApplicationMenu(null);win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());win.webContents.session.setPermissionRequestHandler((w,p,cb)=>cb(false));
ipcMain.handle('read',e=>{trusted(e);return read();});
ipcMain.handle('save',async(e,d)=>{trusted(e);return persist(d);});
ipcMain.handle('history',async e=>{trusted(e);return (await fs.readdir(folder)).filter(n=>n!=='current.json'&&n.endsWith('.json')).sort().reverse();});
ipcMain.handle('restore',async(e,name)=>{trusted(e);if(!/^\d{4}-[\dTZ-]+\.json$/.test(name))throw Error('Неверная версия');return JSON.parse(await fs.readFile(path.join(folder,name),'utf8'));});
ipcMain.handle('import',async e=>{trusted(e);const r=await dialog.showOpenDialog(win,{filters:[{name:'Прайс JSON',extensions:['json']}],properties:['openFile']});if(r.canceled)return null;if((await fs.stat(r.filePaths[0])).size>5e6)throw Error('Файл слишком большой');const d=JSON.parse(await fs.readFile(r.filePaths[0],'utf8'));validate(d);return d;});
ipcMain.handle('export',async(e,d)=>{trusted(e);validate(d);const r=await dialog.showSaveDialog(win,{defaultPath:'glass-prices-'+d.effectiveDate+'.json',filters:[{name:'Прайс JSON',extensions:['json']}]});if(!r.canceled)await fs.writeFile(r.filePath,JSON.stringify(d,null,2));return !r.canceled;});
await win.loadFile(path.join(__dirname,'index.html'));
});app.on('window-all-closed',()=>app.quit());
