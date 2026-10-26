(() => {
  const { t } = window.i18n;
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const closeMenu = () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', t('打开导航'));
  };
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', t(open ? '关闭导航' : '打开导航'));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.topbar')) closeMenu();
  });

  const toast = document.querySelector('.toast');
  let toastTimer;
  function notify(message) {
    toast.textContent = t(message);
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }
  async function copyText(element) {
    try {
      await navigator.clipboard.writeText(element.textContent.trim());
      notify('已复制到剪贴板');
    } catch {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      notify('已选中文本，请按 Ctrl+C 或 ⌘C 复制');
    }
  }
  document.querySelector('#copy-bib').addEventListener('click', event => {
    copyText(document.querySelector('#bibtex'));
  });
  document.querySelectorAll('pre:not(.bib)').forEach((pre, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrap';
    pre.before(wrapper);
    wrapper.append(pre);
    const button = document.createElement('button');
    button.className = 'copy-code';
    button.type = 'button';
    button.textContent = t('复制 ↗');
    button.setAttribute('aria-label', t('复制第 {n} 段命令', { n: index + 1 }));
    wrapper.append(button);
    button.addEventListener('click', () => copyText(pre));
  });

  const promo = document.querySelector('#promo');
  const promoToggle = document.querySelector('#promo-toggle');
  const motionSource = document.querySelector('.hero-animation source');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animationPaused = reducedMotion.matches;
  function updateAnimation() {
    const source = animationPaused ? 'promo-poster.png' : 'datamosaic_promo_5s.gif';
    promo.src = source;
    motionSource.srcset = source;
    syncAnimationLabels();
    promoToggle.setAttribute('aria-pressed', String(animationPaused));
  }
  function syncAnimationLabels() {
    promoToggle.textContent = t(animationPaused ? '播放动画 ▷' : '暂停动画 Ⅱ');
    promoToggle.setAttribute('aria-label', t(animationPaused ? '播放演示动画' : '暂停演示动画'));
  }
  promoToggle.addEventListener('click', () => {
    animationPaused = !animationPaused;
    updateAnimation();
  });
  reducedMotion.addEventListener('change', event => {
    animationPaused = event.matches;
    updateAnimation();
  });
  updateAnimation();
  document.addEventListener('languagechange', () => {
    syncAnimationLabels();
    menuButton.setAttribute('aria-label', t(nav.classList.contains('open') ? '关闭导航' : '打开导航'));
    document.querySelectorAll('.copy-code').forEach((button, index) => {
      button.textContent = t('复制 ↗');
      button.setAttribute('aria-label', t('复制第 {n} 段命令', { n: index + 1 }));
    });
    toast.classList.remove('visible');
  });
  if ('IntersectionObserver' in window) {
    const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const active = link.hash === `#${entry.target.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-15% 0px -60% 0px' });
    document.querySelectorAll('main > section').forEach(section => sectionObserver.observe(section));
  }
})();
