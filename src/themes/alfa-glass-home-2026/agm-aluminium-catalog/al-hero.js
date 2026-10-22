function initAluminiumHero(){
const $=s=>document.querySelector(s), hero=$('.al-hero');if(!hero)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),phrases=['ФАСАДЫ ДЛЯ ВАШЕЙ МЕБЕЛИ','ПЕРЕГОРОДКИ ДЛЯ СВОБОДЫ ПРОСТРАНСТВА','СТЕКЛО И ПРОФИЛЬ В ЕДИНОЙ КОМПОЗИЦИИ','РЕШЕНИЯ ПО ВАШИМ РАЗМЕРАМ'],images=['aluminium-slide-3.jpg','aluminium-slide-5.jpg','aluminium-slide-4.jpg'];let index=0,timer,typing,fade,paused=false;
function stop(){clearTimeout(timer);clearTimeout(typing);clearTimeout(fade)}
function schedule(){if(!paused&&!reduced.matches&&!document.hidden)timer=setTimeout(next,6800)}
function render(){stop();const phrase=phrases[index%phrases.length],text=$('#al-typed');text.textContent=phrase;$('#al-photo').src='assets/'+images[index%images.length];$('#al-photo').style.opacity='1';if(!reduced.matches&&!paused){text.textContent='';let n=0;function type(){text.textContent=phrase.slice(0,++n);if(n<phrase.length)typing=setTimeout(type,40)}type()}schedule()}
function next(){index++;if(reduced.matches){render();return}$('#al-photo').style.opacity='0';fade=setTimeout(render,650)}
$('#al-next').onclick=()=>{stop();next()};$('#al-pause').onclick=()=>{paused=!paused;hero.classList.toggle('al-paused',paused);$('#al-pause').setAttribute('aria-pressed',String(paused));$('#al-pause').setAttribute('aria-label',paused?'Продолжить анимацию':'Приостановить анимацию');$('#al-pause').textContent=paused?'▶':'Ⅱ';render()};document.addEventListener('visibilitychange',()=>{stop();if(!document.hidden)render()});reduced.addEventListener('change',render);render();
// Header interactions; theme selection is provided by the shared site preference layer.
const menu=$('.menu-toggle'),mobile=$('#mobile-nav');menu?.addEventListener('click',()=>{mobile.hidden=!mobile.hidden;menu.setAttribute('aria-expanded',String(!mobile.hidden))});
for(const item of document.querySelectorAll('.nav-dropdown')){const btn=item.querySelector('.nav-expand'),panel=item.querySelector('.nav-panel');if(!btn||!panel)continue;btn.addEventListener('click',()=>{panel.hidden=!panel.hidden;btn.setAttribute('aria-expanded',String(!panel.hidden))});item.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true;btn.setAttribute('aria-expanded','false');btn.focus()}})}
$('.search-toggle')?.addEventListener('click',()=>$('#al-search-dialog').showModal());$('#al-search-close')?.addEventListener('click',()=>$('#al-search-dialog').close());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initAluminiumHero,{once:true});else initAluminiumHero();
