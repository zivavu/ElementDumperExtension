let _pageUsesTailwind = null;

function detectPageUsesTailwind() {
	if (_pageUsesTailwind !== null) return _pageUsesTailwind;

	if (document.querySelector('script[src*="tailwind"]')) {
		_pageUsesTailwind = true;
		return true;
	}

	for (let i = 0; i < document.styleSheets.length; i++) {
		try {
			const rules =
				document.styleSheets[i].cssRules ||
				document.styleSheets[i].rules;
			if (!rules) continue;
			for (let j = 0; j < rules.length; j++) {
				const text = rules[j].cssText || "";
				if (
					text.includes("tailwind") ||
					text.includes("! tailwindcss")
				) {
					_pageUsesTailwind = true;
					return true;
				}
			}
		} catch {}
	}

	const all = document.querySelectorAll("div, span, button, input");
	const sample = Math.min(all.length, 100);
	let matchCount = 0;

	for (let i = 0; i < sample; i++) {
		const el = all[i];
		for (const cls of el.classList) {
			if (/[a-z]+-/i.test(cls)) {
				matchCount++;
				break;
			}
		}
	}

	_pageUsesTailwind = matchCount > sample * 0.1;
	return _pageUsesTailwind;
}

export { detectPageUsesTailwind };
