<?php
namespace Elementor {
 class Plugin {
  public $documents; public $frontend;
  static function instance() { return new self; }
  function __construct() { $this->documents = $this; $this->frontend = $this; }
  function get($id) { return getenv('CASE') === 'missing' ? false : $this; }
  function is_built_with_elementor() { return getenv('CASE') === 'valid'; }
  function get_builder_content_for_display($id) { return '<h1>ELEMENTOR_OK</h1>'; }
 }
}
namespace {
 function get_header() {} function get_footer() {}
 function absint($v) { return abs((int)$v); }
 function get_theme_mod($k) { return getenv('CASE') === 'unset' ? false : 42; }
 function did_action($k) { return getenv('CASE') === 'inactive' ? 0 : 1; }
 ob_start(); require __DIR__ . '/../src/themes/alfa-glass-home-2026/404.php'; $html = ob_get_clean();
 $expected = getenv('CASE') === 'valid' ? 'ELEMENTOR_OK' : '404 -';
 if (strpos($html, $expected) === false) { fwrite(STDERR, 'Unexpected fallback'); exit(1); }
 echo getenv('CASE') . " : OK\n";
}
