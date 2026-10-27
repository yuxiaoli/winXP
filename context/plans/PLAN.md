# WinXP personal desktop update — 2026-10-25

## Active rollout — canonical welcome, 2026-10-27

Scope: replace only Notepad's previous new-window state seed with the exact approved welcome from DOT_NOTES `projects/repos/boot-loader/welcome.md` at `bb681b8fd0085af3cc15ef02e6da1b955404e5ce`. Preserve every word and all six paragraphs, including `Keep exploring`. Canonical text is 525 UTF-8 bytes, no trailing newline, Git blob `fe7e9edba1d4cbbe07d44e43dea42bd5e3f234b7`, SHA256 `8CFADE6F56F8046D1A2DEAE329E43D3F024095917D18DC11E436B095D9C9FB36`.

Starting state: local and remote `develop` both `bad58e397d12f006f84dbbec841ca9db6fa5135e`; remote default is `develop`; `master` remains `856bb554b3667f62078010b4cee10cc2645761e1`. Both the source checkout and existing `winXP-pages` publication worktree are clean. Work branch: `feature/canonical-welcome-20261027`, based on the verified latest develop.

Constraints: no `main`/`master` writes, force push, credentials/security changes, browser control or other repository edits. Preserve the existing public URL, MIT license, upstream/Webamp/JS Paint credits and disabled New/Open/Save behavior. Notepad has no persisted document model or saved-file input parameter; introduce none. Preserve edited and empty mounted documents; do not access or clear browser storage. Keep the existing `winXP-pages` worktree intact and publish through a separate generated-artifact checkout.

