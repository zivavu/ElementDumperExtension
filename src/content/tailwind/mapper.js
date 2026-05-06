import {
	closestTwFontSize,
	closestTwFontWeight,
	closestTwSpacing,
	colorToTw,
	pxValue,
} from "./color.js";
import { TAILWIND_MAPPED } from "./data.js";

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
				const p = pxValue(val);
				if (p !== null) {
					if (p === 0) classes.push(`${prop}-0`);
					else classes.push(`${prop}-${closestTwSpacing(p)}`);
				} else {
					const m = val.match(/^([\d.]+)%$/);
					if (m) {
						const pct = parseFloat(m[1]);
						if (pct === 0) classes.push(`${prop}-0`);
						else if (pct === 50) classes.push(`${prop}-1/2`);
						else if (pct === 100) classes.push(`${prop}-full`);
						else if (pct === 25) classes.push(`${prop}-1/4`);
						else if (Math.abs(pct - 33.33) < 1)
							classes.push(`${prop}-1/3`);
						else if (Math.abs(pct - 66.66) < 1)
							classes.push(`${prop}-2/3`);
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
				if (
					val === "1 1 0%" ||
					val === "1 1 0px" ||
					val.startsWith("1 1 0")
				) {
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
				const p = pxValue(val);
				if (p !== null) classes.push(`gap-${closestTwSpacing(p)}`);
				break;
			}

			case "padding-top": {
				const p = pxValue(val);
				if (p !== null) classes.push(`pt-${closestTwSpacing(p)}`);
				break;
			}
			case "padding-right": {
				const p = pxValue(val);
				if (p !== null) classes.push(`pr-${closestTwSpacing(p)}`);
				break;
			}
			case "padding-bottom": {
				const p = pxValue(val);
				if (p !== null) classes.push(`pb-${closestTwSpacing(p)}`);
				break;
			}
			case "padding-left": {
				const p = pxValue(val);
				if (p !== null) classes.push(`pl-${closestTwSpacing(p)}`);
				break;
			}
			case "margin-top": {
				const p = pxValue(val);
				if (p !== null) classes.push(`mt-${closestTwSpacing(p)}`);
				break;
			}
			case "margin-right": {
				const p = pxValue(val);
				if (p !== null) classes.push(`mr-${closestTwSpacing(p)}`);
				break;
			}
			case "margin-bottom": {
				const p = pxValue(val);
				if (p !== null) classes.push(`mb-${closestTwSpacing(p)}`);
				break;
			}
			case "margin-left": {
				const p = pxValue(val);
				if (p !== null) classes.push(`ml-${closestTwSpacing(p)}`);
				break;
			}

			case "width": {
				if (val === "100%") classes.push("w-full");
				else if (val === "100vw") classes.push("w-screen");
				else if (val === "auto") classes.push("w-auto");
				else if (val === "fit-content") classes.push("w-fit");
				else {
					const p = pxValue(val);
					if (p !== null) classes.push(`w-${closestTwSpacing(p)}`);
				}
				break;
			}
			case "height": {
				if (val === "100%") classes.push("h-full");
				else if (val === "100vh") classes.push("h-screen");
				else if (val === "auto") classes.push("h-auto");
				else if (val === "fit-content") classes.push("h-fit");
				else {
					const p = pxValue(val);
					if (p !== null) classes.push(`h-${closestTwSpacing(p)}`);
				}
				break;
			}
			case "min-width": {
				if (val === "100%") classes.push("min-w-full");
				else {
					const p = pxValue(val);
					if (p !== null)
						classes.push(`min-w-${closestTwSpacing(p)}`);
				}
				break;
			}
			case "min-height": {
				if (val === "100vh") classes.push("min-h-screen");
				else if (val === "100%") classes.push("min-h-full");
				else {
					const p = pxValue(val);
					if (p !== null)
						classes.push(`min-h-${closestTwSpacing(p)}`);
				}
				break;
			}
			case "max-width": {
				if (val === "none") classes.push("max-w-none");
				else if (val === "100%") classes.push("max-w-full");
				else {
					const p = pxValue(val);
					if (p !== null)
						classes.push(`max-w-${closestTwSpacing(p)}`);
				}
				break;
			}
			case "max-height": {
				if (val === "none") classes.push("max-h-none");
				else if (val === "100%") classes.push("max-h-full");
				else if (val === "100vh") classes.push("max-h-screen");
				else {
					const p = pxValue(val);
					if (p !== null)
						classes.push(`max-h-${closestTwSpacing(p)}`);
				}
				break;
			}

			case "text-align":
				classes.push(`text-${val}`);
				break;
			case "letter-spacing": {
				const p = pxValue(val);
				if (p !== null) {
					const em = p / 16;
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
						if (Math.abs(entry.em - em) < Math.abs(best.em - em))
							best = entry;
					}
					classes.push(best.cls);
				}
				break;
			}
			case "font-size": {
				const p = pxValue(val);
				if (p !== null) classes.push(closestTwFontSize(p));
				break;
			}
			case "font-weight": {
				const n = parseInt(val, 10);
				if (!Number.isNaN(n)) classes.push(closestTwFontWeight(n));
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
				const p = pxValue(val);
				if (p !== null) {
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
						if (Math.abs(entry.px - p) < Math.abs(best.px - p))
							best = entry;
					}
					classes.push(best.cls);
				} else {
					const num = parseFloat(val);
					if (!Number.isNaN(num)) {
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
							if (
								Math.abs(entry.val - num) <
								Math.abs(best.val - num)
							)
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
				if (val === "9999px" || val === "50%")
					classes.push("rounded-full");
				else {
					const p = pxValue(val);
					if (p !== null) {
						if (p === 0) classes.push("rounded-none");
						else if (p <= 2) classes.push("rounded-sm");
						else if (p <= 4) classes.push("rounded");
						else if (p <= 6) classes.push("rounded-md");
						else if (p <= 8) classes.push("rounded-lg");
						else if (p <= 12) classes.push("rounded-xl");
						else if (p <= 16) classes.push("rounded-2xl");
						else classes.push("rounded-3xl");
					}
				}
				break;
			}
			case "border": {
				const parts = val.split(/\s+/);
				const widthVal = parts.find(
					(p) => p.endsWith("px") || /^\d+$/.test(p),
				);
				if (widthVal) {
					const px = pxValue(widthVal) ?? parseFloat(widthVal);
					if (!Number.isNaN(px)) {
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
				const tw = colorToTw(val);
				if (tw) classes.push(`border-${tw}`);
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
				const p = pxValue(val);
				if (p !== null) {
					if (p === 0) classes.push(`border-${side}-0`);
					else if (p === 1) classes.push(`border-${side}`);
					else if (p === 2) classes.push(`border-${side}-2`);
					else if (p === 4) classes.push(`border-${side}-4`);
					else if (p === 8) classes.push(`border-${side}-8`);
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
				if (!Number.isNaN(pct)) {
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
					const yPx = (String(val).match(/^rgba?.*\s([\d.]+)px\s/) ||
						[])[1];
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
				const n = parseInt(val, 10);
				if (!Number.isNaN(n)) {
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
				if (val === "1 / 1" || val === "1")
					classes.push("aspect-square");
				else if (val === "16 / 9") classes.push("aspect-video");
				break;
			}

			case "color": {
				const tw = colorToTw(val);
				if (tw) classes.push(`text-${tw}`);
				break;
			}
			case "background-color": {
				const tw = colorToTw(val);
				if (tw) classes.push(`bg-${tw}`);
				break;
			}
			case "background-size": {
				if (val === "cover") classes.push("bg-cover");
				else if (val === "contain") classes.push("bg-contain");
				break;
			}
			case "outline": {
				const p = pxValue(val);
				if (p !== null) {
					if (p === 0) classes.push("outline-0");
					else if (p === 1) classes.push("outline");
					else if (p === 2) classes.push("outline-2");
					else if (p === 4) classes.push("outline-4");
					else if (p === 8) classes.push("outline-8");
				}
				if (val.includes("dashed")) classes.push("outline-dashed");
				else if (val.includes("dotted")) classes.push("outline-dotted");
				else if (val.includes("double")) classes.push("outline-double");
				else if (val.includes("hidden")) classes.push("outline-hidden");
				break;
			}
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

export { cssToStyleString, cssToTailwind };
