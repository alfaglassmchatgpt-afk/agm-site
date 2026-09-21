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

 const form=$('#led-brief');
 document.querySelectorAll('.led-pick').forEach(button=>button.addEventListener('click',()=>{
   ['variant','kind','light','shape'].forEach(key=>form.elements[key].value=button.dataset[key]);
   $('#brief-status').textContent='Выбрано: '+button.dataset.variant+'. Параметры можно изменить.';
   $('#project-brief').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   form.elements.variant.focus({preventScroll:true});
 }));
 form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);
 const labels={variant:'За основу',shape:'Форма',kind:'Подсветка',light:'Цвет света',quantity:'Количество',width:'Ширина / диаметр, мм',height:'Высота, мм',control:'Управление',comment:'Комментарий'};
 const text=['ALFAGLASS — зеркало с подсветкой',...Object.entries(labels).map(([k,v])=>v+': '+(d.get(k)||'не указано')),'Дополнительно: '+(d.getAll('extras').join(', ')||'не указано'),'Эскиз приложите отдельно. Данные не отправлены.'].join('\n\n');
 const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'})); const a=document.createElement('a');a.href=url;a.download='alfaglass-led-mirror.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#brief-status').textContent='Задание подготовлено. Файл сохранён локально; данные не отправлены.';
 });
})();