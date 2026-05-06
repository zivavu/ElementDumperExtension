const BARE = new Set([
	"flex",
	"inline-flex",
	"grid",
	"inline-grid",
	"block",
	"inline-block",
	"inline",
	"hidden",
	"contents",
	"flow-root",
	"table",
	"inline-table",
	"list-item",
	"relative",
	"absolute",
	"fixed",
	"sticky",
	"static",
	"visible",
	"invisible",
	"collapse",
	"truncate",
	"overflow-ellipsis",
	"overflow-clip",
	"italic",
	"not-italic",
	"underline",
	"overline",
	"line-through",
	"no-underline",
	"uppercase",
	"lowercase",
	"capitalize",
	"normal-case",
	"antialiased",
	"subpixel-antialiased",
	"sr-only",
	"not-sr-only",
	"container",
	"isolate",
	"isolation-auto",
	"box-border",
	"box-content",
	"border-collapse",
	"border-separate",
	"grow",
	"grow-0",
	"shrink",
	"shrink-0",
	"transform",
	"transform-gpu",
	"transform-cpu",
	"filter",
	"backdrop-filter",
	"transition-all",
	"transition-colors",
	"transition-opacity",
	"transition-shadow",
	"transition-transform",
	"resize-none",
	"resize",
	"resize-x",
	"resize-y",
	"select-none",
	"select-text",
	"select-all",
	"select-auto",
	"decoration-slice",
	"decoration-clone",
	"box-decoration-slice",
	"box-decoration-clone",
	"scroll-auto",
	"scroll-smooth",
	"pointer-events-none",
	"pointer-events-auto",
	"appearance-none",
	"appearance-auto",
	"order-first",
	"order-last",
	"order-none",
	"col-auto",
	"row-auto",
	"col-span-full",
	"row-span-full",
	"col-start-auto",
	"col-end-auto",
	"row-start-auto",
	"row-end-auto",
	"float-start",
	"float-end",
	"float-right",
	"float-left",
	"float-none",
	"clear-start",
	"clear-end",
	"clear-left",
	"clear-right",
	"clear-both",
	"clear-none",
	"object-contain",
	"object-cover",
	"object-fill",
	"object-none",
	"object-scale-down",
	"overflow-auto",
	"overflow-hidden",
	"overflow-clip",
	"overflow-visible",
	"overflow-scroll",
	"overflow-x-auto",
	"overflow-x-hidden",
	"overflow-x-clip",
	"overflow-x-visible",
	"overflow-x-scroll",
	"overflow-y-auto",
	"overflow-y-hidden",
	"overflow-y-clip",
	"overflow-y-visible",
	"overflow-y-scroll",
	"overscroll-auto",
	"overscroll-contain",
	"overscroll-none",
	"snap-start",
	"snap-end",
	"snap-center",
	"snap-align-none",
	"snap-normal",
	"snap-always",
	"snap-none",
	"snap-x",
	"snap-y",
	"snap-both",
	"snap-mandatory",
	"snap-proximity",
	"touch-auto",
	"touch-none",
	"touch-pan-x",
	"touch-pan-left",
	"touch-pan-right",
	"touch-pan-y",
	"touch-pan-up",
	"touch-pan-down",
	"touch-pinch-zoom",
	"touch-manipulation",
	"will-change-auto",
	"will-change-scroll",
	"will-change-contents",
	"will-change-transform",
	"fill-current",
	"stroke-current",
	"list-inside",
	"list-outside",
	"text-left",
	"text-center",
	"text-right",
	"text-justify",
	"text-start",
	"text-end",
	"text-ellipsis",
	"text-clip",
	"whitespace-normal",
	"whitespace-nowrap",
	"whitespace-pre",
	"whitespace-pre-line",
	"whitespace-pre-wrap",
	"break-normal",
	"break-words",
	"break-all",
	"break-keep",
	"bg-fixed",
	"bg-local",
	"bg-scroll",
	"bg-repeat",
	"bg-no-repeat",
	"bg-repeat-x",
	"bg-repeat-y",
	"bg-repeat-round",
	"bg-repeat-space",
	"bg-bottom",
	"bg-center",
	"bg-left",
	"bg-left-bottom",
	"bg-left-top",
	"bg-right",
	"bg-right-bottom",
	"bg-right-top",
	"bg-top",
	"bg-auto",
	"bg-cover",
	"bg-contain",
	"bg-none",
	"bg-gradient-to-t",
	"bg-gradient-to-tr",
	"bg-gradient-to-r",
	"bg-gradient-to-br",
	"bg-gradient-to-b",
	"bg-gradient-to-bl",
	"bg-gradient-to-l",
	"bg-gradient-to-tl",
	"border-solid",
	"border-dashed",
	"border-dotted",
	"border-double",
	"border-hidden",
	"border-none",
	"rounded-none",
	"rounded-sm",
	"rounded",
	"rounded-md",
	"rounded-lg",
	"rounded-xl",
	"rounded-2xl",
	"rounded-3xl",
	"rounded-full",
	"rounded-t-none",
	"rounded-t-sm",
	"rounded-t",
	"rounded-t-md",
	"rounded-t-lg",
	"rounded-t-xl",
	"rounded-t-2xl",
	"rounded-t-3xl",
	"rounded-t-full",
	"rounded-r-none",
	"rounded-r-sm",
	"rounded-r",
	"rounded-r-md",
	"rounded-r-lg",
	"rounded-r-xl",
	"rounded-r-2xl",
	"rounded-r-3xl",
	"rounded-r-full",
	"rounded-b-none",
	"rounded-b-sm",
	"rounded-b",
	"rounded-b-md",
	"rounded-b-lg",
	"rounded-b-xl",
	"rounded-b-2xl",
	"rounded-b-3xl",
	"rounded-b-full",
	"rounded-l-none",
	"rounded-l-sm",
	"rounded-l",
	"rounded-l-md",
	"rounded-l-lg",
	"rounded-l-xl",
	"rounded-l-2xl",
	"rounded-l-3xl",
	"rounded-l-full",
	"shadow-sm",
	"shadow",
	"shadow-md",
	"shadow-lg",
	"shadow-xl",
	"shadow-2xl",
	"shadow-inner",
	"shadow-none",
	"outline-none",
	"outline",
	"outline-dashed",
	"outline-dotted",
	"outline-double",
	"outline-hidden",
	"ring-0",
	"ring-1",
	"ring-2",
	"ring-4",
	"ring-8",
	"ring-inset",
	"ring-offset-0",
	"ring-offset-1",
	"ring-offset-2",
	"ring-offset-4",
	"ring-offset-8",
	"drop-shadow-sm",
	"drop-shadow",
	"drop-shadow-md",
	"drop-shadow-lg",
	"drop-shadow-xl",
	"drop-shadow-2xl",
	"drop-shadow-none",
	"blur-none",
	"blur-sm",
	"blur",
	"blur-md",
	"blur-lg",
	"blur-xl",
	"blur-2xl",
	"blur-3xl",
	"grayscale-0",
	"grayscale",
	"invert-0",
	"invert",
	"sepia-0",
	"sepia",
	"animate-none",
	"animate-spin",
	"animate-ping",
	"animate-pulse",
	"animate-bounce",
	"aspect-auto",
	"aspect-square",
	"aspect-video",
	"delay-0",
	"delay-75",
	"delay-100",
	"delay-150",
	"delay-200",
	"delay-300",
	"delay-500",
	"delay-700",
	"delay-1000",
	"duration-0",
	"duration-75",
	"duration-100",
	"duration-150",
	"duration-200",
	"duration-300",
	"duration-500",
	"duration-700",
	"duration-1000",
	"ease-linear",
	"ease-in",
	"ease-out",
	"ease-in-out",
	"origin-center",
	"origin-top",
	"origin-top-right",
	"origin-right",
	"origin-bottom-right",
	"origin-bottom",
	"origin-bottom-left",
	"origin-left",
	"origin-top-left",
	"scale-0",
	"scale-50",
	"scale-75",
	"scale-90",
	"scale-95",
	"scale-100",
	"scale-105",
	"scale-110",
	"scale-125",
	"scale-150",
	"rotate-0",
	"rotate-1",
	"rotate-2",
	"rotate-3",
	"rotate-6",
	"rotate-12",
	"rotate-45",
	"rotate-90",
	"rotate-180",
	"skew-x-0",
	"skew-x-1",
	"skew-x-2",
	"skew-x-3",
	"skew-x-6",
	"skew-x-12",
	"skew-y-0",
	"skew-y-1",
	"skew-y-2",
	"skew-y-3",
	"skew-y-6",
	"skew-y-12",
	"opacity-0",
	"opacity-5",
	"opacity-10",
	"opacity-15",
	"opacity-20",
	"opacity-25",
	"opacity-30",
	"opacity-35",
	"opacity-40",
	"opacity-45",
	"opacity-50",
	"opacity-55",
	"opacity-60",
	"opacity-65",
	"opacity-70",
	"opacity-75",
	"opacity-80",
	"opacity-85",
	"opacity-90",
	"opacity-95",
	"opacity-100",
	"z-0",
	"z-10",
	"z-20",
	"z-30",
	"z-40",
	"z-50",
	"z-auto",
	"cursor-auto",
	"cursor-default",
	"cursor-pointer",
	"cursor-wait",
	"cursor-text",
	"cursor-move",
	"cursor-help",
	"cursor-not-allowed",
	"cursor-none",
	"cursor-context-menu",
	"cursor-progress",
	"cursor-cell",
	"cursor-crosshair",
	"cursor-vertical-text",
	"cursor-alias",
	"cursor-copy",
	"cursor-no-drop",
	"cursor-grab",
	"cursor-grabbing",
	"cursor-all-scroll",
	"cursor-col-resize",
	"cursor-row-resize",
	"cursor-n-resize",
	"cursor-e-resize",
	"cursor-s-resize",
	"cursor-w-resize",
	"cursor-ne-resize",
	"cursor-nw-resize",
	"cursor-se-resize",
	"cursor-sw-resize",
	"cursor-ew-resize",
	"cursor-ns-resize",
	"cursor-nesw-resize",
	"cursor-nwse-resize",
	"cursor-zoom-in",
	"cursor-zoom-out",
]);

