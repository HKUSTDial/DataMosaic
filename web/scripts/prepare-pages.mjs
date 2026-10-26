import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve(process.argv[2] || 'dist');
// Pages serves files directly; each portal route needs its own entry HTML.
for (const route of ['research', 'docmosaic', 'dbmosaic', 'ontomosaic-doc', 'ontomosaic-text2sql', 'ontomosaic-enterprise', 'ontology']) {
  await mkdir(resolve(output, route), { recursive: true });
  await copyFile(resolve(output, 'index.html'), resolve(output, route, 'index.html'));
}
