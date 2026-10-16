<?php
/** Plugin Name: AGM form interface consistency */
defined('ABSPATH') || exit;
add_action('wp_enqueue_scripts', function () {
    // The standalone service template uses agm-glass/app.js and service.js.
    // Legacy slider/scroll initializers require libraries this template does not use.
    if (is_page_template('page-agm-service.php')) {
        wp_dequeue_script('sliders');
        wp_dequeue_script('main-script');
    }
}, 999);
add_action('wp_footer', function () {
    if (is_admin()) return;
    ?>
<script id="agm-form-labels">
(() => {
  function mark() {
    document.querySelectorAll('form input[required]:not([type="hidden"]):not([type="checkbox"]),form select[required],form textarea[required]').forEach(input => {
      Array.from(input.labels || []).forEach(label => {
        if (label.dataset.agmRequired || label.textContent.includes('*')) return;
        const text = Array.from(label.childNodes).find(node => node.nodeType === 3 && node.textContent.trim());
        if (!text) return;
        label.dataset.agmRequired = '1';
        text.textContent = text.textContent.trimEnd() + ' * ';
      });
    });
  }
  mark();
  new MutationObserver(mark).observe(document.body, {subtree:true,childList:true,attributes:true,attributeFilter:['required']});
})();
</script>
    <?php
}, 110);
