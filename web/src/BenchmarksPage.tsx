import { siteUrl } from './site';
import dtbenchImage from '../../assets/benchmarks/dtbench.jpg';
import doc2dbImage from '../../assets/benchmarks/doc2db-bench.png';
import longDocURLImage from '../../assets/benchmarks/longdocurl.png';
import mmLongBenchImage from '../../assets/benchmarks/mmlongbench-doc.png';
import madqaImage from '../../assets/benchmarks/madqa.jpg';
import finRAGBenchImage from '../../assets/benchmarks/finragbench-v.png';
import officeQAImage from '../../assets/benchmarks/officeqa-pro.png';

const categories = [
  {
    id: 'information-extraction',
    name: 'Information Extraction',
    benchmarks: [
      {
        name: 'Doc2DB-Bench',
        description: 'Evaluates the construction of relational databases from long documents, covering entity identities, keys, cross-table relationships, and integrity constraints alongside field extraction.',
        image: doc2dbImage,
        imageAlt: 'Doc2DB-Bench database-to-document construction and validation pipeline',
        venue: 'arXiv', year: '2026',
        pdf: 'https://arxiv.org/pdf/2608.08459',
        code: 'https://github.com/SetonLiang/Doc2DB-Bench',
        dataset: 'https://github.com/SetonLiang/Doc2DB-Bench/tree/main/dataset',
      },
      {
        name: 'DTBench',
        description: 'A synthetic benchmark for document-to-table extraction, testing capabilities such as transformation, reasoning, conflict resolution, and faithfulness under a target schema.',
        image: dtbenchImage,
        imageAlt: 'DTBench Table2Doc synthesis workflow',
        venue: 'KDD', year: '2026',
        pdf: 'https://arxiv.org/pdf/2602.13812',
        code: 'https://github.com/ZJU-DAILY/DTBench',
        dataset: 'https://github.com/ZJU-DAILY/DTBench/tree/main/dataset',
      },
    ],
  },
  {
    id: 'docvqa',
    name: 'DocVQA',
    benchmarks: [
      {
        name: 'MADQA',
        description: 'Evaluates agentic reasoning over document collections through human-authored questions. Systems must navigate heterogeneous PDFs, combine visual and textual evidence, and produce answers grounded in source pages.',
        image: madqaImage,
        imageAlt: 'MADQA example requiring evidence from multiple reports',
        venue: 'arXiv', year: '2026',
        pdf: 'https://arxiv.org/pdf/2603.12180',
        code: 'https://github.com/OxRML/MADQA',
        dataset: 'https://huggingface.co/datasets/OxRML/MADQA',
      },
      {
        name: 'OfficeQA Pro',
        description: 'An enterprise grounded-reasoning benchmark over U.S. Treasury Bulletins. Its challenging questions require document retrieval, precise parsing, and analytical reasoning across text and tables.',
        image: officeQAImage,
        imageAlt: 'OfficeQA benchmark suite logo',
        venue: 'arXiv', year: '2026',
        pdf: 'https://arxiv.org/pdf/2603.08655',
        code: 'https://github.com/databricks/officeqa',
        dataset: 'https://huggingface.co/datasets/databricks/officeqa',
      },
      {
        name: 'FinRAGBench-V',
        description: 'A bilingual financial benchmark for multimodal retrieval-augmented generation, evaluating answers and visual citations grounded in charts, tables, and text from financial documents.',
        image: finRAGBenchImage,
        imageAlt: 'FinRAGBench-V dataset construction and visual citation example',
        venue: 'EMNLP', year: '2025',
        pdf: 'https://aclanthology.org/2025.emnlp-main.211.pdf',
        code: 'https://github.com/zhaosuifeng/FinRAGBench-V',
        dataset: 'https://huggingface.co/datasets/zhaosuifeng/FinRAGBench-V',
      },
      {
        name: 'LongDocURL',
        description: 'A multimodal long-document benchmark combining document understanding, numerical reasoning, and evidence localization across text, tables, and visual elements.',
        image: longDocURLImage,
        imageAlt: 'LongDocURL benchmark construction pipeline',
        venue: 'ACL', year: '2025',
        pdf: 'https://aclanthology.org/2025.acl-long.57.pdf',
        code: 'https://github.com/dengc2023/LongDocURL',
        dataset: 'https://huggingface.co/datasets/dengchao/LongDocURL',
      },
      {
        name: 'MMLongBench-Doc',
        description: 'Tests long-context document understanding with evidence from text, images, charts, tables, and layouts. Includes cross-page questions and unanswerable questions to assess hallucination.',
        image: mmLongBenchImage,
        imageAlt: 'MMLongBench-Doc question examples and benchmark overview',
        venue: 'NeurIPS', year: '2024',
        pdf: 'https://arxiv.org/pdf/2407.01523',
        code: 'https://github.com/mayubo2333/MMLongBench-Doc',
        dataset: 'https://huggingface.co/datasets/yubo2333/MMLongBench-Doc',
      },
    ],
  },
];

export default function BenchmarksPage() {
  return <>
    <header className="research-intro">
      <a className="research-back" href={siteUrl('/')}>← Back to DataMosaic</a>
      <h1>Benchmarks</h1>
      <p className="research-description">Explore benchmarks for structured extraction, document understanding, and evidence-grounded reasoning.</p>
    </header>
    {categories.map(category => <section className="publication-year-group" key={category.id} aria-labelledby={category.id}>
      <div className="publication-year"><h2 id={category.id}>{category.name}</h2><p>{category.benchmarks.length} benchmarks</p></div>
      <ol className="publication-list benchmark-list" aria-label={`${category.name} benchmarks`}>
        {category.benchmarks.map(benchmark => <li key={benchmark.name}>
          <a className="publication-figure" href={benchmark.image} target="_blank" rel="noreferrer" aria-label={`View image for ${benchmark.name}`}>
            <img src={benchmark.image} alt={benchmark.imageAlt} decoding="async"/>
          </a>
          <article aria-label={benchmark.name}>
            <h3 className="publication-title"><a href={benchmark.code} target="_blank" rel="noreferrer">{benchmark.name}</a></h3>
            <p className="publication-authors">{benchmark.description}</p>
            <p className="publication-meta"><span>{benchmark.venue}</span><span>{benchmark.year}</span></p>
            <div className="publication-links">
              <a href={benchmark.pdf} target="_blank" rel="noreferrer" aria-label={`Read ${benchmark.name} paper (PDF)`}>PDF <span aria-hidden="true">↗</span></a>
              <a href={benchmark.code} target="_blank" rel="noreferrer" aria-label={`Code for ${benchmark.name}`}>Code <span aria-hidden="true">↗</span></a>
              <a href={benchmark.dataset} target="_blank" rel="noreferrer" aria-label={`Dataset for ${benchmark.name}`}>Dataset <span aria-hidden="true">↗</span></a>
            </div>
          </article>
        </li>)}
      </ol>
    </section>)}
  </>;
}
