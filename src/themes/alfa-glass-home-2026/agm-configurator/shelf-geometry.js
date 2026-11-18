export function outline(s){
    const [w,h]=s.shape==='circle'?[s.diameter,s.diameter]:s.shape==='semicircle'?[s.diameter,s.diameter/2]:s.shape==='quarter'?[s.diameter/2,s.diameter/2]:[s.width,s.height];
    const scale=Math.min(250/Math.max(1,w),130/Math.max(1,h));
    const W=w*scale,H=h*scale,x=(400-W)/2,y=(240-H)/2;
    let d;
    if(s.shape==='circle') {
      d='M '+x+' 120 a '+W/2+' '+H/2+' 0 1 0 '+W+' 0 a '+W/2+' '+H/2+' 0 1 0 '+(-W)+' 0';

    } else if(s.shape==='semicircle'||s.shape==='quarter'){
      const R=s.shape==='semicircle'?W/2:W;
      const cx=s.shape==='semicircle'?x+R:x;
      const right=s.radii[1]*scale;
      const left=s.radii[s.shape==='semicircle'?0:3]*scale;
      const tangent=r=>{
        const c=Math.sqrt(Math.max(0,R*R-2*R*r));
        return {c,u:c*R/(R-r),v:r*R/(R-r)};
      };
      const a=tangent(right),b=tangent(left);
      const arc=(r,px,py)=>r>0?' A '+r+' '+r+' 0 0 1 '+px+' '+py:' L '+px+' '+py;
      if(s.shape==='semicircle'){
        d='M '+(cx-b.c)+' '+y+' L '+(cx+a.c)+' '+y+arc(right,cx+a.u,y+a.v)
          +' A '+R+' '+R+' 0 0 1 '+(cx-b.u)+' '+(y+b.v)+arc(left,cx-b.c,y)+' Z';
      } else {
        const corner=s.radii[0]*scale;
        d='M '+(x+corner)+' '+y+' L '+(x+a.c)+' '+y+arc(right,x+a.u,y+a.v)
          +' A '+R+' '+R+' 0 0 1 '+(x+b.v)+' '+(y+b.u)+arc(left,x,y+b.c)
          +' L '+x+' '+(y+corner)+arc(corner,x+corner,y)+' Z';
      }
    } else {
      const inset=s.shape==='trapezoid'?(W-s.topWidth*scale)/2:0;
      const points=[[x+inset,y],[x+W-inset,y],[x+W,y+H],[x,y+H]];
      const rounded=points.map((p,i)=>{
        const prev=points[(i+3)%4],next=points[(i+1)%4];
        const u=[prev[0]-p[0],prev[1]-p[1]],v=[next[0]-p[0],next[1]-p[1]];
        const ul=Math.hypot(...u),vl=Math.hypot(...v);
        const angle=Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/(ul*vl))));
        const radius=s.radii[i]*scale,distance=radius/Math.tan(angle/2);
        return {radius,a:[p[0]+u[0]*distance/ul,p[1]+u[1]*distance/ul],b:[p[0]+v[0]*distance/vl,p[1]+v[1]*distance/vl]};
      });
      d='M '+rounded[0].a.join(' ');
      rounded.forEach((p,i)=>{
        if(i) d+=' L '+p.a.join(' ');
        d+=p.radius>0?' A '+p.radius+' '+p.radius+' 0 0 1 '+p.b.join(' '):' L '+p.b.join(' ');
      });
      d+=' Z';
    }

return d;
}
