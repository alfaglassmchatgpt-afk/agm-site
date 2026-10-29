(function () {
  var card = document.querySelector('.mirror-card-wrap');
  if (!card) return;
  var button = card.querySelector('.mirror-colors-pause');
  button.addEventListener('click', function () {
    var paused = card.classList.toggle('colors-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Продолжить смену цветов рам' : 'Приостановить смену цветов рам');
    button.textContent = paused ? '▶' : 'Ⅱ';
  });
})();
