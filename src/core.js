// Element Dumper — content script
// Injected on every page. Waits for a 'toggle-dumper' message from the
// background script, then activates / deactivates the dumper UI.

// Cross-browser API shim: Firefox uses browser.*, Chrome uses chrome.*
const api =
	typeof browser !== "undefined" && browser.runtime ? browser : chrome;

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_DEPTH = 100;
const VOID_TAGS = new Set(["br", "hr", "img", "input", "meta", "link"]);
const SKIP_TAGS = new Set(["script", "style", "link", "meta", "title", "head"]);
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
