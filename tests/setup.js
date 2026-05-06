import { Window } from "happy-dom";

const window = new Window();
globalThis.document = window.document;
globalThis.window = window;
globalThis.navigator = window.navigator;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);

// Mock chrome API so core.js can import safely
globalThis.chrome = {
	runtime: { onMessage: { addListener: () => {} } },
	storage: {
		local: {
			get: async () => ({}),
			set: async () => {},
		},
	},
};
