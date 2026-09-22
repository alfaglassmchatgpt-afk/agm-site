(() => {
  'use strict';
  document.querySelectorAll('[data-k1-carousel]').forEach(root => {
    const slides = [...root.querySelectorAll('[data-k1-slide]')];
    const controls = root.querySelector('[data-k1-controls]');
    const label = root.querySelector('[data-k1-label]');
    if (slides.length < 2 || !controls || !label) return;
    let index = 0;
    const show = next => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, n) => { slide.hidden = n !== index; });
      label.textContent = slides[index].dataset.k1Slide + ' · ' + (index + 1) + ' / ' + slides.length;
    };
    controls.querySelector('[data-k1-prev]').addEventListener('click', () => show(index - 1));
    controls.querySelector('[data-k1-next]').addEventListener('click', () => show(index + 1));
    controls.hidden = false;
    show(0);
  });
})();
