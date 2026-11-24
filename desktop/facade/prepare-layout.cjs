const fs=require('node:fs');
module.exports=file=>{
 let s=fs.readFileSync(file,'utf8');
 const replace=(from,to)=>{if(!s.includes(from))throw Error('Layout integration anchor missing: '+from.slice(0,80));s=s.replace(from,to);};
 s="import {placements,bounds,badge,installLayout,facadeNumber,drawLinks} from './layout-ui.js';\n"+s;
 replace("function fit(){const inspect=", "function fit(){const assemblyBounds=bounds(project.items);const inspect=");
 replace("Math.max(s.h,(pair()?s.w*2+40:s.w)/camera.aspect)*2", "Math.max(assemblyBounds.h,assemblyBounds.w/camera.aspect)*2.2");
 replace("const extent=Math.max(s.h,s.w*(pair()?2:1))*1.4", "const extent=Math.max(bounds(project.items).h,bounds(project.items).w)*1.4");
 replace("const other=pair(), states=other&&s.view!=='profile'?[project.current(),other].sort((a,b)=>a.config.side==='left'?-1:1):[project.current()];", "const states=s.view==='profile'?[project.current()]:project.items, positions=placements(states), area=bounds(states);");
 replace("if(states.length===2)part.position.x=(i===0?-1:1)*(s.w+40)/2;", "if(s.view!=='profile'){const p=positions.get(item.id);part.position.set(p.x+p.w/2-area.cx,p.y+p.h/2-area.cy,0);if(document.querySelector('#layout-numbers')?.checked){const label=badge(T,facadeNumber(item),item.id===project.activeId);label.position.set(0,0,80);part.add(label);}}part.userData.facadeId=item.id;if(s.view!=='profile'){const target=new T.Mesh(new T.PlaneGeometry(item.config.w,item.config.h),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));part.add(target);}");
 replace("cabinet.position.x=part.position.x;", "cabinet.position.copy(part.position);");
 replace("if(showPhotobox&&['3d','front','back'].includes(s.view))", "if(s.view!=='profile')drawLinks(T,productGroup,states,positions,area);if(showPhotobox&&['3d','front','back'].includes(s.view))");
 replace("refractionSurround(s.w*states.length,s.h,renderer)", "refractionSurround(area.w,area.h,renderer)");
 replace("В 3D показаны оба фасада; зазор 40 мм только для просмотра. Схема — выбранный фасад.", "В 3D показан весь проект. Схема — выбранный фасад.");
 replace("option.textContent=group.members[0].name+", "option.textContent='№ '+facadeNumber(group.members[0])+' · '+group.members[0].name+");
 s+="\ninstallLayout({project,state:s,activate,update,fit,saveProject,T,camera,surface,getProduct:()=>productGroup,selectInScene:id=>{const position=camera.position.clone(),target=orbit.target.clone();activate(id);camera.position.copy(position);orbit.target.copy(target);orbit.update();}});\n";
 fs.writeFileSync(file,s);
};
