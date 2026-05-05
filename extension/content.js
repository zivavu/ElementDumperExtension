// Element Dumper — content script
// Injected on every page. Waits for a 'toggle-dumper' message from the
// background script, then activates / deactivates the dumper UI.

(() => {
	// Cross-browser API shim: Firefox uses browser.*, Chrome uses chrome.*
	const api =
		typeof browser !== "undefined" && browser.runtime ? browser : chrome;

	// ── Constants ──────────────────────────────────────────────────────────────

	const MAX_DEPTH = 100;
	const VOID_TAGS = new Set(["br", "hr", "img", "input", "meta", "link"]);
	const SKIP_TAGS = new Set([
		"script",
		"style",
		"link",
		"meta",
		"title",
		"head",
	]);
	const DUMP_ATTRS = [
		"id",
		"class",
		"src",
		"alt",
		"href",
		"type",
		"name",
		"value",
		"placeholder",
		"role",
		"aria-label",
		"data-testid",
	];
	const CSS_PROPS = [
		"display",
		"position",
		"width",
		"height",
		"min-width",
		"min-height",
		"max-width",
		"max-height",
		"margin-top",
		"margin-right",
		"margin-bottom",
		"margin-left",
		"padding-top",
		"padding-right",
		"padding-bottom",
		"padding-left",
		"border",
		"border-radius",
		"border-top-width",
		"border-right-width",
		"border-bottom-width",
		"border-left-width",
		"border-color",
		"border-style",
		"background",
		"background-color",
		"background-image",
		"background-size",
		"color",
		"font-family",
		"font-size",
		"font-weight",
		"line-height",
		"text-align",
		"text-decoration",
		"flex",
		"flex-direction",
		"flex-wrap",
		"justify-content",
		"align-items",
		"gap",
		"grid",
		"grid-template-columns",
		"grid-template-rows",
		"opacity",
		"box-shadow",
		"overflow",
		"z-index",
		"transform",
		"top",
		"right",
		"bottom",
		"left",
		"outline",
		"visibility",
		"cursor",
		"white-space",
		"letter-spacing",
		"word-spacing",
		"text-transform",
		"fill",
		"stroke",
		"stroke-width",
		"object-fit",
		"aspect-ratio",
	];

	// ── State ──────────────────────────────────────────────────────────────────

	let active = false;
	let hoveredEl = null;
	let depthOffset = 0;
	let tailwindMode = false;

	// DOM elements created on activation
	let overlay = null;
	let panel = null;
	let panelBreadcrumb = null;
	let panelTag = null;
	let panelDetails = null;
	let panelDepth = null;
	let modeBadge = null;
	let modeDesc = null;

	// ── Pure helpers ───────────────────────────────────────────────────────────

	const escHtml = (s) =>
		s
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");

	const getTagLabel = (el) => {
		const tag = el.tagName.toLowerCase();
		const id = el.id ? `#${el.id}` : "";
		const cls = [...el.classList].filter((c) => !c.startsWith("_")).join(".");
		return `${tag}${id}${cls ? `.${cls}` : ""}`;
	};

	const buildIndent = (depth) => "  ".repeat(depth);

	const setStyles = (el, css) => {
		el.style.cssText = css;
	};

	// ── DOM selection ──────────────────────────────────────────────────────────

	const getSelectedEl = () => {
		if (!hoveredEl) return null;
		let el = hoveredEl;
		for (let i = 0; i < depthOffset; i++) {
			if (el.parentElement) el = el.parentElement;
			else break;
		}
		return el;
	};

	// ── Dump helpers ───────────────────────────────────────────────────────────

	const isMeaningful = (el) =>
		el.nodeType === 1 && !SKIP_TAGS.has(el.tagName.toLowerCase());

	const buildAttrs = (el) =>
		DUMP_ATTRS.map((attr) => {
			const val = el.getAttribute(attr);
			return val ? ` ${attr}="${val.replace(/"/g, "&quot;")}"` : "";
		}).join("");

	const getComputedCSS = (el) => {
		const parentStyles = el.parentElement
			? window.getComputedStyle(el.parentElement)
			: null;
		const styles = window.getComputedStyle(el);
		const result = {};
		for (const prop of CSS_PROPS) {
			const val = styles.getPropertyValue(prop);
			if (
				!val ||
				val === "none" ||
				val === "auto" ||
				val === "normal" ||
				val === "0px"
			)
				continue;
			// Skip inherited values to reduce noise in AI context
			if (parentStyles && val === parentStyles.getPropertyValue(prop)) continue;
			result[prop] = val;
		}
		return result;
	};

	// ── Serialisers ────────────────────────────────────────────────────────────

	const inlineStyles = (el, depth = 0) => {
		if (!isMeaningful(el)) return "";
		const tag = el.tagName.toLowerCase();
		const styles = getComputedCSS(el);
		const styleStr = Object.entries(styles)
			.map(([k, v]) => `${k}: ${v}`)
			.join("; ");
		const indent = buildIndent(depth);

		let html = `${indent}<${tag}${buildAttrs(el)}`;
		if (styleStr) html += ` style="${styleStr}"`;
		html += ">";

		if (VOID_TAGS.has(tag)) return `${html}\n`;

		if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
			const text = el.childNodes[0].textContent.trim();
			if (text) html += text;
		} else {
			html += "\n";
			for (const child of el.children) html += inlineStyles(child, depth + 1);
			html += indent;
		}

		return `${html}</${tag}>\n`;
	};

	// ── CSS to Tailwind class mapper ─────────────────────────────────────────

	const TW_SPACING = [
		{ level: 0, px: 0 },
		{ level: "px", px: 1 },
		{ level: 0.5, px: 2 },
		{ level: 1, px: 4 },
		{ level: 1.5, px: 6 },
		{ level: 2, px: 8 },
		{ level: 2.5, px: 10 },
		{ level: 3, px: 12 },
		{ level: 3.5, px: 14 },
		{ level: 4, px: 16 },
		{ level: 5, px: 20 },
		{ level: 6, px: 24 },
		{ level: 7, px: 28 },
		{ level: 8, px: 32 },
		{ level: 9, px: 36 },
		{ level: 10, px: 40 },
		{ level: 11, px: 44 },
		{ level: 12, px: 48 },
		{ level: 14, px: 56 },
		{ level: 16, px: 64 },
		{ level: 20, px: 80 },
		{ level: 24, px: 96 },
		{ level: 28, px: 112 },
		{ level: 32, px: 128 },
		{ level: 36, px: 144 },
		{ level: 40, px: 160 },
		{ level: 44, px: 176 },
		{ level: 48, px: 192 },
		{ level: 52, px: 208 },
		{ level: 56, px: 224 },
		{ level: 60, px: 240 },
		{ level: 64, px: 256 },
		{ level: 72, px: 288 },
		{ level: 80, px: 320 },
		{ level: 96, px: 384 },
	];

	const TW_FONT_SIZES = [
		{ cls: "text-xs", px: 12 },
		{ cls: "text-sm", px: 14 },
		{ cls: "text-base", px: 16 },
		{ cls: "text-lg", px: 18 },
		{ cls: "text-xl", px: 20 },
		{ cls: "text-2xl", px: 24 },
		{ cls: "text-3xl", px: 30 },
		{ cls: "text-4xl", px: 36 },
		{ cls: "text-5xl", px: 48 },
		{ cls: "text-6xl", px: 60 },
		{ cls: "text-7xl", px: 72 },
		{ cls: "text-8xl", px: 96 },
		{ cls: "text-9xl", px: 128 },
	];

	const TW_FONT_WEIGHTS = [
		{ cls: "font-thin", val: 100 },
		{ cls: "font-extralight", val: 200 },
		{ cls: "font-light", val: 300 },
		{ cls: "font-normal", val: 400 },
		{ cls: "font-medium", val: 500 },
		{ cls: "font-semibold", val: 600 },
		{ cls: "font-bold", val: 700 },
		{ cls: "font-extrabold", val: 800 },
		{ cls: "font-black", val: 900 },
	];

	const TAILWIND_MAPPED = new Set([
		"display",
		"position",
		"flex-direction",
		"flex-wrap",
		"align-items",
		"justify-content",
		"gap",
		"padding-top",
		"padding-right",
		"padding-bottom",
		"padding-left",
		"margin-top",
		"margin-right",
		"margin-bottom",
		"margin-left",
		"width",
		"height",
		"min-width",
		"min-height",
		"max-width",
		"max-height",
		"text-align",
		"font-size",
		"font-weight",
		"border-radius",
		"overflow",
		"cursor",
		"opacity",
		"box-shadow",
		"white-space",
		"text-decoration",
		"text-transform",
		"visibility",
		"z-index",
		"object-fit",
		"outline",
		"color",
		"background-color",
	]);

	function pxValue(cssVal) {
		const m = String(cssVal).match(/^([\d.]+)px$/);
		return m ? parseFloat(m[1]) : null;
	}

	function closestTwSpacing(px) {
		let best = TW_SPACING[0];
		for (const s of TW_SPACING) {
			if (Math.abs(s.px - px) < Math.abs(best.px - px)) best = s;
		}
		return best.level;
	}

	function closestTwFontSize(px) {
		let best = TW_FONT_SIZES[0];
		for (const s of TW_FONT_SIZES) {
			if (Math.abs(s.px - px) < Math.abs(best.px - px)) best = s;
		}
		return best.cls;
	}

	function closestTwFontWeight(val) {
		let best = TW_FONT_WEIGHTS[0];
		for (const s of TW_FONT_WEIGHTS) {
			if (Math.abs(s.val - val) < Math.abs(best.val - val)) best = s;
		}
		return best.cls;
	}

	function colorToTw(cssColor) {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		ctx.fillStyle = cssColor;
		const rgb = ctx.fillStyle;
		const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		if (!m) return null;
		const r = parseInt(m[1]),
			g = parseInt(m[2]),
			b = parseInt(m[3]);
		const max = Math.max(r, g, b),
			min = Math.min(r, g, b);
		const l = ((max + min) / 2 / 255) * 100;
		const s =
			max === min
				? 0
				: l > 50
					? ((max - min) / (510 - max - min)) * 100
					: ((max - min) / (max + min)) * 100;

		if (max - min < 15 && s < 15) {
			const shade =
				l > 80
					? "100"
					: l > 65
						? "300"
						: l > 50
							? "500"
							: l > 35
								? "700"
								: "900";
			return `gray-${shade}`;
		}

		let h = 0;
		if (s > 0) {
			if (max === r) h = ((g - b) / (max - min)) % 6;
			else if (max === g) h = (b - r) / (max - min) + 2;
			else h = (r - g) / (max - min) + 4;
			h = Math.round(h * 60);
			if (h < 0) h += 360;
		}

		const colorMap = [
			{ hue: [0, 15], name: "red" },
			{ hue: [16, 35], name: "orange" },
			{ hue: [36, 55], name: "amber" },
			{ hue: [56, 75], name: "yellow" },
			{ hue: [76, 140], name: "green" },
			{ hue: [141, 170], name: "emerald" },
			{ hue: [171, 200], name: "teal" },
			{ hue: [201, 220], name: "cyan" },
			{ hue: [221, 240], name: "sky" },
			{ hue: [241, 260], name: "blue" },
			{ hue: [261, 280], name: "indigo" },
			{ hue: [281, 310], name: "violet" },
			{ hue: [311, 340], name: "purple" },
			{ hue: [341, 360], name: "pink" },
		];

		let colorName = "gray";
		for (const entry of colorMap) {
			if (h >= entry.hue[0] && h <= entry.hue[1]) {
				colorName = entry.name;
				break;
			}
		}

		const shadeTable = [
			{ min: 92, shade: 50 },
			{ min: 82, shade: 100 },
			{ min: 72, shade: 200 },
			{ min: 62, shade: 300 },
			{ min: 52, shade: 400 },
			{ min: 42, shade: 500 },
			{ min: 32, shade: 600 },
			{ min: 22, shade: 700 },
			{ min: 12, shade: 800 },
			{ min: 0, shade: 900 },
		];

		let shade = 500;
		for (const entry of shadeTable) {
			if (l >= entry.min) {
				shade = entry.shade;
				break;
			}
		}

		return `${colorName}-${shade}`;
	}

	function cssToTailwind(styles) {
		const classes = [];

		for (const [prop, val] of Object.entries(styles)) {
			switch (prop) {
				case "display": {
					const map = {
						none: "hidden",
						flex: "flex",
						"inline-flex": "inline-flex",
						block: "block",
						"inline-block": "inline-block",
						inline: "inline",
						grid: "grid",
						"inline-grid": "inline-grid",
						"table-cell": "table-cell",
						contents: "contents",
					};
					if (map[val]) classes.push(map[val]);
					break;
				}

				case "position":
					classes.push(val);
					break;

				case "flex-direction": {
					const map = {
						row: "flex-row",
						"row-reverse": "flex-row-reverse",
						column: "flex-col",
						"column-reverse": "flex-col-reverse",
					};
					if (map[val]) classes.push(map[val]);
					break;
				}
				case "flex-wrap":
					classes.push(`flex-${val}`);
					break;

				case "align-items":
					classes.push(`items-${val}`);
					break;
				case "justify-content": {
					const map = {
						"flex-start": "justify-start",
						"flex-end": "justify-end",
						center: "justify-center",
						"space-between": "justify-between",
						"space-around": "justify-around",
						"space-evenly": "justify-evenly",
					};
					if (map[val]) classes.push(map[val]);
					break;
				}

				case "gap": {
					const px = pxValue(val);
					if (px !== null) classes.push(`gap-${closestTwSpacing(px)}`);
					break;
				}

				case "padding-top": {
					const px = pxValue(val);
					if (px !== null) classes.push(`pt-${closestTwSpacing(px)}`);
					break;
				}
				case "padding-right": {
					const px = pxValue(val);
					if (px !== null) classes.push(`pr-${closestTwSpacing(px)}`);
					break;
				}
				case "padding-bottom": {
					const px = pxValue(val);
					if (px !== null) classes.push(`pb-${closestTwSpacing(px)}`);
					break;
				}
				case "padding-left": {
					const px = pxValue(val);
					if (px !== null) classes.push(`pl-${closestTwSpacing(px)}`);
					break;
				}
				case "margin-top": {
					const px = pxValue(val);
					if (px !== null) classes.push(`mt-${closestTwSpacing(px)}`);
					break;
				}
				case "margin-right": {
					const px = pxValue(val);
					if (px !== null) classes.push(`mr-${closestTwSpacing(px)}`);
					break;
				}
				case "margin-bottom": {
					const px = pxValue(val);
					if (px !== null) classes.push(`mb-${closestTwSpacing(px)}`);
					break;
				}
				case "margin-left": {
					const px = pxValue(val);
					if (px !== null) classes.push(`ml-${closestTwSpacing(px)}`);
					break;
				}

				case "width": {
					if (val === "100%") classes.push("w-full");
					else if (val === "100vw") classes.push("w-screen");
					else if (val === "auto") classes.push("w-auto");
					else if (val === "fit-content") classes.push("w-fit");
					else {
						const px = pxValue(val);
						if (px !== null) classes.push(`w-${closestTwSpacing(px)}`);
					}
					break;
				}
				case "height": {
					if (val === "100%") classes.push("h-full");
					else if (val === "100vh") classes.push("h-screen");
					else if (val === "auto") classes.push("h-auto");
					else if (val === "fit-content") classes.push("h-fit");
					else {
						const px = pxValue(val);
						if (px !== null) classes.push(`h-${closestTwSpacing(px)}`);
					}
					break;
				}
				case "min-width": {
					if (val === "100%") classes.push("min-w-full");
					else {
						const px = pxValue(val);
						if (px !== null) classes.push(`min-w-${closestTwSpacing(px)}`);
					}
					break;
				}
				case "min-height": {
					if (val === "100vh") classes.push("min-h-screen");
					else if (val === "100%") classes.push("min-h-full");
					else {
						const px = pxValue(val);
						if (px !== null) classes.push(`min-h-${closestTwSpacing(px)}`);
					}
					break;
				}
				case "max-width": {
					if (val === "none") classes.push("max-w-none");
					else if (val === "100%") classes.push("max-w-full");
					else {
						const px = pxValue(val);
						if (px !== null) classes.push(`max-w-${closestTwSpacing(px)}`);
					}
					break;
				}
				case "max-height": {
					if (val === "none") classes.push("max-h-none");
					else if (val === "100%") classes.push("max-h-full");
					else if (val === "100vh") classes.push("max-h-screen");
					else {
						const px = pxValue(val);
						if (px !== null) classes.push(`max-h-${closestTwSpacing(px)}`);
					}
					break;
				}

				case "text-align":
					classes.push(`text-${val}`);
					break;
				case "font-size": {
					const px = pxValue(val);
					if (px !== null) classes.push(closestTwFontSize(px));
					break;
				}
				case "font-weight": {
					const n = parseInt(val);
					if (!isNaN(n)) classes.push(closestTwFontWeight(n));
					break;
				}
				case "text-decoration": {
					if (val === "underline") classes.push("underline");
					else if (val === "line-through") classes.push("line-through");
					else if (val === "none") classes.push("no-underline");
					break;
				}
				case "text-transform": {
					if (
						val === "uppercase" ||
						val === "lowercase" ||
						val === "capitalize"
					)
						classes.push(val);
					else if (val === "none") classes.push("normal-case");
					break;
				}
				case "white-space": {
					const map = {
						normal: "whitespace-normal",
						nowrap: "whitespace-nowrap",
						pre: "whitespace-pre",
						"pre-line": "whitespace-pre-line",
						"pre-wrap": "whitespace-pre-wrap",
					};
					if (map[val]) classes.push(map[val]);
					break;
				}

				case "border-radius": {
					if (val === "9999px" || val === "50%") classes.push("rounded-full");
					else {
						const px = pxValue(val);
						if (px !== null) {
							if (px === 0) classes.push("rounded-none");
							else if (px <= 2) classes.push("rounded-sm");
							else if (px <= 4) classes.push("rounded");
							else if (px <= 6) classes.push("rounded-md");
							else if (px <= 8) classes.push("rounded-lg");
							else if (px <= 12) classes.push("rounded-xl");
							else if (px <= 16) classes.push("rounded-2xl");
							else classes.push("rounded-3xl");
						}
					}
					break;
				}
				case "overflow": {
					const map = {
						auto: "overflow-auto",
						hidden: "overflow-hidden",
						scroll: "overflow-scroll",
						visible: "overflow-visible",
						clip: "overflow-clip",
					};
					if (map[val]) classes.push(map[val]);
					break;
				}
				case "cursor": {
					const map = {
						pointer: "cursor-pointer",
						default: "cursor-default",
						text: "cursor-text",
						"not-allowed": "cursor-not-allowed",
						wait: "cursor-wait",
						help: "cursor-help",
						move: "cursor-move",
						grab: "cursor-grab",
						"zoom-in": "cursor-zoom-in",
						"zoom-out": "cursor-zoom-out",
					};
					if (map[val]) classes.push(map[val]);
					break;
				}
				case "opacity": {
					const pct = parseFloat(val);
					if (!isNaN(pct)) {
						const opacityMap = [
							{ max: 5, cls: "opacity-0" },
							{ max: 15, cls: "opacity-10" },
							{ max: 25, cls: "opacity-20" },
							{ max: 35, cls: "opacity-30" },
							{ max: 45, cls: "opacity-40" },
							{ max: 55, cls: "opacity-50" },
							{ max: 65, cls: "opacity-60" },
							{ max: 75, cls: "opacity-70" },
							{ max: 85, cls: "opacity-80" },
							{ max: 95, cls: "opacity-90" },
							{ max: 100, cls: "opacity-95" },
						];
						const pctVal = Math.round(pct * 100);
						for (const entry of opacityMap) {
							if (pctVal <= entry.max) {
								classes.push(entry.cls);
								break;
							}
						}
					}
					break;
				}
				case "box-shadow": {
					if (val === "none") classes.push("shadow-none");
					else if (val.includes("inset")) classes.push("shadow-inner");
					else {
						const yPx = (String(val).match(/^rgba?.*\s([\d.]+)px\s/) || [])[1];
						const yVal = yPx ? parseFloat(yPx) : 0;
						if (yVal <= 1) classes.push("shadow-sm");
						else if (yVal <= 4) classes.push("shadow");
						else if (yVal <= 6) classes.push("shadow-md");
						else if (yVal <= 10) classes.push("shadow-lg");
						else if (yVal <= 15) classes.push("shadow-xl");
						else classes.push("shadow-2xl");
					}
					break;
				}
				case "visibility": {
					if (val === "hidden") classes.push("invisible");
					else if (val === "visible") classes.push("visible");
					break;
				}
				case "z-index": {
					const n = parseInt(val);
					if (!isNaN(n)) {
						if (n <= 0) classes.push("z-0");
						else if (n <= 10) classes.push("z-10");
						else if (n <= 20) classes.push("z-20");
						else if (n <= 30) classes.push("z-30");
						else if (n <= 40) classes.push("z-40");
						else classes.push("z-50");
					}
					break;
				}
				case "object-fit":
					classes.push(`object-${val}`);
					break;

				case "color": {
					const twColor = colorToTw(val);
					if (twColor) classes.push(`text-${twColor}`);
					break;
				}
				case "background-color": {
					const twColor = colorToTw(val);
					if (twColor) classes.push(`bg-${twColor}`);
					break;
				}
				case "outline":
					break;
				default:
					break;
			}
		}

		return classes;
	}

	function cssToStyleString(styles) {
		const parts = [];
		for (const [prop, val] of Object.entries(styles)) {
			if (!TAILWIND_MAPPED.has(prop)) {
				parts.push(`${prop}: ${val}`);
			}
		}
		return parts.join("; ");
	}

	// ── Tailwind site detection ─────────────────────────────────────────────

	let _pageUsesTailwind = null;

	function detectPageUsesTailwind() {
		if (_pageUsesTailwind !== null) return _pageUsesTailwind;

		// 1. Check for Tailwind CDN script
		if (document.querySelector('script[src*="tailwind"]')) {
			_pageUsesTailwind = true;
			return true;
		}

		// 2. Check stylesheets for Tailwind markers
		const sheets = document.styleSheets;
		for (let i = 0; i < sheets.length; i++) {
			try {
				const rules = sheets[i].cssRules || sheets[i].rules;
				if (!rules) continue;
				for (let j = 0; j < rules.length; j++) {
					try {
						const text = rules[j].cssText || "";
						if (text.includes("tailwind") || text.includes("! tailwindcss")) {
							_pageUsesTailwind = true;
							return true;
						}
					} catch {}
				}
			} catch {}
		}

		// 3. Sample elements for common Tailwind utility class patterns
		const twPattern =
			/^(flex|grid|container|mx-auto|px-\d|py-\d|p-\d|m-\d|mt-\d|mb-\d|ml-\d|mr-\d|gap-\d|w-\d|h-\d|text-\w+|font-\w+|bg-\w+|rounded|shadow|opacity-\d|z-\d|items-\w+|justify-\w+|object-\w+|overflow-\w+|cursor-\w+|whitespace-\w+|visible|invisible|relative|absolute|fixed|sticky|block|inline|hidden|table|table-cell|contents)$/;

		const all = document.querySelectorAll("*");
		const sample = Math.min(all.length, 100);
		let matchCount = 0;
		for (let i = 0; i < sample; i++) {
			const el = all[i];
			const clsList = el.classList;
			for (let k = 0; k < clsList.length; k++) {
				if (twPattern.test(clsList[k])) {
					matchCount++;
					break;
				}
			}
		}

		_pageUsesTailwind = matchCount > sample * 0.1;
		return _pageUsesTailwind;
	}

	// ── Tailwind mode serialiser ────────────────────────────────────────────

	const dumpTailwind = (el, depth = 0) => {
		if (!isMeaningful(el)) return "";
		const tag = el.tagName.toLowerCase();
		const indent = buildIndent(depth);

		let html = `${indent}<${tag}${buildAttrs(el)}`;

		if (detectPageUsesTailwind()) {
			const origClass = el.getAttribute("class");
			if (origClass) html += ` class="${origClass.replace(/"/g, "&quot;")}"`;
		} else {
			const styles = getComputedCSS(el);
			const twClasses = cssToTailwind(styles);
			const styleStr = cssToStyleString(styles);
			if (twClasses.length > 0) html += ` class="${twClasses.join(" ")}"`;
			if (styleStr) html += ` style="${styleStr}"`;
		}

		html += ">";

		if (VOID_TAGS.has(tag)) return `${html}\n`;

		if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
			const text = el.childNodes[0].textContent.trim();
			if (text) html += text;
		} else {
			html += "\n";
			for (const child of el.children) html += dumpTailwind(child, depth + 1);
			html += indent;
		}

		return `${html}</${tag}>\n`;
	};

	// ── UI: mode badge ─────────────────────────────────────────────────────────

	const updateModeBadge = () => {
		modeBadge.textContent = tailwindMode ? "Tailwind" : "CSS";
		modeBadge.style.borderColor = tailwindMode ? "#8b5cf6" : "#0095f6";
		modeBadge.style.color = tailwindMode ? "#a78bfa" : "#0095f6";
		modeDesc.textContent = tailwindMode
			? "Maps computed styles to Tailwind classes — fallback inline style for unmapped props"
			: 'Inlines all computed styles into style="" attributes';
	};

	const toggleMode = () => {
		tailwindMode = !tailwindMode;
		updateUI();
	};

	// ── UI: creation ───────────────────────────────────────────────────────────

	const createUI = () => {
		if (overlay) return;

		overlay = document.createElement("div");
		overlay.id = "__dump_highlight";
		setStyles(
			overlay,
			"position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #0095f6;background:rgba(0,149,246,0.08);display:none",
		);
		document.body.appendChild(overlay);

		panel = document.createElement("div");
		panel.id = "__dump_panel";
		setStyles(
			panel,
			'position:fixed;bottom:16px;right:16px;z-index:2147483647;background:#1f1f22;color:#f5f5f5;font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:14px 18px;border-radius:10px;border:1px solid #393a40;box-shadow:0 6px 24px rgba(0,0,0,0.5);max-width:540px;min-width:300px;display:none',
		);
		document.body.appendChild(panel);

		const makeChild = (tag, css) => {
			const el = document.createElement(tag);
			setStyles(el, css);
			panel.appendChild(el);
			return el;
		};

		panelBreadcrumb = makeChild(
			"div",
			"margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #393a40;font-size:11px;line-height:1.7;overflow-x:auto;white-space:nowrap;color:#a8a8a8",
		);
		panelTag = makeChild(
			"div",
			"font-weight:600;color:#0095f6;font-size:15px;margin-bottom:4px",
		);
		panelDetails = makeChild("div", "color:#a8a8a8;font-size:12px");
		panelDepth = makeChild(
			"div",
			"color:#f5a623;font-size:11px;margin-top:6px;display:none",
		);

		const modeRow = makeChild(
			"div",
			"display:flex;align-items:center;gap:8px;margin-top:8px",
		);

		modeBadge = document.createElement("button");
		setStyles(
			modeBadge,
			"background:transparent;border:1px solid #555;border-radius:4px;color:#ccc;font:600 10px/1.2 -apple-system,sans-serif;padding:3px 8px;cursor:pointer;text-transform:uppercase;letter-spacing:0.5px;flex-shrink:0",
		);
		modeBadge.addEventListener("mouseenter", function () {
			this.style.borderColor = "#0095f6";
			this.style.color = "#0095f6";
		});
		modeBadge.addEventListener("mouseleave", function () {
			this.style.borderColor = "#555";
			this.style.color = "#ccc";
		});
		modeBadge.addEventListener("click", (e) => {
			e.stopPropagation();
			toggleMode();
		});
		modeRow.appendChild(modeBadge);

		modeDesc = document.createElement("span");
		setStyles(modeDesc, "color:#888;font-size:11px;line-height:1.3");
		modeRow.appendChild(modeDesc);

		const footer = makeChild(
			"div",
			"color:#666;font-size:11px;margin-top:10px;padding-top:8px;border-top:1px solid #393a40",
		);
		footer.textContent =
			"↑ Parent  ·  ↓ Child  ·  Enter to dump  ·  T toggle  ·  Esc exit";

		showWelcome();
	};

	const showWelcome = () => {
		panelBreadcrumb.textContent = "";
		panelTag.textContent = "<hover over an element>";
		panelTag.style.color = "#888";
		panelDetails.textContent = "";
		panelDepth.style.display = "none";
		updateModeBadge();
		panel.style.display = "block";
	};

	// ── UI: toast ──────────────────────────────────────────────────────────────

	const showToast = (message, isError) => {
		document.getElementById("__dump_toast")?.remove();

		const toast = document.createElement("div");
		toast.id = "__dump_toast";
		setStyles(
			toast,
			[
				"position:fixed;bottom:80px;right:16px;z-index:2147483647",
				`background:${isError ? "#e04f5f" : "#1b8738"};color:#fff`,
				'font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
				"padding:10px 16px;border-radius:8px",
				"box-shadow:0 4px 16px rgba(0,0,0,0.4)",
				"max-width:420px",
				"opacity:0;transition:opacity 0.25s ease",
				"pointer-events:none",
			].join(";"),
		);
		toast.textContent = message;
		document.body.appendChild(toast);

		requestAnimationFrame(() => {
			toast.style.opacity = "1";
		});
		setTimeout(() => {
			toast.style.opacity = "0";
			setTimeout(() => toast.remove(), 300);
		}, 3000);
	};

	// ── UI: update ─────────────────────────────────────────────────────────────

	const updateUI = () => {
		const el = getSelectedEl();
		if (!el) {
			if (overlay) overlay.style.display = "none";
			if (panel) panel.style.display = "none";
			return;
		}

		const rect = el.getBoundingClientRect();
		setStyles(
			overlay,
			`position:fixed;pointer-events:none;z-index:2147483646;display:block;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;border:2px solid #0095f6;background:rgba(0,149,246,0.08)`,
		);

		const pathNodes = [];
		let cur = el;
		while (cur && cur !== document) {
			pathNodes.unshift(cur);
			cur = cur.parentElement;
		}

		panelBreadcrumb.innerHTML = pathNodes
			.map((node, i) => {
				const label = escHtml(getTagLabel(node));
				const style =
					node === el ? "color:#0095f6;font-weight:600" : "color:#a8a8a8";
				const sep =
					i < pathNodes.length - 1
						? ' <span style="color:#444;font-size:11px">\u203A</span> '
						: "";
				return `<span style="${style}">&lt;${label}&gt;</span>${sep}`;
			})
			.join("");

		panelTag.style.color = "#0095f6";
		panelTag.innerHTML = `&lt;${escHtml(getTagLabel(el))}&gt;`;

		const dims = `${rect.width | 0}\u00D7${rect.height | 0}`;
		const text = (el.textContent ?? "").trim().slice(0, 120);
		const childCount = el.children.length;

		const det = [`<span style="color:#e8e8e8">${dims}</span>`];
		if (childCount > 0)
			det.push(
				` &nbsp;\u00B7 &nbsp;${childCount} child${childCount !== 1 ? "ren" : ""}`,
			);
		if (text) det.push(` &nbsp;\u00B7 &nbsp;"${escHtml(text)}"`);
		panelDetails.innerHTML = det.join("");

		if (depthOffset > 0) {
			panelDepth.textContent = `\u2191 ${depthOffset} level${depthOffset !== 1 ? "s" : ""} above hovered element`;
			panelDepth.style.display = "block";
		} else {
			panelDepth.style.display = "none";
		}

		updateModeBadge();
		panel.style.display = "block";
	};

	// ── Event handlers ─────────────────────────────────────────────────────────

	const onMouseOver = (e) => {
		if (!panel || panel.contains(e.target)) return;
		hoveredEl = e.target;
		depthOffset = 0;
		updateUI();
	};

	const onKeyDown = (e) => {
		switch (e.key) {
			case "ArrowUp": {
				e.preventDefault();
				e.stopPropagation();
				if (!hoveredEl) return;
				let el = hoveredEl;
				let reachable = true;
				for (let i = 0; i < depthOffset; i++) {
					if (el.parentElement) el = el.parentElement;
					else {
						reachable = false;
						break;
					}
				}
				if (
					reachable &&
					el.parentElement &&
					el.parentElement !== document &&
					depthOffset < MAX_DEPTH
				) {
					depthOffset++;
					updateUI();
				}
				break;
			}
			case "ArrowDown":
				e.preventDefault();
				e.stopPropagation();
				if (depthOffset > 0) {
					depthOffset--;
					updateUI();
				}
				break;
			case "Enter":
				e.preventDefault();
				e.stopPropagation();
				doDump();
				break;
			case "t":
			case "T":
				e.preventDefault();
				e.stopPropagation();
				toggleMode();
				break;
			case "Escape":
				e.preventDefault();
				e.stopPropagation();
				deactivate();
				break;
		}
	};

	// ── Dump ───────────────────────────────────────────────────────────────────

	const doDump = () => {
		const el = getSelectedEl();
		if (!el) return;

		const mode = tailwindMode ? "Tailwind" : "CSS";
		const dump = tailwindMode ? dumpTailwind(el) : inlineStyles(el);

		navigator.clipboard
			.writeText(dump)
			.then(() => {
				const msg = `Copied ${dump.length.toLocaleString()} characters to clipboard! [${mode}]`;
				showToast(msg, false);
			})
			.catch((err) => {
				const msg = `Failed to copy: ${err.message}`;
				showToast(msg, true);
			});
	};

	// ── Activate / Deactivate ──────────────────────────────────────────────────

	const activate = () => {
		if (active) return;
		active = true;
		hoveredEl = null;
		depthOffset = 0;
		createUI();
		document.addEventListener("mouseover", onMouseOver, true);
		document.addEventListener("keydown", onKeyDown, true);
	};

	const deactivate = () => {
		if (!active) return;
		active = false;
		document.removeEventListener("mouseover", onMouseOver, true);
		document.removeEventListener("keydown", onKeyDown, true);
		overlay?.remove();
		overlay = null;
		panel?.remove();
		panel = null;
		document.getElementById("__dump_toast")?.remove();
	};

	// ── Message listener ───────────────────────────────────────────────────────

	api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
		if (msg.action !== "toggle-dumper") return;
		if (active) {
			deactivate();
		} else {
			activate();
		}
		sendResponse({ active });
	});
})();
