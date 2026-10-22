function initAluminiumTheme(){
const select=document.querySelector('#site-theme');
const media=matchMedia('(prefers-color-scheme: dark)');
let choice='system';try{choice=localStorage.getItem('alfaglass-theme-mode')||'system'}catch{}
if(!['light','dark','system'].includes(choice))choice='system';
function apply(){document.documentElement.dataset.theme=choice==='system'?(media.matches?'dark':'light'):choice;select.value=choice}
select.addEventListener('change',()=>{choice=select.value;try{localStorage.setItem('alfaglass-theme-mode',choice)}catch{}apply()});
media.addEventListener('change',apply);apply();

}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initAluminiumTheme,{once:true});else initAluminiumTheme();
