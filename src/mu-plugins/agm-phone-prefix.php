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
  function notify(input) { input.dispatchEvent(new Event('input', {bubbles:true})); }
  function prefix(event) {
    const input = event.target;
    if (!eligible(input) || input.value.trim()) return;
    input.value = '+7 ';
    notify(input);
  }
  // Delegation also covers forms inserted after page load.
  document.addEventListener('pointerover', prefix);
  document.addEventListener('focusin', prefix);
  document.addEventListener('focusout', event => {
    const input = event.target;
    if (eligible(input) && input.value.trim() === '+7') {
      input.value = '';
      notify(input);
    }
  });
})();
</script>
    <?php
}, 100);
