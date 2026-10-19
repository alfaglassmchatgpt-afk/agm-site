<?php
/** Plugin Name: AGM phone prefix */
defined('ABSPATH') || exit;
add_action('wp_footer', function () {
    if (is_admin()) return;
    ?>
<script id="agm-phone-prefix">
(() => {
  'use strict';
  const selector = 'input[type="tel"],input[name="phone"],input[name="your-phone"]';
  const eligible = input => input instanceof HTMLInputElement && input.matches(selector) && !input.disabled && !input.readOnly;
  const digits = value => value.replace(/\D/g, '');
  function national(value) {
    let n = digits(value);
    if (/^\s*\+7/.test(value) || (n.length >= 11 && /^[78]/.test(n))) n = n.slice(1);
    return n.slice(0, 10);
  }
  function format(n) {
    if (!n) return '+7 ';
    let value = '+7 (' + n.slice(0, 3);
    if (n.length >= 3) value += ') ';
    if (n.length > 3) value += n.slice(3, 6);
    if (n.length > 6) value += '-' + n.slice(6, 8);
    if (n.length > 8) value += '-' + n.slice(8, 10);
    return value;
  }
  function validate(input) {
    const n = national(input.value);
    input.setCustomValidity(n.length && n.length !== 10 ? 'Введите 10 цифр номера после +7.' : '');
  }
  function prepare(input) {
    input.inputMode = 'tel';
    input.placeholder = '+7 (999) 999-99-99';
    // Formatting adds punctuation; do not let a legacy digit-only limit truncate it.
    input.removeAttribute('maxlength');
  }
  function notify(input) { input.dispatchEvent(new Event('input', {bubbles:true})); }
  function prefix(event) {
    const input = event.target;
    if (!eligible(input)) return;
    prepare(input);
    if (input.value.trim()) return;
    input.value = '+7 ';
    notify(input);
  }
  document.addEventListener('pointerover', prefix);
  document.addEventListener('focusin', prefix);
  document.addEventListener('input', event => {
    const input = event.target;
    if (!eligible(input) || event.isComposing) return;
    prepare(input);
    const raw = input.value;
    const position = input.selectionStart ?? raw.length;
    const rank = digits(raw.slice(0, position)).length;
    const n = national(raw);
    input.value = format(n);
    if (position === raw.length) input.setSelectionRange(input.value.length, input.value.length);
    else {
      let seen = 0, caret = 3;
      for (let i = 0; i < input.value.length; i++) {
        if (/\d/.test(input.value[i]) && ++seen >= rank) { caret = Math.max(3, i + 1); break; }
      }
      input.setSelectionRange(caret, caret);
    }
    validate(input);
  }, true);
  document.addEventListener('paste', event => {
    const input = event.target;
    if (!eligible(input)) return;
    const text = event.clipboardData?.getData('text') || '';
    if (digits(text).length < 10) return;
    event.preventDefault();
    input.value = format(national(text));
    input.setSelectionRange(input.value.length, input.value.length);
    notify(input);
  });
  // Backspace/Delete beside a separator removes a digit instead of trapping the caret.
  document.addEventListener('beforeinput', event => {
    const input = event.target;
    if (!eligible(input) || !['deleteContentBackward','deleteContentForward'].includes(event.inputType)) return;
    const start = input.selectionStart, end = input.selectionEnd;
    if (start !== end) return;
    const backwards = event.inputType === 'deleteContentBackward';
    let at = backwards ? start - 1 : start;
    while (at >= 3 && at < input.value.length && /\D/.test(input.value[at])) at += backwards ? -1 : 1;
    if (at < 3 || at >= input.value.length) { event.preventDefault(); return; }
    event.preventDefault();
    input.value = input.value.slice(0, at) + input.value.slice(at + 1);
    input.setSelectionRange(at, at);
    notify(input);
  });
  document.addEventListener('focusout', event => {
    const input = event.target;
    if (!eligible(input)) return;
    if (!national(input.value)) { input.value = ''; notify(input); input.value = ''; }
    validate(input);
  });
})();
</script>
    <?php
}, 100);
