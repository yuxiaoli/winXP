# WinXP personal desktop update — 2026-10-25

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
6. [ ] Review diff, check concurrent branch movement, commit and push only `develop`. Verify exact remote source SHA and unchanged `master`.
7. [ ] Publish generated artifacts from that exact source to the existing `gh-pages` branch without force pushing, verify Pages workflow success and test the actual public desktop: Start menu identity, browser links/search/Home, My Computer links, Notepad editing, and retained classic apps.

## Verified public references

- `https://github.com/yuxiaoli`, account ID 5307302, public display name Sean.
- `https://vectorindex.cloud`, verified public personal site.
- Public-facing professional wording was confirmed against the user's CV: full-stack engineering, Industrial IoT, cloud services, AI applications and international technology collaboration. No private CV document or contact details are published.
- Original project: `https://github.com/ShizukuIchi/winXP`; MIT license and app credits remain intact.

## Current status

Implementation is local and tests pass; publication and final live acceptance remain pending. The existing `gh-pages` baseline is `b7c765a314cc3453f23f1a56b7ab4a73a7b63632`. Update this plan when the remaining checks have real evidence.
