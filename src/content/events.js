import { MAX_DEPTH, state } from "./core.js";
import { doDump } from "./serialisers.js";
import { updateUI } from "./ui.js";

let _mouseRaf = null;
let _exitCb = null;

export const setExitCallback = (fn) => { _exitCb = fn; };

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
		case "Escape":
			e.preventDefault();
			e.stopPropagation();
			_exitCb?.();
			break;
	}
};
