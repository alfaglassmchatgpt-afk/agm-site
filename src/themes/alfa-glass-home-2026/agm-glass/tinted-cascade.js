(()=>{
  document.querySelectorAll('.tint-cascade').forEach(card=>{
    const images=[...card.querySelectorAll('[data-cascade-color]')];let index=0;
    const render=()=>{
      images.forEach((img,n)=>{const slot=(n-index+images.length)%images.length;img.style.setProperty('--slot',slot);img.style.zIndex=images.length-slot;img.alt=slot===0?img.dataset.label+' — визуализация зеркала':'';});
      const selected=images[index];card.querySelector('[data-cascade-label]').textContent=selected.dataset.label+' · '+(index+1)+' / '+images.length;
      card.querySelectorAll('[data-tint-link]').forEach(link=>{const url=new URL(link.href);url.searchParams.set('variant','tint_'+selected.dataset.cascadeColor);link.href=url.href;});
      card.querySelector('.tint-deck').setAttribute('aria-label','Открыть тонированное зеркало — '+selected.dataset.label);
    };
    card.querySelector('[data-cascade-prev]').addEventListener('click',()=>{index=(index-1+images.length)%images.length;render();});
    card.querySelector('[data-cascade-next]').addEventListener('click',()=>{index=(index+1)%images.length;render();});
    card.querySelector('.tint-switch').hidden=false;render();
  });
})();
