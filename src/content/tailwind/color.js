import { TW_FONT_SIZES, TW_FONT_WEIGHTS, TW_SPACING } from "./data.js";

const _colorCanvas = document.createElement("canvas");
const _colorCtx = _colorCanvas.getContext("2d", { willReadFrequently: true });

function pxValue(cssVal) {
	const m = String(cssVal).match(/^([\d.]+)px$/);
	return m ? parseFloat(m[1]) : null;
}

function closestTwSpacing(px) {
	let best = TW_SPACING[0];
	for (const s of TW_SPACING) {
		if (Math.abs(s.px - px) < Math.abs(best.px - px)) best = s;
	}
	return best.level;
}

function closestTwFontSize(px) {
	let best = TW_FONT_SIZES[0];
	for (const s of TW_FONT_SIZES) {
		if (Math.abs(s.px - px) < Math.abs(best.px - px)) best = s;
	}
	return best.cls;
}

function closestTwFontWeight(val) {
	let best = TW_FONT_WEIGHTS[0];
	for (const s of TW_FONT_WEIGHTS) {
		if (Math.abs(s.val - val) < Math.abs(best.val - val)) best = s;
	}
	return best.cls;
}

function colorToTw(cssColor) {
	_colorCtx.fillStyle = cssColor;
	const rgb = _colorCtx.fillStyle;
	const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	if (!m) return null;
	const r = parseInt(m[1], 10);
	const g = parseInt(m[2], 10);
	const b = parseInt(m[3], 10);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = ((max + min) / 2 / 255) * 100;
	const s =
		max === min
			? 0
			: l > 50
				? ((max - min) / (510 - max - min)) * 100
				: ((max - min) / (max + min)) * 100;

	if (max - min < 15 && s < 15) {
		const shade =
			l > 80
				? "100"
				: l > 65
					? "300"
					: l > 50
						? "500"
						: l > 35
							? "700"
							: "900";
		return `gray-${shade}`;
	}

	let h = 0;
	if (s > 0) {
		if (max === r) h = ((g - b) / (max - min)) % 6;
		else if (max === g) h = (b - r) / (max - min) + 2;
		else h = (r - g) / (max - min) + 4;
		h = Math.round(h * 60);
		if (h < 0) h += 360;
	}

	const colorMap = [
		{ hue: [0, 15], name: "red" },
		{ hue: [16, 35], name: "orange" },
		{ hue: [36, 55], name: "amber" },
		{ hue: [56, 75], name: "yellow" },
		{ hue: [76, 140], name: "green" },
		{ hue: [141, 170], name: "emerald" },
		{ hue: [171, 200], name: "teal" },
		{ hue: [201, 220], name: "cyan" },
		{ hue: [221, 240], name: "sky" },
		{ hue: [241, 260], name: "blue" },
		{ hue: [261, 280], name: "indigo" },
		{ hue: [281, 310], name: "violet" },
		{ hue: [311, 340], name: "purple" },
		{ hue: [341, 360], name: "pink" },
	];

	let colorName = "gray";
	for (const entry of colorMap) {
		if (h >= entry.hue[0] && h <= entry.hue[1]) {
			colorName = entry.name;
			break;
		}
	}

	const shadeTable = [
		{ min: 92, shade: 50 },
		{ min: 82, shade: 100 },
		{ min: 72, shade: 200 },
		{ min: 62, shade: 300 },
		{ min: 52, shade: 400 },
		{ min: 42, shade: 500 },
		{ min: 32, shade: 600 },
		{ min: 22, shade: 700 },
		{ min: 12, shade: 800 },
		{ min: 0, shade: 900 },
	];

	let shade = 500;
	for (const entry of shadeTable) {
		if (l >= entry.min) {
			shade = entry.shade;
			break;
		}
	}

	return `${colorName}-${shade}`;
}

export {
	closestTwFontSize,
	closestTwFontWeight,
	closestTwSpacing,
	colorToTw,
	pxValue,
};
