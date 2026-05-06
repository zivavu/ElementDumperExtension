const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const SRC = path.join(__dirname, "src");
const OUT = path.join(__dirname, "dist");

const CONTENT_ENTRY = path.join(SRC, "content", "main.js");
const shouldMinify = process.env.MINIFY === "true";

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

async function buildContentJs(dest) {
	await esbuild.build({
		entryPoints: [CONTENT_ENTRY],
		bundle: true,
		format: "iife",
		target: ["firefox115", "chrome115"],
		outfile: path.join(dest, "content.js"),
		sourcemap: shouldMinify ? undefined : "inline",
		minify: shouldMinify,
		logLevel: "info",
	});
}

async function buildBackground(dest) {
	await esbuild.build({
		entryPoints: [path.join(SRC, "background.js")],
		bundle: true,
		format: "iife",
		target: ["firefox115", "chrome115"],
		outfile: path.join(dest, "background.js"),
		sourcemap: shouldMinify ? undefined : "inline",
		minify: shouldMinify,
		logLevel: "info",
	});
}

async function buildTarget(target, manifestFile) {
	const dest = path.join(OUT, target);
	if (fs.existsSync(dest)) {
		fs.rmSync(dest, { recursive: true });
	}
	fs.mkdirSync(dest, { recursive: true });

	await buildContentJs(dest);
	await buildBackground(dest);

	copyDir(path.join(SRC, "icons"), path.join(dest, "icons"));
	copyDir(path.join(SRC, "_locales"), path.join(dest, "_locales"));

	fs.copyFileSync(
		path.join(SRC, manifestFile),
		path.join(dest, "manifest.json"),
	);

	console.log(`Built dist/${target}/`);
}

async function main() {
	await buildTarget("firefox", "manifest-v2.json");
	await buildTarget("chrome", "manifest-v3.json");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