const SPACING = new Set([
	"0",
	"0.5",
	"1",
	"1.5",
	"2",
	"2.5",
	"3",
	"3.5",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"12",
	"14",
	"16",
	"20",
	"24",
	"28",
	"32",
	"36",
	"40",
	"44",
	"48",
	"52",
	"56",
	"60",
	"64",
	"72",
	"80",
	"96",
	"px",
]);

const COLORS = new Set([
	"transparent",
	"current",
	"inherit",
	"initial",
	"white",
	"black",
	"slate",
	"gray",
	"grey",
	"zinc",
	"neutral",
	"stone",
	"red",
	"orange",
	"amber",
	"yellow",
	"lime",
	"green",
	"emerald",
	"teal",
	"cyan",
	"sky",
	"blue",
	"indigo",
	"violet",
	"purple",
	"fuchsia",
	"pink",
	"rose",
]);

const SHADES = new Set([
	"50",
	"100",
	"200",
	"300",
	"400",
	"500",
	"600",
	"700",
	"800",
	"900",
	"950",
]);

const FONT_SIZES = new Set([
	"xs",
	"sm",
	"base",
	"lg",
	"xl",
	"2xl",
	"3xl",
	"4xl",
	"5xl",
	"6xl",
	"7xl",
	"8xl",
	"9xl",
]);

