<?php
/** On-demand furniture application video for the home page. */
if (!defined('ABSPATH')) { exit; }
add_action('wp_footer', static function () {
    if (!is_front_page()) { return; }
    $video = get_stylesheet_directory_uri() . '/agm-homepage/assets/furniture-motion-v1.mp4';
?>
<style>
.agm-motion-wrap{position:relative}.agm-motion-wrap>a{display:block}.agm-motion-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;opacity:0;transition:opacity .15s}.agm-motion-wrap.is-playing .agm-motion-video{opacity:1}.agm-motion-play{position:absolute;right:10px;bottom:10px;z-index:2;border:1px solid #ffffff80;border-radius:20px;padding:8px 12px;background:#102a3deb;color:white;font:12px/1.3 Arial,sans-serif;cursor:pointer}.agm-motion-play:focus-visible{outline:3px solid #57c9ed;outline-offset:3px}@media(prefers-reduced-motion:reduce){.agm-motion-video{transition:none}}
</style>
<script>
(() => {
 const img = document.querySelector('#clients img[src*="client-furniture"]');
 const link = img && img.closest('a');
 if (!link || link.closest('.agm-motion-wrap')) return;
 const wrap = document.createElement('div'); wrap.className = 'agm-motion-wrap';
 link.before(wrap); wrap.append(link);
 const video = document.createElement('video');
 video.className = 'agm-motion-video'; video.muted = true; video.playsInline = true; video.preload = 'none';
 video.setAttribute('aria-hidden','true'); video.tabIndex = -1;
 link.append(video);
 const button = document.createElement('button'); button.type='button'; button.className='agm-motion-play';
 button.textContent='▶ Посмотреть в движении'; button.setAttribute('aria-pressed','false'); wrap.append(button);
 let active=false;
 const stop=()=>{active=false;video.pause();wrap.classList.remove('is-playing');button.textContent='▶ Посмотреть в движении';button.setAttribute('aria-pressed','false');};
 const play=()=>{
   if(active)return; active=true;
   if(!video.getAttribute('src'))video.src=<?php echo wp_json_encode($video); ?>;
   video.currentTime=0;
   video.play().then(()=>{if(!active){video.pause();return;}wrap.classList.add('is-playing');button.textContent='Ⅱ Остановить';button.setAttribute('aria-pressed','true');}).catch(stop);
 };
 button.addEventListener('click',()=>active?stop():play());
 wrap.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)play();});
 wrap.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')stop();});
 video.addEventListener('ended',stop);video.addEventListener('error',stop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(wrap);
})();
</script>
<?php
}, 110);
