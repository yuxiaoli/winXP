const obsolete = Object.freeze({
  'static/js/main.fd1ef8b7.js': 'bd06a3e3863512a87f37c613a3654a4b550a9cc7',
  'static/js/main.fd1ef8b7.js.map': '0b0913b186a7f22a8e7e75564faa308f4399145f',
});

function plannedRemovals({ trackedBlobs, worktreeBlobs = {}, manifest, html }) {
  const references = [
    ...Object.values(manifest.files),
    ...(manifest.entrypoints || []),
    ...Array.from(
      html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi),
      match => match[1],
    ),
  ];
  const referenced = new Set(
    references.map(value => {
      const url = new URL(value, 'https://yuxiaoli.github.io/winXP/');
      return url.origin === 'https://yuxiaoli.github.io'
        ? decodeURIComponent(url.pathname).replace(/^\/(?:winXP\/)?/, '')
        : null;
    }),
  );
  for (const name of Object.keys(obsolete)) {
    if (
      Object.hasOwn(worktreeBlobs, name) &&
      worktreeBlobs[name] !== obsolete[name]
    ) {
      throw new Error(`Refusing changed worktree target: ${name}`);
    }
    if (referenced.has(name))
      throw new Error(`Refusing to remove referenced asset: ${name}`);
    if (
      Object.hasOwn(trackedBlobs, name) &&
      trackedBlobs[name] !== obsolete[name]
    ) {
      throw new Error(`Refusing changed fingerprint: ${name}`);
    }
  }
  return Object.keys(obsolete).filter(name =>
    Object.hasOwn(trackedBlobs, name),
  );
}

module.exports = { plannedRemovals };

if (require.main === module) {
  const { execFileSync } = require('node:child_process');
  const fs = require('node:fs');
  const path = require('node:path');
  const args = process.argv.slice(2);
  const target = args.find(arg => !arg.startsWith('--'));
  if (!target || args.some(arg => arg.startsWith('--') && arg !== '--apply')) {
    throw new Error(
      'Usage: node scripts/prune-obsolete-pages.cjs <publication-worktree> [--apply]',
    );
  }
  const cwd = path.resolve(target);
  const git = gitArgs =>
    execFileSync('git', gitArgs, { cwd, encoding: 'utf8' }).trim();
  const top = path.resolve(git(['rev-parse', '--show-toplevel']));
  if (cwd !== top)
    throw new Error('Target must be the publication worktree root');
  const branch = git(['branch', '--show-current']);
  if (!branch.startsWith('publish/'))
    throw new Error('Target must use an isolated publish/ branch');
  const remote = git(['remote', 'get-url', 'origin']);
  if (
    ![
      'https://github.com/yuxiaoli/winXP.git',
      'git@github.com:yuxiaoli/winXP.git',
    ].includes(remote)
  ) {
    throw new Error('Target is not the verified WinXP repository');
  }
  const trackedBlobs = {};
  const worktreeBlobs = {};
  for (const name of Object.keys(obsolete)) {
    const filename = path.join(cwd, name);
    try {
      const stat = fs.lstatSync(filename);
      if (!stat.isFile() || stat.isSymbolicLink())
        throw new Error(`Unexpected local target type: ${name}`);
      worktreeBlobs[name] = git(['hash-object', '--no-filters', '--', name]);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  for (const line of git([
    'ls-files',
    '--stage',
    '--',
    ...Object.keys(obsolete),
  ])
    .split('\n')
    .filter(Boolean)) {
    const match = /^100644 ([a-f0-9]{40}) 0\t(.+)$/.exec(line);
    if (!match)
      throw new Error('Unexpected target mode or unmerged index entry');
    trackedBlobs[match[2]] = match[1];
  }
  const removals = plannedRemovals({
    trackedBlobs,
    worktreeBlobs,
    manifest: JSON.parse(git(['show', ':asset-manifest.json'])),
    html: git(['show', ':index.html']),
  });
  if (args.includes('--apply') && removals.length) {
    git(['update-index', '--force-remove', '--', ...removals]);
  }
  console.log(
    JSON.stringify(
      {
        mode: args.includes('--apply') ? 'index-only' : 'dry-run',
        branch,
        removals,
        localCopiesPresent: Object.keys(worktreeBlobs),
      },
      null,
      2,
    ),
  );
}
