import { siteUrl } from './site';
import { useEffect, useState } from 'react';
import './SystemOverview.css';

const icons = {
  document: 'M6 3h8l4 4v5M6 3v18h7M14 3v5h4M9 11h3M9 15h2M18 13a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm3 7 2 2',
  mosaic: 'M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z',
  research: 'M4 5c3-1 5-1 8 1 3-2 5-2 8-1v14c-3-1-5-1-8 1-3-2-5-2-8-1V5Zm8 1v14M7 9h2M7 12h2M15 9h2M15 12h2',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm5 11 6 6M8 8h5M8 11h3',
  analytics: 'M4 4v16h17M8 16v-5M13 16V7M18 16v-8M7 8l5-4 6 1',
  workflow: 'M3 3h6v6H3zM15 15h6v6h-6zM6 9v6h9M15 6h6M18 3v6M3 18h6M6 15v6',
  assistant: 'M8 5h8l4 4v9H4V9l4-4Zm4 0V2M8 11h1M15 11h1M9 15h6M2 10v5M22 10v5',
  graph: 'M12 3 4 19h16L12 3Zm0 0v10M4 19l8-6 8 6M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM4 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm16 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  finance: 'M3 9 12 3l9 6H3Zm2 3v6M10 12v6M14 12v6M19 12v6M3 21h18',
  science: 'M9 3h6M10 3v7L4 20h16l-6-10V3M8 14h8M10 17h1M14 18h1',
  legal: 'M12 3v18M6 21h12M4 7h16M6 7l-4 8h8L6 7Zm12 0-4 8h8l-4-8Z',
  health: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z',
  education: 'm2 9 10-5 10 5-10 5L2 9Zm4 3v6c4 3 8 3 12 0v-6M22 9v8',
  commerce: 'M4 7h16l1 5H3l1-5Zm0 5v9h16v-9M9 21v-6h6v6M7 3h10',
  plus: 'M12 5v14M5 12h14',
};

type AppTile = { name: string; icon: keyof typeof icons; tone: string; detail?: string; href?: string };
const applications: AppTile[] = [
  { name: 'DocMosaic', icon: 'document', tone: 'blue', detail: 'Understand', href: '/docmosaic/' },
  { name: 'DBMosaic', icon: 'mosaic', tone: 'violet', detail: 'Structure', href: '/dbmosaic/' },
  { name: 'Research', icon: 'research', tone: 'cyan' },
  { name: 'Search', icon: 'search', tone: 'rose' },
  { name: 'Analytics', icon: 'analytics', tone: 'amber' },
  { name: 'Automation', icon: 'workflow', tone: 'indigo' },
  { name: 'Assistants', icon: 'assistant', tone: 'green' },
  { name: 'Your next app', icon: 'plus', tone: 'slate' },
];
const ontologies: AppTile[] = [
  { name: 'OntoMosaic', detail: 'Text2SQL', icon: 'graph', tone: 'teal', href: '/ontomosaic-text2sql' },
  { name: 'Finance', icon: 'finance', tone: 'indigo' },
  { name: 'Science', icon: 'science', tone: 'cyan' },
  { name: 'Legal', icon: 'legal', tone: 'amber' },
  { name: 'Health', icon: 'health', tone: 'rose' },
  { name: 'Education', icon: 'education', tone: 'violet' },
  { name: 'Commerce', icon: 'commerce', tone: 'green' },
  { name: 'Your domain', icon: 'plus', tone: 'slate' },
];
const connections = [
  'M178 244H225Q255 244 255 214V157Q255 130 286 130H360',
  'M178 264H225Q255 264 255 294V373Q255 400 286 400H360',
  'M600 223V285',
  'M930 285V223',
];