1. [x] Verify canonical bytes, current source/default/cache refs and clean worktrees; record this plan before implementation.
2. [x] Replace only the bundled state seed. Add noninteractive DOM regression coverage for exact default equality, edited/empty text preservation across rerenders and independent new windows.
3. [x] Run the unchanged existing test plus the new Notepad DOM test: two suites/two tests pass. The new test first failed on the previous 363-byte introduction, then passed on the approved 525-byte value. Lint passes with zero errors/four existing warnings. Production build passes with the documented existing Webamp source-map, lint, Browserslist and bundle-size warnings. Parsed source and minified build ASTs each contain exactly one actual welcome `useState` initializer, byte-for-byte equal to the canonical copy (six paragraphs, approved SHA256). Substantive diff review confirms no storage, file-input, menu, license or credit changes. No CUA/Edge/Chrome/Playwright used; rendered/device appearance remains untested.
4. [x] Opened [draft PR #1](https://github.com/yuxiaoli/winXP/pull/1) at head `8c4d1860f10f21e2d24134f89f57a4a62bc0bf35`. The parent agent independently reviewed the entire diff and ran both Jest tests successfully before readiness. Recorded the agent review in the PR without claiming a GitHub formal approval. Platform readback had no unresolved review threads, no blocking reviews and no configured PR check/status contexts; hosted PR CI is not claimed.
5. [x] Marked ready only after that review, then merged normally with expected-head protection. Exact merged `develop`: `4a945de7bce21bf25f3f21d40d6888bf61fb941e`. Re-ran both tests and the production build from the clean merged checkout. Published generated files via separate `winXP-welcome-pages-20261027` worktree; existing `winXP-pages` stayed at `788e0b4073967b68d25e6ebd3484398abfa0397e`, clean and untouched.
6. [x] Final generated publication `7428144ef76d7cb2deba8797e24166357564a2a2` passed [Pages workflow 40503453076](https://github.com/yuxiaoli/winXP/actions/runs/40503453076). HTTP readback of [deployment metadata](https://yuxiaoli.github.io/winXP/deployment.json) matched the merged source, public HTML referenced `/winXP/static/js/main.9230efc1.js`, and the downloaded bundle matched the exact merged build SHA256 `6324b1203c1dff303e8f0046368aa9839eca24864cad9c31251e75b49165caab`. Parsed actual `useState` initializers in source, local build and live compiled bundle each equal the complete approved text: 525 bytes, six paragraphs, approved SHA256, no trailing newline.

Status: approved welcome delivered and accepted with noninteractive DOM/HTTP evidence. The delivery-record closeout changes only this plan; publication metadata identifies the exact deployed source revision, including any such documentation-only closeout. No browser/UI control was used, so rendered/device appearance remains NOT TESTED. No persistence subsystem or saved-file behavior was introduced; safety coverage is for existing mounted edited/empty documents and independent new-window defaults. Disabled New/Open/Save, credits/licenses, other repositories and the read-only `master` cache remain unchanged. Historical personalization evidence below is retained separately and is not this rollout's acceptance evidence.

## Scope and constraints

- Verified target: `yuxiaoli/winXP`, fork of `ShizukuIchi/winXP`.
- All custom source changes belong on `develop`, which is the verified remote default branch.
- `master` is read-only to agents; the owner alone synchronizes it. Baseline: `856bb554b3667f62078010b4cee10cc2645761e1`. Do not push, merge, reset, synchronize or delete it.
- Preserve the existing `https://yuxiaoli.github.io/winXP/` URL and `gh-pages` publishing integration. Do not edit Boot Loader, Win11, Win12 integration or other repositories.
- Personalize bundled profile, homepage links and Notepad starter text using verified Sean / Yuxiao Li / yuxiaoli and Vector Index information. No private contacts or full resume. Preserve upstream attribution, licenses, third-party app credits and user-created content.
- No new paid resources, credentials or security-setting changes.

## Implementation and acceptance

1. [x] Inspect repository identity, source tree, app defaults and existing Pages settings. No existing repository instruction files, AI plan or TODO was present.
2. [x] Create `develop` from the existing fork `master`; set and independently read back the remote default as `develop`.
3. [x] Update Start menu identity, My Computer profile links, browser start page, metadata and Notepad bundled introductory text. Keep classic apps and the search demo available.
4. [x] Validate the browser route behavior with a failing test before implementation and a passing test afterward. Lint: zero errors, four pre-existing anonymous-export warnings. Frozen Yarn dependency installation succeeded without changing the lockfile.
5. [x] Complete production build and local browser checks. Start menu identity, My Computer links and Notepad introduction were inspected in Chrome. Browser home/search/Home round-trip passes the behavior test. Production build succeeds with existing dependency/source-map and lint warnings; CI-mode build rejects those existing warnings. Retained the original external wallpaper URL and added a classic blue fallback because its host was unavailable in the verification browser.
6. [x] Review diff, check concurrent branch movement, commit and push only `develop`. Verified `ced4c218fa20307a4b36460188850597849eea7b` on remote `develop` and unchanged `master`. The final publication also restores the existing Pages favicon into `public/favicon.ico` so builds retain the owner's deployed icon.
7. [x] Publish generated artifacts from that exact source to the existing `gh-pages` branch without force pushing, verify Pages workflow success and test the actual public desktop: Start menu identity, browser links/search/Home, My Computer links and Notepad editing. See evidence and limits below.

## Verified public references

- `https://github.com/yuxiaoli`, account ID 5307302, public display name Sean.
- `https://vectorindex.cloud`, verified public personal site.
- Public-facing professional wording was confirmed against the user's CV: full-stack engineering, Industrial IoT, cloud services, AI applications and international technology collaboration. No private CV document or contact details are published.
- Original project: `https://github.com/ShizukuIchi/winXP`; MIT license and app credits remain intact.

## Current status

The requested personalization is pushed, deployed and verified at the original public URL. The existing `gh-pages` baseline was `b7c765a314cc3453f23f1a56b7ab4a73a7b63632`; publication preserved its auxiliary favicon files and existing branch integration.

### Publication evidence

- Tested source: `28eeedcdead6e9f7542e3ed4458000bdc6baee91` on `develop`.
- Generated artifact commit: `3c124025356f8f003019823772ccae378d3eb2c3` on `gh-pages`, copied byte for byte from the production build.
- Pages workflow: [40202843231](https://github.com/yuxiaoli/winXP/actions/runs/40202843231), completed successfully for that artifact commit.
- Live [deployment metadata](https://yuxiaoli.github.io/winXP/deployment.json) returned the expected source SHA; the main JavaScript returned HTTP 200. Each publication's metadata identifies its exact source commit, including documentation closeouts.
- Live Chrome verified the personal browser start page, correct Vector Index/GitHub/fork links, search-demo query and Home round-trip, Start menu Sean, My Computer profile, and Notepad introduction/editing. Typed Notepad text remained intact when Word Wrap was toggled.
- Existing Winamp playlist rendered; Minesweeper reset produced the standard 81-cell board. No claims of comprehensive game or audio playback testing.
- Upstream license, package author, app credits and genuine upstream Minesweeper link remain unchanged. No email, private CV file or unsupported contact claim was published.

### Remaining limits

- The existing Paint `https://jspaint.app` iframe opened as a grey window in the verification browser, including one reopen. The same public service loaded correctly as a top-level tab and returned HTTP 200 with no X-Frame-Options or Content-Security-Policy header. The underlying embedding cause is unconfirmed; the integration is unchanged and full embedded drawing functionality is not verified. No security policy was weakened.
- Existing build warnings remain: four anonymous-default-export lint warnings, Webamp's absent bundled source map, old Browserslist data, and bundle size. Normal production build succeeds; setting `CI=true` treats the existing lint warnings as build errors.
- One escalated read-only `git ls-remote` request timed out during automatic approval before execution. It was not retried; the connector supplied the branch snapshot instead. Source and artifact pushes later succeeded normally without force, and `master` stayed unchanged.
