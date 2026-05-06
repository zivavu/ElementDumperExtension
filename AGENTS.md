# Agent Notes — Element Dumper Extension

## Quick commands

- `bun run build` — build both Firefox (MV2) and Chrome (MV3) outputs to `dist/`.
- `bun run dev` — build, then launch Firefox via `web-ext run` with auto-reload.
- `bun test` — run unit tests with `bun:test` and `happy-dom`.
- `bun run format` / `bun run check` — Biome format / lint+check on `src/`, `*.js`, and `tests/`.
- `bun run lint` — **requires `bun run build` first**. Runs `web-ext lint` on `dist/firefox` and `dist/chrome`.
- `bun run release` — runs tests, then production build (`MINIFY=true`), then zips both targets into `releases/`.

## Build system

- `build.js` uses **esbuild** (not plain concatenation) to bundle:
  - `src/content/main.js` → `dist/<target>/content.js`
  - `src/background.js` → `dist/<target>/background.js`
  - Format: IIFE. Targets: `firefox115`, `chrome115`.
- It also copies `src/icons/` and `src/_locales/` into each dist folder.
- Manifests:
  - `src/manifest-v2.json` → `dist/firefox/manifest.json`
  - `src/manifest-v3.json` → `dist/chrome/manifest.json`
- The version for releases is read **only** from `src/manifest-v2.json`.

## Dev server

- `dev.js` always runs `node build.js` first, then `web-ext run`.
- Default target is `dist/firefox`.
- If `web-ext.config.cjs` exists in the repo root, `dev.js` passes `--config web-ext.config.cjs` instead of the default `--source-dir`.
- `web-ext.config.cjs` is **gitignored** but may exist locally (it does in this workspace). Do not commit it.

## Testing

- Tests live in `tests/` and import from `src/content/core.js` directly (ESM).
- `tests/setup.js` sets up `happy-dom` globals (`document`, `window`, `navigator`) and mocks the `chrome` extension API (`chrome.runtime`, `chrome.storage.local`).
- No real browser is involved in tests.

## Lint / format

- Biome config is in `biome.json`.
- Globals: `browser`, `chrome` for source files; `node` for `build.js` / `dev.js` / `release.js`.
- `noExplicitAny` is disabled. `useConst` is warn-only.
- Style: tabs, LF, trailing commas, semicolons, arrow parentheses always.

## Source layout

- `src/content/main.js` — content script entrypoint.
- `src/content/core.js` — helpers, constants, CSS parser.
- `src/content/tailwind/` — Tailwind detection (`detect.js`) and mapping (`index.js`).
- `src/content/serialisers.js`, `ui.js`, `events.js` — content-script modules.
- `src/background.js` — background / service worker.
- `src/_locales/en/messages.json` — localized strings referenced by manifests.

## Gotchas

- `bun run lint` lints the **built** extension in `dist/`, not the source. Always build first.
- Pre-existing lint warnings/errors in the Chrome MV3 manifest (`service_worker` without Firefox fallback) are expected; do not try to fix them unless explicitly requested.
- The README still mentions "concatenates" and "no bundler" — that is stale; esbuild bundles the content script.
- `release.js` falls back to PowerShell `Compress-Archive` if `archiver` is not resolvable.
