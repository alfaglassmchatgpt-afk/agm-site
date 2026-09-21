/* Designer prototype: local brief export only, no network submissions. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const root = document.documentElement;
  const theme = $('.theme-toggle');
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    theme.setAttribute('aria-pressed', String(dark));
    theme.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  };
  theme.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('alfaglass-home-theme', root.dataset.theme); } catch (_) {}
    syncTheme();
  });
  syncTheme();
  const menu = $('#mobile-nav');
  const menuButton = $('.menu-toggle');
  const closeMenu = () => { menu.hidden = true; menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Открыть меню'); };
  menuButton.addEventListener('click', () => {
    const opening = menu.hidden; menu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
  });
  document.querySelectorAll('#mobile-nav a').forEach(a => a.addEventListener('click', closeMenu));
  const items = [...document.querySelectorAll('.nav-dropdown')];
  const set = (item, open) => { item.querySelector('.nav-expand').setAttribute('aria-expanded',String(open));item.querySelector('.nav-panel').hidden = !open; };
  const open = item => items.forEach(other => set(other,other===item));
  items.forEach(item => {
    const button = item.querySelector('.nav-expand');
    button.addEventListener('click', () => { if (button.getAttribute('aria-expanded')==='true') set(item,false); else open(item); });
    item.addEventListener('pointerenter', e => { if(e.pointerType==='mouse' && item.closest('.desktop-nav')) open(item); });
    item.addEventListener('pointerleave', e => { if(e.pointerType==='mouse' && item.closest('.desktop-nav') && !item.contains(document.activeElement)) set(item,false); });
    item.addEventListener('focusout', e => { if(!item.contains(e.relatedTarget)) set(item,false); });
    item.addEventListener('keydown', e => { if(e.key==='Escape'){e.stopPropagation();set(item,false);button.focus();} });
  });
  document.addEventListener('click', e => {
    if(!e.target.closest('.nav-dropdown')) items.forEach(item=>set(item,false));
    if(!e.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && !menu.hidden){closeMenu();menuButton.focus();}});
  window.addEventListener('resize',()=>{if(innerWidth>1000)closeMenu();},{passive:true});
  if('ResizeObserver' in window) new ResizeObserver(()=>root.style.setProperty('--header-height',$('.site-header').getBoundingClientRect().height+'px')).observe($('.site-header'));
})();

(()=>{'use strict';const cards=[...document.querySelectorAll('[data-material-card]')],search=document.querySelector('#material-search');let group='all';function filter(){const q=(search?.value||'').toLocaleLowerCase('ru');let n=0;cards.forEach(c=>{c.hidden=!(group==='all'||c.dataset.groups.split(' ').includes(group))||!c.textContent.toLocaleLowerCase('ru').includes(q);if(!c.hidden)n++});document.querySelector('#material-count').textContent='Найдено материалов: '+n;document.querySelector('#no-results').hidden=!!n;}if(search){search.addEventListener('input',filter);document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{group=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filter()}));filter()}
document.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#material-photo').src=b.dataset.photo;document.querySelectorAll('[data-photo]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}));
const f=document.querySelector('#glass-brief');if(f)f.addEventListener('submit',e=>{e.preventDefault();if(!f.reportValidity())return;const d=new FormData(f),names={thickness:'Толщина',color:'Цвет',width:'Ширина, мм',height:'Высота, мм',quantity:'Количество',comment:'Обработка и пожелания'},text=['Задание на изготовление ALFAGLASS',f.dataset.title,...Object.entries(names).map(([k,v])=>v+': '+(d.get(k)||'уточнить'))].join('\n');const u=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='ALFAGLASS-material.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);document.querySelector('#brief-status').textContent='Задание подготовлено. Передайте файл менеджеру вместе с чертежом.'});})();
