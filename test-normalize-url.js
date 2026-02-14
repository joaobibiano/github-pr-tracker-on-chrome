const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadNormalizeUrl() {
  const utilsPath = path.join(__dirname, 'src/shared/utils.js');
  const source = fs.readFileSync(utilsPath, 'utf8');
  const transformedSource = `${source.replaceAll('export function ', 'function ')}\nmodule.exports = { normalizeUrl };`;

  const context = {
    module: { exports: {} },
    exports: {},
  };

  vm.runInNewContext(transformedSource, context, { filename: utilsPath });

  return context.module.exports.normalizeUrl;
}

function testNormalizeUrl() {
  const normalizeUrl = loadNormalizeUrl();

  assert.equal(
    normalizeUrl('https://github.com/acme/repo/pull/123'),
    'https://github.com/acme/repo/pull/123'
  );

  assert.equal(
    normalizeUrl('https://github.com/acme/repo/pull/123/files'),
    'https://github.com/acme/repo/pull/123'
  );

  assert.equal(
    normalizeUrl('https://github.com/acme/repo/pull/123/files?diff=split#L1'),
    'https://github.com/acme/repo/pull/123'
  );

  assert.equal(
    normalizeUrl('https://example.com/path?x=1#hash'),
    'https://example.com/path'
  );
}

testNormalizeUrl();
console.log('normalizeUrl tests passed');
