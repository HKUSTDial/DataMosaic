import { useState, type KeyboardEvent } from 'react';

const useCases = [
  {
    id: 'finance', title: 'Finance', icon: 'M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7',
    headline: 'Read the story behind the numbers.',
    description: 'Bring report text, financial tables, and charts into the same investigation. Trace the drivers behind a result and organize the figures that matter.',
    analyze: 'Compare periods, interpret charts, and locate the evidence behind financial changes.',
    extract: 'Collect financial metrics and reporting periods as structured records.',
    filename: 'annual-report.pdf', page: '12', sourceTitle: 'Performance overview',
    excerpt: 'Revenue increased from $12.4m to $14.1m. Operating costs rose from $8.8m to $10.6m.',
    figureLabel: 'Revenue and operating costs', evidence: 'Text + financial chart',
    question: 'Why did operating margin fall?',
    answer: 'Operating costs grew faster than revenue.',
    fields: [['Revenue', '$14.1m'], ['Operating costs', '$10.6m']],
  },
  {
    id: 'healthcare', title: 'Healthcare', icon: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
    headline: 'Connect observations across the record.',
    description: 'Review report narratives, measurement tables, and visual trends together. Find what a record says and organize reported observations for further review.',
    analyze: 'Track reported changes and navigate to the source measurements and notes.',
    extract: 'Organize tests, values, units, and visit dates into consistent records.',
    filename: 'follow-up-report.pdf', page: '2', sourceTitle: 'Reported measurements',
    excerpt: 'CRP was reported as 8.1 mg/L at baseline and 4.2 mg/L at the follow-up visit.',
    figureLabel: 'Reported CRP trend', evidence: 'Report text + measurement trend',
    question: 'How did the reported CRP value change?',
    answer: 'The follow-up value decreased from 8.1 to 4.2 mg/L.',
    fields: [['Test', 'CRP'], ['Follow-up', '4.2 mg/L']],
  },
  {
    id: 'legal', title: 'Legal', icon: 'M12 3v17M5 21h14M5 6h14M5 6l-3 7h6L5 6zm14 0-3 7h6l-3-7z',
    headline: 'Make every obligation traceable.',
    description: 'Read clauses, schedules, and exhibits in context. Locate the terms relevant to a question and organize the details needed for document review.',
    analyze: 'Find obligations and explain how clauses and supporting exhibits relate.',
    extract: 'Capture parties, dates, notice periods, and contractual terms.',
    filename: 'service-agreement.pdf', page: '7', sourceTitle: 'Renewal and notice',
    excerpt: 'The agreement renews annually unless written notice is given at least 60 days before expiry.',
    figureLabel: 'Notice window before expiry', evidence: 'Clause + renewal schedule',
    question: 'What notice is required to prevent renewal?',
    answer: 'Written notice at least 60 days before expiry.',
    fields: [['Renewal', 'Annual'], ['Notice period', '60 days']],
  },
  {
    id: 'research', title: 'Research', icon: 'M9 3h6M10 3v6L4 19a1.4 1.4 0 0 0 1.2 2h13.6a1.4 1.4 0 0 0 1.2-2L14 9V3M7 15h10',
    headline: 'Reason across methods, figures, and results.',
    description: 'Read beyond a paper’s abstract. Connect figure-level observations with experimental tables and supporting passages to investigate a research question.',
    analyze: 'Interpret visual results and compare findings across a long paper.',
    extract: 'Organize methods, experimental settings, and reported measurements.',
    filename: 'experiment-results.pdf', page: '8', sourceTitle: 'Results by input length',
    excerpt: 'At 64K input length, Method A scores 71.2 and Method B scores 75.9 on the reported metric.',
    figureLabel: 'Method comparison across input lengths', evidence: 'Experiment figure + results table',
    question: 'Which method scores higher at 64K?',
    answer: 'Method B: 75.9, compared with Method A’s 71.2.',
    fields: [['Method', 'B'], ['Score at 64K', '75.9']],
  },
];

