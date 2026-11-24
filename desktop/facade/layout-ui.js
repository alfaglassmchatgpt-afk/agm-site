import {placements,bounds,bake,attach,overlaps} from './layout.mjs';
export {placements,bounds};
export function badge(T,number,active){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle=active?'#007eaf':'#183746';c.beginPath();c.arc(64,64,56,0,Math.PI*2);c.fill();c.strokeStyle='white';c.lineWidth=5;c.stroke();c.fillStyle='white';c.font='bold 65px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(number),64,67);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),depthTest:false,depthWrite:false}));sprite.scale.set(95,95,1);sprite.renderOrder=1000;return sprite;}
export function installLayout({project,state,activate,update,fit,saveProject}){
 const panel=document.createElement('section');panel.className='layout-controls';panel.innerHTML='<strong>Расстановка фасадов</strong><p>Добавить рядом с выбранным. Затем измените размеры нового фасада. Если место занято, используем ближайшее свободное.</p><div class="layout-directions"><button data-direction="above">↑ Сверху</button><button data-direction="left">← Слева</button><button data-direction="right">Справа →</button><button data-direction="below">↓ Снизу</button></div><label>Зазор для расстановки, мм <input id="layout-gap" type="number" min="0" max="1000" step="1" value="3"></label><label><input id="layout-numbers" type="checkbox" checked> Номера фасадов в 3D</label><p id="layout-warning" role="status"></p>';
 document.querySelector('.environment-panel').before(panel);
 const gap=panel.querySelector('#layout-gap'),toggle=panel.querySelector('#layout-numbers');toggle.checked=localStorage.getItem('rf-layout-numbers')!=='false';
 toggle.onchange=()=>{localStorage.setItem('rf-layout-numbers',String(toggle.checked));update();};
 if(project.items.some(i=>!i.layout))bake(project.items);
 const originalAdd=project.add.bind(project),originalRemove=project.remove.bind(project);
 project.add=kind=>{if(project.items.length>=200)throw Error('В проекте максимум 200 фасадов');const anchor=project.current();const item=originalAdd(kind);attach(project.items,item,anchor,'right',3);return item;};
 project.remove=()=>{bake(project.items);return originalRemove();};
 panel.querySelectorAll('[data-direction]').forEach(button=>button.onclick=()=>{if(!gap.checkValidity()){gap.reportValidity();return;}if(project.items.length>=200){panel.querySelector('#layout-warning').textContent='В проекте максимум 200 фасадов';return;}project.update(state);const anchor=project.current();const item=originalAdd('copy');attach(project.items,item,anchor,button.dataset.direction,Number(gap.value));activate(item.id);document.dispatchEvent(new Event('rf-facade-activated'));fit();});
 project.groups=()=>project.items.map(item=>({id:item.id,pairId:item.pairId,members:[item]}));
 const originalUpdate=project.update.bind(project);project.update=config=>{originalUpdate(config);const conflicts=overlaps(project.items);panel.querySelector('#layout-warning').textContent=conflicts.length?'Пересекаются фасады: '+conflicts.map(p=>p.join(' и ')).join(', ')+'. Проверьте размеры и расположение.':'';};
 update();fit();saveProject();
}
