import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const path = process.argv[2];
if (!path) throw new Error('DocPilot API source path is required');

function replaceOnce(file, original, replacement) {
  const source = readFileSync(file, 'utf8');
  if (source.split(original).length !== 2) {
    throw new Error(`${file} changed; update the same-origin build patch`);
  }
  writeFileSync(file, source.replace(original, replacement));
}

replaceOnce(
  path,
  'const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8008";',
  'const API_BASE = import.meta.env.VITE_API_BASE_URL ?? `${window.location.origin}/analyze`;',
);
replaceOnce(join(dirname(path), 'App.tsx'), 'src="/docpilot-logo.png"', 'src="/analyze/docpilot-logo.png"');
