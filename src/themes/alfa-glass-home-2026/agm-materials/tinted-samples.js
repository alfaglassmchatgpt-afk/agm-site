(() => {
  const root=document.querySelector('.tint-samples');
  if(!root)return;
  const slides=[...root.querySelectorAll('[data-tint-slide]')],controls=root.querySelector('.tint-controls');
  let index=0;
  const show=next=>{index=(next+slides.length)%slides.length;slides.forEach((s,n)=>s.hidden=n!==index);root.querySelector('[data-tint-label]').textContent=slides[index].dataset.tintSlide+' · '+(index+1)+' / '+slides.length;};
  root.querySelector('[data-tint-prev]').addEventListener('click',()=>show(index-1));
  root.querySelector('[data-tint-next]').addEventListener('click',()=>show(index+1));
  controls.hidden=false;show(0);
})();
