# Element Dumper

A browser extension that lets you **hover over any element on a page**, inspect its DOM structure, and copy its HTML (with inlined computed styles or raw class names) to your clipboard.

Designed as a context-gathering tool for AI assistants — instead of taking a screenshot (which the AI can't see), you dump the actual styled DOM tree for it to read.

![demo](https://img.shields.io/badge/Firefox-✓-orange) ![demo](https://img.shields.io/badge/Chrome-✓-brightgreen)

## Features

- **Hover to inspect** — blue highlight follows your cursor, panel shows element info
- **DOM navigation** — press ↑ / ↓ to walk up/down the ancestor chain
- **Two output modes:**
  - **CSS mode** — inlines computed styles into `style=""` attributes (with smart filtering that skips values inherited from parent)
  - **Tailwind mode** — preserves original class names, no computed styles
- **Smart filtering** — only includes CSS properties that differ from the parent element, reducing output noise for AI context
- **One-click copy** — press Enter to dump to clipboard with a visual toast notification
- **Cross-browser** — works in Firefox (MV2) and Chrome/Edge (MV3)

## Install

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file in this folder

### Chrome / Edge

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `chrome/` subfolder

## Usage

| Key / Action | Result |
|---|---|
| **Alt+Shift+D** | Toggle dumper on/off |
| **Click toolbar icon** | Toggle dumper on/off |
| **Hover** over page elements | Blue highlight + info panel |
| **↑** / **↓** | Navigate to parent / back toward hovered element |
| **Enter** | Copy element's HTML to clipboard |
| **T** or click mode badge | Toggle CSS / Tailwind mode |
| **Esc** | Deactivate dumper |

After dumping, a green toast appears showing the character count and mode used.

## Project structure

```
element-dumper-extension/
├── manifest.json          # Firefox manifest (MV2)
├── background.js          # Firefox background script
├── content.js             # Shared dumper logic (single source of truth)
├── chrome/
│   ├── manifest.json      # Chrome manifest (MV3)
│   ├── background.js      # Chrome service worker
│   ├── content.js         # copy of repo-root content.js (see below — do not edit by hand)
│   └── icons/icon.png     # Chrome toolbar icon
├── scripts/
│   └── sync-chrome.ts     # copies content.js → chrome/content.js (Git‑friendly)
├── icons/
│   └── icon.png           # Firefox toolbar icon
├── package.json
└── README.md
```

**One source file, two manifests.** Firefox loads the repo root; Chrome loads only the `chrome/` folder, so the MV3 bundle needs its own path to `content.js`. Edit **`content.js` at the repo root**, then refresh the unpacked Chrome extension — and run sync whenever you commit so `chrome/content.js` stays aligned:

```bash
bun run sync
```

`bun install` also runs that copy (`postinstall`) so a fresh clone keeps Chrome working after installs. Later, if you add a bundler, call the same paths from its output step or extend `scripts/sync-chrome.ts`.

## License

MIT
