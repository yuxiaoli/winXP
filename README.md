# WinXP

🏁 Web based Windows XP desktop recreation.

Features:

- Drag and resize, minimize, maximize windows
- Open applications from desktop icons or start menu
- Minesweeper, Internet Explorer, My Computer, Notepad, Winamp, Paint
- Power off menu

## [Try Sean’s desktop](https://yuxiaoli.github.io/winXP/)

Personal desktop maintained by [Sean / Yuxiao Li](https://github.com/yuxiaoli), with links to [Vector Index](https://vectorindex.cloud) and public projects.

[![](demo/demo.gif)](https://yuxiaoli.github.io/winXP/)

Originally created by [ShizukuIchi](https://github.com/ShizukuIchi/winXP). The original project and its credits are retained under the MIT license.

Custom changes live on `develop`, the default branch. `master` is a read-only upstream cache synchronized manually by the repository owner.

## Development and publishing

Use the existing Yarn lockfile: `corepack yarn@1.22.22 install --frozen-lockfile`.
Run `npm test -- --watchAll=false --runInBand`, then `npm run build`.
The build uses the existing `/winXP/` Pages base path. Publish only generated `build/` files from the verified `develop` commit to `gh-pages`; the public URL remains unchanged.

Before committing a publication, use Node 18+ to run `node scripts/prune-obsolete-pages.cjs <publication-worktree>` from this source checkout. The target must be an isolated `publish/` worktree of this fork. The default is a dry run; add `--apply` after reviewing its two-file allowlist to stage index-only removals of the verified obsolete JS/map. It refuses referenced assets, changed blob fingerprints or edited local target bytes, preserves all other assets, and never deletes files or Git history. Stage build files BEFORE pruning; do not run a broad `git add` afterward, which could reintroduce retained local copies. An index-only publication checkout avoids materializing these old files; otherwise they remain locally untracked after commit and are reported by path only. Run metadata-only tests with `node --test scripts/prune-obsolete-pages.test.cjs`. Existing publication worktrees, historical Git/PR copies, CDN caches and prior downloads remain outside this policy's cleanup scope.

The browser start page and Notepad introduction are bundled defaults. They do not read, erase or migrate browser storage. Notepad in this recreation does not persist documents between closed windows.

## Contributing

Generally open an issue (or comment on an issue if there's one already) before starting work on a PR.

## License

The Windows XP name, artwork, trademark are surely property of Microsoft. This project is provided for educational purposes only. It is not affiliated with and has not been approved by Microsoft.

## Thanks

- [Webamp](https://github.com/captbaritone/webamp), Winamp 2 reimplementation by: [captbaritone](https://github.com/captbaritone)
- [JS Paint](https://github.com/1j01/jspaint), Paint reimplementation by: [1j01](https://github.com/1j01)
