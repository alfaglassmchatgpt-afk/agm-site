(()=>{
  document.querySelectorAll('.tint-cascade').forEach(card=>{
    const images=[...card.querySelectorAll('[data-cascade-color]')],buttons=[...card.querySelectorAll('[data-swatch]')];
    const show=color=>{
      const selected=images.find(img=>img.dataset.cascadeColor===color);if(!selected)return;
      images.forEach(img=>{img.style.display=img===selected?'block':'none';});
      buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.swatch===color)));
      card.querySelector('[data-cascade-label]').textContent=selected.dataset.label;
      card.querySelectorAll('[data-tint-link]').forEach(link=>{const url=new URL(link.href);url.searchParams.set('variant','tint_'+color);link.href=url.href;});
      card.querySelector('.tint-deck').setAttribute('aria-label','Открыть тонированное зеркало — '+selected.dataset.label);
    };
    buttons.forEach(button=>button.addEventListener('click',()=>show(button.dataset.swatch)));
    card.querySelector('.tint-swatches').hidden=false;show('bronze');
  });
})();
