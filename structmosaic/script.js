(() => {
  document.querySelector('.menu-toggle').setAttribute('aria-label', window.i18n.t('打开导航'));
  const tabs = [...document.querySelectorAll('[data-structure]')];
  function select(tab) {
    tabs.forEach(button => {
      const active = button === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      document.getElementById(button.getAttribute('aria-controls')).hidden = !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next]);
      tabs[next].focus();
    });
  });
})();

/* Hero examples: static bilingual panels share the page's language switch. */
(() => {
  const carousel = document.querySelector('.case-carousel');
  const buttons = [...carousel.querySelectorAll('[data-case]')];
  const panels = [...carousel.querySelectorAll('.hero-example')];
  const playback = carousel.querySelector('.case-playback');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 6500;
  let current = 0;
  let paused = motion.matches;
  let hovered = false;
  let focused = false;
  let inView = true;
  let timer;
  function schedule() {
    clearTimeout(timer);
    const stopped = paused || hovered || focused || !inView || document.hidden;
    carousel.classList.toggle('is-paused', stopped);
    const progress = buttons[current].querySelector('.case-progress');
    progress.style.animation = 'none';
    void progress.offsetWidth;
    progress.style.animation = '';
    if (!stopped) timer = setTimeout(() => show((current + 1) % buttons.length), interval);
  }
  function show(index) {
    current = index;
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    carousel.querySelector('.case-counter').textContent = `0${index + 1} / 03`;
    schedule();
  }
  function updateLabels() {
    const zh = window.i18n.language === 'zh';
    playback.setAttribute('aria-label', paused ? (zh ? '播放问答轮播' : 'Play examples') : (zh ? '暂停问答轮播' : 'Pause examples'));
    playback.setAttribute('aria-pressed', String(paused));
    playback.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
    document.querySelector('.home-key').setAttribute('aria-label', zh ? '返回 DataMosaic 主页' : 'Back to DataMosaic');
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => show(index));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      show(next);
      buttons[next].focus();
    });
  });
  playback.addEventListener('click', () => { paused = !paused; updateLabels(); schedule(); });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) { focused = false; schedule(); }
  });
  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('languagechange', updateLabels);
  motion.addEventListener('change', () => { paused = motion.matches; updateLabels(); schedule(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      schedule();
    }).observe(carousel);
  }
  updateLabels();
  show(0);
})();
