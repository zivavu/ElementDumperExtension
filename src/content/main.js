import { api, state } from "./core.js";
import { onKeyDown, onMouseOver, setExitCallback } from "./events.js";
import { createUI, updateUI } from "./ui.js";

let _scrollRaf = false;

function onScroll() {
	if (_scrollRaf) return;
	_scrollRaf = true;
	requestAnimationFrame(() => {
		_scrollRaf = false;
		updateUI();
	});
}

export const activate = () => {
	if (state.active) return;
	state.active = true;
	state.hoveredEl = null;
	state.selectedEl = null;
	createUI();
	document.addEventListener("mouseover", onMouseOver, true);
	document.addEventListener("keydown", onKeyDown, true);
	document.addEventListener("scroll", onScroll, true);
};

export const deactivate = () => {
	if (!state.active) return;
	state.active = false;
	document.removeEventListener("mouseover", onMouseOver, true);
	document.removeEventListener("keydown", onKeyDown, true);
	document.removeEventListener("scroll", onScroll, true);
	state.overlay?.remove();
	state.overlay = null;
	state.panel?.remove();
	state.panel = null;
	document.getElementById("__dump_toast")?.remove();
};

setExitCallback(deactivate);

api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
	if (msg.action !== "toggle-dumper") return;
	if (state.active) {
		deactivate();
	} else {
		activate();
	}
	sendResponse({ active: state.active });
});
