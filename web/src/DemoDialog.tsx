import { useEffect, useRef, useState } from 'react';
import ProductPreview from './ProductPreview';
import ontoMosaicDemo from '../../assets/OntoMosaic-Text2SQL-demo.gif';
import docMosaicDemo from '../../assets/DocMosaic-demo.gif';
import dbMosaicDemo from '../../assets/DBMosaic-demo.gif';
import { isPagesPreview } from './site';

const demoVideos = import.meta.glob<string>('../../assets/*-demo.{mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export default function DemoDialog({ mode, onClose }: { mode: 'analyze' | 'extract' | 'ontology'; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const title = mode === 'ontology' ? 'OntoMosaic-Text2SQL' : mode === 'analyze' ? 'DocMosaic' : 'DBMosaic';
  const videoUrl = demoVideos[`../../assets/${mode}-demo.mp4`] ?? demoVideos[`../../assets/${mode}-demo.webm`];

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog?.close();
    };
  }, []);

  function closeDemo() {
    videoRef.current?.pause();
    onClose();
  }

  return <dialog className={`demo-dialog${expanded ? ' demo-dialog-expanded' : ''}`} ref={dialogRef} aria-labelledby="demo-title"
    onCancel={event => { event.preventDefault(); if (expanded) setExpanded(false); else closeDemo(); }}
    onClick={event => { if (event.target === event.currentTarget) closeDemo(); }}>
    <div className="demo-header">
      <h2 id="demo-title">{title} demo</h2>
      <div className="demo-controls">
        <button className="demo-control demo-expand" type="button" onClick={() => setExpanded(value => !value)} aria-pressed={expanded} aria-label={expanded ? 'Restore demo size' : 'Expand demo to full screen'} title={expanded ? 'Restore size' : 'Full screen'}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={expanded ? 'M3 8h5V3M16 3v5h5M21 16h-5v5M8 21v-5H3' : 'M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5'}/></svg>
        </button>
        <button className="demo-control demo-close" type="button" onClick={closeDemo} aria-label="Close demo" title="Close" autoFocus>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </div>
    </div>
    {isPagesPreview && <p className="demo-preview-note">Workflow preview. Run DataMosaic locally to use this application.</p>}
    {mode === 'ontology' ? <img className="demo-video" src={ontoMosaicDemo} alt="OntoMosaic-Text2SQL ontology learning workflow"/>
      : isPagesPreview ? <img className="demo-video" src={mode === 'analyze' ? docMosaicDemo : dbMosaicDemo} alt={`${title} workflow preview`}/>
      : videoUrl && !videoFailed ? <video className="demo-video" ref={videoRef} src={videoUrl} controls playsInline preload="metadata" onError={() => setVideoFailed(true)} aria-label={`${title} product demonstration`}/>
      : <div className="demo-placeholder">
        <span className="coming-soon-badge">{videoFailed ? 'Video unavailable' : 'Video coming soon'}</span>
        <ProductPreview mode={mode}/>
      </div>}
  </dialog>;
}
