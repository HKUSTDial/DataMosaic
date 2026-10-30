(() => {
  const bindings = [...document.querySelectorAll('[data-en]')].map(element => ({ element, zh: element.textContent, en: element.dataset.en }));
  const messages = { '打开导航': 'Open navigation', '关闭导航': 'Close navigation', '复制 ↗': 'Copy ↗', '复制第 {n} 段命令': 'Copy command block {n}', '已复制到剪贴板': 'Copied to clipboard', '已选中文本，请按 Ctrl+C 或 ⌘C 复制': 'Text selected. Press Ctrl+C or ⌘C to copy' };
  let language = 'en';
  const t = (key, values = {}) => {
    let result = language === 'en' ? (messages[key] || key) : key;
    for (const [name, value] of Object.entries(values)) result = result.replaceAll(`{${name}}`, value);
    return result;
  };
  function setLanguage(value, persist = true) {
    language = value === 'zh' ? 'zh' : 'en';
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    bindings.forEach(binding => { binding.element.textContent = binding[language]; });
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    if (persist) { try { localStorage.setItem('datamosaic-language', language); } catch {} }
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
  }
  window.i18n = { t, setLanguage, get language() { return language; } };
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
  let initial = 'en';
  try { initial = localStorage.getItem('datamosaic-language') || initial; } catch {}
  setLanguage(initial, false);
})();
