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
		"font-weight:600;color:#0095f6;font-size:15px;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap",
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
