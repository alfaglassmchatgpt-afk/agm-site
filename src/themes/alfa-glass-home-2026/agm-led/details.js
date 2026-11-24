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
