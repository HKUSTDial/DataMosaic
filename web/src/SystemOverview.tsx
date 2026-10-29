import { siteUrl } from './site';
import { useEffect, useState, type CSSProperties } from 'react';
import './SystemOverview.css';

const applications = [
  { name: 'DocMosaic', detail: 'Answers with evidence', kind: 'document', tone: 'blue', href: '/docmosaic/' },
  { name: 'DBMosaic', detail: 'Documents to databases', kind: 'database', tone: 'violet', href: '/dbmosaic/' },
  { name: 'StructMosaic', detail: 'Tables. Graphs. Trees.', kind: 'structure', tone: 'cyan' },
];
const ontologies = [
  { name: 'OntoMosaic-Doc', detail: 'Context graph retrieval', kind: 'graph', tone: 'blue', href: '/ontomosaic-doc' },
  { name: 'OntoMosaic-Text2SQL', detail: 'Learn from SQL examples', kind: 'graph', tone: 'violet', href: '/ontomosaic-text2sql' },
  { name: 'OntoMosaic-Enterprise', detail: 'Connect processes & data', kind: 'graph', tone: 'teal', href: '/ontomosaic-enterprise' },
];
type Module = { name: string; detail: string; kind: string; tone: string; href?: string };

function ModuleArt({ kind }: { kind: string }) {
  return <svg className="overview-art" viewBox="0 0 220 90" aria-hidden="true">
    {kind === 'document' ? <>
      <g className="overview-art-muted"><rect x="30" y="11" width="51" height="66" rx="7" transform="rotate(-9 55 44)"/><rect x="42" y="8" width="51" height="66" rx="7"/></g>
      <rect className="overview-art-glass" x="53" y="13" width="51" height="66" rx="7"/><path className="overview-art-muted" d="M64 27h27M64 35h19M64 51h27M64 59h23M64 67h15"/>
      <path className="overview-art-signal overview-motion" d="M104 45h30"/><rect className="overview-art-glass" x="136" y="23" width="62" height="43" rx="10"/>
      <path className="overview-art-accent overview-motion" d="m148 44 5 5 10-12M171 38h16M171 47h11"/>
      <rect className="overview-scan overview-motion" x="59" y="39" width="39" height="7" rx="2"/>
    </> : kind === 'database' ? <>
      <g className="overview-art-muted"><path d="M34 25h39l22 20M34 65h39l22-20M163 45h25"/><rect x="20" y="17" width="26" height="16" rx="4"/><rect x="20" y="57" width="26" height="16" rx="4"/><rect x="174" y="33" width="27" height="25" rx="4"/><path d="M174 42h27M183 42v16M192 42v16"/></g>
      <path className="overview-art-glass" d="M95 23v43c0 16 67 16 67 0V23"/><ellipse className="overview-art-accent overview-motion" cx="128.5" cy="23" rx="33.5" ry="11"/>
      <path className="overview-art-accent overview-motion" d="M95 44c0 16 67 16 67 0M95 64c0 16 67 16 67 0"/>
      <path className="overview-art-signal overview-motion" d="M46 25h27l22 20M46 65h27l22-20"/>
    </> : <>
      <path className="overview-art-muted" d="M110 15 46 43l18 29 46-21 47 21 22-29-69-28v36M46 43l64 8 69-8M64 72h93"/>
      <path className="overview-art-signal overview-motion" d="M46 43 110 15l69 28-22 29-47-21-46 21"/>
      {[[110,15],[46,43],[179,43],[64,72],[110,51],[157,72]].map(([x,y], i) => <g key={i} className="overview-node overview-motion" style={{ '--node-delay': `${i * -.65}s` } as CSSProperties}>
        <circle className="overview-node-halo" cx={x} cy={y} r="10"/>
        {kind === 'structure' && i % 2 ? <rect x={x-4} y={y-4} width="8" height="8" rx="2"/> : <circle cx={x} cy={y} r={i===0 ? 5 : 4}/>}
      </g>)}
    </>}
  </svg>;
}

function Tile({ module, index }: { module: Module; index: number }) {
  const ontology = module.name.startsWith('OntoMosaic-');
  const props = { className: `overview-tile overview-tone-${module.tone}`, style: { '--module-delay': `${index * -3}s` } as CSSProperties };
  const content = <>
    <span className="overview-card-light overview-motion" aria-hidden="true"/>
    <ModuleArt kind={module.kind}/>
    <span className="overview-tile-copy">
      <strong>{ontology ? <><span className="overview-name-prefix">OntoMosaic-</span>{module.name.slice(11)}</> : module.name}</strong>
      <span className="overview-tile-detail">{module.detail}</span>
    </span>
    {module.href && <span className="overview-tile-arrow" aria-hidden="true">↗</span>}
  </>;
  return module.href
    ? <a {...props} href={siteUrl(module.href)} aria-label={`Explore ${module.name}`}>{content}</a>
    : <div {...props} aria-label={module.name}>{content}</div>;
}

