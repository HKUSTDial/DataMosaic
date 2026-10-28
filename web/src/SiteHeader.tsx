import { siteUrl } from './site';
import { useEffect, useRef, useState } from 'react';

const repository = 'https://github.com/HKUSTDial/DataMosaic';
const dropdowns = [
  { id: 'application', label: 'Applications', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', links: [
    { label: 'DBMosaic', description: 'Schema-driven extraction with DBMosaic', href: '/dbmosaic/', icon: 'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM3 10h18M9 10v10M15 10v10M7 7h3' },
    { label: 'DocMosaic', description: 'Document Q&A with DocMosaic', href: '/docmosaic/', icon: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H16l4 4v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5zM15.5 3v4.5H20M8 11h8M8 15h5' },
  ] },
  { id: 'ontology', label: 'Ontologies', icon: 'M12 8v4M5 16v-4h14v4M9 2h6v6H9zM2 16h6v6H2zM16 16h6v6h-6z', links: [
    { label: 'OntoMosaic-Doc', description: 'Context-graph retrieval across the enterprise', href: '/ontomosaic-doc', icon: 'M12 8v4M5 16v-4h14v4M9 2h6v6H9zM2 16h6v6H2zM16 16h6v6h-6z' },
    { label: 'OntoMosaic-Text2SQL', description: 'Build and explore database knowledge from SQL examples', href: '/ontomosaic-text2sql', icon: 'M12 8v4M5 16v-4h14v4M9 2h6v6H9zM2 16h6v6H2zM16 16h6v6h-6z' },
    { label: 'OntoMosaic-Enterprise', description: 'Connect business processes and data through a shared ontology', href: '/ontomosaic-enterprise', icon: 'M12 8v4M5 16v-4h14v4M9 2h6v6H9zM2 16h6v6H2zM16 16h6v6h-6z' },
  ] },
  { id: 'resource', label: 'Resources', icon: 'M12 5v15M3 5c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0v15c-3-1.5-6-1.5-9 0-3-1.5-6-1.5-9 0z', links: [
    { label: 'Tools', description: 'Explore tools for working with data', href: '/tools/', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
    { label: 'Benchmarks', description: 'Explore datasets and evaluations', href: '/benchmarks/', icon: 'M4 3v18h17M8 17v-5M13 17V8M18 17V4' },
    { label: 'Publications', description: 'Read the research behind DataMosaic', href: '/research/', icon: 'M4 3h11l3 3v5M4 3v18h7M8 7h5M8 11h3M19 15a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-1 3 3 3' },
  ] },
  { id: 'organization', label: 'Organization', icon: 'M12 8v4M5 16v-4h14v4M9 2h6v6H9zM2 16h6v6H2zM16 16h6v6h-6z', links: [
    { label: 'Documentation', description: 'Explore the repository and setup guides', href: repository, icon: 'M12 5v15M3 5c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0v15c-3-1.5-6-1.5-9 0-3-1.5-6-1.5-9 0z' },
    { label: 'Members', description: 'Meet the people behind DataMosaic', href: '/members/', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  ] },
];

export default function SiteHeader({ darkMode, onToggleTheme }: { darkMode: boolean; onToggleTheme: () => void }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  function closeNavigation() {
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (mobileOpen) document.getElementById('nav-application')?.focus();
  }, [mobileOpen]);

  useEffect(() => {
    if (!openMenu && !mobileOpen) return;
    function outsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) closeNavigation();
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (openMenu) {
        document.getElementById(`nav-${openMenu}`)?.focus();
        setOpenMenu(null);
      } else {
        document.getElementById('nav-mobile')?.focus();
        setMobileOpen(false);
      }
    }
    document.addEventListener('pointerdown', outsideClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', outsideClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openMenu, mobileOpen]);

  return <header className="site-header" ref={headerRef} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeNavigation();
  }}>
    <div className="site-header-inner">
      <a className="brand" href={siteUrl('/')} aria-label="DataMosaic home">
        <span className="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
        <span className="brand-name">Data<span>Mosaic</span></span>
      </a>
      <nav className={`header-navigation${mobileOpen ? ' is-open' : ''}`} id="primary-navigation" aria-label="Main navigation">
        {dropdowns.map((group) => <div className="header-nav-group" key={group.id}>
          <button className="header-nav-trigger" id={`nav-${group.id}`} type="button" aria-expanded={openMenu === group.id} aria-controls={`nav-${group.id}-panel`} onClick={() => setOpenMenu(openMenu === group.id ? null : group.id)}>
            <span className="header-nav-label"><svg className="header-nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={group.icon}/></svg>{group.label}</span><svg className="header-nav-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
          </button>
          <div className="header-dropdown" id={`nav-${group.id}-panel`} hidden={openMenu !== group.id}>
            {group.links.map((link) => <a key={link.label} href={siteUrl(link.href)} target={link.href.startsWith('https:') ? '_blank' : undefined} rel={link.href.startsWith('https:') ? 'noreferrer' : undefined} onClick={closeNavigation}>
              <span className="header-dropdown-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d={link.icon}/></svg></span><span className="header-dropdown-copy"><strong>{link.label}</strong><small>{link.description}</small></span><span className="header-link-arrow" aria-hidden="true">↗</span>
            </a>)}
          </div>
        </div>)}
      </nav>
      <div className="header-actions">
        <button className="header-mobile-toggle" id="nav-mobile" type="button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls="primary-navigation" onClick={() => { setMobileOpen(!mobileOpen); setOpenMenu(null); }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={mobileOpen ? 'm6 6 12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'}/></svg>
        </button>
        <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-pressed={darkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Light mode' : 'Dark mode'}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{darkMode ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></> : <path d="M20.7 13.4A8.8 8.8 0 0 1 10.6 3.3a8.8 8.8 0 1 0 10.1 10.1Z"/>}</svg>
        </button>
        <a className="header-contact" href={`${repository}/issues/new`} target="_blank" rel="noreferrer">Contact us<span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </header>;
}
