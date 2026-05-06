const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const DIST = path.join(__dirname, "dist");
const RELEASES = path.join(__dirname, "releases");

const manifest = JSON.parse(
	fs.readFileSync(path.join(__dirname, "src", "manifest-v2.json"), "utf8"),
);
const version = manifest.version;

console.log("Building (production)...");
execSync("node build.js", {
	stdio: "inherit",
	cwd: __dirname,
	env: { ...process.env, MINIFY: "true" },
});

fs.mkdirSync(RELEASES, { recursive: true });

function zipDirectory(source, outPath) {
	const archiver = require("archiver");
	const output = fs.createWriteStream(outPath);
	const archive = archiver("zip", { zlib: { level: 9 } });

	return new Promise((resolve, reject) => {
		output.on("close", () => resolve());
		archive.on("error", (err) => reject(err));
		archive.pipe(output);
		archive.directory(source, false);
		archive.finalize();
	});
}

async function main() {
	const useArchiver = (() => {
		try {
			require.resolve("archiver");
			return true;
		} catch {
			return false;
		}
	})();

	for (const target of ["firefox", "chrome"]) {
		const sourceDir = path.join(DIST, target);
		const zipName = `element-dumper-${version}-${target}.zip`;
		const outPath = path.join(RELEASES, zipName);

		if (fs.existsSync(outPath)) {
			fs.unlinkSync(outPath);
		}

		if (useArchiver) {
			await zipDirectory(sourceDir, outPath);
		} else {
			const psPath = sourceDir.replace(/\//g, "\\");
			const psOut = outPath.replace(/\//g, "\\");
			execSync(
				`powershell -Command "Compress-Archive -Path '${psPath}\\*' -DestinationPath '${psOut}' -Force"`,
				{ stdio: "inherit" },
			);
		}

		const size = (fs.statSync(outPath).size / 1024).toFixed(1);
		console.log(`Created ${zipName} (${size} KB)`);
	}

	console.log(`\nAll releases ready in ${RELEASES}/`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
