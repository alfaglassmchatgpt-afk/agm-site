<?php
/** New blog archive and a link beside the homepage processing footer link. */
defined('ABSPATH') || exit;
add_filter('template_include', function($template){
    if(is_post_type_archive('blog')) return get_template_directory().'/agm-blog/archive.php';
    return $template;
}, 99);
add_action('wp_footer', function(){
    if(!is_front_page()) return;
    ?><script>document.querySelectorAll('a[href]').forEach(function(a){if(a.textContent.trim()==='Обработка стекла и зеркал'&&!a.parentElement.querySelector('[data-agm-blog-link]')){var link=document.createElement('a');link.href=<?php echo wp_json_encode(home_url('/blog/')); ?>;link.textContent='Блог';link.dataset.agmBlogLink='1';link.style.marginInlineStart='24px';a.after(link);}});</script><?php
}, 99);
