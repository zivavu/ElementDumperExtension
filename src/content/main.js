// ── Element Dumper — entry point ──────────────────────────────────────────

import { api, loadModePreference, state } from "./core.js";
import { onKeyDown, onMouseOver } from "./events.js";
import { createUI, updateUI } from "./ui.js";

// ── Activate / Deactivate ──────────────────────────────────────────────────

export const activate = async () => {
	if (state.active) return;
	state.active = true;
	state.hoveredEl = null;
	state.depthOffset = 0;
	await loadModePreference();
	createUI();
	document.addEventListener("mouseover", onMouseOver, true);
	document.addEventListener("keydown", onKeyDown, true);
	document.addEventListener("scroll", updateUI, true);
};

export const deactivate = () => {
	if (!state.active) return;
	state.active = false;
	document.removeEventListener("mouseover", onMouseOver, true);
	document.removeEventListener("keydown", onKeyDown, true);
	document.removeEventListener("scroll", updateUI, true);
	state.overlay?.remove();
	state.overlay = null;
	state.panel?.remove();
	state.panel = null;
	document.getElementById("__dump_toast")?.remove();
};

// ── Message listener ───────────────────────────────────────────────────────

api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
	if (msg.action !== "toggle-dumper") return;
	if (state.active) {
		deactivate();
	} else {
		activate();
	}
	sendResponse({ active: state.active });
});
