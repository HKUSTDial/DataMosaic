export const isPagesPreview = import.meta.env.MODE === 'pages';

export function siteUrl(path: string) {
  return path.startsWith('/') ? import.meta.env.BASE_URL + path.slice(1) : path;
}

export function pagePath() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return window.location.pathname.slice(base.length) || '/';
}
