import landingAIImage from '../../assets/tools/landing-ai.webp';
import llamaExtractImage from '../../assets/tools/llamaextract.png';
import reductoImage from '../../assets/tools/reducto.png';
import { siteUrl } from './site';

const categories = [
  {
    id: 'agentic-document-ai',
    name: 'Agentic Document AI',
    description: 'Understand complex documents with layout-aware, evidence-grounded AI.',
    products: [{
      name: 'LandingAI',
      image: landingAIImage,
      imageAlt: 'LandingAI document processing workflow connecting documents with structured results',
      url: 'https://landing.ai',
      description: 'Turn documents into structured, usable content with Agentic Document Extraction. Parse text, tables, and figures, extract fields with a schema, and trace results back to their source.',
      tags: ['Layout-aware parsing', 'Schema extraction', 'Source citations'],
    }],
  },
  {
    id: 'extraction',
    name: 'Extraction',
    description: 'Turn unstructured documents into structured data for your workflows.',
    products: [
      {
        name: 'LlamaExtract',
        image: llamaExtractImage,
        imageAlt: 'LlamaExtract custom schema mapping document fields to structured extraction results',
        url: 'https://www.llamaindex.ai',
        description: 'Define a custom schema and extract structured data from documents. LlamaExtract pairs extracted fields with confidence scores and source citations to help you review and use the results.',
        tags: ['Custom schemas', 'Field confidence', 'Source citations'],
      },
      {
        name: 'Reducto',
        image: reductoImage,
        imageAlt: 'Reducto extracting email, address, amount, and order fields from a document',
        url: 'https://reducto.ai',
        description: 'Extract structured data from invoices, forms, and financial disclosures. Reducto combines document parsing with schema-based extraction to turn complex layouts and tables into fields your applications can use.',
        tags: ['Document parsing', 'Schema extraction', 'Table extraction'],
      },
    ],
  },
];

export default function ToolsPage() {
  return <>
    <header className="research-intro">
      <a className="research-back" href={siteUrl('/')}>← Back to DataMosaic</a>
      <h1>Tools</h1>
      <p className="research-description">Explore products for document understanding and data extraction. Find the capabilities that fit your workflow.</p>
    </header>
    {categories.map(category => <section className="tools-category" key={category.id} aria-labelledby={category.id}>
      <h2 id={category.id}>{category.name}</h2>
      <p className="tools-category-description">{category.description}</p>
      <div className="tools-grid">
        {category.products.map(product => <article className="tool-card" key={product.name} aria-label={product.name}>
          <a href={product.url} target="_blank" rel="noreferrer" aria-label={`Visit ${product.name} website`}>
            <div className="tool-image"><img src={product.image} alt={product.imageAlt} decoding="async"/></div>
            <div className="tool-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <ul className="tool-tags" aria-label="Capabilities">{product.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
              <span className="tool-visit">Visit website <span aria-hidden="true">↗</span></span>
            </div>
          </a>
        </article>)}
      </div>
    </section>)}
  </>;
}
