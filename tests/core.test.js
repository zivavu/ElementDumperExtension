import { describe, expect, it } from "bun:test";
import "./setup.js";
import {
	buildIndent,
	escHtml,
	getTagLabel,
	isMeaningful,
	VOID_TAGS,
	SKIP_TAGS,
} from "../src/content/core.js";

describe("escHtml", () => {
	it("escapes ampersand", () => {
		expect(escHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
	});

	it("escapes less-than and greater-than", () => {
		expect(escHtml("<div>")).toBe("&lt;div&gt;");
	});

	it("escapes double quotes", () => {
		expect(escHtml('class="foo"')).toBe("class=&quot;foo&quot;");
	});

	it("handles empty string", () => {
		expect(escHtml("")).toBe("");
	});

	it("handles plain text", () => {
		expect(escHtml("hello")).toBe("hello");
	});
});

describe("getTagLabel", () => {
	it("returns tag name only", () => {
		const el = document.createElement("div");
		expect(getTagLabel(el)).toBe("div");
	});

	it("includes id", () => {
		const el = document.createElement("section");
		el.id = "hero";
		expect(getTagLabel(el)).toBe("section#hero");
	});

	it("includes classes", () => {
		const el = document.createElement("span");
		el.className = "foo bar";
		expect(getTagLabel(el)).toBe("span.foo.bar");
	});

	it("filters classes starting with underscore", () => {
		const el = document.createElement("div");
		el.className = "visible _internal _scoped";
		expect(getTagLabel(el)).toBe("div.visible");
	});

	it("combines id and classes", () => {
		const el = document.createElement("button");
		el.id = "submit";
		el.className = "btn primary";
		expect(getTagLabel(el)).toBe("button#submit.btn.primary");
	});
});

describe("buildIndent", () => {
	it("returns empty string for depth 0", () => {
		expect(buildIndent(0)).toBe("");
	});

	it("returns two spaces per depth", () => {
		expect(buildIndent(1)).toBe("  ");
		expect(buildIndent(3)).toBe("      ");
	});
});

describe("isMeaningful", () => {
	it("returns true for meaningful elements", () => {
		expect(isMeaningful(document.createElement("div"))).toBe(true);
		expect(isMeaningful(document.createElement("span"))).toBe(true);
	});

	it("returns false for skipped tags", () => {
		for (const tag of SKIP_TAGS) {
			expect(isMeaningful(document.createElement(tag))).toBe(false);
		}
	});

	it("returns false for text nodes", () => {
		const text = document.createTextNode("hello");
		expect(isMeaningful(text)).toBe(false);
	});
});

describe("VOID_TAGS", () => {
	it("contains expected void elements", () => {
		expect(VOID_TAGS.has("br")).toBe(true);
		expect(VOID_TAGS.has("hr")).toBe(true);
		expect(VOID_TAGS.has("img")).toBe(true);
		expect(VOID_TAGS.has("input")).toBe(true);
		expect(VOID_TAGS.has("div")).toBe(false);
	});
});
