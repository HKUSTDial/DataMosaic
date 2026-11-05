(() => {
  const table = document.querySelector('#results-table');
  const status = document.querySelector('#results-status');
  let data, failed = false, filter = 'all', view = 'overall', sort = 6, descending = true;
  function cell(row, tag, text) {
    const node = document.createElement(tag);
    node.textContent = text;
    row.append(node);
    return node;
  }
  function render() {
    const zh = document.documentElement.lang === 'zh-CN';
    if (!data) {
      status.textContent = failed
        ? (zh ? '结果加载失败，请刷新页面重试。' : 'Results could not be loaded. Reload this page to try again.')
        : (zh ? '正在加载结果…' : 'Loading results…');
      return;
    }
    const indices = view === 'overall' ? [6, 7, 8, 12, 13, 14] : data.metrics.map((_, i) => i);
    const rows = data.rows.filter(row => {
      if (filter === 'all') return true;
      if (filter === 'baseline') return ['vanilla', 'ocr'].includes(row.group);
      if (filter === 'agent') return ['agent', 'docatlas', 'docpilot'].includes(row.group);
      return row.group === filter;
    });
    rows.sort((a, b) => {
      if (a.values[sort] === null) return b.values[sort] === null ? 0 : 1;
      if (b.values[sort] === null) return -1;
      return (a.values[sort] - b.values[sort]) * (descending ? -1 : 1);
    });
    table.replaceChildren();
    const caption = table.createCaption();
    caption.textContent = zh ? '已报告的基准测试结果' : 'Reported benchmark results';
    const head = table.createTHead();
    const groups = head.insertRow();
    const system = cell(groups, 'th', zh ? '系统' : 'System');
    system.rowSpan = 2;
    system.scope = 'col';
    system.className = 'results-system';
    for (let i = 0; i < indices.length;) {
      const benchmark = data.metrics[indices[i]].benchmark;
      let count = 1;
      while (i + count < indices.length && data.metrics[indices[i + count]].benchmark === benchmark) count++;
      const group = cell(groups, 'th', benchmark);
      group.colSpan = count;
      group.scope = 'colgroup';
      i += count;
    }
    const labels = head.insertRow();
    for (const index of indices) {
      const metric = data.metrics[index];
      const th = cell(labels, 'th', '');
      th.scope = 'col';
      th.setAttribute('aria-sort', index === sort ? (descending ? 'descending' : 'ascending') : 'none');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = metric.label + (index === sort ? (descending ? ' ↓' : ' ↑') : ' ↕');
      button.setAttribute('aria-label', `${zh ? '排序：' : 'Sort by '}${metric.benchmark} ${metric.label}`);
      button.addEventListener('click', () => {
        descending = index === sort ? !descending : true;
        sort = index;
        render();
        table.querySelector(`button[aria-label="${button.getAttribute('aria-label')}"]`)?.focus({ preventScroll: true });
      });
      th.append(button);
    }
    const body = table.createTBody();
    for (const row of rows) {
      const tr = body.insertRow();
      tr.dataset.group = row.group;
      const model = cell(tr, 'th', '');
      model.scope = 'row';
      model.className = 'results-system';
      const name = document.createElement('span');
      name.textContent = row.model;
      model.append(name);
      indices.forEach(index => cell(tr, 'td', row.values[index] === null ? '—' : row.values[index].toFixed(1)));
    }
    status.textContent = zh ? `显示 ${rows.length} / ${data.rows.length} 个系统 · ${indices.length} 项指标` : `${rows.length} / ${data.rows.length} systems · ${indices.length} metrics`;
    table.classList.toggle('is-detailed', view === 'detailed');
    document.querySelectorAll('[data-result-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.resultView === view)));
    document.querySelectorAll('[data-result-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.resultFilter === filter)));
  }
  document.querySelectorAll('[data-result-view]').forEach(button => button.addEventListener('click', () => {
    view = button.dataset.resultView;
    if (view === 'overall' && ![6, 7, 8, 12, 13, 14].includes(sort)) { sort = 6; descending = true; }
    render();
  }));
  document.querySelectorAll('[data-result-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.resultFilter; render(); }));
  document.addEventListener('languagechange', render);
  fetch('results.json').then(response => {
    if (!response.ok) throw new Error('Results request failed');
    return response.json();
  }).then(value => {
    if (!Array.isArray(value.metrics) || value.metrics.length !== 15 || !Array.isArray(value.rows) || !value.rows.length || !value.sources || value.rows.some(row =>
      typeof row.model !== 'string' || !value.sources[row.source]?.url?.startsWith('https://') || !Array.isArray(row.values) || row.values.length !== 15 || row.values.some(score => score !== null && (!Number.isFinite(score) || score < 0 || score > 100)))) throw new Error('Invalid results data');
    data = value;
    render();
  }).catch(() => { failed = true; render(); });
})();
