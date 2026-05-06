import { describe, expect, it } from "bun:test";
import "./setup.js";
import {
	buildAttrs,
	getSelectedEl,
	setStyles,
	state,
} from "../src/content/core.js";

describe("buildAttrs", () => {
	it("returns empty string when no matching attributes", () => {
		const el = document.createElement("div");
		expect(buildAttrs(el)).toBe("");
	});

	it("includes id attribute", () => {
		const el = document.createElement("div");
		el.id = "test-id";
		expect(buildAttrs(el)).toBe(' id="test-id"');
	});

	it("includes src attribute", () => {
		const el = document.createElement("img");
		el.src = "image.png";
		expect(buildAttrs(el)).toBe(' src="image.png"');
	});

	it("includes multiple attributes", () => {
		const el = document.createElement("input");
		el.id = "search";
		el.type = "text";
		el.placeholder = 'Say "hello"';
		const attrs = buildAttrs(el);
		expect(attrs).toContain(' id="search"');
		expect(attrs).toContain(' type="text"');
		expect(attrs).toContain(' placeholder="Say &quot;hello&quot;"');
	});

	it("escapes quotes in attribute values", () => {
		const el = document.createElement("div");
		el.setAttribute("data-testid", 'foo"bar');
		expect(buildAttrs(el)).toBe(' data-testid="foo&quot;bar"');
	});
});

describe("getSelectedEl", () => {
	it("returns null when hoveredEl is null", () => {
		state.hoveredEl = null;
		expect(getSelectedEl()).toBeNull();
	});

	it("returns hoveredEl when depthOffset is 0", () => {
		const el = document.createElement("div");
		state.hoveredEl = el;
		state.depthOffset = 0;
		expect(getSelectedEl()).toBe(el);
	});

	it("walks up parent chain by depthOffset", () => {
		const grandparent = document.createElement("div");
		const parent = document.createElement("section");
		const child = document.createElement("span");
		parent.appendChild(child);
		grandparent.appendChild(parent);

		state.hoveredEl = child;
		state.depthOffset = 1;
		expect(getSelectedEl()).toBe(parent);

		state.depthOffset = 2;
		expect(getSelectedEl()).toBe(grandparent);
	});

	it("stops at root when depthOffset exceeds tree depth", () => {
		const parent = document.createElement("div");
		const child = document.createElement("span");
		parent.appendChild(child);

		state.hoveredEl = child;
		state.depthOffset = 5;
		expect(getSelectedEl()).toBe(parent);
	});
});

describe("setStyles", () => {
	it("applies cssText to element", () => {
		const el = document.createElement("div");
		setStyles(el, "color: red; display: flex");
		expect(el.style.color).toBe("red");
		expect(el.style.display).toBe("flex");
	});
});
