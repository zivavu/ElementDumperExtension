const fs = require("node:fs");
const path = require("node:path");

const SRC = path.join(__dirname, "src");
const OUT = path.join(__dirname, "dist");

const CONTENT_ORDER = [
	"core.js",
	"tailwind.js",
	"serialisers.js",
	"ui.js",
	"events.js",
	"main.js",
];

function buildContentJs() {
	const parts = [];
	for (const file of CONTENT_ORDER) {
		const filePath = path.join(SRC, "content", file);
		if (!fs.existsSync(filePath)) {
			console.error(`Missing source file: ${filePath}`);
			process.exit(1);
		}
		parts.push(fs.readFileSync(filePath, "utf8"));
	}
	return `(() => {\n${parts.join("\n\n")}\n})();\n`;
}

function copyDir(src, dest) {
	fs.mkdirSync(dest, { recursive: true });
	for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);
		if (entry.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

function buildTarget(target, manifestFile) {
	const dest = path.join(OUT, target);
	if (fs.existsSync(dest)) {
		fs.rmSync(dest, { recursive: true });
	}
	fs.mkdirSync(dest, { recursive: true });

	// Copy static assets (background.js, icons)
	fs.copyFileSync(
		path.join(SRC, "background.js"),
		path.join(dest, "background.js"),
	);
	copyDir(path.join(SRC, "icons"), path.join(dest, "icons"));

	// Write generated content.js
	fs.writeFileSync(path.join(dest, "content.js"), buildContentJs());

	// Copy correct manifest
	fs.copyFileSync(
		path.join(SRC, manifestFile),
		path.join(dest, "manifest.json"),
	);

	console.log(`Built dist/${target}/`);
}

buildTarget("firefox", "manifest-v2.json");
buildTarget("chrome", "manifest-v3.json");
