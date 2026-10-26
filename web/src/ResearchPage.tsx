import { siteUrl } from './site';
import datamosaicFramework from '../../assets/research/datamosaic-framework.png';
import docpilotFramework from '../../assets/research/docpilot-framework.png';

const publications = [
  {
    title: 'Document-to-Database: Extraction Meets Relational Semantics.',
    authors: 'Zhengxuan Zhang, Zhuowen Liang, Jiazhuo Chen, Haixun Wang, and Nan Tang.',
    venue: 'VLDB',
    framework: datamosaicFramework,
    pdf: 'https://www.vldb.org/pvldb/vol19/p2522-zhang.pdf',
    code: 'https://github.com/HKUSTDial/DBMosaic',
  },
  {
    title: 'DataMosaic: An Interactive Demonstration of Constraint-Driven Document-to-Database Construction.',
    authors: 'Zhengxuan Zhang, Zhuowen Liang, Haixun Wang, and Nan Tang.',
    venue: 'VLDB Demo',
    framework: datamosaicFramework,
    pdf: 'https://www.vldb.org/pvldb/vol19/p4570-zhang.pdf',
    code: 'https://github.com/HKUSTDial/DBMosaic',
  },
  {
    title: 'DocPILOT: Interactive Agent Orchestration and Training for Long Visual Document Understanding.',
    authors: 'Zhuowen Liang, Xiaotian Lin, Yuyu Luo, Haixun Wang, and Nan Tang.',
    venue: 'arXiv',
    framework: docpilotFramework,
    pdf: 'https://arxiv.org/pdf/2610.21327',
    code: 'https://github.com/HKUSTDial/DocPilot',
  },
];

export default function ResearchPage() {
  return <>
    <header className="research-intro">
      <a className="research-back" href={siteUrl('/')}>← Back to DataMosaic</a>
      <h1>Research <em>Papers</em></h1>
      <p className="research-description">† Equal contribution. * Corresponding author.</p>
    </header>
    <section className="publication-year-group" aria-labelledby="publication-year-2026">
      <div className="publication-year"><h2 id="publication-year-2026">2026</h2><p>{publications.length} publications</p></div>
      <ol className="publication-list" aria-label="2026 research publications">
        {publications.map(publication => <li key={publication.pdf}>
          <a className="publication-figure" href={publication.framework} target="_blank" rel="noreferrer" aria-label={`View framework for ${publication.title}`}>
            <img src={publication.framework} alt={`Framework overview for ${publication.title}`} loading="lazy" decoding="async"/>
          </a>
          <article>
            <h3 className="publication-title"><a href={publication.pdf} target="_blank" rel="noreferrer">{publication.title}</a></h3>
            <p className="publication-authors">{publication.authors}</p>
            <p className="publication-meta"><span>{publication.venue}</span><span>2026</span></p>
            <div className="publication-links">
              <a href={publication.pdf} target="_blank" rel="noreferrer" aria-label={`Read ${publication.title} (PDF)`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h5"/></svg>PDF<span aria-hidden="true">↗</span></a>
              <a href={publication.code} target="_blank" rel="noreferrer" aria-label={`Code for ${publication.title}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"/></svg>Code<span aria-hidden="true">↗</span></a>
            </div>
          </article>
        </li>)}
      </ol>
    </section>
  </>;
}
