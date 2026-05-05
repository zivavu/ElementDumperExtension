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

	const dumpTailwind = (el, depth = 0) => {
		if (!isMeaningful(el)) return "";
		const tag = el.tagName.toLowerCase();
		const indent = buildIndent(depth);
		let html = `${indent}<${tag}${buildAttrs(el)}>`;

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
			? "Preserves original class names — omits computed styles"
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

		// Breadcrumb — walk up to document root
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
						? ' <span style="color:#444;font-size:11px">›</span> '
						: "";
				return `<span style="${style}">&lt;${label}&gt;</span>${sep}`;
			})
			.join("");

		panelTag.style.color = "#0095f6";
		panelTag.innerHTML = `&lt;${escHtml(getTagLabel(el))}&gt;`;

		const dims = `${rect.width | 0}×${rect.height | 0}`;
		const text = (el.textContent ?? "").trim().slice(0, 120);
		const childCount = el.children.length;

		const det = [`<span style="color:#e8e8e8">${dims}</span>`];
		if (childCount > 0)
			det.push(
				` &nbsp;· &nbsp;${childCount} child${childCount !== 1 ? "ren" : ""}`,
			);
		if (text) det.push(` &nbsp;· &nbsp;"${escHtml(text)}"`);
		panelDetails.innerHTML = det.join("");

		if (depthOffset > 0) {
			panelDepth.textContent = `↑ ${depthOffset} level${depthOffset !== 1 ? "s" : ""} above hovered element`;
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
		const tag = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}`;

		console.log(`✅ Dumping <${tag}> [${mode} mode]`);
		console.log(dump);

		navigator.clipboard
			.writeText(dump)
			.then(() => {
				const msg = `✅ Copied ${dump.length.toLocaleString()} characters to clipboard! [${mode}]`;
				console.log(msg);
				showToast(msg, false);
			})
			.catch((err) => {
				const msg = `❌ Failed to copy: ${err.message}`;
				console.error(msg);
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
		console.log(
			"🔍  Element Dumper activated — hover, navigate with ↑/↓, Enter to dump, Esc to exit.",
		);
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
		console.log("🔴  Element Dumper deactivated.");
	};

	// ── Message listener ───────────────────────────────────────────────────────

	api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
		if (msg.action !== "toggle-dumper") return;
		if (active) {
			console.log("Element Dumper: deactivating via toggle");
			deactivate();
		} else {
			console.log("Element Dumper: activating via toggle");
			activate();
		}
		sendResponse({ active });
	});

	console.log(
		"ℹ️  Element Dumper loaded. Press Alt+Shift+D or click the toolbar icon to activate.",
	);
})();
