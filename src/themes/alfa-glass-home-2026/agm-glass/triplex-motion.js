(() => {
const root=document.querySelector('[data-triplex-motion]');if(!root)return;
const scene=root.querySelector('.tp-door-scene'),stage=root.querySelector('.tp-visual-stage'),toggle=root.querySelector('[data-play]'),stops=[...root.querySelectorAll('[data-stop]')],choices=[...root.querySelectorAll('[data-phase]')],sets=[...root.querySelectorAll('[data-textures]')];
const copy=root.closest('.tp-hero').querySelector('.tp-hero-copy'),title=copy.querySelector('h1'),lead=copy.querySelector('.tp-lead'),over=copy.querySelector('.tp-overline'),caption=root.querySelector('figcaption');
const original=[title.innerHTML,lead.textContent,over.textContent,caption.textContent],reduced=matchMedia('(prefers-reduced-motion: reduce)'),seq=[0,1,2,3,2,1,0];
let playing=!reduced.matches,hover=false,visible=true,index=0,phase='door',timer;
function setPhase(next){
const changed=phase!==next;phase=next;root.dataset.phase=phase;stage.classList.toggle('is-texture',phase!=='door');
sets.forEach((s,i)=>{const active=phase===(i?'fluted':'pattern');s.classList.toggle('is-active',active);s.setAttribute('aria-hidden',String(!active));});
choices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.phase===phase)));
if(phase==='door'){title.innerHTML=original[0];lead.textContent=original[1];over.textContent=original[2];caption.textContent=original[3];}
else{title.innerHTML='Ваш замысел —<br>в рисунке и фактуре';lead.textContent='Подберём сочетание узорчатого, рифлёного и тонированного стекла под ваш проект. Фактуру, прозрачность и оттенок согласуем по образцу.';over.textContent='Декоративный триплекс';caption.textContent=phase==='pattern'?'Silvit · Kathedral Klein · Aqualite':'MORU · Flutelite · Estriado';}
if(changed&&!reduced.matches)copy.animate([{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'ease-out'});
stops.forEach((b,i)=>b.setAttribute('aria-pressed',String(phase==='door'&&i===seq[index])));
}
function show(n){scene.style.setProperty('--opening',n/3);stops.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));}
function advance(){if(phase==='door'){if(index<seq.length-1)show(seq[++index]);else setPhase('pattern');}else if(phase==='pattern')setPhase('fluted');else{index=0;show(0);setPhase('door');}schedule();}
function schedule(){clearTimeout(timer);toggle.textContent=playing?'Пауза':'Воспроизвести';toggle.setAttribute('aria-pressed',String(playing));if(playing&&!hover&&visible&&!document.hidden)timer=setTimeout(advance,phase==='door'?3000:3200);}
toggle.addEventListener('click',()=>{playing=!playing;hover=false;schedule();});
stops.forEach((b,i)=>b.addEventListener('click',()=>{playing=false;index=i;setPhase('door');show(i);schedule();}));
choices.forEach(b=>b.addEventListener('click',()=>{playing=false;setPhase(b.dataset.phase);schedule();}));
root.addEventListener('mouseenter',()=>{hover=true;schedule();});root.addEventListener('mouseleave',()=>{hover=false;schedule();});
document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{if(reduced.matches)playing=false;schedule();});
new IntersectionObserver(e=>{visible=e[0].isIntersecting;schedule();},{threshold:.15}).observe(root);
show(0);setPhase('door');schedule();
})();
