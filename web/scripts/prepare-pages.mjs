import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve(process.argv[2] || 'dist');
await writeFile(resolve(output, '.nojekyll'), '');
// Pages serves files directly; each portal route needs its own entry HTML.
// Product introductions keep their standalone entries copied from public/.
for (const route of ['research', 'members', 'tools', 'benchmarks', 'docmosaic/app', 'ontomosaic-doc', 'ontomosaic-db', 'ontomosaic-text2sql', 'ontomosaic-enterprise', 'ontology']) {
  await mkdir(resolve(output, route), { recursive: true });
  await copyFile(resolve(output, 'index.html'), resolve(output, route, 'index.html'));
}

// Give the public ontology page its own search/share metadata.
const ontologyEntry = resolve(output, 'ontomosaic-db', 'index.html');
const ontologyHtml = (await readFile(ontologyEntry, 'utf8'))
  .replace(/<title>[^<]*<\/title>/, '<title>OntoMosaic-DB · Reusable database knowledge</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="OntoMosaic-DB builds reusable ontology graphs that connect business concepts, metrics and rules to database structures and values.">');
await writeFile(ontologyEntry, ontologyHtml);
