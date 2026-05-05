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
