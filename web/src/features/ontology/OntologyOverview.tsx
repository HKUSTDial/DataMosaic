import {useId,useState} from 'react';
import OntologyGraphDetail from './OntologyGraphDetail';
import './ontology-overview.css';

export default function OntologyOverview(){
 const [expanded,setExpanded]=useState(true);
 const id=useId();
 return <section className="oi-overview" aria-label="About the OntoMosaic-DB ontology graph">
  <div className="oi-top"><span className="oi-eyebrow">THE ONTOMOSAIC-DB ONTOLOGY</span><button type="button" className="oi-disclosure" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(value=>!value)}>{expanded?'Collapse introduction':'Expand introduction'}<svg viewBox="0 0 16 16" aria-hidden="true" className={expanded?'is-open':''}><path d="m4 6 4 4 4-4"/></svg></button></div>
  <div id={id} hidden={!expanded}>
   <div className="oi-hero">
    <div className="oi-copy"><h2>Your business knowledge.<br/><span>Connected to your data.</span></h2><p className="oi-lead">OntoMosaic-DB builds an ontology graph that describes your business, explains the meaning of your data, and connects the two.</p>
     <div className="oi-contents">
      <article><span className="oi-mark semantic"/><div><h3>Business semantics &amp; processes</h3><p>Business concepts, objects, and events, their relationships, and the steps and conditions that organize business processes.</p></div></article>
      <article><span className="oi-mark data"/><div><h3>The meaning of database data</h3><p>What each table, column, and value represents, including record granularity, units, and value codes.</p></div></article>
      <article><span className="oi-mark knowledge"/><div><h3>Business-to-data mappings</h3><p>How business concepts and metrics connect to tables and columns, through matching conditions, calculation expressions, and data dependencies.</p></div></article>
     </div>
    </div>
    <div className="oi-visual"><details className="oi-detail" open><summary><span>Ontology graph example</span><span aria-hidden="true">＋</span></summary><div className="oi-detail-body"><p>See how the graph represents product categories, return metrics, calculation rules, and their database dependencies.</p><OntologyGraphDetail/></div></details></div>
   </div>

  </div>
 </section>;
}
