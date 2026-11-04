import {useId} from 'react';
import './ontology-overview.css';

function Node({x,y,w=180,h,title,lines=[],tone='business'}:{x:number;y:number;w?:number;h?:number;title:string;lines?:string[];tone?:string}) {
 return <g className={`oo-node oo-${tone}`} transform={`translate(${x} ${y})`}><rect width={w} height={h??38+lines.length*19} rx="9"/><text x="13" y="25" className="oo-node-title">{title}</text>{lines.map((line,i)=><text key={line} x="13" y={47+i*19} className="oo-node-line">{line}</text>)}</g>;
}

export default function OntologyGraphDetail(){
 const id=useId().replace(/:/g,'');
 const arrow=(tone:string)=>`url(#${id}-${tone})`;
 const edge=(d:string,tone='business')=><path d={d} className={`oo-edge oo-${tone}`} markerEnd={arrow(tone)}/>;
 const label=(x:number,y:number,text:string,tone='business')=><text x={x} y={y} className={`oo-edge-label oo-${tone}`} textAnchor="middle">{text}</text>;
 return (
    <figure className="oo-figure">
     <div className="oo-graph-scroll" tabIndex={0} role="region" aria-label="Retail ontology diagram. Scroll horizontally on small screens.">
      <svg viewBox="0 0 1080 780" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
       <title id={`${id}-title`}>A retail ontology connecting business structure, executable knowledge, and database metadata</title>
       <desc id={`${id}-desc`}>Functional sofa is a sofa, which is a product. Orders contain order lines referencing products. An after-sales process involves separate return and refund events. The functional sofa concept stores a complete matching condition. An order return rate metric counts distinct completed-return orders over all orders, supported by a deduplication generation rule. Gold edges connect these definitions to database columns. Purple nodes show proposed business extensions; blue nodes show existing expression mechanisms.</desc>
       <defs>{['business','knowledge','binding','data'].map(tone=><marker id={`${id}-${tone}`} key={tone} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 9 5 L 1 9" className={`oo-arrow oo-${tone}`}/></marker>)}</defs>
       <rect className="oo-semantic-band" x="8" y="8" width="1064" height="498" rx="14"/>
       <text x="28" y="37" className="oo-band-title">BUSINESS SEMANTICS &amp; TASK KNOWLEDGE</text>
       {edge('M 115 165 V 131')}{label(137,153,'is_a')}
       {edge('M 160 272 V 240 H 115 V 222')}{label(183,253,'is_a')}
       {edge('M 420 131 V 165')}{label(466,153,'contains')}
       {edge('M 320 193 H 265 V 101 H 215')}{label(272,168,'product')}
       {edge('M 780 131 V 148 H 697 V 165')}{label(740,153,'involves')}
       {edge('M 780 148 H 931 V 165')}{label(945,153,'involves')}
       {edge('M 607 193 H 520')}{label(563,181,'return item')}
       {edge('M 787 193 H 841')}{label(814,178,'refund')}
       {edge('M 574 272 V 246 H 697 V 222')}{label(601,243,'based on')}
       <Node x={25} y={74} w={190} title="Product" lines={['Business object type']}/>
       <Node x={25} y={165} w={190} title="Sofa" lines={['Product category']}/>
       <Node x={320} y={74} w={200} title="Order" lines={['Business object type']}/>
       <Node x={320} y={165} w={200} title="Order line" lines={['Product · quantity · order']}/>
       <Node x={607} y={74} w={414} title="After-sales process" lines={['Request → return handling → refund handling']}/>
       <Node x={607} y={165} w={180} title="Return event" lines={['Item · time · status']}/>
       <Node x={841} y={165} w={180} title="Refund event" lines={['Amount · time · status']}/>
       <Node x={25} y={272} w={300} h={206} tone="knowledge" title="Concept · Functional sofa" lines={['Meaning: the set of functional sofas']}/>
       <rect className="oo-expression" x="39" y="339" width="272" height="115" rx="7"/>
       <text x="52" y="362" className="oo-binding-copy">target t1 · complete condition</text>
       <text x="52" y="389" className="oo-code">type1 = '沙发' AND</text><text x="52" y="412" className="oo-code">type2 = '功能沙发'</text><text x="52" y="438" className="oo-node-line">Sofa AND functional-sofa category</text>
       <Node x={365} y={272} w={370} h={206} tone="knowledge" title="Metric · Order return rate" lines={['Unit of analysis: order']}/>
       <rect className="oo-expression" x="379" y="339" width="342" height="115" rx="7"/>
       <text x="392" y="362" className="oo-binding-copy">expression / SQL generation plan</text>
       <text x="392" y="389" className="oo-code">distinct completed-return orders</text><text x="392" y="411" className="oo-code">÷ all distinct orders</text><text x="392" y="438" className="oo-node-line">returns.status = 'C' · join on line_id</text>
       <Node x={797} y={272} w={250} tone="knowledge" title="GenerationRule" lines={['Deduplicate by order', 'When returns repeat an order,', 'count each order only once.']}/>
       {edge('M 797 318 H 735','knowledge')}{label(767,304,'applies_to','knowledge')}
       <text x="797" y="415" className="oo-node-line">Conditions and plans belong</text><text x="797" y="436" className="oo-node-line">to their semantic nodes.</text>
       <rect className="oo-data-band" x="8" y="560" width="1064" height="208" rx="14"/>
       <text x="28" y="589" className="oo-band-title">DATA &amp; METADATA</text>
       {edge('M 175 478 V 521 H 82 V 621','binding')}{edge('M 175 521 H 215 V 621','binding')}{label(168,512,'grounded_on · target t1','binding')}
       {edge('M 550 478 V 541 H 440 V 621','binding')}{edge('M 550 541 H 574 V 621','binding')}{edge('M 550 541 H 799 V 621','binding')}{edge('M 550 541 H 934 V 621','binding')}{label(783,532,'grounded_on · physical dependencies','binding')}
       <Node x={25} y={621} w={300} tone="data" title="products" lines={['Columns: type1 · type2 · id', 'One row per product · PK: id', 'Category meanings & example values']}/>
       <Node x={365} y={621} w={335} tone="data" title="order_items" lines={['Columns: order_id · line_id · product_id', 'One row per order line · PK: line_id', 'Field types, keys & business meanings']}/>
       <Node x={740} y={621} w={307} tone="data" title="returns" lines={['Columns: line_id · status · return_id', 'One row per return · C = completed', 'Field types, codes & descriptions']}/>
       <text x="28" y="749" className="oo-node-line">Compact table views; the full graph represents tables and columns as separate, linked nodes.</text>
      </svg>
     </div>
     <figcaption><span><i className="oo-dot business"/>Proposed business structure</span><span><i className="oo-dot knowledge"/>Existing expression mechanisms</span><span><i className="oo-dot binding"/>Data dependencies</span></figcaption>
    </figure>
 );
}
