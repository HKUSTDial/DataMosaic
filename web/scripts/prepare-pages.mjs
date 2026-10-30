import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve(process.argv[2] || 'dist');
await writeFile(resolve(output, '.nojekyll'), '');
// Pages serves files directly; each portal route needs its own entry HTML.
// /dbmosaic/ and /structmosaic/ keep their standalone entries copied from public/.
for (const route of ['research', 'members', 'tools', 'benchmarks', 'docmosaic', 'ontomosaic-doc', 'ontomosaic-text2sql', 'ontomosaic-enterprise', 'ontology']) {
  await mkdir(resolve(output, route), { recursive: true });
  await copyFile(resolve(output, 'index.html'), resolve(output, route, 'index.html'));
}