const FONT_WEIGHTS = new Set([
	"thin",
	"extralight",
	"light",
	"normal",
	"medium",
	"semibold",
	"bold",
	"extrabold",
	"black",
]);

const LEADING = new Set([
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"none",
	"tight",
	"snug",
	"normal",
	"relaxed",
	"loose",
]);

const TRACKING = new Set([
	"tighter",
	"tight",
	"normal",
	"wide",
	"wider",
	"widest",
]);

const ITEMS_VALS = new Set(["start", "end", "center", "baseline", "stretch"]);
const JUSTIFY_VALS = new Set([
	"start",
	"end",
	"center",
	"between",
	"around",
	"evenly",
	"stretch",
	"normal",
]);
const CONTENT_VALS = new Set([
	"center",
	"start",
	"end",
	"between",
	"around",
	"evenly",
	"baseline",
	"normal",
	"stretch",
]);
const SELF_VALS = new Set([
	"auto",
	"start",
	"end",
	"center",
	"baseline",
	"stretch",
]);
const FLEX_VALS = new Set([
	"1",
	"auto",
	"initial",
	"none",
	"grow",
	"shrink",
	"wrap",
	"wrap-reverse",
	"nowrap",
	"col",
	"col-reverse",
	"row",
	"row-reverse",
]);
const GRID_NUM = new Set([
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"12",
	"none",
	"auto",
	"subgrid",
	"span-1",
	"span-2",
	"span-3",
	"span-4",
	"span-5",
	"span-6",
	"span-7",
	"span-8",
	"span-9",
	"span-10",
	"span-11",
	"span-12",
	"span-full",
	"start-1",
	"start-2",
	"start-3",
	"start-4",
	"start-5",
	"start-6",
	"start-7",
	"start-8",
	"start-9",
	"start-10",
	"start-11",
	"start-12",
	"start-auto",
	"end-1",
	"end-2",
	"end-3",
	"end-4",
	"end-5",
	"end-6",
	"end-7",
	"end-8",
	"end-9",
	"end-10",
	"end-11",
	"end-12",
	"end-auto",
]);

