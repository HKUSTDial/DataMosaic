import {useEffect, useId, useRef, useState, type CSSProperties} from 'react';
import './SystemOverview.css';

const apps = [
  {title:'Document understanding', input:'Documents + questions', output:'Grounded answers'},
  {title:'Information extraction', input:'Documents + schema', output:'Structured data'},
  {title:'Adaptive structuring', input:'Data + a task', output:'Tables, graphs or trees'},
];
const plugins = [
  {name:'Context & evidence', detail:'Reusable concepts and source relationships', tone:'blue'},
  {name:'SQL knowledge', detail:'Reusable mappings and query rules', tone:'violet'},
  {name:'Business semantics', detail:'Reusable definitions and constraints', tone:'teal'},
];
function PlugIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v5M16 3v5M6 8h12v4a6 6 0 0 1-12 0V8ZM12 18v4"/></svg>;}
function Story({index}:{index:number}) {
  const id=useId();
  return <svg className="overview-story-art" viewBox="0 0 280 190" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--ov-surface)"/><stop offset="1" stopColor="var(--ov-bg)"/></linearGradient>
      <linearGradient id={`${id}-accent`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--story)"/><stop offset="1" stopColor="var(--story-end)"/></linearGradient>
      <linearGradient id={`${id}-scan`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--story)" stopOpacity="0"/><stop offset="1" stopColor="var(--story)" stopOpacity=".18"/></linearGradient>
      <filter id={`${id}-shadow`} x="-35%" y="-35%" width="180%" height="190%"><feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="var(--story)" floodOpacity=".13"/></filter>
    </defs>
    <ellipse className="story-floor" cx="140" cy="168" rx="113" ry="12"/>
    {index===0 ? <>
      <g className="story-float" filter={`url(#${id}-shadow)`}>
        <rect className="story-paper" x="21" y="17" width="116" height="143" rx="10" transform="rotate(-5 79 88)"/>
        <rect className="story-paper" x="30" y="13" width="116" height="143" rx="10" style={{fill:`url(#${id}-paper)`}}/>
        <rect x="43" y="27" width="25" height="7" rx="3.5" fill={`url(#${id}-accent)`}/>
        <path className="story-muted" d="M43 47h85M43 55h68M43 118h85M43 126h74M43 134h46"/>
        <rect className="story-field" x="43" y="69" width="85" height="32" rx="4"/>
        <path className="story-ink" d="M51 80h62M51 89h42"/>
        <g className="story-scan story-motion"><rect x="37" y="36" width="102" height="27" rx="3" fill={`url(#${id}-scan)`}/><path className="story-ink" d="M37 63h102"/><circle className="story-dot" cx="139" cy="63" r="2.5"/></g>
      </g>
      <path className="story-wire" d="M129 85h23q12 0 12 12v9h17"/>
      <path className="story-flow story-motion" pathLength="1" d="M129 85h23q12 0 12 12v9h17"/>
      <g className="story-answer story-motion" filter={`url(#${id}-shadow)`}>
        <rect className="story-paper" x="157" y="66" width="105" height="80" rx="12"/>
        <rect x="169" y="78" width="20" height="20" rx="6" fill={`url(#${id}-accent)`}/>
        <path className="story-white" d="m175 88 3 3 5-6"/>
        <path className="story-ink" d="M198 82h48M198 91h33"/>
        <path className="story-muted" d="M169 109h76M169 117h57"/>
        <rect className="story-field" x="169" y="128" width="42" height="7" rx="3.5"/>
        <rect className="story-field" x="217" y="128" width="28" height="7" rx="3.5"/>
      </g>
      <g className="story-seal story-motion"><circle className="story-paper" cx="235" cy="43" r="15"/><path className="story-ink" d="m229 43 4 4 8-9"/></g>
    </> : index===1 ? <>
      <g className="story-float" filter={`url(#${id}-shadow)`}>
        <rect className="story-paper" x="14" y="24" width="103" height="129" rx="10" style={{fill:`url(#${id}-paper)`}}/>
        <rect x="27" y="38" width="25" height="7" rx="3.5" fill={`url(#${id}-accent)`}/>
        <path className="story-muted" d="M27 57h72M27 64h51"/>
        {[0,1,2].map(i=><g key={i}><rect className="story-field" x="27" y={79+i*21} width="72" height="14" rx="4"/><path className="story-ink" d={`M34 ${86+i*21}h${[44,29,37][i]}`}/></g>)}
      </g>
      {[0,1,2].map(i=><g key={i} style={{'--step':i} as CSSProperties}><path className="story-wire" d={`M101 ${86+i*21}h16q18 0 18-18v${-9+i*7}q0-12 12-12h18`}/><path className="story-flow story-motion" pathLength="1" d={`M101 ${86+i*21}h16q18 0 18-18v${-9+i*7}q0-12 12-12h18`}/><rect className="story-packet story-motion" x="111" y={81+i*21} width="12" height="9" rx="3" fill={`url(#${id}-accent)`}/></g>)}
      <g className="story-table" filter={`url(#${id}-shadow)`}>
        <rect className="story-paper" x="155" y="31" width="113" height="121" rx="11"/>
        <path className="story-table-head" d="M166 31h91q11 0 11 11v15H155V42q0-11 11-11Z" fill={`url(#${id}-accent)`}/>
        <path className="story-white" d="M167 44h16M196 44h17M228 44h25"/>
        <path className="story-muted" d="M155 80h113M155 103h113M155 126h113M189 57v95M223 57v95"/>
        {[0,1,2].map(i=><g key={i} className="story-table-row story-motion" style={{'--step':i} as CSSProperties}><rect className="story-field" x="161" y={63+i*23} width="101" height="13" rx="3"/><path className="story-ink" d={`M167 ${70+i*23}h14m16 0h17m15 0h24`}/></g>)}
      </g>
    </> : <>
      <path className="story-wire" d="M140 82V46q0-12-12-12H84M140 82h45q12 0 12 12v13M140 82v39q0 12-12 12H87"/>
      <path className="story-flow story-motion" pathLength="1" d="M140 82V46q0-12-12-12H84M140 82h45q12 0 12 12v13M140 82v39q0 12-12 12H87"/>
      <circle className="story-orbit story-motion" cx="140" cy="82" r="38"/>
      <g className="story-core" filter={`url(#${id}-shadow)`}><rect className="story-paper" x="115" y="57" width="50" height="50" rx="15"/>{[0,1,2,3].map(i=><rect key={i} className="story-core-cell story-motion" x={127+i%2*15} y={69+Math.floor(i/2)*15} width="11" height="11" rx="3" fill={`url(#${id}-accent)`} style={{'--step':i} as CSSProperties}/>)}</g>
      <g className="story-structure story-motion" style={{'--step':0} as CSSProperties} filter={`url(#${id}-shadow)`}><rect className="story-paper" x="17" y="13" width="70" height="56" rx="10"/><rect className="story-field" x="28" y="25" width="48" height="10" rx="3"/><path className="story-ink" d="M28 41h48M28 51h48M43 36v24M60 36v24"/></g>
      <g className="story-structure story-motion" style={{'--step':1} as CSSProperties} filter={`url(#${id}-shadow)`}><rect className="story-paper" x="191" y="107" width="73" height="63" rx="10"/><path className="story-ink" d="M227 123v13m-20 15v-15h40v15"/>{[[227,123],[207,153],[247,153]].map(([x,y],i)=><rect key={i} className="story-field" x={x-5} y={y-4} width="10" height="8" rx="2"/>)}</g>
      <g className="story-structure story-motion" style={{'--step':2} as CSSProperties} filter={`url(#${id}-shadow)`}><rect className="story-paper" x="21" y="112" width="73" height="58" rx="10"/><path className="story-ink" d="m35 150 20-22 24 18-44 4m20-22 5 28"/>{[[35,150],[55,128],[79,146],[60,156]].map(([x,y],i)=><circle key={i} className="story-dot" cx={x} cy={y} r="3.5"/>)}</g>
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
  function toggle(index:number){setSelected(values=>values.map((value,i)=>i===index?!value:value));}
  return <section ref={sectionRef} className="system-overview" aria-labelledby="system-overview-title" data-playing={playing} data-running={playing&&inView} data-active={active}>
    <header className="overview-heading"><div><p className="overview-eyebrow"><span aria-hidden="true">✦</span> THE DATAMOSAIC ECOSYSTEM</p><h2 id="system-overview-title">More than documents.<br/><em>A world of possibilities.</em></h2></div><p>Purpose-built applications.<br/>A growing layer of knowledge.<br/><strong>All in one mosaic.</strong></p><button className="overview-toggle" type="button" aria-label={playing?'Pause system animation':'Play system animation'} onClick={()=>setPlaying(v=>!v)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d={playing?'M5 3v10M11 3v10':'m5 3 8 5-8 5Z'}/></svg></button></header>
    <div className="overview-scene">
      <div className="overview-app-layout">
        <aside className="overview-data" aria-label="Data sources"><span className="overview-small-label">YOUR INFORMATION</span><div className="overview-data-stack" aria-hidden="true">
          <div className="overview-paper overview-paper-back"><span>DATA</span><div className="overview-paper-cells">{Array.from({length:12},(_,i)=><i key={i}/>)}</div></div>
          <div className="overview-paper overview-paper-middle"><span>REPORT</span><div className="overview-paper-bars"><i/><i/><i/><i/></div><i/><i/></div>
          <div className="overview-paper overview-paper-front"><b>D<span>↗</span></b><i/><i/><i/><span className="overview-paper-scan"/><div className="overview-paper-highlight"><i/><i/><i/></div></div>
        </div><p>Text · Tables · Figures</p><span className="overview-data-arrow" aria-hidden="true">→</span></aside>
        <section className="overview-applications" aria-labelledby="overview-apps-title"><div className="overview-layer-heading"><h3 id="overview-apps-title">APPLICATION LAYER</h3></div>
          <div ref={storiesRef} className="overview-app-stories" onPointerDown={()=>setPlaying(false)}>{apps.map((app,index)=><article className={`overview-app-story overview-tone-${index} ${active===index?'is-active':''}`} key={app.title}>
            <button className="overview-story-select" aria-label={`Show ${app.title}`} aria-pressed={active===index} onClick={()=>{setActive(index);setPlaying(false);}}><span className="overview-story-dot"/><strong>{app.title}</strong></button>
            <div className="overview-story-io"><span>{app.input}</span><i aria-hidden="true">→</i><strong>{app.output}</strong></div>
            <div className="overview-story-visual" key={index}><Story index={index}/></div>
            <div className="overview-app-socket" aria-label={`${count} knowledge plugins connected to ${app.title}`}><PlugIcon/><span>{count?`${count} knowledge ${count===1?'plugin':'plugins'}`:'Add knowledge plugins'}</span><div>{plugins.map((plugin,i)=><i key={plugin.name} className={`overview-socket-dot overview-plugin-tone-${plugin.tone} ${selected[i]?'is-connected':''}`} aria-hidden="true"/>)}</div></div>
            <span className="overview-story-progress" aria-hidden="true"><i key={active===index?'active':'idle'}/></span>
          </article>)}</div>
        </section>
      </div>
      <div className={`overview-plugin-bus ${count?'is-connected':''}`} aria-hidden="true"><svg viewBox="0 0 1000 60" preserveAspectRatio="none"><path d="M165 0v15q0 15 15 15h640q15 0 15-15V0M500 0v60M165 60V45q0-15 15-15h640q15 0 15 15v15"/>{[165,500,835].map((x,i)=><path key={`${i}-${selected.join('-')}`} className="overview-plugin-energy" style={{'--step':i} as CSSProperties} pathLength="1" d={`M${x} 60V0`}/>)}</svg><span><PlugIcon/> Plug in knowledge. Power your apps.</span></div>
      <section className="overview-ontology" aria-labelledby="overview-knowledge-title"><div className="overview-layer-heading"><h3 id="overview-knowledge-title">ONTOLOGY LAYER <span>(OntoMosaic)</span></h3></div>
        <div className="overview-plugin-rack">{plugins.map((plugin,index)=><button type="button" className={`overview-plugin overview-plugin-tone-${plugin.tone}`} key={plugin.name} aria-pressed={selected[index]} onClick={()=>toggle(index)}><span className="overview-plugin-icon"><PlugIcon/></span><span><strong>{plugin.name}</strong><small>{plugin.detail}</small></span><span className="overview-plugin-switch" aria-hidden="true"><i/></span></button>)}</div>
      </section>
    </div>
  </section>;
}
