# Element Dumper

A browser extension that lets you **hover over any element on a page**, inspect its DOM structure, and copy its HTML (with inlined computed styles or raw class names) to your clipboard.

Designed as a context-gathering tool for AI assistants — instead of taking a screenshot (which the AI can't see), you dump the actual styled DOM tree for it to read.

![Firefox](https://img.shields.io/badge/Firefox-✓-orange) ![Chrome](https://img.shields.io/badge/Chrome-✓-brightgreen)

## Features

- **Hover to inspect** — blue highlight follows your cursor, panel shows element info
- **DOM navigation** — press ↑ / ↓ to walk up/down the ancestor chain
- **Two output modes:**
  - **CSS mode** — inlines computed styles into `style=""` attributes (with smart filtering that skips values inherited from parent)
  - **Tailwind mode** — preserves original class names, no computed styles
- **Smart filtering** — only includes CSS properties that differ from the parent element, reducing output noise for AI context
- **One-click copy** — press Enter to dump to clipboard with a visual toast notification
- **Cross-browser** — separate MV2 (Firefox) and MV3 (Chrome) builds from a single source

## Install

### Build

The extension uses a single source tree with two manifest versions. Run the build script to generate browser-specific output:

```bash
bun run build
```

This creates:

```
dist/
├── firefox/   # Manifest V2 — for Firefox / Zen Browser
└── chrome/    # Manifest V3 — for Chrome / Edge
```

### Firefox / Zen Browser

1. Run `bun run build`
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select `dist/firefox/manifest.json`

### Chrome / Edge

1. Run `bun run build`
2. Open `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the **`dist/chrome/` folder**

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
├── extension/
│   ├── manifest-v2.json       # Firefox manifest (MV2)
│   ├── manifest-v3.json       # Chrome manifest (MV3)
│   ├── background.js          # Background / service worker script
│   ├── content.js             # Content script injected into pages
│   └── icons/
│       └── icon.png           # Toolbar icon
├── build.js                   # Build script — generates dist/firefox & dist/chrome
├── release.js                 # Release script — creates versioned zip files
├── dev.js                     # Dev server wrapper — passes config to web-ext
├── package.json
└── README.md
```

Source files live in `extension/`. The `build.js` script copies them into `dist/` and swaps in the correct manifest for each browser. There is no bundler — `content.js` and `background.js` are loaded directly.

## Development server

[**web-ext**](https://github.com/mozilla/web-ext) is a Mozilla CLI tool that launches a browser with your extension loaded and auto-reloads on file changes.

```bash
# Build first, then launch with live reload:
bun run build
bun run dev
```

The extension loads into a **temporary Firefox profile** — it won't affect your normal browser profile.

> **Note:** `dev.js` automatically picks up `web-ext.config.cjs` (gitignored) if it exists. Create one to set your browser path and profile:
>
> ```js
> module.exports = {
>   sourceDir: "dist/firefox",
>   run: {
>     firefox: "C:/Program Files/Zen Browser/zen.exe",
>     firefoxProfile: "C:/Users/<you>/AppData/Roaming/zen/Profiles/...",
>   },
> };
> ```
>
> For standard Firefox, just `bunx web-ext run` works without any config.

## Releasing

To create versioned zip packages for distribution:

```bash
bun run release
```

This builds both targets and creates:

```
releases/
├── element-dumper-0.0.1-firefox.zip
└── element-dumper-0.0.1-chrome.zip
```

The version is read automatically from `manifest.json`. These zips are ready to upload to:
- **Firefox:** [addons.mozilla.org](https://addons.mozilla.org) (requires signing)
- **Chrome:** [Chrome Web Store](https://chrome.google.com/webstore) (requires MV3)

Both `dist/` and `releases/` are gitignored — only source files are committed.

## License

MIT
