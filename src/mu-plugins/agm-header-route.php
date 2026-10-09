<?php
/** Plugin Name: AGM header route button */
defined('ABSPATH') || exit;
add_action('wp_head', function () {
    if (is_admin()) return;
    if (!is_front_page() && !(is_page() && preg_match('~^(page-agm-|page-kompleksnye-postavki\.php$)~', get_page_template_slug()))) return;
    ?>
<style id="agm-route-css">
.site-header .messenger-link{width:44px!important;height:44px!important;min-width:44px;flex:0 0 44px!important}
.site-header .route-link{width:66px!important;min-width:66px;flex:0 0 66px!important;background:#ffcf00!important;border:1px solid #edbf00!important;border-radius:12px!important;display:inline-flex;align-items:center;justify-content:center;color:#222!important}
.site-header .route-link svg{width:30px;height:30px}.site-header .route-link:hover{background:#ffdc40!important}.site-header .route-link:focus-visible{outline:3px solid #168eae;outline-offset:3px}.header-messengers{gap:8px!important}.mobile-actions{gap:8px!important;flex-wrap:wrap}
@media(max-width:700px){.mobile-actions>.button{flex:1 1 100%!important}}
</style>
<script id="agm-route-script">
(()=>{'use strict';function install(){
 const destination='Видное, Белокаменное шоссе, владение 10/2';
 document.querySelectorAll('.site-header .messenger-telegram').forEach(telegram=>{
  if(telegram.parentElement.querySelector('.route-link'))return;
  const link=document.createElement('a');link.className='messenger-link route-link';
  link.href='https://yandex.ru/maps/?rtext=~'+encodeURIComponent(destination)+'&rtt=auto';
  link.target='_blank';link.rel='noopener noreferrer';link.title='Маршрут — Яндекс Карты';
  link.setAttribute('aria-label','Построить автомобильный маршрут в Яндекс Картах');
  link.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M26 5 19 27l-5-10-10-5Z" fill="#222"/><path d="m26 5-12 12" stroke="#fff" stroke-width="1.3"/></svg>';
  telegram.after(link);
 });
}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();})();
</script>
<?php
}, 99);
