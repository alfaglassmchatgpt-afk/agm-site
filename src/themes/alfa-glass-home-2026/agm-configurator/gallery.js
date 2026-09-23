(function(){
  window.agmOperationGallery=function(host,slides,base){
    if(!slides.length)return;
    let index=0;
    const photo=document.createElement('img'),caption=document.createElement('p'),controls=document.createElement('div');
    photo.style.cssText='display:block;width:100%;max-width:480px;height:auto;max-height:300px;object-fit:contain;margin:auto;border-radius:12px';
    caption.className='gc-note';caption.setAttribute('aria-live','polite');
    controls.style.cssText='display:flex;align-items:center;justify-content:center;gap:16px;margin:12px 0';
    const previous=document.createElement('button'),next=document.createElement('button'),count=document.createElement('span');
    previous.type=next.type='button';previous.textContent='←';next.textContent='→';
    previous.setAttribute('aria-label','Предыдущий пример обработки');next.setAttribute('aria-label','Следующий пример обработки');
    [previous,next].forEach(b=>b.style.cssText='min-width:44px;min-height:44px;cursor:pointer');
    function show(){const s=slides[index];photo.src=base+s.image;photo.alt=s.alt||s.caption;caption.textContent='Визуализация. '+s.caption;count.textContent=(index+1)+' / '+slides.length;}
    previous.onclick=()=>{index=(index+slides.length-1)%slides.length;show();};next.onclick=()=>{index=(index+1)%slides.length;show();};
    controls.append(previous,count,next);host.replaceChildren(photo,controls,caption);show();
  };
  document.querySelectorAll('[data-operation-gallery]').forEach(host=>{try{window.agmOperationGallery(host,JSON.parse(host.dataset.operationGallery),host.dataset.assetsBase);}catch(e){/* Keep server-rendered first image if data is invalid. */}});
})();
