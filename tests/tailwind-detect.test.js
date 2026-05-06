import { describe, expect, it, beforeEach } from "bun:test";
import "./setup.js";
import {
	detectPageUsesTailwind,
	resetTailwindCache,
} from "../src/content/tailwind/index.js";

describe("detectPageUsesTailwind", () => {
	beforeEach(() => {
		document.head.innerHTML = "";
		document.body.innerHTML = "";
		resetTailwindCache();
	});

	it("returns false for a plain page", () => {
		const result = detectPageUsesTailwind();
		expect(result).toBe(false);
	});

	it("detects Tailwind CDN script", () => {
		const script = document.createElement("script");
		script.src = "https://cdn.tailwindcss.com";
		document.head.appendChild(script);

		const result = detectPageUsesTailwind();
		expect(result).toBe(true);
	});

	it("detects tailwind-like classes above threshold", () => {
		for (let i = 0; i < 20; i++) {
			const div = document.createElement("div");
			div.className = "flex items-center p-4";
			document.body.appendChild(div);
		}

		const result = detectPageUsesTailwind();
		expect(result).toBe(true);
	});

	it("does not detect when few tailwind-like classes exist", () => {
		for (let i = 0; i < 20; i++) {
			const div = document.createElement("div");
			div.className = "foo bar baz";
			document.body.appendChild(div);
		}

		const result = detectPageUsesTailwind();
		expect(result).toBe(false);
	});
});
