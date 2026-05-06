// ── Event handlers ─────────────────────────────────────────────────────────

import { MAX_DEPTH, state } from "./core.js";
import { deactivate } from "./main.js";
import { doDump } from "./serialisers.js";
import { toggleMode, updateUI } from "./ui.js";

let _mouseRaf = null;

export const onMouseOver = (e) => {
	if (!state.panel || state.panel.contains(e.target)) return;
	if (_mouseRaf) return;
	_mouseRaf = requestAnimationFrame(() => {
		_mouseRaf = null;
		state.hoveredEl = e.target;
		state.depthOffset = 0;
		updateUI();
	});
};

export const onKeyDown = (e) => {
	if (e.altKey && e.shiftKey && (e.key === "s" || e.key === "S")) {
		e.preventDefault();
		e.stopPropagation();
		doDump();
		return;
	}

	switch (e.key) {
		case "ArrowUp": {
			e.preventDefault();
			e.stopPropagation();
			if (!state.hoveredEl) return;
			let el = state.hoveredEl;
			let reachable = true;
			for (let i = 0; i < state.depthOffset; i++) {
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
				state.depthOffset < MAX_DEPTH
			) {
				state.depthOffset++;
				updateUI();
			}
			break;
		}
		case "ArrowDown":
			e.preventDefault();
			e.stopPropagation();
			if (state.depthOffset > 0) {
				state.depthOffset--;
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
