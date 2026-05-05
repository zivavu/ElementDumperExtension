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
