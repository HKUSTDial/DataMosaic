import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { test } from 'node:test';

test('Pages publishing creates a static branch, replaces old assets, preserves history and skips identical builds', () => {
  const folder = mkdtempSync(join(tmpdir(), 'pages-publish-'));
  const remote = join(folder, 'remote.git');
  const script = resolve('scripts/publish-pages.sh');
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const publish = (name, files) => {
    const output = join(folder, name);
    mkdirSync(output);
    writeFileSync(join(output, 'index.html'), '<div id="root"></div>');
    writeFileSync(join(output, '.nojekyll'), '');
    for (const [path, text] of Object.entries(files)) writeFileSync(join(output, path), text);
    execFileSync('bash', [script, output, remote], { stdio: 'pipe' });
    return git('--git-dir', remote, 'rev-parse', 'gh-pages');
  };
  try {
    git('init', '--bare', remote);
    const first = publish('first', { 'old.js': 'old' });
    const second = publish('second', { 'new.js': 'new' });
    assert.notEqual(first, second);
    assert.equal(git('--git-dir', remote, 'rev-parse', 'gh-pages^'), first);
    assert.equal(git('--git-dir', remote, 'ls-tree', '--name-only', 'gh-pages'), '.nojekyll\nindex.html\nnew.js');
    assert.equal(publish('identical', { 'new.js': 'new' }), second);
    assert.equal(git('--git-dir', remote, 'show', 'gh-pages:new.js'), 'new');
    const invalid = join(folder, 'invalid');
    mkdirSync(invalid);
    writeFileSync(join(invalid, 'index.html'), 'unprepared');
    assert.throws(() => execFileSync('bash', [script, invalid, remote], { stdio: 'pipe' }));
    assert.equal(git('--git-dir', remote, 'rev-parse', 'gh-pages'), second);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
