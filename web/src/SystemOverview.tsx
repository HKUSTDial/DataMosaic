import { siteUrl } from './site';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './SystemOverview.css';

const icons = {
  document: 'M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h4',
  database: 'M4 5c0-4 16-4 16 0s-16 4-16 0v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0',
  structure: 'M9 3h6v6H9zM4 16h5v5H4zM15 16h5v5h-5zM12 9v4M6.5 16v-3h11v3',
  table: 'M3 4h18v16H3zM3 10h18M9 10v10M15 10v10',
  answer: 'M4 4h16v13H9l-5 4V4ZM8 9h8M8 13h5',
  workflow: 'M3 3h6v6H3zM15 15h6v6h-6zM6 9v9h9M15 6h6M18 3v6',
  graph: 'M12 4 4 19h16L12 4Zm0 0v9M4 19l8-6 8 6',
};
const applications = [
  {name:'Document understanding', icon:'document', tone:'blue', href:'/docmosaic/'},
  {name:'Relational extraction', icon:'database', tone:'violet', href:'/dbmosaic/'},
  {name:'Adaptive structuring', icon:'structure', tone:'cyan'},
] as const;
const ontologies = [
  {name:'Context retrieval', tone:'blue', href:'/ontomosaic-doc'},
  {name:'SQL learning', tone:'violet', href:'/ontomosaic-text2sql'},
  {name:'Business semantics', tone:'teal', href:'/ontomosaic-enterprise'},
];
const nodes = [[150,45],[80,85],[222,85],[55,145],[150,130],[248,150],[100,195],[204,200]];
const graphPath = 'M150 45 80 85 55 145 100 195 150 130 204 200 248 150 222 85 150 45v85L80 85M55 145l95-15 98 20M222 85l-72 45';
const captions = ['Connect your data.', 'Put applications to work.', 'Learn shared knowledge.', 'Reuse it everywhere.'];
function Icon({kind}:{kind:keyof typeof icons}) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[kind]}/></svg>;
}

