export function gripBounds(p,h){const min=Math.ceil(p.gripLength/2+p.baseWidth);return {min,max:Math.floor(h-p.gripLength/2-p.baseWidth)};}
export function gripPosition(p,c){const {min,max}=gripBounds(p,c.h);return Math.max(min,Math.min(max,Math.round(c.gripAt??c.h/2)));}
