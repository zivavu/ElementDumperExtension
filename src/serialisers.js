// ── Serialisers ────────────────────────────────────────────────────────────

const inlineStyles = (el, depth = 0) => {
	if (!isMeaningful(el)) return "";
	const tag = el.tagName.toLowerCase();
	const styles = getComputedCSS(el);
	const styleStr = Object.entries(styles)
		.map(([k, v]) => `${k}: ${v}`)
		.join("; ");
	const indent = buildIndent(depth);

	let html = `${indent}<${tag}${buildAttrs(el)}`;
	if (styleStr) html += ` style="${styleStr}"`;
	html += ">";

	if (VOID_TAGS.has(tag)) return `${html}\n`;

	if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
		const text = el.childNodes[0].textContent.trim();
		if (text) html += text;
	} else {
		html += "\n";
		for (const child of el.children) html += inlineStyles(child, depth + 1);
		html += indent;
	}

	return `${html}</${tag}>\n`;
};

// ── Tailwind mode serialiser ────────────────────────────────────────────

const dumpTailwind = (el, depth = 0) => {
	if (!isMeaningful(el)) return "";
	const tag = el.tagName.toLowerCase();
	const indent = buildIndent(depth);

	let html = `${indent}<${tag}${buildAttrs(el)}`;

	if (detectPageUsesTailwind()) {
		const origClass = el.getAttribute("class");
		if (origClass) html += ` class="${origClass.replace(/"/g, "&quot;")}"`;
	} else {
		const styles = getComputedCSS(el);
		const twClasses = cssToTailwind(styles);
		const styleStr = cssToStyleString(styles);
		if (twClasses.length > 0) html += ` class="${twClasses.join(" ")}"`;
		if (styleStr) html += ` style="${styleStr}"`;
	}

	html += ">";

	if (VOID_TAGS.has(tag)) return `${html}\n`;

	if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
		const text = el.childNodes[0].textContent.trim();
		if (text) html += text;
	} else {
		html += "\n";
		for (const child of el.children) html += dumpTailwind(child, depth + 1);
		html += indent;
	}

	return `${html}</${tag}>\n`;
};
