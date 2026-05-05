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
- **Cross-browser** — single manifest loads in both Firefox and Chromium-based browsers

## Install

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file inside the `extension/` folder

### Chrome / Edge

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the **`extension/` folder** (contains `manifest.json`)

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
│   ├── manifest.json          # Extension manifest
│   ├── background.js          # Background / service worker script
│   ├── content.js             # Content script injected into pages
│   └── icons/
│       └── icon.png           # Toolbar icon
├── package.json
└── README.md
```

There is no build step — `content.js` and `background.js` are loaded directly by the browser. Edit them in place and reload the extension to see changes. All source files live inside the `extension/` folder.

## Development server

[**web-ext**](https://github.com/mozilla/web-ext) is a Mozilla CLI tool that launches a browser with your extension loaded and auto-reloads on file changes.

```bash
# With bunx (no install needed):
bunx web-ext run --source-dir extension --firefox="C:/Program Files/Zen Browser/zen.exe"

# Or if web-ext is installed locally:
bun run dev
```

The extension loads into a **temporary Firefox profile** — it won't affect your normal browser profile.

> **Note:** If you use a Firefox fork (e.g. Zen Browser), pass the full path to its executable with `--firefox`. For standard Firefox, just `bunx web-ext run` works.

## License

MIT
