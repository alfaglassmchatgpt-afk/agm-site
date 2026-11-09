// Select an existing configurator option; quote state remains owned by the shared app.
document.querySelectorAll('[data-triplex-variant]').forEach(link => {
  link.addEventListener('click', () => {
    const choice = Array.from(document.querySelectorAll('#material-request input[name="base"]'))
      .find(input => input.value === link.dataset.triplexVariant);
    if (choice) {
      choice.checked = true;
      choice.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
});

// Material / application slideshow. Each pair shares one story.
(() => {
  const root = document.querySelector('.aml-showcase');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('.aml-slide'));
  const dots = Array.from(root.querySelectorAll('[data-slide]'));
  const pause = root.querySelector('.aml-slide-pause');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let request = 0, current = 0, timer, paused = motion.matches, hovered = false, focused = false, visible = true;
  const stories = document.querySelectorAll('.aml-story [data-story]');
  const copy = document.querySelector('[data-story-copy]');
  const interval = 4000;
  let storyIndex = -1, typing;
  function updateStory() {
    const index = Math.floor(current / 2);
    if (!copy || !stories[index]) return;
    const phrase = stories[index].textContent;
    if (paused || motion.matches) {
      clearTimeout(typing);
      copy.classList.remove('is-typing');
      copy.textContent = phrase;
    } else if (index !== storyIndex) {
      clearTimeout(typing);
      let length = 0;
      copy.classList.add('is-typing');
      function tick() {
        copy.textContent = phrase.slice(0, ++length);
        if (length < phrase.length) {
          typing = setTimeout(tick, 65);
        } else {
          copy.classList.remove('is-typing');
        }
      }
      tick();
    }
    storyIndex = index;
  }
  function controls() {
    pause.textContent = paused ? '▷' : 'Ⅱ';
    pause.setAttribute('aria-label', paused ? 'Продолжить слайды' : 'Приостановить слайды');
  }
  function schedule() {
    clearTimeout(timer);
    if (!paused && !hovered && !focused && visible && !document.hidden) {
      timer = setTimeout(() => show((current + 1) % slides.length), current % 2 === 0 ? interval * 2 : interval);
    }
  }
  async function show(index) {
    const ticket = ++request;
    clearTimeout(timer);
    const img = slides[index].querySelector('img');
    img.loading = 'eager';
    try { await img.decode(); } catch (_) { schedule(); return; }
    if (ticket !== request) return;
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].setAttribute('aria-pressed', 'false');
    current = index;
    updateStory();
    slides[current].classList.add('is-active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].setAttribute('aria-pressed', 'true');
    schedule();
  }
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  pause.addEventListener('click', () => { paused = !paused; updateStory(); controls(); schedule(); });
  root.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  root.addEventListener('focusin', () => { focused = true; schedule(); });
  root.addEventListener('focusout', event => { focused = root.contains(event.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', () => schedule());
  motion.addEventListener('change', () => { paused = motion.matches; updateStory(); controls(); schedule(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; schedule();
  }).observe(root);
  updateStory(); controls(); schedule();
})();
