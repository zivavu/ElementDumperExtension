const fs = require("node:fs");
const path = require("node:path");

const SRC = path.join(__dirname, "extension");
const OUT = path.join(__dirname, "dist");

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

function build(target, manifestFile) {
	const dest = path.join(OUT, target);
	if (fs.existsSync(dest)) {
		fs.rmSync(dest, { recursive: true });
	}
	copyDir(SRC, dest);

	// Remove both manifest variants
	fs.unlinkSync(path.join(dest, "manifest-v2.json"));
	fs.unlinkSync(path.join(dest, "manifest-v3.json"));

	// Copy the correct manifest as manifest.json
	fs.copyFileSync(
		path.join(SRC, manifestFile),
		path.join(dest, "manifest.json"),
	);

	console.log(`Built dist/${target}/ with ${manifestFile}`);
}

build("firefox", "manifest-v2.json");
build("chrome", "manifest-v3.json");
