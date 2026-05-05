const fs = require("node:fs");
const path = require("node:path");

const SRC = path.join(__dirname, "src");
const EXTENSION = path.join(__dirname, "extension");
const OUT = path.join(__dirname, "dist");

const CONCAT_ORDER = [
	"core.js",
	"tailwind.js",
	"serialisers.js",
	"ui.js",
	"events.js",
	"main.js",
];

// Concatenate src/ files into a single content.js wrapped in an IIFE
function buildContentJs() {
	const parts = [];
	for (const file of CONCAT_ORDER) {
		const filePath = path.join(SRC, file);
		if (!fs.existsSync(filePath)) {
			console.error(`Missing source file: ${filePath}`);
			process.exit(1);
		}
		parts.push(fs.readFileSync(filePath, "utf8"));
	}

	return `(() => {\n${parts.join("\n\n")}\n})();\n`;
}

// Copy extension/ to dist/, minus content.js (it's built from src/)
function copyExtension(dest) {
	fs.mkdirSync(dest, { recursive: true });
	for (const entry of fs.readdirSync(EXTENSION, { withFileTypes: true })) {
		const name = entry.name;
		if (name === "content.js") continue; // skip generated file
		const srcPath = path.join(EXTENSION, name);
		const destPath = path.join(dest, name);
		if (entry.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
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

	// Copy extension/ (minus content.js)
	copyExtension(dest);

	// Write generated content.js from src/
	const contentJs = buildContentJs();
	fs.writeFileSync(path.join(dest, "content.js"), contentJs);

	// Remove both manifest variants
	fs.unlinkSync(path.join(dest, "manifest-v2.json"));
	fs.unlinkSync(path.join(dest, "manifest-v3.json"));

	// Copy the correct manifest as manifest.json
	fs.copyFileSync(
		path.join(EXTENSION, manifestFile),
		path.join(dest, "manifest.json"),
	);

	console.log(`Built dist/${target}/`);
}

buildTarget("firefox", "manifest-v2.json");
buildTarget("chrome", "manifest-v3.json");
