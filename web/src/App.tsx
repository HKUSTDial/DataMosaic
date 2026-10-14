import { useEffect, useState } from 'react';
import UseCases from './UseCases';
import ProductPreview from './ProductPreview';
import DemoDialog from './DemoDialog';

const previewSources = [
  { format: 'TXT', filename: 'notes.txt', kind: 'txt', icon: 'M8 10h8M8 14h8M8 18h5' },
  { format: 'DOCX', filename: 'report.docx', kind: 'docx', icon: 'M8 10h8M8 14h8M8 18h8' },
  { format: 'MD', filename: 'README.md', kind: 'md', icon: 'M8 11v6l3-3 3 3v-6M17 11v6m-2-2 2 2 2-2' },
  { format: 'PPTX', filename: 'slides.pptx', kind: 'pptx', icon: 'M8 11h8v6H8zM10 20h4M12 17v3' },
];

function ServiceStatus({ url }: { url: string }) {
  const [status, setStatus] = useState<'checking' | 'ok' | 'bad'>('checking');

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { cache: 'no-store', signal: controller.signal })
      .then(response => setStatus(response.ok ? 'ok' : 'bad'))
      .catch(() => { if (!controller.signal.aborted) setStatus('bad'); });
    return () => controller.abort();
  }, [url]);

  return <span className={`service-status ${status === 'checking' ? '' : status}`} role="status">
    {status === 'checking' ? 'Checking…' : status === 'ok' ? 'Available' : 'Unavailable'}
  </span>;
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const [previewPaused, setPreviewPaused] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'analyze' | 'extract' | null>(null);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.dataset.theme === 'dark');

  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', darkMode ? '#111720' : '#f4f6f8');
    try {
      window.localStorage.setItem('docsensaai-theme', theme);
    } catch {
      // Theme switching remains available when browser storage is blocked.
    }
  }, [darkMode]);

  return <div className={`app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}${previewPaused ? ' animations-paused' : ''}`}>
    <aside className="sidebar" id="primary-sidebar" aria-label="Primary navigation">
      <div className="sidebar-header">
        <a className="brand" href="/" aria-label="DocSensaAI home">
          <span className="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
          <span className="brand-name">DocSensa<span>AI</span></span>
        </a>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setSidebarCollapsed(collapsed => !collapsed)}
          aria-expanded={!sidebarCollapsed}
          aria-controls="primary-sidebar"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/><path d={sidebarCollapsed ? 'm13 9 3 3-3 3' : 'm16 9-3 3 3 3'}/></svg>
        </button>
      </div>
      <nav className="side-nav" aria-label="Main navigation">
        <a className="nav-link current" href="/" aria-current="page" aria-label="Overview" title="Overview">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg><span className="nav-text">Overview</span>
        </a>
        <a className="nav-link" href="/analyze/" aria-label="Analyze" title="Analyze">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H16l4 4v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5z"/><path d="M15.5 3v4.5H20M8 11h8M8 15h5"/></svg><span className="nav-text">Analyze</span>
        </a>
        <a className="nav-link" href="/extract/" aria-label="Extract" title="Extract">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 10h18M9 10v10M15 10v10M7 7h3"/></svg><span className="nav-text">Extract</span>
        </a>
      </nav>
      <div className="sidebar-resources">
        <p className="resource-heading">Resource</p>
        <nav className="resource-nav" aria-label="Resources">
          <a className="nav-link" href="https://github.com/SetonLiang/DocSensaAI" target="_blank" rel="noreferrer" aria-label="Documentation (opens in a new tab)" title="Documentation">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v15M3 5c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0v15c-3-1.5-6-1.5-9 0-3-1.5-6-1.5-9 0z"/></svg><span className="nav-text">Documentation</span>
            <svg className="resource-external" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>
          </a>
          <a className="nav-link" href="https://github.com/SetonLiang/DocSensaAI/issues/new" target="_blank" rel="noreferrer" aria-label="Contact us (opens in a new tab)" title="Contact us">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 1v-9.5a8.5 8.5 0 0 1 17 0zM7 10h9M7 14h6"/></svg><span className="nav-text">Contact us</span>
            <svg className="resource-external" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>
          </a>
        </nav>
      </div>
    </aside>

    <div className="page">
      <header className="topbar">
        <div className="breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><strong>Overview</strong></div>
        <button className="theme-toggle" type="button" onClick={() => setDarkMode(value => !value)} aria-pressed={darkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Light mode' : 'Dark mode'}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{darkMode ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></> : <path d="M20.7 13.4A8.8 8.8 0 0 1 10.6 3.3a8.8 8.8 0 1 0 10.1 10.1Z"/>}</svg>
        </button>
      </header>
      <main className="content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Unlock the intelligence in your documents. <em>Put it to work.</em></h1>
            <p className="hero-description">Ask questions, follow the evidence, or turn documents into structured data. Choose the workflow that fits the result you need.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="/analyze/">Open Analyze <span aria-hidden="true">↗</span></a>
              <a className="button button-secondary" href="/extract/">Explore Extract <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className="preview-sources" role="list" aria-label="Illustrative document formats">
            {previewSources.map(source => <div className={`preview-source source-${source.kind}`} key={source.format} role="listitem" aria-label={source.kind === 'md' ? 'Markdown: README.md' : `${source.format}: ${source.filename}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5zM15 3v5h4"/><path d={source.icon}/></svg>
              <div><strong>{source.format}</strong><span>{source.filename}</span></div>
            </div>)}
            <svg className="preview-source-links" viewBox="0 0 20 200" preserveAspectRatio="none" aria-hidden="true">
              <path className="connection-track" d="M0 22h3q7 0 7 7v142q0 7-7 7H0M0 74h10M0 126h10M10 100h10"/>
              <path className="connection-flow source-flow" d="M0 22h3q7 0 7 7v142q0 7-7 7H0M0 74h10M0 126h10M10 100h10"/>
            </svg>
          </div>
          <div className={`hero-preview${previewPaused ? ' preview-paused' : ''}`} role="group" aria-label="Illustrative workflow: a document with text, tables and figures is scanned; evidence leads to answers and structured records">
            <div className="preview-grid" aria-hidden="true"></div>
            <svg className="preview-connections" viewBox="0 0 440 380" preserveAspectRatio="none" aria-hidden="true">
              <path className="connection-track" d="M195 119H222Q238 119 238 103V100Q238 84 255 84H282"/>
              <path className="connection-track" d="M195 209H222Q238 209 238 225V244Q238 260 255 260H282"/>
              <path className="connection-flow analyze-flow" d="M195 119H222Q238 119 238 103V100Q238 84 255 84H282"/>
              <path className="connection-flow extract-flow" d="M195 209H222Q238 209 238 225V244Q238 260 255 260H282"/>
            </svg>
            <div className="preview-document">
              <div className="preview-document-head"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h6"/></svg><span className="preview-filename">source-document.pdf</span><span>PDF</span></div>
              <div className="paper">
                <div className="paper-scan" aria-hidden="true"></div>
                <div className="paper-heading"></div>
                <div className="paper-line long"></div><div className="paper-line medium"></div>
                <div className="paper-table" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>
                <div className="paper-evidence"><span className="evidence-anchor">E1</span><div className="paper-line long"></div><div className="paper-line medium"></div></div>
                <div className="paper-chart" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
                <div className="paper-line medium"></div>
              </div>
              <div className="preview-document-foot"><span className="preview-dot"></span> PAGE 05 <span>·</span> EVIDENCE LOCATED</div>
            </div>
            <div className="preview-modalities" aria-label="Document content: text, tables and figures"><span>Text</span><span>Tables</span><span>Figures</span></div>
            <div className="preview-result analyze-result">
              <span className="result-kicker"><span></span> ANALYZE</span>
              <strong>Grounded answers</strong>
              <div className="answer-lines" aria-hidden="true"><span></span><span></span></div>
              <span className="result-citation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg> Source linked <b>p. 05</b></span>
            </div>
            <div className="preview-result extract-result">
              <span className="result-kicker"><span></span> EXTRACT</span>
              <strong>Structured output</strong>
              <div className="result-code"><span>{'{'}</span><span><i>"page"</i>: <b>5</b>,</span><span><i>"evidence"</i>: <b>"E1"</b></span><span>{'}'}</span></div>
            </div>
            <div className="preview-caption"><span></span> Workflow preview
              <button className="preview-toggle" type="button" onClick={() => setPreviewPaused(paused => !paused)} aria-pressed={previewPaused} aria-label={previewPaused ? 'Resume workflow animations' : 'Pause workflow animations'} title={previewPaused ? 'Resume animations' : 'Pause animations'}>
                <svg viewBox="0 0 16 16" aria-hidden="true">{previewPaused ? <path d="m5 3 8 5-8 5Z"/> : <path d="M5 3v10M11 3v10"/>}</svg>
              </button>
            </div>
          </div>
        </section>

        <section className="workflow-section" aria-labelledby="workflows-title">
          <div className="section-heading product-heading">
            <div><p className="section-kicker">Product</p><h2 id="workflows-title">Put your documents <em>to work.</em></h2></div>
            <p>A growing collection of tools to understand documents, investigate evidence, and build structured data.</p>
          </div>
          <div className="workflow-grid">
            <article className="workflow-card analyze">
              <a className="card-main" href="/analyze/" aria-label="Open Analyze">
              <span className="card-header"><span className="card-title"><span className="card-number">01</span>Analyze <span className="workflow-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 3h11l3 3v5M4 3v18h7M8 7h5M8 11h3"/><circle cx="15" cy="15" r="4"/><path d="m18 18 3 3"/></svg></span></span><ServiceStatus url="/analyze/api/health"/></span>
              <span className="card-description">Ask complex questions across text, tables, and figures. Inspect agent steps and trace answers back to source evidence.</span>
              <ProductPreview mode="analyze"/>
              <span className="card-features"><span>Document Q&amp;A</span><span>Evidence navigation</span></span>
              </a>
              <div className="card-actions"><a href="/analyze/">Open Analyze <span aria-hidden="true">↗</span></a><button className="card-demo" type="button" onClick={() => setActiveDemo('analyze')} aria-label="Watch Analyze demo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>Demo</button></div>
            </article>
            <article className="workflow-card extract">
              <a className="card-main" href="/extract/" aria-label="Open Extract">
              <span className="card-header"><span className="card-title"><span className="card-number">02</span>Extract <span className="workflow-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></svg></span></span><ServiceStatus url="/api/health"/></span>
              <span className="card-description">Turn document content into schema-defined records. Review entities and relationships, then export structured results.</span>
              <ProductPreview mode="extract"/>
              <span className="card-features"><span>Schema-driven</span><span>Structured results</span></span>
              </a>
              <div className="card-actions"><a href="/extract/">Open Extract <span aria-hidden="true">↗</span></a><button className="card-demo" type="button" onClick={() => setActiveDemo('extract')} aria-label="Watch Extract demo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>Demo</button></div>
            </article>
            <article className="coming-soon-card">
              <div className="coming-soon-visual" aria-hidden="true"><span><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M17.5 14v7M14 17.5h7"/></svg></span><i></i><span><svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16"/></svg></span></div>
              <div className="coming-soon-copy"><div><h3>More capabilities</h3><span className="coming-soon-badge">Coming soon</span></div><p>An expanding workspace for document intelligence. More modules and workflows are on the way.</p></div>
            </article>
          </div>
        </section>
        <UseCases/>
      </main>
    </div>
    {activeDemo && <DemoDialog key={activeDemo} mode={activeDemo} onClose={() => setActiveDemo(null)}/>}
  </div>;
}
