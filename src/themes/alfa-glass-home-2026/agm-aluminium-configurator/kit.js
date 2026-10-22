export const oppositeSide=side=>side==='left'?'right':'left';
export function kitItems(s){
  const {profile,w,h,color,glass,hinge,side,handle,mask,reed,glassOpaque}=s;
  const base={profile,width:w,height:h,color,glass,hinge,side,handle,mask,reed,glassOpaque,hingeCoordinatesFromTop:[...s.hinges],quantity:1};
  return s.kit?[{id:'facade-1',...base},{id:'facade-2',...base,side:oppositeSide(side),hingeCoordinatesFromTop:[...s.hinges]}]:[{id:'facade-1',...base}];
}
