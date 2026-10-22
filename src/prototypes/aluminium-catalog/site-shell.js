const select=document.querySelector('#site-theme');
const media=matchMedia('(prefers-color-scheme: dark)');
let choice='system';try{choice=localStorage.getItem('aluminium-prototype-theme')||'system'}catch{}
if(!['light','dark','system'].includes(choice))choice='system';
function apply(){document.documentElement.dataset.theme=choice==='system'?(media.matches?'dark':'light'):choice;select.value=choice}
select.addEventListener('change',()=>{choice=select.value;try{localStorage.setItem('aluminium-prototype-theme',choice)}catch{}apply()});
media.addEventListener('change',apply);apply();