export default function UseCases() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = useCases[selectedIndex];

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % useCases.length;
    else if (event.key === 'ArrowLeft') next = (index + useCases.length - 1) % useCases.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = useCases.length - 1;
    else return;
    event.preventDefault();
    setSelectedIndex(next);
    document.getElementById(`case-tab-${useCases[next].id}`)?.focus();
  }

  return <section className="use-case-section" aria-labelledby="use-cases-title">
    <div className="section-heading use-case-heading">
      <div><p className="section-kicker">Use cases</p><h2 id="use-cases-title">See the whole document.<br/><em>Solve the real task.</em></h2></div>
      <p>Connect text, tables, charts, and page images with the questions and data that matter to your work.</p>
    </div>
    <div className={`use-case-shell case-${selected.id}`}>
      <div className="case-tabs" role="tablist" aria-label="Document use cases">
        {useCases.map((item, index) => <button
          key={item.id} className="case-tab" type="button" role="tab"
          id={`case-tab-${item.id}`} aria-selected={selectedIndex === index}
          aria-controls="case-panel" tabIndex={selectedIndex === index ? 0 : -1}
          onClick={() => setSelectedIndex(index)} onKeyDown={event => handleTabKey(event, index)}
        ><svg viewBox="0 0 24 24" aria-hidden="true"><path d={item.icon}/></svg>{item.title}</button>)}
      </div>
      <div className="case-panel" id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${selected.id}`} tabIndex={0}>
        <div className="case-copy">
          <span className="case-domain">{selected.title} / Document intelligence</span>
          <h3>{selected.headline}</h3>
          <p className="case-description">{selected.description}</p>
          <div className="case-capability"><span className="case-capability-label">DocMosaic</span><p>{selected.analyze}</p></div>
          <div className="case-capability extract-capability"><span className="case-capability-label">DBMosaic</span><p>{selected.extract}</p></div>
          <div className="case-actions"><a href="/docmosaic/">Open DocMosaic <span aria-hidden="true">↗</span></a><a href="/dbmosaic/">Open DBMosaic <span aria-hidden="true">↗</span></a></div>
        </div>
        <div className="case-preview" key={selected.id} role="group" aria-label={`${selected.title} illustrative document workflow`}>
          <div className="case-source">
            <div className="case-file"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5zM15 3v5h4"/></svg><span>{selected.filename}</span><b>PDF</b></div>
            <div className="case-source-body">
              <div className="case-passage"><strong>{selected.sourceTitle}</strong><p>{selected.excerpt}</p><span className="case-source-evidence">{selected.evidence}</span></div>
              <div className="case-figure-wrap">
                <svg className="case-figure" viewBox="0 0 150 105" aria-hidden="true">
                  {selected.id !== 'legal' && <path className="figure-axis" d="M12 10v72h126M12 47h126"/>}
                  {selected.id === 'finance' && <g className="figure-bars"><rect x="26" y="30" width="17" height="52" rx="2"/><rect className="figure-secondary" x="47" y="46" width="17" height="36" rx="2"/><rect x="91" y="22" width="17" height="60" rx="2"/><rect className="figure-secondary" x="112" y="37" width="17" height="45" rx="2"/><text x="45" y="99">FY24</text><text x="110" y="99">FY25</text></g>}
                  {selected.id === 'healthcare' && <g><path className="figure-area" d="M22 24 73 44 127 64V82H22Z"/><path className="figure-line" d="M22 24 73 44 127 64"/><circle className="figure-point" cx="22" cy="24" r="4"/><circle className="figure-point" cx="127" cy="64" r="4"/><text x="27" y="99">Baseline</text><text x="118" y="99">Follow-up</text></g>}
                  {selected.id === 'legal' && <g><path className="figure-axis" d="M15 52h120"/><rect className="figure-area" x="60" y="32" width="69" height="40" rx="5"/><path className="figure-line" d="M64 52h61"/><circle className="figure-point" cx="64" cy="52" r="4"/><circle className="figure-point" cx="125" cy="52" r="4"/><text x="95" y="26">60 days</text><text x="64" y="91">Notice</text><text x="125" y="91">Expiry</text></g>}
                  {selected.id === 'research' && <g><path className="figure-secondary figure-line" d="M22 59 55 53 89 42 127 39"/><path className="figure-line" d="M22 48 55 35 89 24 127 19"/><circle className="figure-point" cx="127" cy="19" r="4"/><text x="22" y="99">8K</text><text x="73" y="99">32K</text><text x="127" y="99">64K</text><text x="137" y="22">B</text><text x="137" y="42">A</text></g>}
                </svg>
                <span>{selected.figureLabel}</span>
              </div>
            </div>
          </div>
          <svg className="case-branches" viewBox="0 0 400 32" preserveAspectRatio="none" aria-hidden="true"><path d="M200 0v9M100 32v-11q0-12 12-12h176q12 0 12 12v11"/><circle cx="200" cy="9" r="3"/></svg>
          <div className="case-output-grid">
            <div className="case-output case-analyze-output"><span className="case-output-label">DocMosaic <span aria-hidden="true">↗</span></span><p className="case-question">{selected.question}</p><p className="case-answer">{selected.answer}</p><span className="case-citation">Source evidence · p. {selected.page}</span></div>
            <div className="case-output case-extract-output"><span className="case-output-label">DBMosaic <span aria-hidden="true">{'{ }'}</span></span><dl className="case-record">{selected.fields.map(([field, value]) => <div key={field}><dt>{field}</dt><dd>{value}</dd></div>)}</dl><span className="case-citation">Structured record</span></div>
          </div>
          <p className="case-example-label">Illustrative example</p>
        </div>
      </div>
    </div>
  </section>;
}
