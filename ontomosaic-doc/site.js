(() => {
  const text = [...document.querySelectorAll('[data-zh]')].map(element => ({
    element, english: element.textContent, chinese: element.dataset.zh,
  }));
  const labels = [...document.querySelectorAll('[data-zh-label]')].map(element => ({
    element, english: element.getAttribute('aria-label'), chinese: element.dataset.zhLabel,
  }));
  const englishTitle = document.title;
  function setLanguage(value, persist = true) {
    const language = value === 'zh' ? 'zh' : 'en';
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = language === 'zh' ? 'OntoMosaic-Doc · 连接证据，保留语义。' : englishTitle;
    text.forEach(({ element, english, chinese }) => {
      element.textContent = language === 'zh' ? chinese : english;
    });
    labels.forEach(({ element, english, chinese }) => {
      element.setAttribute('aria-label', language === 'zh' ? chinese : english);
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    if (persist) {
      try { localStorage.setItem('datamosaic-language', language); } catch { /* Keep the selected language for this page. */ }
    }
  }
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });
  let initial = 'en';
  try { initial = localStorage.getItem('datamosaic-language') || initial; } catch { /* Use English by default. */ }
  setLanguage(initial, false);

  document.querySelectorAll('[data-case-tabs]').forEach(card => {
    const tabs = [...card.querySelectorAll('[role="tab"]')];
    function selectTab(selected) {
      tabs.forEach(tab => {
        const active = tab === selected;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      });
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        else if (event.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
        else if (event.key === 'Home') next = tabs[0];
        else if (event.key === 'End') next = tabs[tabs.length - 1];
        else return;
        event.preventDefault();
        selectTab(next);
        next.focus();
      });
    });
  });
  document.querySelectorAll('[data-reading]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-reading]').forEach(row => row.setAttribute('aria-pressed', String(row === button)));
      document.querySelectorAll('[data-reading-detail]').forEach(detail => {
        detail.hidden = detail.dataset.readingDetail !== button.dataset.reading;
      });
    });
  });
  document.querySelectorAll('[data-scope]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-scope]').forEach(row => row.setAttribute('aria-pressed', String(row === button)));
      document.querySelectorAll('[data-scope-detail]').forEach(detail => {
        detail.hidden = detail.dataset.scopeDetail !== button.dataset.scope;
      });
    });
  });
})();
