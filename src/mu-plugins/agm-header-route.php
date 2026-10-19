<?php
/** Plugin Name: AGM header route button */
defined('ABSPATH') || exit;
add_action('wp_head', function () {
    if (is_admin()) return;
    $home=file_get_contents(get_template_directory().'/agm-homepage/index.html');
    preg_match('~<div class="header-messengers"[^>]*>.*?</div>~s',$home,$messengers);
    $messengers=str_replace('__AGM_ASSETS__',esc_url(get_template_directory_uri().'/agm-homepage'),$messengers[0]??'');
    ?>
<style id="agm-route-css">
:is(.site-header,header.header) .messenger-link{width:44px!important;height:44px!important;min-width:44px;flex:0 0 44px!important}
:is(.site-header,header.header) .route-link{width:66px!important;min-width:66px;flex:0 0 66px!important;background:#f4f4f4!important;border:1px solid #e5e7eb!important;border-radius:12px!important;display:inline-flex;align-items:center;justify-content:center;color:#222!important}
:is(.site-header,header.header) .route-link svg{width:30px;height:30px}:is(.site-header,header.header) .route-link:hover{background:#e9edf0!important}:is(.site-header,header.header) .route-link:focus-visible{outline:3px solid #168eae;outline-offset:3px}.header-messengers{gap:8px!important}.mobile-actions{gap:8px!important;flex-wrap:wrap}
@media(max-width:700px){.mobile-actions>.button{flex:1 1 100%!important}}
header.header .header-messengers{display:flex;align-items:center}header.header .messenger-link{display:inline-flex;align-items:center;justify-content:center;border-radius:10px;background:#209bd0}header.header .messenger-max{background:#6857ee}header.header .messenger-link img{width:22px;height:22px}@media(max-width:1100px){header.header .header-inner{flex-wrap:wrap}header.header .header-tools{flex-wrap:wrap;gap:8px}header.header .header-messengers{display:flex!important}}
</style>
<script id="agm-route-script">
(()=>{'use strict';function install(){
 const supply=document.querySelector('header.header .header-tools');
 if(supply&&!supply.querySelector('.header-messengers'))supply.insertAdjacentHTML('afterbegin',<?php echo wp_json_encode($messengers); ?>);
 const destination='Видное, Белокаменное шоссе, владение 10/2';
 document.querySelectorAll('header .messenger-telegram').forEach(telegram=>{
  if(telegram.parentElement.querySelector('.route-link'))return;
  const link=document.createElement('a');link.className='messenger-link route-link';
  link.href='https://yandex.ru/maps/?rtext=~'+encodeURIComponent(destination)+'&rtt=auto';
  link.target='_blank';link.rel='noopener noreferrer';link.title='Маршрут — Яндекс Карты';
  link.setAttribute('aria-label','Построить автомобильный маршрут в Яндекс Картах');
  link.innerHTML='<svg viewBox="0 0 32 40" aria-hidden="true"><path fill="#f34f3e" d="M16 1C7.7 1 1 7.7 1 16c0 5.4 2.8 9.1 6.8 13.5C11.3 33.3 14 36.5 16 40c2-3.5 4.7-6.7 8.2-10.5C28.2 25.1 31 21.4 31 16 31 7.7 24.3 1 16 1Z"/><circle cx="16" cy="16" r="5.2" fill="#fff"/></svg>';
  telegram.after(link);
 });
}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();})();
</script>
<?php
}, 99);
