(() => {
  const root=document.querySelector('.tint-samples');
  if(!root)return;
  const slides=[...root.querySelectorAll('[data-silver-base]')];
  let index=0;
  const show=next=>{index=(next+slides.length)%slides.length;slides.forEach((slide,n)=>slide.hidden=n!==index);root.querySelector('[data-tint-label]').textContent=slides[index].dataset.tintSlide+' · '+(index+1)+' / '+slides.length;};
  root.querySelector('[data-tint-prev]').addEventListener('click',()=>show(index-1));
  root.querySelector('[data-tint-next]').addEventListener('click',()=>show(index+1));
  document.querySelectorAll('input[name=base]').forEach(r=>r.addEventListener('change',()=>{const n=slides.findIndex(s=>s.dataset.silverBase===r.value);if(n>=0)show(n);}));
  root.querySelector('.tint-controls').hidden=false;
  const current=document.querySelector('input[name=base]:checked')?.value;
  show(Math.max(0,slides.findIndex(s=>s.dataset.silverBase===current)));
})();