function isSpacing(val) {
	return SPACING.has(val);
}
function isSizing(val) {
	return (
		SPACING.has(val) ||
		/^(?:auto|full|screen|min|max|fit)$/.test(val) ||
		/^\d+\/\d+$/.test(val)
	);
}
function isColor(val) {
	if (COLORS.has(val)) return true;
	const m = val.match(/^([a-z]+)-(\d+)$/);
	return !!m && COLORS.has(m[1]) && SHADES.has(m[2]);
}
function isBracket(val) {
	return /^\[.+\]$/.test(val);
}
function isAnyNumber(val) {
	return /^\d+(?:\.\d+)?$/.test(val);
}

const PREFIXES = [
	[
		[
			"p-",
			"px-",
			"py-",
			"pt-",
			"pr-",
			"pb-",
			"pl-",
			"m-",
			"mx-",
			"my-",
			"mt-",
			"mr-",
			"mb-",
			"ml-",
			"gap-",
			"gap-x-",
			"gap-y-",
			"scroll-m-",
			"scroll-mx-",
			"scroll-my-",
			"scroll-mt-",
			"scroll-mr-",
			"scroll-mb-",
			"scroll-ml-",
			"scroll-p-",
			"scroll-px-",
			"scroll-py-",
			"scroll-pt-",
			"scroll-pr-",
			"scroll-pb-",
			"scroll-pl-",
			"space-x-",
			"space-y-",
			"inset-",
			"inset-x-",
			"inset-y-",
			"top-",
			"right-",
			"bottom-",
			"left-",
			"indent-",
		],
		(val) => isSpacing(val) || isBracket(val),
	],

	[
		["w-", "h-", "min-w-", "max-w-", "min-h-", "max-h-", "basis-"],
		(val) => isSizing(val) || isBracket(val),
	],

	[
		["text-"],
		(val) =>
			FONT_SIZES.has(val) ||
			isColor(val) ||
			isSpacing(val) ||
			isBracket(val),
	],

	[
		["font-"],
		(val) => FONT_WEIGHTS.has(val) || isSpacing(val) || isBracket(val),
	],

	[
		["leading-"],
		(val) => LEADING.has(val) || isSpacing(val) || isBracket(val),
	],

	[["tracking-"], (val) => TRACKING.has(val)],

	[
		["flex-"],
		(val) => FLEX_VALS.has(val) || isSpacing(val) || isBracket(val),
	],

	[
		[
			"grid-cols-",
			"grid-rows-",
			"col-span-",
			"row-span-",
			"col-start-",
			"col-end-",
			"row-start-",
			"row-end-",
			"auto-cols-",
			"auto-rows-",
			"grid-flow-",
		],
		(val) =>
			GRID_NUM.has(val) ||
			/^(col|row|dense|col-dense|row-dense)$/.test(val) ||
			isBracket(val),
	],

	[
		["items-", "justify-items-"],
		(val) => ITEMS_VALS.has(val) || isBracket(val),
	],
	[
		["justify-", "justify-self-"],
		(val) => JUSTIFY_VALS.has(val) || isBracket(val),
	],
	[["content-"], (val) => CONTENT_VALS.has(val) || isBracket(val)],
	[["self-"], (val) => SELF_VALS.has(val) || isBracket(val)],
	[
		["place-items-", "place-content-", "place-self-"],
		(val) =>
			/^(?:start|end|center|baseline|stretch|between|around|evenly)$/.test(
				val,
			),
	],

	[["bg-", "from-", "via-", "to-"], (val) => isColor(val) || isBracket(val)],

	[
		[
			"border-",
			"border-t-",
			"border-r-",
			"border-b-",
			"border-l-",
			"border-x-",
			"border-y-",
		],
		(val) =>
			isColor(val) ||
			isSpacing(val) ||
			/^(?:solid|dashed|dotted|double|hidden|none)$/.test(val) ||
			isBracket(val),
	],

	[
		["divide-", "divide-x-", "divide-y-"],
		(val) =>
			isColor(val) ||
			isSpacing(val) ||
			/^(?:solid|dashed|dotted|double|none|reverse)$/.test(val) ||
			isBracket(val),
	],

	[
		["outline-", "outline-offset-"],
		(val) =>
			isSpacing(val) ||
			/^(?:none|dashed|dotted|double|hidden)$/.test(val) ||
			isBracket(val),
	],

	[
		["ring-", "ring-offset-"],
		(val) =>
			isSpacing(val) || isColor(val) || val === "inset" || isBracket(val),
	],

	[
		[
			"rounded-t-",
			"rounded-r-",
			"rounded-b-",
			"rounded-l-",
			"rounded-tl-",
			"rounded-tr-",
			"rounded-br-",
			"rounded-bl-",
		],
		(val) => isSpacing(val) || isBracket(val),
	],

	[
		["shadow-"],
		(val) =>
			/^(?:sm|md|lg|xl|2xl|inner|none)$/.test(val) ||
			isColor(val) ||
			isBracket(val),
	],

	[["opacity-"], (val) => isAnyNumber(val) || isBracket(val)],

	[["z-"], (val) => isAnyNumber(val) || val === "auto" || isBracket(val)],

	[
		["order-"],
		(val) =>
			isAnyNumber(val) ||
			/^(?:first|last|none)$/.test(val) ||
			isBracket(val),
	],

	[
		["scale-", "scale-x-", "scale-y-"],
		(val) => isAnyNumber(val) || isBracket(val),
	],
	[["rotate-"], (val) => /^[\d.]+$/.test(val) || isBracket(val)],
	[
		["translate-x-", "translate-y-"],
		(val) => isSpacing(val) || /^\d+\/\d+$/.test(val) || isBracket(val),
	],
	[["skew-x-", "skew-y-"], (val) => /^[\d.]+$/.test(val) || isBracket(val)],

	[
		[
			"brightness-",
			"contrast-",
			"saturate-",
			"backdrop-brightness-",
			"backdrop-contrast-",
			"backdrop-saturate-",
		],
		(val) => isAnyNumber(val) || isBracket(val),
	],
	[
		["hue-rotate-", "backdrop-hue-rotate-"],
		(val) => isAnyNumber(val) || isBracket(val),
	],
	[
		["blur-", "backdrop-blur-"],
		(val) => /^(?:none|sm|md|lg|xl|2xl|3xl)$/.test(val) || isBracket(val),
	],
	[["backdrop-opacity-"], (val) => isAnyNumber(val) || isBracket(val)],
	[
		["backdrop-grayscale-", "backdrop-invert-", "backdrop-sepia-"],
		(val) => /^\d*$/.test(val) || isBracket(val),
	],

	[
		["drop-shadow-"],
		(val) => /^(?:sm|md|lg|xl|2xl|none)$/.test(val) || isBracket(val),
	],

	[
		["transition-"],
		(val) =>
			/^(?:all|colors|opacity|shadow|transform|none)$/.test(val) ||
			isBracket(val),
	],
	[["duration-", "delay-"], (val) => isAnyNumber(val) || isBracket(val)],
	[["ease-"], (val) => /^(?:linear|in|out|in-out)$/.test(val)],

	[
		["stroke-"],
		(val) => isAnyNumber(val) || val === "current" || isBracket(val),
	],

	[
		["columns-"],
		(val) =>
			isAnyNumber(val) ||
			/^(?:auto|\d+|3xs|2xs|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/.test(
				val,
			) ||
			isBracket(val),
	],

	[
		["overflow-x-", "overflow-y-"],
		(val) => /^(?:auto|hidden|clip|visible|scroll)$/.test(val),
	],
	[
		["overscroll-x-", "overscroll-y-"],
		(val) => /^(?:auto|contain|none)$/.test(val),
	],

	[
		["object-"],
		(val) =>
			/^(?:contain|cover|fill|none|scale-down|bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/.test(
				val,
			),
	],

	[
		["list-"],
		(val) =>
			/^(?:none|disc|decimal|inside|outside|image)$/.test(val) ||
			isBracket(val),
	],

	[
		["mix-blend-", "bg-blend-"],
		(val) =>
			/^(?:normal|multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity|plus-lighter|plus-darker)$/.test(
				val,
			),
	],

	[
		["will-change-"],
		(val) => /^(?:auto|scroll|contents|transform)$/.test(val),
	],

	[
		["align-"],
		(val) =>
			/^(?:baseline|top|middle|bottom|text-top|text-bottom|sub|super)$/.test(
				val,
			),
	],

	[
		["whitespace-"],
		(val) => /^(?:normal|nowrap|pre|pre-line|pre-wrap)$/.test(val),
	],

	[["break-"], (val) => /^(?:normal|words|all|keep)$/.test(val)],

	[["box-"], (val) => /^(?:border|content)$/.test(val)],

	[
		["table-"],
		(val) =>
			/^(?:auto|fixed|inline|caption|cell|column|column-group|footer-group|header-group|row-group|row)$/.test(
				val,
			),
	],

	[["caption-"], (val) => /^(?:top|bottom)$/.test(val)],

	[["clear-"], (val) => /^(?:start|end|left|right|both|none)$/.test(val)],

	[
		["display-"],
		(val) =>
			/^(?:block|inline|inline-block|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|none)$/.test(
				val,
			),
	],

	[
		["touch-"],
		(val) =>
			/^(?:auto|none|pan-x|pan-left|pan-right|pan-y|pan-up|pan-down|pinch-zoom|manipulation)$/.test(
				val,
			),
	],
];

function isTailwindClass(cls) {
	let c = cls.replace(/^(?:[a-z]+(?:\.[a-z]+)?:)+/i, "");
	c = c.replace(/!+$/, "");

	if (BARE.has(c)) return true;

	if (/^[a-z]+-\[.+\]$/i.test(c)) return true;

	for (const [prefixes, validate] of PREFIXES) {
		for (const p of prefixes) {
			if (c.startsWith(p)) {
				const val = c.slice(p.length);
				if (!val) continue;
				if (validate(val)) return true;
			}
		}
	}

	return false;
}

let _pageUsesTailwind = null;

function detectPageUsesTailwind() {
	if (_pageUsesTailwind !== null) return _pageUsesTailwind;

	const all = document.querySelectorAll("div, span, button, input");
	const sample = Math.min(all.length, 100);
	let matchCount = 0;

	for (let i = 0; i < sample; i++) {
		const el = all[i];
		for (const cls of el.classList) {
			if (isTailwindClass(cls)) {
				matchCount++;
				break;
			}
		}
	}

	_pageUsesTailwind = matchCount > sample * 0.85;

	return _pageUsesTailwind;
}

export function resetTailwindCache() {
	_pageUsesTailwind = null;
}

export { detectPageUsesTailwind };
