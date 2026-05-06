import { describe, expect, it } from "bun:test";
import "./setup.js";
import { inlineStyles } from "../src/content/serialisers.js";

describe("inlineStyles", () => {
	it("serialises a single element", () => {
		const el = document.createElement("div");
		el.textContent = "hello";
		const result = inlineStyles(el);
		expect(result.trim()).toBe("<div>hello</div>");
	});

	it("serialises nested elements with indentation", () => {
		const parent = document.createElement("div");
		const child = document.createElement("span");
		child.textContent = "text";
		parent.appendChild(child);

		const result = inlineStyles(parent);
		const lines = result.split("\n").filter((l) => l.trim() !== "");
		expect(lines[0]).toBe("<div>");
		expect(lines[1]).toBe("  <span>text</span>");
		expect(lines[2]).toBe("</div>");
	});

	it("includes attributes", () => {
		const el = document.createElement("img");
		el.src = "pic.png";
		el.alt = "A picture";
		const result = inlineStyles(el);
		expect(result).toContain('src="pic.png"');
		expect(result).toContain('alt="A picture"');
	});

	it("self-closes void tags", () => {
		const el = document.createElement("input");
		el.type = "text";
		const result = inlineStyles(el);
		expect(result.trim()).toBe('<input type="text">');
	});

	it("skips script and style tags", () => {
		const div = document.createElement("div");
		const script = document.createElement("script");
		script.textContent = "alert(1)";
		const span = document.createElement("span");
		span.textContent = "ok";
		div.appendChild(script);
		div.appendChild(span);

		const result = inlineStyles(div);
		expect(result).not.toContain("script");
		expect(result).toContain("<span>ok</span>");
	});

	it("serialises deep nesting", () => {
		const root = document.createElement("article");
		const section = document.createElement("section");
		const p = document.createElement("p");
		p.textContent = "deep";
		section.appendChild(p);
		root.appendChild(section);

		const result = inlineStyles(root);
		expect(result).toContain("<article>");
		expect(result).toContain("  <section>");
		expect(result).toContain("    <p>deep</p>");
		expect(result).toContain("  </section>");
		expect(result).toContain("</article>");
	});
});
