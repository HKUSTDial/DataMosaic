import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const data = JSON.parse(readFileSync(new URL('../public/docmosaic/results.json', import.meta.url), 'utf8'));
test('reported results preserve source coverage and separate benchmark metrics', () => {
  assert.equal(data.rows.length, 32);
  assert.equal(data.rows.filter(row => row.source === 'docatlas').length, 27);
  assert.equal(data.rows.filter(row => row.source === 'docpilot').length, 5);
  assert.equal(new Set(data.rows.map(row => row.model)).size, 32);
  assert.deepEqual(data.metrics.map(metric => `${metric.benchmark}/${metric.label}`), [
    ...['TXT', 'LAY', 'CHA', 'TAB', 'FIG', 'UNA', 'Acc', 'F1', 'LasJ'].map(metric => `MMLongBench-Doc/${metric}`),
    ...['TXT', 'TAB', 'CHA', 'LasJ'].map(metric => `FinRAGBench-V/${metric}`),
    'LongDocURL/LasJ', 'DocBench/LasJ',
  ]);
  for (const row of data.rows) {
    assert.equal(row.values.length, 15, row.model);
    assert(row.values.every(value => value === null || Number.isFinite(value) && value >= 0 && value <= 100), row.model);
    assert(data.sources[row.source].url.startsWith('https://'));
    if (row.source === 'docpilot') {
      assert.equal(row.values[8], null, 'DocPilot does not report MMLongBench-Doc LasJ');
      assert.equal(row.values[13], null, 'DocPilot does not report LongDocURL');
    } else {
      assert.equal(row.values[14], null, 'The DocAtlas leaderboard does not report DocBench');
    }
  }
  const scores = name => data.rows.find(row => row.model === name).values;
  assert.deepEqual(scores('DocPilot-4B'), [57.4, 47.9, 53.4, 58.7, 51.0, 70.0, 59.1, 58.5, null, 68.7, 56.2, 59.6, 60.2, null, 80.3]);
  assert.deepEqual(scores('DocPilot + Gemini-3.1-Pro'), [75.4, 70.0, 74.6, 74.5, 74.2, 73.2, 75.6, 74.9, null, 68.3, 79.4, 77.4, 75.8, null, 86.8]);
  assert.deepEqual(scores('DocPilot + GPT-5.4'), [72.7, 68.4, 69.1, 71.6, 71.4, 75.0, 73.5, 72.4, null, 59.3, 79.4, 78.7, 73.8, null, 83.5]);
  assert.equal(scores('GPT-5.4')[6], 62.4, 'Retain the DocAtlas baseline rather than replacing it with the different DocPilot baseline');
  assert.equal(scores('Qwen3.5-4B')[6], 54.4);
  assert.equal(scores('DocAtlas + GPT-5.4')[13], 78.8);
});
