<?php
/** Plugin Name: AGM Staging HTTPS (never deploy to production) */
if (!defined('AGM_STAGING') || !AGM_STAGING || PHP_SAPI === 'cli' || !is_ssl()) { return; }
// Runtime URL overrides: no database or serialized Elementor data changes.
foreach (['home', 'siteurl'] as $option) {
    add_filter('option_' . $option, function ($url) {
        return preg_replace('~^http://10\.78\.89\.58(?=/|$)~', 'https://10.78.89.58', $url);
    });
}
