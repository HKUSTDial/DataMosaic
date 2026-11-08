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
})();
