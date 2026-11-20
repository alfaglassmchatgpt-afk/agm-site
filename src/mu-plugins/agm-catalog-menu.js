/* Unified material/product dropdowns across both header versions. */
(() => {
  function init() {
    const selector = 'header .nav-dropdown,header .agm-nav-dropdown';
    const groups = [...document.querySelectorAll(selector)];
    if (!groups.length || document.documentElement.dataset.agmDropdowns) return;
    document.documentElement.dataset.agmDropdowns = 'ready';
    const parts = group => ({panel:group.querySelector('.nav-panel,.agm-nav-panel'),button:group.querySelector('.nav-expand,.agm-nav-expand'),label:group.querySelector('.nav-parent>a,.agm-nav-parent>a')});
    const timers = new Map();
    function set(group, open) {
      clearTimeout(timers.get(group));
      const {panel,button,label} = parts(group);
      if (!panel || !button) return;
      panel.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      if(label) label.setAttribute('aria-expanded', String(open));
    }
    function closeAll(except) { groups.forEach(group => { if(group !== except) set(group,false); }); }
    function open(group) { closeAll(group); set(group,true); }
    groups.forEach(group => {
      const {panel,button,label} = parts(group);
      if(!panel || !button || !label) return;
      label.setAttribute('role','button');
      label.setAttribute('aria-controls',panel.id);
      label.setAttribute('aria-expanded',String(!panel.hidden));
      // Capture before legacy listeners. Descendant events are not group exits.
      group.addEventListener('pointerenter', event => {
        event.stopImmediatePropagation();
        if(event.target === group && event.pointerType === 'mouse' && group.closest('.desktop-nav')) open(group);
      },true);
      group.addEventListener('pointerleave', event => {
        event.stopImmediatePropagation();
        if(event.target !== group || event.pointerType !== 'mouse' || !group.closest('.desktop-nav')) return;
        clearTimeout(timers.get(group));
        timers.set(group,setTimeout(()=>set(group,false),180));
      },true);
      group.addEventListener('focusout', event => {
        event.stopImmediatePropagation();
        if(!group.contains(event.relatedTarget)) set(group,false);
      },true);
      new MutationObserver(()=>{const value=String(!panel.hidden);button.setAttribute('aria-expanded',value);label.setAttribute('aria-expanded',value);}).observe(panel,{attributes:true,attributeFilter:['hidden']});
    });
    // One capturing listener prevents double toggles in older page scripts.
    document.addEventListener('click',event=>{
      const group=event.target.closest(selector);
      if(!group){closeAll();return;}
      const parent=event.target.closest('.nav-parent,.agm-nav-parent');
      if(!parent){if(event.target.closest('a'))closeAll();return;}
      event.preventDefault();event.stopImmediatePropagation();
      // Hover already opened the panel: the following mouse click keeps it open.
      if(event.detail > 0 && group.closest('.desktop-nav') && matchMedia('(hover:hover)').matches) open(group);
      else if(parts(group).panel.hidden)open(group);else set(group,false);
    },true);
    document.addEventListener('keydown',event=>{
      const group=event.target.closest(selector);
      if(event.key==='Escape'){closeAll();if(group){event.preventDefault();event.stopImmediatePropagation();parts(group).button.focus();}return;}
      if(group && event.key===' ' && event.target===parts(group).label){event.preventDefault();event.stopImmediatePropagation();if(parts(group).panel.hidden)open(group);else set(group,false);}
    },true);
    window.addEventListener('resize',()=>closeAll(),{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
