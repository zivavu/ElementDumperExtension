const { execSync } = require("node:child_process");
const fs = require("node:fs");

// Build first — concatenates src/ into extension/content.js & copies to dist/
execSync("node build.js", { stdio: "inherit", cwd: __dirname });

const hasConfig = fs.existsSync("./web-ext.config.cjs");
const args = hasConfig
	? ["--config", "web-ext.config.cjs"]
	: ["--source-dir", "dist/firefox"];

execSync(`web-ext run ${args.join(" ")}`, { stdio: "inherit" });
