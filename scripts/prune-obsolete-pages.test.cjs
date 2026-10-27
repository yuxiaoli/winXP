const assert = require('node:assert/strict');
const test = require('node:test');
const { plannedRemovals } = require('./prune-obsolete-pages.cjs');

const obsolete = {
  'static/js/main.fd1ef8b7.js': 'bd06a3e3863512a87f37c613a3654a4b550a9cc7',
  'static/js/main.fd1ef8b7.js.map': '0b0913b186a7f22a8e7e75564faa308f4399145f',
};
const current = 'static/js/main.9230efc1.js';
const manifest = {
  files: {
    'main.js': `/winXP/${current}`,
    'main.js.map': `/winXP/${current}.map`,
  },
  entrypoints: [current],
};

test('prunes only the two verified obsolete blobs and is repeatable after removal', () => {
  const input = {
    trackedBlobs: {
      ...obsolete,
      [current]: '1111111111111111111111111111111111111111',
      'static/js/other-unreferenced.js':
        '3333333333333333333333333333333333333333',
      'static/js/main.fd1ef8b7.js.LICENSE.txt':
        '4444444444444444444444444444444444444444',
    },
    manifest,
    html: `<script src="/winXP/${current}"></script>`,
  };
  assert.deepEqual(plannedRemovals(input), Object.keys(obsolete));
  assert.deepEqual(
    plannedRemovals({
      ...input,
      trackedBlobs: { [current]: input.trackedBlobs[current] },
    }),
    [],
  );
  assert.equal(Object.keys(input.trackedBlobs).length, 5);
});

test('refuses removal when either target is referenced by the manifest or HTML', () => {
  for (const name of Object.keys(obsolete)) {
    assert.throws(
      () =>
        plannedRemovals({
          trackedBlobs: obsolete,
          manifest: { files: { asset: `/winXP/${name}` } },
          html: '',
        }),
      /referenced/,
    );
    assert.throws(
      () =>
        plannedRemovals({
          trackedBlobs: obsolete,
          manifest,
          html: `<script src="/winXP/${name}?v=1"></script>`,
        }),
      /referenced/,
    );
  }
});

test('refuses removal when an obsolete path no longer has its verified Git blob', () => {
  assert.throws(
    () =>
      plannedRemovals({
        trackedBlobs: {
          ...obsolete,
          'static/js/main.fd1ef8b7.js':
            '2222222222222222222222222222222222222222',
        },
        manifest,
        html: '',
      }),
    /fingerprint/,
  );
});

test('preserves a concurrently edited target even if its staged blob still matches', () => {
  assert.throws(
    () =>
      plannedRemovals({
        trackedBlobs: obsolete,
        worktreeBlobs: {
          'static/js/main.fd1ef8b7.js':
            '5555555555555555555555555555555555555555',
        },
        manifest,
        html: '',
      }),
    /worktree/,
  );
});
