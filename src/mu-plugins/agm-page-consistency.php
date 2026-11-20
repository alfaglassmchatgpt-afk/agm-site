<?php
/** Plugin Name: AGM page consistency refinements */
defined('ABSPATH') || exit;
add_action('template_redirect', static function () {
    if (is_admin() || is_feed() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    $path = trim(wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
    $pages = ['kompleksnye-postavki'=>'supply','dveri-iz-stekla'=>'doors','contacts'=>'contacts','materialy/tonirovannye-zerkala'=>'tinted','aluminium/peregorodki'=>'partitions'];
    if (!isset($pages[$path])) return;
    $kind = $pages[$path];
    ob_start(static function ($html) use ($kind) {
        $html = preg_replace_callback('~<body\b[^>]*>~', static function ($m) use ($kind) {
            return strpos($m[0], 'class="') !== false
                ? str_replace('class="', 'class="agm-refine-'.$kind.' ', $m[0])
                : str_replace('<body', '<body class="agm-refine-'.$kind.'"', $m[0]);
        }, $html, 1);
        if ($kind === 'tinted') {
            $banner = '';
            $html = preg_replace_callback('~<aside class="asr-material-cta"[^>]*>.*?</aside>~s', static function ($m) use (&$banner) {$banner=$m[0];return '';}, $html, 1);
            if ($banner) $html = preg_replace('~</main>~', $banner.'</main>', $html, 1);
            // The service component may create this card after document parsing.
            $html = str_replace('</body>', '<script>window.addEventListener("load",function(){var card=document.querySelector(".asr-material-cta"),main=document.querySelector("main");if(card&&main)main.appendChild(card);},{once:true});</script></body>', $html);
        }
        if ($kind === 'partitions') $html = preg_replace('~((?:agm-aluminium-catalog/)?t911\.js)(?:\?[^"\s]*)?~', '$1?v=20261120-catalog', $html);
        return str_replace('</body>', '<style id="agm-page-consistency">'.file_get_contents(__DIR__.'/agm-page-consistency.css').'</style></body>', $html);
    });
}, -90);
