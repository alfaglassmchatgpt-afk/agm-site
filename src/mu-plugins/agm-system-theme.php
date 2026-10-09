<?php
/** Plugin Name: AGM system theme preference */
defined('ABSPATH') || exit;
add_action('wp_head', function () {
    if (is_admin()) return;
    if (!is_front_page() && !(is_page() && preg_match('~^(page-agm-|page-kompleksnye-postavki\.php$)~', get_page_template_slug()))) return;
    echo '<style id="agm-theme-choice-css">#agm-theme-choice{position:fixed;z-index:100050;box-sizing:border-box;width:236px;max-width:calc(100vw - 24px);padding:8px;border:1px solid #9aafb9;border-radius:16px;background:#fff;color:#183540;box-shadow:0 12px 36px #0003}#agm-theme-choice[hidden]{display:none}#agm-theme-choice button{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:10px 12px;border:0;border-radius:9px;text-align:left;font:500 14px/1.4 Arial,sans-serif;background:transparent;color:inherit;cursor:pointer}#agm-theme-choice button[aria-checked="true"]{background:#e1f1f5;color:#06566d}#agm-theme-choice button:focus-visible{outline:2px solid #168eae;outline-offset:-2px}#agm-theme-choice button::before{content:"○";font-size:17px}#agm-theme-choice button[aria-checked="true"]::before{content:"●"}[data-theme="dark"] #agm-theme-choice{background:#132833;color:#edf8fc;border-color:#58727e}[data-theme="dark"] #agm-theme-choice button[aria-checked="true"]{background:#234958;color:#fff}</style>';
    echo '<script id="agm-system-theme">' . file_get_contents(__DIR__ . '/agm-system-theme.js') . '</script>';
}, 99);
