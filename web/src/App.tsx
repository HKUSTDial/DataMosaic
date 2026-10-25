import { useEffect, useState } from 'react';
import UseCases from './UseCases';
import ProductPreview from './ProductPreview';
import DemoDialog from './DemoDialog';
import SiteHeader from './SiteHeader';
import ResearchPage from './ResearchPage';

/* const previewSources = [
  { format: 'TXT', filename: 'notes.txt', kind: 'txt', icon: 'M8 10h8M8 14h8M8 18h5' },
  { format: 'DOCX', filename: 'report.docx', kind: 'docx', icon: 'M8 10h8M8 14h8M8 18h8' },
  { format: 'MD', filename: 'README.md', kind: 'md', icon: 'M8 11v6l3-3 3 3v-6M17 11v6m-2-2 2 2 2-2' },
  { format: 'PPTX', filename: 'slides.pptx', kind: 'pptx', icon: 'M8 11h8v6H8zM10 20h4M12 17v3' },
]; */

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
  const isResearchPage = /^\/research\/?$/.test(window.location.pathname);
  const isText2SQLPage = /^\/ontomosaic-text2sql\/?$/.test(window.location.pathname);
  // const [previewPaused, setPreviewPaused] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'analyze' | 'extract' | null>(null);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.dataset.theme === 'dark');

  useEffect(() => {
    document.title = isText2SQLPage ? 'OntoMosaic-Text2SQL | DataMosaic' : isResearchPage ? 'Research Papers | DataMosaic' : 'DataMosaic';
    const theme = darkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', darkMode ? '#111720' : '#f4f6f8');
    try {
      window.localStorage.setItem('docsensaai-theme', theme);
    } catch {
      // Theme switching remains available when browser storage is blocked.
    }
  }, [darkMode, isResearchPage, isText2SQLPage]);

  return <div className="app-shell">
    <SiteHeader darkMode={darkMode} onToggleTheme={() => setDarkMode(value => !value)}/>
    <div className="page">
      <main className={`content${isResearchPage ? ' research-content' : ''}`}>
        {isText2SQLPage ? null : isResearchPage ? <ResearchPage/> : <>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Unlock the intelligence in your documents. <em>Put it to work.</em></h1>
            <p className="hero-description">Ask questions, follow the evidence, or turn documents into structured data. Choose the workflow that fits the result you need.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="/analyze/">Open DocMosaic <span aria-hidden="true">↗</span></a>
              <a className="button button-secondary" href="/extract/">Explore DBMosaic <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          {/* <div className="preview-sources" role="list" aria-label="Illustrative document formats">
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
          </div> */}
        </section>

        <section className="workflow-section" aria-labelledby="workflows-title">
          <div className="section-heading product-heading">
            <div><p className="section-kicker">Application Layer</p><h2 id="workflows-title">Put your documents <em>to work.</em></h2></div>
            <p>A growing collection of tools to understand documents, investigate evidence, and build structured data.</p>
          </div>
          <div className="workflow-grid">
            <article className="workflow-card analyze">
              <a className="card-main" href="/analyze/" aria-label="Open DocMosaic">
              <span className="card-header"><span className="card-title"><span className="card-number">01</span>DocMosaic <span className="workflow-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 3h11l3 3v5M4 3v18h7M8 7h5M8 11h3"/><circle cx="15" cy="15" r="4"/><path d="m18 18 3 3"/></svg></span></span><ServiceStatus url="/analyze/api/health"/></span>
              <span className="card-description">Ask complex questions across text, tables, and figures. Inspect agent steps and trace answers back to source evidence.</span>
              <ProductPreview mode="analyze"/>
              <span className="card-features"><span>Document Q&amp;A</span><span>Evidence navigation</span></span>
              </a>
              <div className="card-actions"><a href="/analyze/">Open DocMosaic <span aria-hidden="true">↗</span></a><button className="card-demo" type="button" onClick={() => setActiveDemo('analyze')} aria-label="Watch DocMosaic demo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>Demo</button></div>
            </article>
            <article className="workflow-card extract">
              <a className="card-main" href="/extract/" aria-label="Open DBMosaic">
              <span className="card-header"><span className="card-title"><span className="card-number">02</span>DBMosaic <span className="workflow-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></svg></span></span><ServiceStatus url="/api/health"/></span>
              <span className="card-description">Turn document content into schema-defined records. Review entities and relationships, then export structured results.</span>
              <ProductPreview mode="extract"/>
              <span className="card-features"><span>Schema-driven</span><span>Structured results</span></span>
              </a>
              <div className="card-actions"><a href="/extract/">Open DBMosaic <span aria-hidden="true">↗</span></a><button className="card-demo" type="button" onClick={() => setActiveDemo('extract')} aria-label="Watch DBMosaic demo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>Demo</button></div>
            </article>
            <article className="coming-soon-card">
              <div className="coming-soon-visual" aria-hidden="true"><span><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M17.5 14v7M14 17.5h7"/></svg></span><i></i><span><svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16"/></svg></span></div>
              <div className="coming-soon-copy"><div><h3>More capabilities</h3><span className="coming-soon-badge">Coming soon</span></div><p>An expanding workspace for document intelligence. More modules and workflows are on the way.</p></div>
            </article>
          </div>
        </section>
        <section className="ontology-section" aria-labelledby="ontologies-title">
          <div className="section-heading product-heading">
            <div><p className="section-kicker">Ontology Layer</p><h2 id="ontologies-title">Knowledge for <em>your workflows.</em></h2></div>
          </div>
          <div className="workflow-grid">
            <article className="workflow-card">
              <a className="card-main" href="/ontomosaic-text2sql" aria-label="Open OntoMosaic-Text2SQL">
                <span className="card-header"><span className="card-title"><span className="card-number">01</span>OntoMosaic-Text2SQL <span className="workflow-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 8v4M5 16v-4h14v4"/><rect x="9" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="16" width="6" height="6" rx="1.5"/><rect x="16" y="16" width="6" height="6" rx="1.5"/></svg></span></span></span>
              </a>
              <div className="card-actions"><a href="/ontomosaic-text2sql">Open OntoMosaic-Text2SQL <span aria-hidden="true">↗</span></a></div>
            </article>
            <article className="coming-soon-card">
              <div className="coming-soon-visual" aria-hidden="true"><span><svg viewBox="0 0 24 24"><path d="M12 8v4M5 16v-4h14v4"/><rect x="9" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="16" width="6" height="6" rx="1.5"/><rect x="16" y="16" width="6" height="6" rx="1.5"/></svg></span><i></i><span><svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16"/></svg></span></div>
              <div className="coming-soon-copy"><div><h3>More ontologies coming soon</h3></div></div>
            </article>
          </div>
        </section>
        <UseCases/>
        </>}
      </main>
    </div>
    {activeDemo && <DemoDialog key={activeDemo} mode={activeDemo} onClose={() => setActiveDemo(null)}/>}
  </div>;
}
