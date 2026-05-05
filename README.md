# Element Dumper

A browser extension that lets you **hover over any element on a page**, inspect its DOM structure, and copy its HTML (with inlined computed styles or Tailwind utility classes) to your clipboard.

Designed as a context-gathering tool for AI assistants — instead of taking a screenshot (which the AI can't see), you dump the actual styled DOM tree for it to read.

![Firefox](https://img.shields.io/badge/Firefox-✓-orange) ![Chrome](https://img.shields.io/badge/Chrome-✓-brightgreen)

## Features

- **Hover to inspect** — blue highlight follows your cursor, panel shows element info
- **DOM navigation** — press ↑ / ↓ to walk up/down the ancestor chain
- **Two output modes:**
  - **CSS mode** — inlines all computed styles into `style=""` attributes (with smart filtering that skips values inherited from the parent)
  - **Tailwind mode** — maps computed styles to Tailwind utility classes on non-Tailwind sites; preserves original classes on sites that already use Tailwind
- **Tailwind-aware** — auto-detects if the page uses Tailwind (via CDN, stylesheet markers, or class name sampling). If yes, the original classes are kept as-is. If no, computed CSS is mapped to equivalent Tailwind utility classes with inline style fallback for unmappable properties.
- **Smart filtering** — only includes CSS properties that differ from the parent element, reducing output noise for AI context
- **One-click copy** — press Enter to dump to clipboard with a visual toast notification
- **Cross-browser** — separate MV2 (Firefox) and MV3 (Chrome) builds from a single source

## Install

### Build

Run the build script to generate browser-specific output:

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

### Tailwind mode behaviour

The Tailwind mode is **context-aware**:

| Page type | What Tailwind mode outputs |
|---|---|
| **Tailwind site** (e.g. tailwindcss.com, Shadcn, Vercel) | Preserves the original `class=""` attributes as authored — no redundant mapping |
| **CSS Modules** (e.g. olx.pl with `css-1j50698`) | Maps computed styles to Tailwind utility classes like `flex`, `p-4`, `text-sm`, `items-center` |
| **Custom / hand-written CSS** | Same as above — computed CSS is mapped to the closest Tailwind equivalents |

Properties that can't be mapped to Tailwind utilities (e.g. `font-family`, `background-image`, custom `border` values) fall through to an inline `style=""` attribute, so nothing is lost.

Detection runs once (lazy-cached) and checks:
1. Tailwind CDN script tag
2. Tailwind markers in stylesheets
3. Samples up to 100 elements — if >10% use Tailwind-like classes, assumes Tailwind

## Project structure

```
element-dumper-extension/
├── src/                            # All source files
│   ├── content/                    #   Content script components
│   │   ├── core.js                 #     API shim, constants, state, helpers, CSS parser
│   │   ├── tailwind.js             #     Tailwind data, mapper, site detection
│   │   ├── serialisers.js          #     inlineStyles + dumpTailwind
│   │   ├── ui.js                   #     UI creation, updates, toast notifications
│   │   ├── events.js               #     Mouse / keyboard event handlers
│   │   └── main.js                 #     doDump, lifecycle, message listener
│   ├── background.js               #   Background / service worker script
│   ├── manifest-v2.json            #   Firefox manifest (MV2)
│   ├── manifest-v3.json            #   Chrome manifest (MV3)
│   └── icons/
│       └── icon.png                #   Toolbar icon
├── build.js                        # Build script — concats src/content/ → dist/
├── release.js                      # Release script — creates versioned zip files
├── dev.js                          # Dev server wrapper — builds then runs web-ext
├── package.json
└── README.md
```

The content script is split into logical components under `src/content/`. The build script concatenates them in order and wraps them in an IIFE, outputting directly to `dist/firefox/content.js` and `dist/chrome/content.js`. There is no bundler — just file concatenation.

## Development server

[**web-ext**](https://github.com/mozilla/web-ext) is a Mozilla CLI tool that launches a browser with your extension loaded and auto-reloads on file changes.

```bash
# Builds src/ and launches with live reload:
bun run dev
```

The extension loads into a **temporary Firefox profile** — it won't affect your normal browser profile.

> **Note:** `dev.js` automatically runs the build and then picks up `web-ext.config.cjs` (gitignored) if it exists. Create one to set your browser path and profile:
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
> For standard Firefox, just `bun dev` works without any config.

## Releasing

To create versioned zip packages for distribution:

```bash
bun run release
```

This builds both targets and creates:

```
releases/
├── element-dumper-0.0.2-firefox.zip
└── element-dumper-0.0.2-chrome.zip
```

The version is read automatically from `manifest.json`. These zips are ready to upload to:
- **Firefox:** [addons.mozilla.org](https://addons.mozilla.org) (requires signing)
- **Chrome:** [Chrome Web Store](https://chrome.google.com/webstore) (requires MV3)

Both `dist/` and `releases/` are gitignored — only source files are committed.

## License

MIT
