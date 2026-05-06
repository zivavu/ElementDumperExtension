import {
	buildAttrs,
	buildIndent,
	getComputedCSS,
	getSelectedEl,
	isMeaningful,
	state,
	VOID_TAGS,
} from "./core.js";
import {
	cssToStyleString,
	cssToTailwind,
	detectPageUsesTailwind,
} from "./tailwind/index.js";
import { showToast } from "./ui.js";

export const inlineStyles = (el, depth = 0) => {
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
		if (el.shadowRoot) {
			for (const child of el.shadowRoot.children) {
				html += inlineStyles(child, depth + 1);
			}
		}
		html += indent;
	}

	return `${html}</${tag}>\n`;
};

export const dumpTailwind = (el, depth = 0) => {
	if (!isMeaningful(el)) return "";
	const tag = el.tagName.toLowerCase();
	const indent = buildIndent(depth);

	let html = `${indent}<${tag}${buildAttrs(el)}`;

	const pageUsesTailwind = detectPageUsesTailwind();
	const styles = getComputedCSS(el);

	if (pageUsesTailwind) {
		const originalClasses = [...el.classList].filter(
			(c) => !c.startsWith("_"),
		);
		if (originalClasses.length > 0) {
			html += ` class="${originalClasses.join(" ")}"`;
		}
		const styleStr = cssToStyleString(styles);
		if (styleStr) html += ` style="${styleStr}"`;
	} else {
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
		if (el.shadowRoot) {
			for (const child of el.shadowRoot.children) {
				html += dumpTailwind(child, depth + 1);
			}
		}
		html += indent;
	}

	return `${html}</${tag}>\n`;
};

async function writeToClipboard(text) {
	if (navigator.clipboard && window.isSecureContext) {
		return navigator.clipboard.writeText(text);
	}

	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.style.position = "fixed";
	textarea.style.left = "-9999px";
	textarea.style.top = "0";
	textarea.setAttribute("readonly", "");
	document.body.appendChild(textarea);

	const selection = document.getSelection();
	const range = document.createRange();
	range.selectNodeContents(textarea);
	selection.removeAllRanges();
	selection.addRange(range);

	let success = false;
	try {
		success = document.execCommand("copy");
	} catch (err) {
		console.warn("[Element Dumper] execCommand copy failed:", err);
	}

	selection.removeAllRanges();
	document.body.removeChild(textarea);

	if (!success) {
		throw new Error("Clipboard copy failed in this context");
	}
}

export const doDump = () => {
	const el = getSelectedEl();
	if (!el) return;

	const mode = state.tailwindMode ? "Tailwind" : "CSS";
	const dump = state.tailwindMode ? dumpTailwind(el) : inlineStyles(el);

	writeToClipboard(dump)
		.then(() => {
			const msg = `Copied ${dump.length.toLocaleString()} characters to clipboard! [${mode}]`;
			showToast(msg, false);
		})
		.catch((err) => {
			const msg = `Failed to copy: ${err.message}`;
			showToast(msg, true);
		});
};
