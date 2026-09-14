'use strict';

// Source-level tripwire complements the behavioral coverage in portfolio.test.cjs.
// Cover future runtime assets too; docs/tests may name the forbidden features.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const excluded = new Set(['.git', '.github', '.claude', 'node_modules', 'tests', 'docs', 'Old', 'Old2', 'OLD3']);

function sources(dir = root) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (excluded.has(entry.name)) return [];
    const file = path.join(dir, entry.name);
    if (file === path.join(root, 'FUN')) return [path.join(file, 'AQMgame.html')];
    if (entry.isDirectory()) return sources(file);
    return /\.(?:html|css|js|mjs|cjs|svg)$/.test(entry.name) ? [file] : [];
  });
}

test('live source never restores OS motion gates or the removed static/idle modes', () => {
  for (const file of sources()) {
    const source = fs.readFileSync(file, 'utf8');
    const name = path.relative(root, file);
    assert.doesNotMatch(source, /prefers[\s_-]*reduced[\s_-]*motion/i,
      `${name}: motion-preference gates violate the owner requirement in AGENTS.md`);
    assert.doesNotMatch(source, /\bbg[-_](?:idle|static)\b|\b(?:reduceMotion|reducedMotion|prefersReduced|lowMotion|lowEnd)\b/,
      `${name}: do not restore the removed static/idle modes; see AGENTS.md`);
  }
});
