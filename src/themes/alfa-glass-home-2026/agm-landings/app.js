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
  const caption = root.querySelector('#slide-label');
  caption.textContent = slides[0].dataset.caption;
  const pause = root.querySelector('.aml-slide-pause');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let request = 0, current = 0, timer, paused = motion.matches, visible = true;
  const stories = document.querySelectorAll('.aml-story [data-story]');
  const copy = document.querySelector('[data-story-copy]');
  const storyTones = ['graphite', 'bronze', 'brass', 'green', 'smoke'];
  const interval = 4000;
  let storyIndex = -1, typing;
  function updateStory() {
    const index = Math.floor(current / 2);
    if (!copy || !stories[index]) return;
    copy.dataset.tone = storyTones[index] || '';
    const phrase = stories[index].textContent;
    copy.classList.toggle('is-paused', paused);
    if (paused || motion.matches) {
      clearTimeout(typing);
      copy.textContent = phrase;
    } else if (index !== storyIndex) {
      clearTimeout(typing);
      let length = 0;
      function tick() {
        copy.textContent = phrase.slice(0, ++length);
        if (length < phrase.length) {
          typing = setTimeout(tick, 65);
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
    if (!paused && visible && !document.hidden) {
      timer = setTimeout(() => show((current + 1) % slides.length), current % 2 === 0 ? interval * 2 : interval);
    }
  }
  async function show(index) {
    const ticket = ++request;
    clearTimeout(timer);
    const img = slides[index];
    img.loading = 'eager';
    try { await img.decode(); } catch (_) { schedule(); return; }
    if (ticket !== request) return;
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    current = index;
    updateStory();
    slides[current].classList.add('is-active');
    slides[current].setAttribute('aria-hidden', 'false');
    caption.textContent = slides[current].dataset.caption;
    schedule();
  }

  pause.addEventListener('click', () => {
    paused = !paused;
    ++request;
    updateStory();
    controls();
    if (paused) clearTimeout(timer);
    else show((current + 1) % slides.length);
  });
  document.addEventListener('visibilitychange', () => schedule());
  motion.addEventListener('change', () => { paused = motion.matches; updateStory(); controls(); schedule(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; schedule();
  }).observe(root);
  updateStory(); controls(); schedule();
})();
