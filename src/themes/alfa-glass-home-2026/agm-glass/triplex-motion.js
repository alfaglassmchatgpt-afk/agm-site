(() => {
const root=document.querySelector('[data-triplex-motion]'); if(!root)return;
const scene=root.querySelector('.tp-door-scene'), toggle=root.querySelector('[data-play]'), stops=[...root.querySelectorAll('[data-stop]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let playing=!reduced.matches, hover=false, visible=true, step=0, direction=1, timer;
function show(n){step=n;scene.style.setProperty('--opening',n/3);stops.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));}
function schedule(){clearTimeout(timer);toggle.textContent=playing?'Пауза':'Воспроизвести';toggle.setAttribute('aria-pressed',String(playing));if(playing&&!hover&&visible&&!document.hidden)timer=setTimeout(()=>{if(step===3)direction=-1;if(step===0)direction=1;show(step+direction);schedule();},3000);}
toggle.addEventListener('click',()=>{playing=!playing;schedule();});
stops.forEach((b,i)=>b.addEventListener('click',()=>{playing=false;show(i);schedule();}));
root.addEventListener('mouseenter',()=>{hover=true;schedule();});
root.addEventListener('mouseleave',()=>{hover=false;schedule();});
root.addEventListener('focusin',()=>{hover=true;schedule();});
root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget)){hover=false;schedule();}});
document.addEventListener('visibilitychange',schedule);
reduced.addEventListener('change',()=>{if(reduced.matches)playing=false;schedule();});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(root);
show(0);schedule();
})();
