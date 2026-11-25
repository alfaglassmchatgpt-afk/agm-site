/* Visual option samples. Selection here never silently changes the quote. */
(() => {
  const image = document.querySelector('#led-detail-image');
  if (!image) return;
  const root = image.src.slice(0, image.src.lastIndexOf('/') + 1);
  const power = document.querySelector('#led-power');
  let active = 'light', on = true;
  const content = {
    light: ['ВКЛЮЧИТЕ НАСТРОЕНИЕ', 'Свет меняет всё', 'Мягкий ореол за зеркалом или световой контур на лицевой стороне. Нажмите на кнопку на изображении, чтобы сравнить включённый и выключенный свет.'],
    sensor: ['ОДНО КАСАНИЕ', 'Управление прямо на зеркале', 'Небольшой сенсор на поверхности включает подсветку. Его расположение подбираем под форму и размер зеркала. Регулировку яркости можно обсудить отдельно.'],
    heater: ['ПОСЛЕ ГОРЯЧЕГО ДУША', 'Отражение без дымки', 'Подогрев помогает уменьшить запотевание в зоне нагревательного элемента. Её размер и расположение согласуем: подогрев не обязательно охватывает всё полотно.'],
    clock: ['ВСЁ ПЕРЕД ГЛАЗАМИ', 'Время — в отражении', 'Лаконичный дисплей встроен в зеркало. Расположение часов, цвет цифр и сочетание с сенсором согласуем до изготовления.']
  };
  function render() {
    image.src = root + (active === 'heater' ? 'detail-heater.png' : on ? 'detail-on.png' : 'detail-off.png');
    image.alt = active === 'heater' ? 'Круглое зеркало: прозрачная зона подогрева и запотевшая поверхность вокруг' : 'Фрагмент зеркала: подсветка ' + (on ? 'включена' : 'выключена') + ', сенсор и часы';
    image.dataset.focus = active;
    power.hidden = active === 'heater';
    power.setAttribute('aria-pressed', String(on));
    power.textContent = on ? '◉ Подсветка включена' : '○ Включить подсветку';
    ['kicker', 'title', 'text'].forEach((key, i) => document.querySelector('#led-detail-' + key).textContent = content[active][i]);
  }
  document.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => {
    active = button.dataset.detail;
    on = true;
    document.querySelectorAll('[data-detail]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  }));
  power.addEventListener('click', () => { on = !on; render(); });
})();
// Authored render variants: changing light updates both image and quote preference.
document.querySelectorAll('[data-model-light]').forEach(button => button.addEventListener('click', () => {
 const card = button.closest('.led-card'), state = button.dataset.modelLight;
 const img = card.querySelector('img');
 img.src = img.src.replace(/-(3000k|4500k|6000k|off|red|orange|green|cyan|blue|purple)\.(jpg|png)$/, '-' + state + '.$2');
 card.querySelector('a').href = img.src;
 card.querySelectorAll('[data-model-light]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
 if (state !== 'off') card.querySelector('.led-pick').dataset.light = { '3000k':'Тёплый', '4500k':'Нейтральный', '6000k':'Холодный', red:'RGB — красный', orange:'RGB — оранжевый', green:'RGB — зелёный', cyan:'RGB — голубой', blue:'RGB — синий', purple:'RGB — фиолетовый' }[state];
}));

(() => {
 const root=document.querySelector('.led-hero-slider'); if(!root)return;
 const slides=Array.from(root.querySelectorAll('.led-hero-slide'));
 const pause=root.querySelector('[data-hero-pause]');
 let index=0, paused=matchMedia('(prefers-reduced-motion: reduce)').matches, timer;
 function show(n){index=(n+slides.length)%slides.length;slides.forEach((s,i)=>{s.classList.toggle('is-active',i===index);s.setAttribute('aria-hidden',String(i!==index));});root.querySelector('figcaption').textContent=slides[index].dataset.caption;}
 function schedule(){clearInterval(timer);if(!paused&&!document.hidden)timer=setInterval(()=>show(index+1),5000);pause.textContent=paused?'Воспроизвести':'Пауза';pause.setAttribute('aria-label',paused?'Воспроизвести слайды':'Приостановить слайды');}
 root.querySelector('[data-hero-prev]').addEventListener('click',()=>{show(index-1);schedule();});
 root.querySelector('[data-hero-next]').addEventListener('click',()=>{show(index+1);schedule();});
 pause.addEventListener('click',()=>{paused=!paused;schedule();});
 document.addEventListener('visibilitychange',schedule);schedule();
})();
