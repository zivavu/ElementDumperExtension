// Element Dumper - content script
// Cross-browser API shim: Firefox uses browser.*, Chrome uses chrome.*
const browserAPI =
	typeof browser !== "undefined" && browser.runtime ? browser : chrome;
export const api = browserAPI;

// ── Constants ──────────────────────────────────────────────────────────────

export const MAX_DEPTH = 100;
export const VOID_TAGS = new Set(["br", "hr", "img", "input", "meta", "link"]);
export const SKIP_TAGS = new Set([
	"script",
	"style",
	"link",
	"meta",
	"title",
	"head",
]);
export const DUMP_ATTRS = [
	"id",
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
export const CSS_PROPS = [
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
// Mutable state object shared across all modules via import { state }

export const state = {
	active: false,
	hoveredEl: null,
	depthOffset: 0,
	tailwindMode: false,
	// DOM elements created on activation
	overlay: null,
	panel: null,
	panelBreadcrumb: null,
	panelTag: null,
	panelDetails: null,
	panelDepth: null,
	modeBadge: null,
	modeDesc: null,
};

// ── Pure helpers ───────────────────────────────────────────────────────────

export const escHtml = (s) =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

export const getTagLabel = (el) => {
	const tag = el.tagName.toLowerCase();
	const id_ = el.id ? `#${el.id}` : "";
	const cls = [...el.classList].filter((c) => !c.startsWith("_")).join(".");
	return `${tag}${id_}${cls ? `.${cls}` : ""}`;
};

export const buildIndent = (depth) => "  ".repeat(depth);

export const setStyles = (el, css) => {
	el.style.cssText = css;
};

// ── DOM selection ──────────────────────────────────────────────────────────

export const getSelectedEl = () => {
	if (!state.hoveredEl) return null;
	let el = state.hoveredEl;
	for (let i = 0; i < state.depthOffset; i++) {
		if (el.parentElement) el = el.parentElement;
		else break;
	}
	return el;
};

// ── Dump helpers ───────────────────────────────────────────────────────────

export const isMeaningful = (el) =>
	el.nodeType === 1 && !SKIP_TAGS.has(el.tagName.toLowerCase());

export const buildAttrs = (el) =>
	DUMP_ATTRS.map((attr) => {
		const val = el.getAttribute(attr);
		return val ? ` ${attr}="${val.replace(/"/g, "&quot;")}"` : "";
	}).join("");

export const getComputedCSS = (el) => {
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
		if (parentStyles && val === parentStyles.getPropertyValue(prop))
			continue;
		result[prop] = val;
	}
	return result;
};

// ── Storage helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = "elementDumperMode";

export async function loadModePreference() {
	try {
		const result = await api.storage.local.get(STORAGE_KEY);
		if (typeof result[STORAGE_KEY] === "boolean") {
			state.tailwindMode = result[STORAGE_KEY];
		}
	} catch (err) {
		console.warn("[Element Dumper] Failed to load mode preference:", err);
	}
}

export async function saveModePreference() {
	try {
		await api.storage.local.set({ [STORAGE_KEY]: state.tailwindMode });
	} catch (err) {
		console.warn("[Element Dumper] Failed to save mode preference:", err);
	}
}
