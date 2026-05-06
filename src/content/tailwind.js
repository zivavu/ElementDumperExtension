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
	"border",
	"border-color",
	"border-style",
	"border-top-width",
	"border-right-width",
	"border-bottom-width",
	"border-left-width",
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
	"line-height",
	"font-family",
	"letter-spacing",
	"flex",
	"top",
	"right",
	"bottom",
	"left",
	"aspect-ratio",
	"background-size",
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
			l > 80 ? "100" : l > 65 ? "300" : l > 50 ? "500" : l > 35 ? "700" : "900";
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

			case "top":
			case "right":
			case "bottom":
			case "left": {
				const px = pxValue(val);
				if (px !== null) {
					if (px === 0) classes.push(`${prop}-0`);
					else classes.push(`${prop}-${closestTwSpacing(px)}`);
				} else {
					const m = val.match(/^([\d.]+)%$/);
					if (m) {
						const pct = parseFloat(m[1]);
						if (pct === 0) classes.push(`${prop}-0`);
						else if (pct === 50) classes.push(`${prop}-1/2`);
						else if (pct === 100) classes.push(`${prop}-full`);
						else if (pct === 25) classes.push(`${prop}-1/4`);
						else if (Math.abs(pct - 33.33) < 1) classes.push(`${prop}-1/3`);
						else if (Math.abs(pct - 66.66) < 1) classes.push(`${prop}-2/3`);
						else if (pct === 75) classes.push(`${prop}-3/4`);
					}
				}
				break;
			}

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

			case "flex": {
				if (val === "1 1 0%" || val === "1 1 0px" || val.startsWith("1 1 0")) {
					classes.push("flex-1");
				} else if (val === "1 1 auto") {
					classes.push("flex-auto");
				} else if (val === "0 0 auto" || val === "none") {
					classes.push("flex-none");
				}
				break;
			}

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
			case "letter-spacing": {
				const px = pxValue(val);
				if (px !== null) {
					const em = px / 16;
					const trackMap = [
						{ cls: "tracking-tighter", em: -0.05 },
						{ cls: "tracking-tight", em: -0.025 },
						{ cls: "tracking-normal", em: 0 },
						{ cls: "tracking-wide", em: 0.025 },
						{ cls: "tracking-wider", em: 0.05 },
						{ cls: "tracking-widest", em: 0.1 },
					];
					let best = trackMap[0];
					for (const entry of trackMap) {
						if (Math.abs(entry.em - em) < Math.abs(best.em - em)) best = entry;
					}
					classes.push(best.cls);
				}
				break;
			}
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
			case "font-family": {
				const lower = val.toLowerCase();
				if (
					lower.includes("monospace") ||
					lower.includes("mono") ||
					lower.includes("consolas") ||
					lower.includes("courier")
				) {
					classes.push("font-mono");
				} else if (
					lower.includes("serif") ||
					lower.includes("georgia") ||
					lower.includes("times new roman") ||
					lower.includes("times")
				) {
					classes.push("font-serif");
				} else if (
					lower.includes("arial") ||
					lower.includes("helvetica") ||
					lower.includes("system-ui") ||
					lower.includes("sans-serif")
				) {
					classes.push("font-sans");
				}
				break;
			}
			case "line-height": {
				const px = pxValue(val);
				if (px !== null) {
					const leadingMap = [
						{ cls: "leading-3", px: 12 },
						{ cls: "leading-4", px: 16 },
						{ cls: "leading-5", px: 20 },
						{ cls: "leading-6", px: 24 },
						{ cls: "leading-7", px: 28 },
						{ cls: "leading-8", px: 32 },
						{ cls: "leading-9", px: 36 },
						{ cls: "leading-10", px: 40 },
					];
					let best = leadingMap[0];
					for (const entry of leadingMap) {
						if (Math.abs(entry.px - px) < Math.abs(best.px - px)) best = entry;
					}
					classes.push(best.cls);
				} else {
					const num = parseFloat(val);
					if (!isNaN(num)) {
						const ulMap = [
							{ cls: "leading-none", val: 1 },
							{ cls: "leading-tight", val: 1.25 },
							{ cls: "leading-snug", val: 1.375 },
							{ cls: "leading-normal", val: 1.5 },
							{ cls: "leading-relaxed", val: 1.625 },
							{ cls: "leading-loose", val: 2 },
						];
						let best = ulMap[0];
						for (const entry of ulMap) {
							if (Math.abs(entry.val - num) < Math.abs(best.val - num))
								best = entry;
						}
						classes.push(best.cls);
					}
				}
				break;
			}
			case "text-decoration": {
				if (val === "underline") classes.push("underline");
				else if (val === "line-through") classes.push("line-through");
				else if (val === "none") classes.push("no-underline");
				break;
			}
			case "text-transform": {
				if (val === "uppercase" || val === "lowercase" || val === "capitalize")
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
			case "border": {
				const parts = val.split(/\s+/);
				const widthVal = parts.find((p) => p.endsWith("px") || /^\d+$/.test(p));
				if (widthVal) {
					const px = pxValue(widthVal) ?? parseFloat(widthVal);
					if (!isNaN(px)) {
						if (px === 0) classes.push("border-0");
						else if (px === 1) classes.push("border");
						else if (px === 2) classes.push("border-2");
						else if (px === 4) classes.push("border-4");
						else if (px === 8) classes.push("border-8");
					}
				}
				break;
			}
			case "border-color": {
				const twColor = colorToTw(val);
				if (twColor) classes.push(`border-${twColor}`);
				break;
			}
			case "border-style": {
				if (val === "solid") classes.push("border-solid");
				else if (val === "dashed") classes.push("border-dashed");
				else if (val === "dotted") classes.push("border-dotted");
				else if (val === "double") classes.push("border-double");
				else if (val === "none") classes.push("border-none");
				else if (val === "hidden") classes.push("border-hidden");
				break;
			}
			case "border-top-width":
			case "border-right-width":
			case "border-bottom-width":
			case "border-left-width": {
				const side = prop.split("-")[1];
				const px = pxValue(val);
				if (px !== null) {
					if (px === 0) classes.push(`border-${side}-0`);
					else if (px === 1) classes.push(`border-${side}`);
					else if (px === 2) classes.push(`border-${side}-2`);
					else if (px === 4) classes.push(`border-${side}-4`);
					else if (px === 8) classes.push(`border-${side}-8`);
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

			case "aspect-ratio": {
				if (val === "1 / 1" || val === "1") classes.push("aspect-square");
				else if (val === "16 / 9") classes.push("aspect-video");
				break;
			}

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
			case "background-size": {
				if (val === "cover") classes.push("bg-cover");
				else if (val === "contain") classes.push("bg-contain");
				break;
			}
			case "outline": {
				const px = pxValue(val);
				if (px !== null) {
					if (px === 0) classes.push("outline-0");
					else if (px === 1) classes.push("outline");
					else if (px === 2) classes.push("outline-2");
					else if (px === 4) classes.push("outline-4");
					else if (px === 8) classes.push("outline-8");
				}
				if (val.includes("dashed")) classes.push("outline-dashed");
				else if (val.includes("dotted")) classes.push("outline-dotted");
				else if (val.includes("double")) classes.push("outline-double");
				else if (val.includes("hidden")) classes.push("outline-hidden");
				break;
			}
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
