<?php
/** Quiet footer access to the processing guide, without changing the main menu. */
defined('ABSPATH') || exit;
add_action('wp_footer', function () {
    echo '<nav aria-label="Полезная информация" style="padding:24px;text-align:center;border-top:1px solid #71818b40"><a style="color:inherit;text-decoration:underline" href="' . esc_url(home_url('/obrabotka-stekla-i-zerkal/')) . '">Обработка стекла и зеркал</a></nav>';
}, 5);
