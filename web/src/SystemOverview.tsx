import {useEffect, useRef, useState} from 'react';
import './SystemOverview.css';

const apps = [
  {title:'Document understanding', description:'Find evidence. Answer with confidence.', input:'Documents + questions', output:'Grounded answers'},
  {title:'Relational extraction', description:'Turn scattered facts into connected records.', input:'Documents + schema', output:'Related tables'},
  {title:'Adaptive structuring', description:'Choose the right structure for the task.', input:'Data + a task', output:'Tables, graphs or trees'},
];
const plugins = [
  {name:'Context & evidence', detail:'Reusable concepts and source relationships', tone:'blue'},
  {name:'SQL knowledge', detail:'Reusable mappings and query rules', tone:'violet'},
  {name:'Business semantics', detail:'Reusable definitions and constraints', tone:'teal'},
];
function PlugIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v5M16 3v5M6 8h12v4a6 6 0 0 1-12 0V8ZM12 18v4"/></svg>;}
function Story({index}:{index:number}) {
  return <svg className="overview-story-art" viewBox="0 0 260 160" aria-hidden="true">
    {index===0 ? <>
      <rect className="story-paper" x="14" y="21" width="90" height="113" rx="8"/>
      <text x="26" y="40">REPORT</text><path className="story-muted" d="M26 52h62M26 61h50M26 91h62M26 100h54M26 109h38"/>
      <rect className="story-evidence story-motion" x="22" y="69" width="74" height="13" rx="3"/>
      <path className="story-ink" d="M28 75h55"/>
      <path className="story-transfer story-motion" d="M104 75h39"/><path className="story-muted" d="m136 70 7 5-7 5"/>
      <g className="story-result story-motion"><rect className="story-paper" x="151" y="38" width="96" height="82" rx="10"/>
      <text x="164" y="59">ANSWER</text><path className="story-ink" d="m164 76 4 4 9-10M186 73h46M186 82h31"/>
      <rect className="story-evidence" x="163" y="95" width="72" height="14" rx="4"/><text x="171" y="105" className="story-small">Source · p. 12</text></g>
    </> : index===1 ? <>
      <rect className="story-paper" x="10" y="29" width="80" height="101" rx="8"/>
      <text x="21" y="47">INVOICE</text><path className="story-muted" d="M21 57h57M21 65h43"/>
      <g className="story-evidence story-motion"><rect x="18" y="74" width="63" height="15" rx="3"/><rect x="18" y="98" width="63" height="15" rx="3"/></g>
      <text x="24" y="85">Acme</text><text x="24" y="109">$240</text>
      <path className="story-transfer story-motion" d="M90 81h33q9 0 9-9V47h16M132 81v32h16"/>
      <g className="story-result story-motion"><rect className="story-paper" x="151" y="24" width="98" height="49" rx="6"/><rect className="story-evidence" x="151" y="24" width="98" height="18" rx="6"/>
      <text x="162" y="37">CUSTOMERS</text><text x="162" y="59">01</text><text x="186" y="59">Acme</text>
      <rect className="story-paper" x="151" y="95" width="98" height="49" rx="6"/><rect className="story-evidence" x="151" y="95" width="98" height="18" rx="6"/>
      <text x="162" y="108">ORDERS</text><text x="162" y="130">01</text><text x="186" y="130">$240</text>
      <path className="story-ink story-link story-motion" d="M162 73v22"/><circle className="story-dot" cx="162" cy="76" r="2"/><circle className="story-dot" cx="162" cy="92" r="2"/></g>
    </> : <>
      <rect className="story-paper" x="66" y="12" width="128" height="32" rx="8"/><text x="88" y="32">Organize this data</text>
      <path className="story-muted" d="M130 44v28M47 88V72h166v16"/>
      <path className="story-transfer story-motion" d="M130 44v28H47v16"/>
      <g className="story-result story-motion"><rect className="story-paper story-choice" x="13" y="89" width="67" height="53" rx="7"/>
      <path className="story-ink" d="M28 102h36v26H28zM28 111h36M28 120h36M40 111v17M52 111v17"/>
      <rect className="story-paper" x="97" y="89" width="67" height="53" rx="7"/><path className="story-muted" d="m111 120 20-18 19 24-39-6"/>
      <circle className="story-dot" cx="111" cy="120" r="3"/><circle className="story-dot" cx="131" cy="102" r="3"/><circle className="story-dot" cx="150" cy="126" r="3"/>
      <rect className="story-paper" x="181" y="89" width="67" height="53" rx="7"/><path className="story-muted" d="M214 105v10M199 127v-12h30v12"/>
      <rect className="story-ink" x="209" y="99" width="10" height="8" rx="2"/><rect className="story-ink" x="194" y="125" width="10" height="8" rx="2"/><rect className="story-ink" x="224" y="125" width="10" height="8" rx="2"/></g>
    </>}
  </svg>;
}
export default function SystemOverview(){
  const sectionRef=useRef<HTMLElement>(null);
  const storiesRef=useRef<HTMLDivElement>(null);
  const [inView,setInView]=useState(false);
  const [playing,setPlaying]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [active,setActive]=useState(0);
  const [selected,setSelected]=useState([true,true,false]);
  const [notice,setNotice]=useState('Select knowledge plugins. Reuse them across applications.');
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{if(media.matches)setPlaying(false);};media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting&&entry.intersectionRatio>=.15),{threshold:.15});if(sectionRef.current)observer.observe(sectionRef.current);return()=>observer.disconnect();},[]);
  useEffect(()=>{if(!playing||!inView)return;const timer=setTimeout(()=>setActive(i=>(i+1)%apps.length),4800);return()=>clearTimeout(timer);},[active,playing,inView]);
  useEffect(()=>{
    const media=window.matchMedia('(max-width:600px)');
    const reveal=()=>{if(!inView||!media.matches)return;const panel=storiesRef.current,card=panel?.children[active] as HTMLElement|undefined;if(panel&&card)panel.scrollTo({left:card.offsetLeft,behavior:'auto'});};
    reveal();media.addEventListener('change',reveal);
    return()=>media.removeEventListener('change',reveal);
  },[active,inView]);
  const count=selected.filter(Boolean).length;
  function toggle(index:number){const next=selected.map((value,i)=>i===index?!value:value);setSelected(next);setNotice(next[index]?`${plugins[index].name} connected to all three applications.`:`${plugins[index].name} disconnected from the applications.`);}
  return <section ref={sectionRef} className="system-overview" aria-labelledby="system-overview-title" data-playing={playing} data-running={playing&&inView} data-active={active}>
    <header className="overview-heading"><div><p className="overview-eyebrow"><span aria-hidden="true">✦</span> THE DATAMOSAIC ECOSYSTEM</p><h2 id="system-overview-title">More than documents.<br/><em>A world of possibilities.</em></h2></div><p>Purpose-built applications.<br/>A growing layer of knowledge.<br/><strong>All in one mosaic.</strong></p><button className="overview-toggle" type="button" aria-label={playing?'Pause system animation':'Play system animation'} onClick={()=>setPlaying(v=>!v)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d={playing?'M5 3v10M11 3v10':'m5 3 8 5-8 5Z'}/></svg></button></header>
    <div className="overview-scene">
      <div className="overview-app-layout">
        <aside className="overview-data" aria-label="Data sources"><span className="overview-small-label">YOUR INFORMATION</span><div className="overview-data-stack" aria-hidden="true">
          <div className="overview-paper overview-paper-back"><span>DATA</span><div className="overview-paper-cells">{Array.from({length:12},(_,i)=><i key={i}/>)}</div></div>
          <div className="overview-paper overview-paper-middle"><span>REPORT</span><div className="overview-paper-bars"><i/><i/><i/><i/></div><i/><i/></div>
          <div className="overview-paper overview-paper-front"><b>D<span>↗</span></b><i/><i/><i/><div className="overview-paper-highlight"><i/><i/><i/></div></div>
        </div><p>Text · Tables · Figures</p><span className="overview-data-arrow" aria-hidden="true">→</span></aside>
        <section className="overview-applications" aria-labelledby="overview-apps-title"><div className="overview-layer-heading"><h3 id="overview-apps-title">APPLICATION LAYER</h3><span>Three ways to put your data to work</span></div>
          <div ref={storiesRef} className="overview-app-stories" onPointerDown={()=>setPlaying(false)}>{apps.map((app,index)=><article className={`overview-app-story overview-tone-${index} ${active===index?'is-active':''}`} key={app.title}>
            <button className="overview-story-select" aria-label={`Show ${app.title}`} aria-pressed={active===index} onClick={()=>{setActive(index);setPlaying(false);}}><span className="overview-story-dot"/><strong>{app.title}</strong></button>
            <div className="overview-story-visual" key={`${index}-${active===index}`}><Story index={index}/></div>
            <p className="overview-story-description">{app.description}</p><div className="overview-story-io"><span>{app.input}</span><i aria-hidden="true">→</i><strong>{app.output}</strong></div>
            <div className="overview-app-socket" aria-label={`${count} knowledge plugins connected to ${app.title}`}><PlugIcon/><span>{count?`${count} knowledge ${count===1?'plugin':'plugins'}`:'Add knowledge plugins'}</span><div>{plugins.map((plugin,i)=><i key={plugin.name} className={`overview-socket-dot overview-plugin-tone-${plugin.tone} ${selected[i]?'is-connected':''}`} aria-hidden="true"/>)}</div></div>
            <span className="overview-story-progress" aria-hidden="true"><i key={active===index?'active':'idle'}/></span>
          </article>)}</div>
        </section>
      </div>
      <div className={`overview-plugin-bus ${count?'is-connected':''}`} aria-hidden="true"><svg viewBox="0 0 1000 60" preserveAspectRatio="none"><path d="M165 0v15q0 15 15 15h640q15 0 15-15V0M500 0v60M165 60V45q0-15 15-15h640q15 0 15 15v15"/><path className="overview-plugin-energy" key={selected.join('-')} pathLength="1" d="M165 60V45q0-15 15-15h640q15 0 15-15V0M500 60V0"/></svg><span><PlugIcon/> Choose once. Reuse across apps.</span></div>
      <section className="overview-ontology" aria-labelledby="overview-knowledge-title"><div className="overview-layer-heading"><h3 id="overview-knowledge-title">ONTOLOGY LAYER <span>(OntoMosaic)</span></h3><span>Optional, reusable knowledge plugins</span></div>
        <div className="overview-plugin-rack">{plugins.map((plugin,index)=><button type="button" className={`overview-plugin overview-plugin-tone-${plugin.tone}`} key={plugin.name} aria-pressed={selected[index]} onClick={()=>toggle(index)}><span className="overview-plugin-icon"><PlugIcon/></span><span><strong>{plugin.name}</strong><small>{plugin.detail}</small></span><span className="overview-plugin-switch" aria-hidden="true"><i/></span></button>)}</div>
        <p className="overview-plugin-notice" aria-live="polite">{notice}</p>
      </section>
    </div>
  </section>;
}