export default function SystemOverview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => { if (preference.matches) setPlaying(false); };
    preference.addEventListener('change', handleChange);
    return () => preference.removeEventListener('change', handleChange);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= .15), {threshold: .15});
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return <section ref={sectionRef} className="system-overview" aria-labelledby="system-overview-title" data-playing={playing} data-running={playing && inView}>
    <header className="overview-heading">
      <div><p className="overview-eyebrow"><span aria-hidden="true">✦</span> THE DATAMOSAIC ECOSYSTEM</p><h2 id="system-overview-title">More than documents.<br/><em>A world of possibilities.</em></h2></div>
      <p>Purpose-built applications.<br/>A growing layer of knowledge.<br/><strong>All in one mosaic.</strong></p>
      <button className="overview-toggle" type="button" onClick={() => setPlaying(v => !v)} aria-label={playing ? 'Pause system animation' : 'Play system animation'}><svg viewBox="0 0 16 16" aria-hidden="true"><path d={playing ? 'M5 3v10M11 3v10' : 'm5 3 8 5-8 5Z'}/></svg></button>
    </header>
    <div className="overview-scene" role="group" aria-label="Data powers applications. OntoMosaic turns experience into shared knowledge that applications can reuse.">
      <section className="overview-shelf overview-applications" aria-labelledby="overview-apps-title">
        <h3 id="overview-apps-title" className="overview-layer-label">APPLICATION LAYER</h3>
        <div className="overview-app-dock">
          {applications.map((app,i) => {
            const content = <><span className={`overview-app-icon overview-motion overview-tone-${app.tone}`} style={{'--item':i} as CSSProperties}><Icon kind={app.icon}/><i className="overview-icon-shine overview-motion"/></span><strong>{app.name}</strong></>;
            return 'href' in app ? <a className="overview-tile" key={app.name} href={siteUrl(app.href)} aria-label={`Explore ${app.name}`}>{content}</a> : <div className="overview-tile" key={app.name}>{content}</div>;
          })}
        </div>
        <span className="overview-dock-caption">Agentic applications for your data</span>
      </section>
      <div className="overview-stage">
        <svg className="overview-routes" viewBox="0 0 1000 350" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="overview-route-gradient"><stop stopColor="#7794b4"/><stop offset=".5" stopColor="#a394bc"/><stop offset="1" stopColor="#7eaaa5"/></linearGradient></defs>
          <path className="overview-route-track" d="M180 175H820M500 0V105M500 245V350M820 200v75q0 30-30 30H210q-30 0-30-30v-75"/>
          <path className="overview-route-in overview-motion" pathLength="1" d="M180 175H500V0"/>
          <path className="overview-route-learn overview-motion" pathLength="1" d="M500 0V175"/>
          <path className="overview-route-out overview-motion" pathLength="1" d="M500 175H820"/>
          <path className="overview-route-reuse overview-motion" pathLength="1" d="M820 200v75q0 30-30 30H500V0"/>
        </svg>
        <svg className="overview-routes overview-routes-mobile" viewBox="0 0 300 420" preserveAspectRatio="none" aria-hidden="true">
          <path className="overview-route-track" d="M150 0v420M150 390h120V10H150"/>
          <path className="overview-route-in overview-motion" pathLength="1" d="M150 0v150"/>
          <path className="overview-route-learn overview-motion" pathLength="1" d="M150 60v150"/>
          <path className="overview-route-out overview-motion" pathLength="1" d="M150 250v170"/>
          <path className="overview-route-reuse overview-motion" pathLength="1" d="M150 390h100q20 0 20-20V30q0-20-20-20H150"/>
        </svg>
        <div className="overview-data" aria-label="Data sources">
          <span className="overview-small-label">YOUR INFORMATION</span>
          <div className="overview-data-stack overview-motion" aria-hidden="true">
            <div className="overview-paper overview-paper-back"><span className="overview-paper-caption">DATA</span><div className="overview-paper-cells">{Array.from({length:12},(_,i)=><i key={i}/>)}</div></div>
            <div className="overview-paper overview-paper-middle"><span className="overview-paper-caption">REPORT</span><div className="overview-paper-bars"><i/><i/><i/><i/></div><i/><i/></div>
            <div className="overview-paper overview-paper-front"><b className="overview-paper-monogram">D<span>↗</span></b><i/><i/><i/><div className="overview-paper-highlight"><i/><i/><i/></div><span className="overview-paper-scan overview-motion"/></div>
          </div>
          <p>Text · Tables · Figures</p>
        </div>
        <div className="overview-knowledge">
          <div className="overview-knowledge-orbit" aria-hidden="true"><i/><i/></div>
          <svg className="overview-knowledge-graph" viewBox="0 0 300 240" aria-hidden="true">
            <path className="overview-graph-track" d={graphPath}/>
            <path className="overview-graph-build overview-motion" pathLength="1" d={graphPath}/>
            {nodes.map(([x,y],i)=><g className="overview-knowledge-node overview-motion" key={i} style={{'--node':i} as CSSProperties}>
              <circle className="overview-node-halo" cx={x} cy={y} r="13"/><circle cx={x} cy={y} r={i===4?7:5}/>
            </g>)}
          </svg>
          <span className="overview-graph-tag overview-tag-concepts overview-motion">Concepts</span><span className="overview-graph-tag overview-tag-relations overview-motion">Relationships</span><span className="overview-graph-tag overview-tag-rules overview-motion">Rules</span>
          <div className="overview-core overview-motion"><span className="overview-core-mark" aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i}/>)}</span><strong>OntoMosaic</strong></div>
          <p>Shared knowledge. Evolving intelligence.</p>
        </div>
        <div className="overview-outcomes" aria-label="Application capabilities">
          <span className="overview-small-label">NEW POSSIBILITIES</span>
          {(['answer','table','workflow'] as const).map((kind,i)=><div key={kind} className={`overview-outcome overview-motion overview-outcome-${i}`}><span><Icon kind={kind}/></span><strong>{['Answers','Structured data','Agentic workflows'][i]}</strong><i>↗</i></div>)}
        </div>
      </div>
      <section className="overview-shelf overview-ontology" aria-labelledby="overview-knowledge-title">
        <h3 id="overview-knowledge-title" className="overview-layer-label">ONTOLOGY LAYER <span>(OntoMosaic)</span></h3>
        <div className="overview-ontology-dock">{ontologies.map(module=><a className={`overview-tile overview-tone-${module.tone}`} key={module.name} href={siteUrl(module.href)} aria-label={`Explore ${module.name}`}><Icon kind="graph"/><span><strong>{module.name}</strong></span></a>)}</div>
      </section>
      <div className="overview-narration" aria-hidden="true">{captions.map((caption,i)=><span className={`overview-caption overview-caption-${i} overview-motion`} key={caption}>{caption}</span>)}</div>
    </div>
  </section>;
}
