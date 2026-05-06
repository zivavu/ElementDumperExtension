import { getSelectedEl, isMeaningful, state } from "./core.js";
import { doDump } from "./serialisers.js";
import { updateUI } from "./ui.js";

let _mouseRaf = null;
let _exitCb = null;

export const setExitCallback = (fn) => {
	_exitCb = fn;
};

export const onMouseOver = (e) => {
	if (!state.panel || state.panel.contains(e.target)) return;
	if (_mouseRaf) return;
	_mouseRaf = requestAnimationFrame(() => {
		_mouseRaf = null;
		state.hoveredEl = e.target;
		state.selectedEl = null;
		updateUI();
	});
};

const getMeaningfulSiblings = (el) => {
	const parent = el.parentElement;
	if (!parent) return [];
	return [...parent.children].filter(isMeaningful);
};

export const onKeyDown = (e) => {
	switch (e.key) {
		case "ArrowLeft": {
			e.preventDefault();
			e.stopPropagation();
			const el = getSelectedEl();
			if (!el) return;
			if (el.parentElement && el.parentElement !== document) {
				state.selectedEl = el.parentElement;
				updateUI();
			}
			break;
		}
		case "ArrowRight": {
			e.preventDefault();
			e.stopPropagation();
			const el = getSelectedEl();
			if (!el) return;
			const firstChild = [...el.children].find(isMeaningful);
			if (firstChild) {
				state.selectedEl = firstChild;
				updateUI();
			}
			break;
		}
		case "ArrowUp": {
			e.preventDefault();
			e.stopPropagation();
			const el = getSelectedEl();
			if (!el) return;
			const siblings = getMeaningfulSiblings(el);
			const idx = siblings.indexOf(el);
			if (idx === -1 || siblings.length <= 1) return;
			const prevIdx = (idx - 1 + siblings.length) % siblings.length;
			state.selectedEl = siblings[prevIdx];
			updateUI();
			break;
		}
		case "ArrowDown": {
			e.preventDefault();
			e.stopPropagation();
			const el = getSelectedEl();
			if (!el) return;
			const siblings = getMeaningfulSiblings(el);
			const idx = siblings.indexOf(el);
			if (idx === -1 || siblings.length <= 1) return;
			const nextIdx = (idx + 1) % siblings.length;
			state.selectedEl = siblings[nextIdx];
			updateUI();
			break;
		}
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
