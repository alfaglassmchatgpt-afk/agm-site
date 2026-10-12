<?php
/** New blog archive and a link beside the homepage processing footer link. */
defined('ABSPATH') || exit;
add_filter('template_include', function($template){
    if(is_post_type_archive('blog')) return get_template_directory().'/agm-blog/archive.php';
    return $template;
}, 99);
add_action('wp_footer', function(){
    if(!is_front_page()) return;
    ?><script>(()=>{const target=document.querySelector('footer nav[aria-label="Навигация в подвале"]');const source=document.querySelector('body>nav[aria-label="Полезная информация"]');if(!target||!source)return;source.querySelectorAll('a').forEach(a=>target.append(a));if(!target.querySelector('[data-agm-blog-link]')){const a=document.createElement('a');a.href=<?php echo wp_json_encode(home_url('/blog/')); ?>;a.textContent='Блог';a.dataset.agmBlogLink='1';target.append(a);}source.remove();})();</script><?php }, 99);

add_action('wp_head', function(){
    if (is_admin()) return;
    echo '<style id="agm-footer-links">footer a,.site-footer a,nav[aria-label="Полезная информация"] a{color:inherit;text-decoration:none!important}footer a:hover,.site-footer a:hover,nav[aria-label="Полезная информация"] a:hover{color:var(--blue,#08699f)}footer a:focus-visible,.site-footer a:focus-visible,nav[aria-label="Полезная информация"] a:focus-visible{outline:2px solid var(--focus,#137eaf);outline-offset:4px}</style>';
}, 100);
