export function dimensions(b,h){
 if(!Number.isInteger(b)||!Number.isInteger(h)||b<2400||b>4759||h<1000||h>4000) throw new RangeError('Размеры вне диапазона макета');
 const door=(b+41)/4, height=h-70, passage=b-2*door;
 return {b,h,door,height,passage,travel:b/2-door,glassWidth:door-27,glassHeight:height-52,ratio:height/door};
}