export default function SystemOverview() {
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => { if (preference.matches) setPlaying(false); };
    preference.addEventListener('change', handleChange);
    return () => preference.removeEventListener('change', handleChange);
  }, []);

  return <section className="system-overview" aria-labelledby="system-overview-title" data-playing={playing}>
    <header className="overview-heading">
      <div><p className="overview-eyebrow"><span aria-hidden="true">✦</span> THE DATAMOSAIC ECOSYSTEM</p><h2 id="system-overview-title">More than documents.<br/><em>A world of possibilities.</em></h2></div>
      <p>Purpose-built applications.<br/>A growing layer of knowledge.<br/><strong>All in one mosaic.</strong></p>
      <button className="overview-toggle" type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause system animation' : 'Play system animation'} title={playing ? 'Pause animation' : 'Play animation'}><svg viewBox="0 0 16 16" aria-hidden="true">{playing ? <path d="M5 3v10M11 3v10"/> : <path d="m5 3 8 5-8 5Z"/>}</svg></button>
    </header>
    <div className="overview-scene" role="group" aria-label="Documents, tables and databases connect to three applications and three OntoMosaic modules through shared, evolving knowledge.">
      <div className="overview-aurora overview-motion" aria-hidden="true"/>
      <div className="overview-grid" aria-hidden="true"/>
      <aside className="overview-sources" aria-label="Data sources">
        <p className="overview-source-label">YOUR DATA</p>
        <div className="overview-source-stack">
          {['Documents', 'Tables', 'Databases'].map((name,i) => <div className={`overview-source overview-source-${i} overview-motion`} key={name}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{i===0 ? <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/> : i===1 ? <path d="M3 4h18v16H3zM3 10h18M9 10v10M15 10v10"/> : <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></>}</svg>
            <span>{name}</span><i aria-hidden="true"/>
          </div>)}
        </div>
        <p className="overview-source-note">Different formats.<br/>Connected possibilities.</p>
        <div className="overview-intake" aria-hidden="true"><i className="overview-motion"/></div>
      </aside>
      <div className="overview-engine">
        <section className="overview-shelf overview-applications" aria-labelledby="overview-apps-title">
          <div className="overview-shelf-heading"><h3 id="overview-apps-title"><span/> APPLICATION LAYER</h3><span>Answer. Extract. Act.</span></div>
          <div className="overview-catalog">{applications.map((module,index) => <Tile key={module.name} module={module} index={index}/>)}</div>
        </section>
        <div className="overview-exchange">
          <svg className="overview-connections" viewBox="0 0 900 100" preserveAspectRatio="none" aria-hidden="true">
            <g className="overview-connection-track"><path d="M150 0v20Q150 50 180 50h540q30 0 30-30V0M450 0v100M150 100V80q0-30 30-30h540q30 0 30 30v20"/></g>
            <g className="overview-connection-flow overview-motion"><path d="M150 0v20q0 30 30 30h270v50M750 100V80q0-30-30-30H450V0"/></g>
          </svg>
          <div className="overview-core"><span className="overview-core-orbit overview-motion" aria-hidden="true"/><span className="overview-core-mark" aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i} className="overview-motion"/>)}</span><span>Shared, evolving <strong>knowledge.</strong></span></div>
          <span className="overview-exchange-label overview-learn">Learn from experience</span><span className="overview-exchange-label overview-reuse">Reuse across applications</span>
        </div>
        <section className="overview-shelf overview-ontology" aria-labelledby="overview-knowledge-title">
          <div className="overview-shelf-heading"><h3 id="overview-knowledge-title"><span/> ONTOLOGY LAYER <span className="overview-layer-name">(OntoMosaic)</span></h3><span>Concepts. Relationships. Rules.</span></div>
          <div className="overview-catalog">{ontologies.map((module,index) => <Tile key={module.name} module={module} index={index}/>)}</div>
        </section>
      </div>
      <div className="overview-scene-footer"><span><i/> One connected ecosystem</span><span>Applications × Ontologies</span></div>
    </div>
  </section>;
}
