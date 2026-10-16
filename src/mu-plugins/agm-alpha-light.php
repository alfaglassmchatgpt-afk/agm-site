<?php
/** Hero Alpha: soft shimmer and dark-theme backlight. */
if (!defined('ABSPATH')) { exit; }
add_action('wp_footer', static function () {
    if (!is_front_page()) { return; }
    ?>
<style id="agm-alpha-light">
.hero-brand.agm-alpha{position:relative;isolation:isolate;overflow:visible}
.agm-alpha img{position:relative;z-index:1}
.agm-alpha .agm-alpha-shine{position:absolute;inset:0;z-index:2;pointer-events:none;mask:var(--alpha-image) center/contain no-repeat;-webkit-mask:var(--alpha-image) center/contain no-repeat}
.agm-alpha-shine:after{content:"";position:absolute;inset:0;opacity:.85;background:repeating-linear-gradient(110deg,rgba(29,142,165,.08) 0px,rgba(132,218,229,.28) 95px,rgba(255,255,255,.7) 175px,rgba(154,226,235,.3) 235px,rgba(29,142,165,.08) 395px,rgba(29,142,165,.08) 420px);background-size:420px 100%;animation:agm-alpha-flow 4s linear infinite;mix-blend-mode:screen}
@keyframes agm-alpha-flow{from{background-position:0 0}to{background-position:420px 0}}
.agm-alpha:before,.agm-alpha:after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:var(--alpha-image) center/contain no-repeat;opacity:0;transition:opacity .35s}
.agm-alpha:before{filter:brightness(0) invert(1) blur(14px);transform:scale(1.04)}
.agm-alpha:after{filter:brightness(0) invert(1) blur(34px);transform:scale(1.12);--alpha-level:.38}
[data-theme=dark] .agm-alpha:before{opacity:.8}
[data-theme=dark] .agm-alpha:after{opacity:.38}
[data-theme=dark] .agm-alpha.agm-lamp-start:before,[data-theme=dark] .agm-alpha.agm-lamp-start:after{animation:agm-alpha-start 1.5s linear both}
@keyframes agm-alpha-start{0%,17%{opacity:0}18%,25%{opacity:calc(var(--alpha-level,.8)*.55)}26%,57%{opacity:.04}58%,70%{opacity:calc(var(--alpha-level,.8)*.85)}71%,81%{opacity:.12}90%,100%{opacity:var(--alpha-level,.8)}}
@media(prefers-reduced-motion:reduce){.agm-alpha-shine:after{animation:none;opacity:0}.agm-alpha:before,.agm-alpha:after{transition:none}[data-theme=dark] .agm-alpha.agm-lamp-start:before,[data-theme=dark] .agm-alpha.agm-lamp-start:after{animation:none}}
</style>
<script>
(()=>{'use strict';const mark=document.querySelector('.hero-brand'),root=document.documentElement;if(!mark)return;const img=mark.querySelector('img');if(!img)return;mark.style.setProperty('--alpha-image','url('+JSON.stringify(img.currentSrc||img.src)+')');mark.classList.add('agm-alpha');const shine=document.createElement('span');shine.className='agm-alpha-shine';shine.setAttribute('aria-hidden','true');mark.append(shine);let dark=root.getAttribute('data-theme')==='dark';new MutationObserver(()=>{const next=root.getAttribute('data-theme')==='dark';if(next===dark)return;dark=next;mark.classList.remove('agm-lamp-start');if(next){void mark.offsetWidth;mark.classList.add('agm-lamp-start')}}).observe(root,{attributes:true,attributeFilter:['data-theme']});})();
</script>
<?php
}, 100);
