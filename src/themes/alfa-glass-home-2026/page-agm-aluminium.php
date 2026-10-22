<?php
/** Template Name: ALFAGLASS Aluminium */
defined('ABSPATH') || exit;
// Isolate the approved layout from legacy Elementor assets, as other custom pages do.
$cleanup=function(){foreach(wp_styles()->queue as $h){if(!in_array($h,['admin-bar','dashicons','sm_theme_style','sm_style'],true))wp_dequeue_style($h);}foreach(wp_scripts()->queue as $h){if(!in_array($h,['admin-bar','sm_script'],true))wp_dequeue_script($h);}};
add_action('wp_enqueue_scripts',$cleanup,PHP_INT_MAX);
add_action('wp_footer',$cleanup,0);
$slug=get_post_field('post_name',get_queried_object_id());
$file=['aluminium'=>'index.html','fasady'=>'facades.html','peregorodki'=>'partitions.html'][$slug]??'index.html';
$html=file_get_contents(get_template_directory().'/agm-aluminium-catalog/'.$file);
ob_start();wp_head();$head=ob_get_clean();
ob_start();wp_footer();$foot=ob_get_clean();
$pos=strpos($html,'<link rel="stylesheet"');$html=substr_replace($html,$head,$pos,0);
$html=str_replace('</body>',$foot.'</body>',$html);
echo $html;
