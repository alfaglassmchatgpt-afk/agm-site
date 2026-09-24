(() => {
  const root=document.querySelector('.tint-samples');
  if(!root)return;
  const slides=[...root.querySelectorAll('[data-tint-slide]')],controls=root.querySelector('.tint-controls');
  if(!slides.length)return;
  let index=0;
  const show=next=>{index=(next+slides.length)%slides.length;slides.forEach((s,n)=>s.hidden=n!==index);root.querySelector('[data-tint-label]').textContent=slides[index].dataset.tintSlide+' · '+(index+1)+' / '+slides.length;};
  const sync=()=>{const base=document.querySelector('input[name=base]:checked')?.value;const next=slides.findIndex(s=>s.dataset.tintBase===base);if(next>=0)show(next);};
  const choose=next=>{show(next);const radio=[...document.querySelectorAll('input[name=base]')].find(r=>r.value===slides[index].dataset.tintBase);if(radio&&!radio.checked){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}};
  root.querySelector('[data-tint-prev]').addEventListener('click',()=>choose(index-1));
  root.querySelector('[data-tint-next]').addEventListener('click',()=>choose(index+1));
  document.addEventListener('change',e=>{if(e.target.matches('input[name=base]'))sync();});
  document.addEventListener('agm:selectionchange',sync);
  controls.hidden=false;sync();
})();
