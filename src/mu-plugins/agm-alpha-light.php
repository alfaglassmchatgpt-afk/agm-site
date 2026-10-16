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
.agm-alpha-sound{position:absolute;top:calc(100% + 12px);left:50%;transform:translateX(-50%);z-index:3;white-space:nowrap;border:1px solid currentColor;border-radius:16px;background:transparent;color:inherit;font-size:11px;line-height:1.4;font-family:inherit;padding:5px 10px;cursor:pointer;opacity:.75}.agm-alpha-sound:focus-visible{outline:2px solid currentColor;outline-offset:3px}
</style>
<script>
(() => {
    'use strict';
    const mark = document.querySelector('.hero-brand');
    const root = document.documentElement;
    if (!mark) return;
    const img = mark.querySelector('img');
    if (!img) return;
    mark.style.setProperty('--alpha-image', 'url(' + JSON.stringify(img.currentSrc || img.src) + ')');
    mark.classList.add('agm-alpha');
    const shine = document.createElement('span');
    shine.className = 'agm-alpha-shine';
    shine.setAttribute('aria-hidden', 'true');
    mark.append(shine);

    let enabled = true;
    try { enabled = localStorage.getItem('agm-alpha-sound') !== 'off'; } catch (_) {}
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'agm-alpha-sound';
    const updateButton = () => {
        toggle.textContent = enabled ? 'Звук: вкл.' : 'Звук: выкл.';
        toggle.setAttribute('aria-label', enabled ? 'Выключить звук подсветки' : 'Включить звук подсветки');
        toggle.setAttribute('aria-pressed', String(enabled));
    };
    updateButton();
    mark.append(toggle);
    let context, activeGain, timer;
    const stopSound = () => {
        clearTimeout(timer);
        if (activeGain) { activeGain.disconnect(); activeGain = null; }
    };
    toggle.addEventListener('click', () => {
        enabled = !enabled;
        if (!enabled) stopSound();
        try { localStorage.setItem('agm-alpha-sound', enabled ? 'on' : 'off'); } catch (_) {}
        updateButton();
    });
    const prepareAudio = () => {
        if (!enabled) return;
        try {
            const Audio = window.AudioContext || window.webkitAudioContext;
            if (!Audio) return;
            context = context || new Audio();
            if (context.state === 'suspended') context.resume().catch(() => {});
        } catch (_) {}
    };
    const playStartup = () => {
        if (!enabled || !context || context.state !== 'running') return;
        stopSound();
        const start = context.currentTime;
        const master = context.createGain();
        master.gain.value = 0.14;
        master.connect(context.destination);
        activeGain = master;
        // Two starter clicks, aligned with the backlight's ignition pulses.
        for (const offset of [0.27, 0.87]) {
            const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.045), context.sampleRate);
            const samples = buffer.getChannelData(0);
            for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.exp(-i / (context.sampleRate * 0.006));
            const source = context.createBufferSource();
            source.buffer = buffer;
            const filter = context.createBiquadFilter();
            filter.type = 'bandpass'; filter.frequency.value = 1700; filter.Q.value = 0.8;
            source.connect(filter); filter.connect(master);
            source.start(start + offset);
        }
        // Brief ballast hum: silence after the lamp has started.
        const hum = context.createOscillator();
        hum.type = 'sawtooth'; hum.frequency.value = 100;
        const lowpass = context.createBiquadFilter();
        lowpass.type = 'lowpass'; lowpass.frequency.value = 650;
        const envelope = context.createGain();
        const gain = envelope.gain;
        gain.setValueAtTime(0, start);
        for (const [t, value] of [[0.27,0],[0.29,0.16],[0.38,0],[0.87,0],[0.90,0.23],[1.06,0.08],[1.23,0.12],[1.5,0]]) gain.linearRampToValueAtTime(value,start+t);
        hum.connect(lowpass); lowpass.connect(envelope); envelope.connect(master);
        hum.start(start); hum.stop(start + 1.52);
        timer = setTimeout(stopSound, 1650);
    };
    // A trusted click (including keyboard activation) arms only this theme change.
    let manual = false;
    document.addEventListener('click', event => {
        if (!event.isTrusted || !(event.target instanceof Element)) return;
        if (!event.target.closest('.theme-toggle, #agm-theme-choice button')) return;
        manual = true;
        prepareAudio();
        setTimeout(() => { manual = false; }, 0);
    }, true);
    let ignition = 0;
    let dark = root.getAttribute('data-theme') === 'dark';
    new MutationObserver(() => {
        const next = root.getAttribute('data-theme') === 'dark';
        if (next === dark) return;
        dark = next;
        const version = ++ignition;
        const requestedSound = manual && enabled;
        stopSound();
        mark.classList.remove('agm-lamp-start');
        if (next) {
            const ignite = () => {
                if (version !== ignition || !dark) return;
                void mark.offsetWidth;
                mark.classList.add('agm-lamp-start');
                if (requestedSound) playStartup();
            };
            // Start sound and light together after the audio device is ready.
            if (requestedSound && context && context.state === 'suspended') {
                context.resume().then(ignite, ignite);
            } else { ignite(); }
        }
        manual = false;
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopSound(); });
})();
</script>
<?php
}, 100);
