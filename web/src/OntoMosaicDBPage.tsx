import { useEffect, useRef, useState } from 'react';
import OntologyGraphDetail from './features/ontology/OntologyGraphDetail';
import { siteUrl } from './site';
import './ontomosaic-db-page.css';
import overviewVideo from '../../assets/OntoMosaic-DB-overview.mp4';

type IconName = 'network' | 'search' | 'chart' | 'workflow' | 'database' | 'files';
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    network: <><rect x="9" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="16" width="6" height="6" rx="1.5"/><rect x="16" y="16" width="6" height="6" rx="1.5"/><path d="M12 8v4M5 16v-4h14v4"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    chart: <><path d="M4 3v17h17M8 16v-5M13 16V7M18 16v-3"/></>,
    workflow: <><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h6a3 3 0 0 1 3 3v6M6 9v6a3 3 0 0 0 3 3h6"/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></>,
    files: <><path d="M8 3h8l4 4v13H8zM16 3v5h4M4 7v15h11M11 12h6M11 16h6"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const graphViews = {
  full: { label: 'Full graph', viewBox: '0 0 1080 780' },
  business: { label: 'Business structure', viewBox: '8 50 1045 190' },
  mapping: { label: 'Data mappings', viewBox: '8 250 1050 520' },
};
type GraphView = keyof typeof graphViews;

export default function OntoMosaicDBPage() {
  const [graphView, setGraphView] = useState<GraphView>('full');
  const graphRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    graphRef.current?.querySelector('svg')?.setAttribute('viewBox', graphViews[graphView].viewBox);
  }, [graphView]);

  return <div id="ontomosaic-public">
    <a className="op-skip" href="#op-main">Skip to content</a>
    <header className="op-header">
      <div className="op-wrap op-header-inner">
        <a className="op-brand" href="#ontology" aria-label="OntoMosaic-DB overview"><Icon name="network"/>OntoMosaic-DB<span>.</span></a>
        <nav className="op-nav" aria-label="Page sections">
          <a href="#ontology">Ontology</a><a href="#applications">Applications</a><a href="#get-started">Get started</a><a href="#design-principles">Design principles</a>
        </nav>
      </div>
    </header>
    <main className="op-wrap" id="op-main">
      <section className="op-hero" id="ontology" aria-labelledby="op-title">
        <p className="op-eyebrow"><a href={siteUrl('/')}>DATAMOSAIC</a> / ONTOLOGY LAYER</p>
        <h1 id="op-title">Your business knowledge, <em>connected to your data.</em></h1>
        <p className="op-lead">OntoMosaic-DB builds ontology graphs that describe your business, explain your data, and connect the two—giving database tasks a shared foundation of knowledge.</p>
        <div className="op-layers">
          <article><h3><span className="op-marker business"/>Business semantics &amp; processes</h3><p>Business concepts, objects and events; their relationships, and the steps and conditions of business processes.</p></article>
          <article><h3><span className="op-marker data"/>The meaning of database data</h3><p>What tables, columns and values represent, including record granularity, units and value codes.</p></article>
          <article><h3><span className="op-marker mapping"/>Business-to-data mappings</h3><p>How concepts and metrics map to data through matching conditions, calculations and dependencies.</p></article>
        </div>
        <div className="op-graph">
          <div className="op-graph-heading"><span>Ontology graph example</span><div className="op-graph-controls" role="group" aria-label="Graph view">{(Object.keys(graphViews) as GraphView[]).map(view => <button key={view} type="button" aria-pressed={graphView === view} onClick={() => setGraphView(view)}>{graphViews[view].label}</button>)}</div></div>
          <div className="op-graph-drawing" ref={graphRef}><OntologyGraphDetail/></div>
          <div className="op-graph-legend"><span><i className="op-marker business"/>Business structure</span><span><i className="op-marker mapping"/>Concepts, metrics &amp; rules</span><span><i className="op-marker binding"/>Data dependencies</span></div>
        </div>
      </section>
      <section className="op-section op-video-section" id="product-overview" aria-labelledby="op-video-title">
        <h2 id="op-video-title">Product overview</h2>
        <video className="op-video" src={overviewVideo} controls playsInline preload="metadata" width="1920" height="1080" aria-label="OntoMosaic-DB product overview">
          Your browser does not support embedded video. <a href={overviewVideo}>Download the product overview</a>.
        </video>
      </section>
      <section className="op-section" id="applications" aria-labelledby="op-applications-title">
        <p className="op-eyebrow">WHAT IT ENABLES</p><h2 id="op-applications-title">One knowledge foundation. Many database tasks.</h2>
        <p className="op-intro">Reuse business definitions and data mappings wherever a task needs to understand your database.</p>
        <div className="op-columns">
          <article><h3><Icon name="search"/>Understand the data</h3><p>Find what a field means, which records match a concept, and how business objects relate.</p></article>
          <article><h3><Icon name="chart"/>Support business analysis</h3><p>Supply metric definitions, calculation rules and data dependencies to analytical workflows.</p></article>
          <article><h3><Icon name="workflow"/>Ground database agents</h3><p>Retrieve relevant business knowledge to help agents reason about and work with the data.</p></article>
        </div>
      </section>
      <section className="op-section" id="get-started" aria-labelledby="op-inputs-title">
        <p className="op-eyebrow">GET STARTED</p><h2 id="op-inputs-title">Easy to get started.</h2>
        <p className="op-intro">Provide a database and trusted question–SQL examples. OntoMosaic-DB handles knowledge extraction and graph construction.</p>
        <div className="op-inputs">
          <article><h3><span className="op-number">01</span>Select a database</h3><p>Upload a database file or choose an available database.</p><span className="op-input-detail"><Icon name="database"/>SQLite file upload is currently supported.</span></article>
          <article><h3><span className="op-number">02</span>Add trusted (NLQ, SQL) pairs</h3><p>Provide questions and verified SQL for the same database.</p></article>
        </div>
        <div className="op-extension"><div><Icon name="files"/><span><strong>Additional database context</strong><span className="op-progress">In progress</span></span></div><p>Extending web inputs to include data dictionaries, database descriptions and business definitions.</p></div>
      </section>
      <section className="op-section" id="design-principles" aria-labelledby="op-principles-title">
        <p className="op-eyebrow">DESIGN PRINCIPLES</p><h2 id="op-principles-title">Designed for reliable, reusable knowledge.</h2>
        <div className="op-columns op-principles">
          <article><h3>Learn from examples and mistakes</h3><p>Learn from trusted examples and use errors to uncover missing or misunderstood business logic.</p></article>
          <article><h3>Keep knowledge grounded in evidence</h3><p>Link definitions to data and source examples, then check their meaning and use.</p></article>
          <article><h3>Reuse knowledge without losing context</h3><p>Combine knowledge across examples while preserving its sources, scope and meaningful differences.</p></article>
        </div>
      </section>
      <div className="op-closing"><span>Ready to build your database knowledge?</span><a className="op-primary" href="https://github.com/HKUSTDial/DataMosaic/blob/main/docs/ontomosaic-text2sql.md#setup">Get started ↗</a></div>
    </main>
    <footer className="op-wrap op-footer"><span>OntoMosaic-DB · <a href={siteUrl('/')}>DataMosaic</a></span><a href="#ontology">Back to top ↑</a></footer>
  </div>;
}
