let _pageUsesTailwind = null;

function detectPageUsesTailwind() {
	if (_pageUsesTailwind !== null) return _pageUsesTailwind;

	if (document.querySelector('script[src*="tailwind"]')) {
		_pageUsesTailwind = true;
		return true;
	}

	const sheets = document.styleSheets;
	for (let i = 0; i < sheets.length; i++) {
		try {
			const rules = sheets[i].cssRules || sheets[i].rules;
			if (!rules) continue;
			for (let j = 0; j < rules.length; j++) {
				try {
					const text = rules[j].cssText || "";
					if (
						text.includes("tailwind") ||
						text.includes("! tailwindcss")
					) {
						_pageUsesTailwind = true;
						return true;
					}
				} catch {}
			}
		} catch {}
	}

	const twPattern =
		/^(flex|grid|container|mx-auto|px-\d|py-\d|p-\d|m-\d|mt-\d|mb-\d|ml-\d|mr-\d|gap-\d|w-\d|h-\d|text-\w+|font-\w+|bg-\w+|rounded|shadow|opacity-\d|z-\d|items-\w+|justify-\w+|object-\w+|overflow-\w+|cursor-\w+|whitespace-\w+|visible|invisible|relative|absolute|fixed|sticky|block|inline|hidden|table|table-cell|contents)$/;

	const all = document.querySelectorAll("*");
	const sample = Math.min(all.length, 100);
	let matchCount = 0;
	for (let i = 0; i < sample; i++) {
		const el = all[i];
		const clsList = el.classList;
		for (let k = 0; k < clsList.length; k++) {
			if (twPattern.test(clsList[k])) {
				matchCount++;
				break;
			}
		}
	}

	_pageUsesTailwind = matchCount > sample * 0.1;
	return _pageUsesTailwind;
}

export { detectPageUsesTailwind };
