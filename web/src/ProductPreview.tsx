const documentTools = [
  { name: 'Navigate', icon: 'M3 5h7v14H3zM14 5h7v14h-7zM6 9h1M17 9h1' },
  { name: 'Focus', icon: 'M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5M9 9h6v6H9z' },
  { name: 'Extract', icon: 'M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h5' },
  { name: 'Solve', icon: 'M8 5 2 12l6 7M16 5l6 7-6 7M14 3l-4 18' },
];

export default function ProductPreview({ mode }: { mode: 'analyze' | 'extract' }) {
  const analyzing = mode === 'analyze';

  return <div className={`product-preview preview-${mode}`} role="img" aria-label={analyzing
    ? 'Illustrative DocPilot orchestration: Navigate locates a map on page 7 and supporting text and a table on page 12; Focus inspects Iowa; Extract gathers evidence; Solve calculates the cost-per-GW decrease; verification grounds the final answer'
    : 'Illustrative constraint-aware extraction: read an invoice under schema constraints, verify required fields, numeric types and totals, fix an inconsistent total from 3200 to 3300, re-check and produce a validated record'}>
    <div className="product-workflow-heading"><strong>{analyzing ? 'Agent orchestration' : 'Constraint-aware extraction'}</strong><span>Illustrative workflow</span></div>
    <div className="product-scene">
      <div className="product-source-stack">
        <div className="product-source-sheet">
          <span className="product-scan" aria-hidden="true"></span>
          <div className="product-source-label"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5zM15 3v5h4"/></svg><span>{analyzing ? 'REPORT' : 'INVOICE'}</span><b>{analyzing ? '64 pp.' : '#042'}</b></div>
          {analyzing ? <div className="product-report-body">
            <div className="product-report-stage report-navigate">
              <strong className="product-document-title">Candidate pages</strong>
              <div className="product-page-grid">{[1, 3, 7, 9, 12, 15].map(page => <div className={`product-page-thumb${page === 7 || page === 12 ? ' is-hit' : ''}`} key={page}>
                <span className="product-text-line"></span><span className="product-text-line short"></span>
                <span className="product-page-graphic"></span><b>p. {page}</b>
              </div>)}</div>
              <div className="product-report-step">Navigate · p. 07 + 12</div>
            </div>
            <div className="product-report-stage report-focus">
              <strong className="product-document-title">Focus · p. 07</strong>
              <svg className="product-map" viewBox="0 0 120 78" aria-hidden="true">
                <g><rect x="8" y="12" width="18" height="15" rx="2"/><rect x="29" y="12" width="18" height="15" rx="2"/><rect x="50" y="12" width="18" height="15" rx="2"/><rect x="71" y="12" width="18" height="15" rx="2"/><rect x="92" y="12" width="18" height="15" rx="2"/><rect x="8" y="30" width="18" height="15" rx="2"/><rect x="29" y="30" width="18" height="15" rx="2"/><rect className="product-map-focus" x="50" y="30" width="18" height="15" rx="2"/><rect x="71" y="30" width="18" height="15" rx="2"/><rect x="92" y="30" width="18" height="15" rx="2"/><rect x="29" y="48" width="18" height="15" rx="2"/><rect x="50" y="48" width="18" height="15" rx="2"/><rect x="71" y="48" width="18" height="15" rx="2"/></g>
                <rect className="product-map-selection" x="47" y="27" width="24" height="21" rx="3"/><text x="59" y="41">IA</text>
              </svg>
              <div className="product-focus-detail"><span>Iowa</span><strong>62.4%</strong><span>Highest renewable share</span></div>
              <div className="product-report-step">Focus · zoomed region</div>
            </div>
            <div className="product-report-stage report-extract">
              <strong className="product-document-title">Extracted evidence</strong>
              <div className="product-extracted-card"><span>p. 07 · map</span><strong>Iowa · 62.4%</strong></div>
              <div className="product-extracted-card"><span>p. 12 · criterion</span><strong>Substantial: ≥15%</strong></div>
              <table className="product-evidence-table"><caption>p. 12 · cost/GW</caption><thead><tr><th>2022</th><th>2023</th></tr></thead><tbody><tr><td>6.62</td><td>5.30</td></tr></tbody></table>
              <div className="product-report-step">Extract · map + text + table</div>
            </div>
            <div className="product-report-stage report-solve">
              <strong className="product-document-title">Numerical reasoning</strong>
              <div className="product-calculation"><span>Cost/GW decrease</span><code>(6.62 − 5.30)<br/>÷ 6.62 × 100</code><strong>19.9%</strong></div>
              <div className="product-solve-check"><span>≥15% criterion</span><strong>Substantial ✓</strong></div>
              <div className="product-report-step">Solve · ready to verify</div>
            </div>
          </div> : <>
            <strong className="product-document-title">Example Co.</strong>
            <div className="product-text-line short"></div>
            <div className="product-invoice-grid"><span>Item</span><span>Qty</span><span>Total</span><span>Services</span><span>1</span><span>$2,400</span><span>Review</span><span>1</span><span>$900</span></div>
            <div className="product-total"><span>Total</span><strong>$3,300</strong></div>
            <div className="product-schema-tags"><span>company: string</span><span>amount: number</span><span>total = Σ items</span></div>
          </>}
        </div>
      </div>
      <div className={`product-tool-panel${analyzing ? '' : ' product-constraint-panel'}`}>
        <span className="product-panel-title">{analyzing ? 'Tool calls' : 'Extract + verify'}</span>
        {analyzing ? <>
          <div className="product-tool-grid">{documentTools.map(tool => <div className="product-tool-node" key={tool.name}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={tool.icon}/></svg><span>{tool.name}</span></div>)}</div>
          <div className="product-verification"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg><span>Analyze · Verify</span></div>
        </> : <>
          <div className="product-constraint-list"><span>Required fields</span><span>Numeric types</span><span>Σ items = total</span></div>
          <div className="product-repair-state"><span>Total mismatch</span><code><s>3200</s> → <b>3300</b></code></div>
          <div className="product-fix-loop"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12 0l2 3M18 17a7 7 0 0 1-12 0l-2-3"/></svg><span>Fix &amp; re-check</span></div>
        </>}
      </div>
      <div className="product-output">
        <div className="product-output-header"><span></span>{analyzing ? 'Grounded answer' : 'Validated record'}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></div>
        {analyzing ? <>
          <span className="product-example-question">Highest share + efficiency gain?</span>
          <p className="product-example-answer"><strong>Iowa.</strong> Cost/GW fell <strong>19.9%</strong>.</p>
          <div className="product-answer-evidence"><span>p. 07</span><span>p. 12</span><span>Map · table · text</span></div>
          <div className="product-answer-criterion">Meets the ≥15% criterion.</div>
        </> : <>
          <code className="product-json"><span>{'{'}</span><span><i>"company"</i>: <b>"Example Co."</b>,</span><span><i>"amount"</i>: <b>3300</b></span><span>{'}'}</span></code>
          <div className="product-record-row"><span>company</span><span>amount</span><b>Example Co.</b><b>3,300</b></div>
        </>}
        <div className="product-final-status"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>{analyzing ? 'Evidence verified' : 'Constraints checked'}</div>
      </div>
    </div>
    <div className="product-preview-caption">{(analyzing
      ? ['Document', 'Navigate', 'Focus', 'Extract', 'Solve', 'Verify', 'Answer']
      : ['Document + schema', 'Extract', 'Verify', 'Fix', 'Re-check', 'Structure']).map((step, index) => <span key={step}>{index > 0 && <i aria-hidden="true">→</i>}{step}</span>)}</div>
  </div>;
}