function Tile({ app }: { app: AppTile }) {
  const className = `overview-tile overview-tone-${app.tone}${app.href ? ' overview-available' : ' overview-future'}${app.icon === 'plus' ? ' overview-custom' : ''}`;
  const content = <>
    <span className="overview-icon overview-motion" aria-hidden="true"><svg viewBox="0 0 24 24"><path d={icons[app.icon]}/></svg></span>
    <strong>{app.name}</strong>{app.detail && <span className="overview-tile-detail">{app.detail}</span>}
  </>;
  return app.href
    ? <a className={className} href={siteUrl(app.href)} aria-label={`Explore ${app.name}${app.detail === 'Text2SQL' ? '-Text2SQL' : ''}`}>{content}</a>
    : <div className={className} role="img" aria-label={`${app.name}, future concept`}>{content}</div>;
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
    <div className="overview-scene" role="group" aria-label="An expanding ecosystem: document applications connected to shared domain ontologies. DocMosaic, DBMosaic and OntoMosaic-Text2SQL are available; the other icons illustrate future possibilities.">
      <div className="overview-ambient overview-ambient-blue" aria-hidden="true"/>
      <div className="overview-ambient overview-ambient-teal" aria-hidden="true"/>
      <svg className="overview-wires" viewBox="0 0 1200 524" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="overview-flow-color"><stop stopColor="#a4c8e9"/><stop offset=".5" stopColor="#aaa0d7"/><stop offset="1" stopColor="#6fb9ba"/></linearGradient></defs>
        <g className="overview-wire-track">{connections.map(path => <path key={path} d={path}/>)}</g>
        <g className="overview-wire-flow overview-motion">{connections.map(path => <path key={path} d={path}/>)}</g>
        <g className="overview-wire-anchors"><circle cx="178" cy="244" r="4"/><circle cx="178" cy="264" r="4"/></g>
      </svg>
      <div className="overview-sources">
        <p className="overview-source-label">YOUR INFORMATION</p>
        <div className="overview-paper-stack overview-motion" aria-hidden="true">
          <div className="overview-sheet overview-sheet-back"><span>DATA</span><div className="overview-sheet-cells">{Array.from({ length: 12 }, (_, index) => <i key={index}/>)}</div></div>
          <div className="overview-sheet overview-sheet-middle"><span>REPORT</span><div className="overview-sheet-bars"><i/><i/><i/><i/></div><i className="overview-sheet-line"/><i className="overview-sheet-line short"/></div>
          <div className="overview-sheet overview-sheet-front"><b>D<span>↗</span></b><i className="overview-sheet-line"/><i className="overview-sheet-line"/><i className="overview-sheet-line short"/><div className="overview-sheet-highlight overview-motion"><i/><i/><i/></div></div>
          <span className="overview-source-seal">✦</span>
        </div>
        <div className="overview-source-types"><span>Text</span><span>Tables</span><span>Figures</span></div>
        <p className="overview-source-note">Every document.<br/>A new starting point.</p>
      </div>
      <section className="overview-shelf overview-applications" aria-labelledby="overview-apps-title">
        <div className="overview-shelf-heading"><div><p className="overview-layer-label"><span/> APPLICATION LAYER</p><h3 id="overview-apps-title">An app for every possibility.</h3></div><span className="overview-more">More apps to come <i aria-hidden="true">↗</i></span></div>
        <div className="overview-catalog" role="group" aria-label="Available applications and future app concepts">{applications.map(app => <Tile key={app.name} app={app}/>)}</div>
      </section>
      <div className="overview-exchange" aria-hidden="true"><span>↓</span> Shared intelligence <span>↑</span></div>
      <section className="overview-shelf overview-ontology" aria-labelledby="overview-knowledge-title">
        <div className="overview-shelf-heading"><div><p className="overview-layer-label"><span/> ONTOLOGY LAYER (OntoMosaic)</p><h3 id="overview-knowledge-title">Knowledge without boundaries.</h3></div><span className="overview-more">More domains to come <i aria-hidden="true">↗</i></span></div>
        <div className="overview-catalog" role="group" aria-label="Available ontology application and future domain concepts">{ontologies.map(app => <Tile key={app.name} app={app}/>)}</div>
      </section>
    </div>
  </section>;
}
