// Reconstructed from MODUS printed page 64. Millimetres; x runs from
// the inner edge to the outer edge, y from the rear to the front.
// Unspecified wall thickness (1.2), rib shapes and radii are visual estimates.
const wall = 1.2;
const rectHole = (b, h) => [
  [wall,wall],[b-wall,wall],[b-wall,4.8],[b-2.5,4.8],
  [b-2.5,6],[b-wall,6],[b-wall,h-wall],[wall,h-wall],
  [wall,6],[2.5,6],[2.5,4.8],[wall,4.8]
];
function capped(b,d,lip,body,rounded=false,groove=false) {
  // MZ07 glass deduction is 2 mm: the estimated retaining wall must not
  // intrude into the 1 mm edge clearance on either side of the glass.
  const neck=groove&&b===19?1:wall;
  const top = rounded
    ? [[b,d-1],[b-.6,d-.25],[b-1.6,d],[b-lip+1,d-.15],[b-lip,d-.8],[b-lip,d-1.8],[b-lip+1,d-1.35],[b-neck,d-1.2]]
    : [[b,d],[b-lip,d],[b-lip,d-wall],[b-wall,d-wall]];
  const outline=[[0,0],[b,0],...top,[b-neck,body],[0,body]];
  let hole=rectHole(b,body);
  if(groove){
    // Return lip under the glass seat, visible in the MZ07 / MZ17 drawing.
    hole=[[wall,wall],[b-wall,wall],[b-wall,4.8],[b-3,4.8],[b-3,6],[b-wall,6],
      [b-wall,body-3.8],[b-6.8,body-3.8],[b-6.8,body-wall],
      [wall,body-wall],[wall,6],[2.5,6],[2.5,4.8],[wall,4.8]];
  }
  return {b,d,outline,holes:[hole],glassY:body+.6};
}
export const sections={
  '01': {b:19,d:20.5,outline:[[0,0],[19,0],[19,20.5],[0,20.5],[0,19.3],[4.3,19.3],[4.3,15.2],[0,15.2]],
    holes:[[[1.2,1.2],[17.8,1.2],[17.8,4.8],[16.3,4.8],[16.3,6],[17.8,6],[17.8,19.3],[5.5,19.3],[5.5,14],[1.2,14],[1.2,6],[2.5,6],[2.5,4.8],[1.2,4.8]]],glassY:15.25},
  '02': capped(19,20.5,8,14.1),
  '04': {b:50,d:20.6,outline:[[0,0],[50,0],[50,20.6],[35,20.6],[35,19.4],[39.5,19.4],[39.5,13.9],[35,13.9],[33.8,15.1],[0,15.1]],
    holes:[[[1.2,1.2],[5,1.2],[5,3.5],[6.2,3.5],[6.2,1.2],[48.8,1.2],[48.8,4.8],[47.2,4.8],[47.2,6],[48.8,6],[48.8,19.4],[40.7,19.4],[40.7,12.7],[34.5,12.7],[33.3,13.9],[1.2,13.9]]],glassY:15.25},
  '07': capped(19,20.5,3.2,14.1,true,true),
  '09': capped(45,21,6,14.7,true),
  '10': {b:50,d:20,outline:[[0,0],[50,0],[50,20],[48.8,20],[48.8,16],[0,16]],holes:[rectHole(50,16)],glassY:16},
  '12': {b:45,d:20,outline:[[0,0],[45,0],[45,20],[43.8,20],[43.8,16],[0,16]],holes:[rectHole(45,16)],glassY:16},
  '13': capped(45,20.4,8,14),
  '17': capped(45,20.2,3.2,13.8,false,true),
  '13-01': {b:45,d:37,outline:[[0,0],[45,0],[45,14],[1.2,14],[1.2,19.4],[8,19.4],[8,20.6],[1.2,20.6],[1.2,35.8],[10,35.8],[10,37],[0,37]],holes:[rectHole(45,14)],glassY:14.6}
};
export const sectionNotes='Форма восстановлена по странице 64. Габариты — по каталогу; непроставленные стенки, рёбра и радиусы приблизительные. Не производственный чертёж.';
export function svgSection(id,color='#8e9da5',large=false){
  const q=sections[id],padding=large?14:7, vb=[-padding,-padding,q.b+padding*2,q.d+padding*2];
  const path=points=>points.map(([x,y],i)=>`${i?'L':'M'}${x},${q.d-y}`).join(' ')+'Z';
  return `<svg class="section-diagram" viewBox="${vb.join(' ')}" role="img" aria-label="Сечение MZ ${id}, ${q.b} на ${q.d} мм"><path d="${[q.outline,...q.holes].map(path).join(' ')}" fill="${color}" fill-rule="evenodd" stroke="currentColor" stroke-width=".18"/>${large?`<path d="M0 ${q.d+5}H${q.b} M${q.b+5} 0V${q.d}" fill="none" stroke="currentColor" stroke-width=".25"/><text x="${q.b/2}" y="${q.d+10}" text-anchor="middle" font-size="3.5" fill="currentColor">${q.b} мм</text><text transform="translate(${q.b+10},${q.d/2}) rotate(-90)" text-anchor="middle" font-size="3.5" fill="currentColor">${q.d} мм</text>`:''}</svg>`;
}
