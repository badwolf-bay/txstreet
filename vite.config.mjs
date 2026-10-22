import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue2";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));

const SHEETS = ["sheet.json", "sheet_holiday.json"];
const SHEET_IMAGES = ["sheet.png", "characters.png", "mall.png", "sheet_holiday.png"];

// Appends ?v=<version> to the images referenced by the sprite sheets, so browsers refetch them on release.
const versionSpriteSheets = (version) => ({
	name: "version-sprite-sheets",
	apply: "build",
	closeBundle() {
		for (const file of SHEETS) {
			const sheetPath = path.resolve(__dirname, "dist/static/img", file);
			if (!fs.existsSync(sheetPath)) continue;
			let contents = fs.readFileSync(sheetPath, "utf8");
			for (const image of SHEET_IMAGES) {
				contents = contents.split(`"image": "${image}"`).join(`"image": "${image}?v=${version}"`);
			}
			fs.writeFileSync(sheetPath, contents);
		}
	},
});

// Keeps the Vue CLI style `<%= VUE_APP_X %>` placeholders working in index.html.
const htmlEnv = (env) => ({
	name: "html-env",
	transformIndexHtml: {
		// Must run before Vite parses the HTML, which rejects the raw placeholders in URLs.
		order: "pre",
		handler: (html) => html.replace(/<%=\s*(\w+)\s*%>/g, (match, key) => env[key] ?? match),
	},
});

export default defineConfig(({ mode }) => {
	const env = {
		...loadEnv(mode, __dirname, "VUE_APP_"),
		VUE_APP_VERSION: pkg.version,
		NODE_ENV: mode === "production" ? "production" : "development",
		BASE_URL: "/",
	};
	const backend = process.env.XMR_BACKEND || "http://localhost:8081";

	return {
		plugins: [vue(), htmlEnv(env), versionSpriteSheets(pkg.version)],
		// The code reads process.env.VUE_APP_* (including dynamic keys), so expose them as one object.
		define: { "process.env": JSON.stringify(env) },
		resolve: {
			alias: [
				{ find: /^~(.*)$/, replacement: "$1" },
				{ find: "@", replacement: path.resolve(__dirname, "src") },
				// Same as Vue CLI's runtimeCompiler: true.
				{ find: /^vue$/, replacement: "vue/dist/vue.esm.js" },
			],
			extensions: [".mjs", ".js", ".ts", ".json", ".vue"],
		},
		css: { preprocessorOptions: { scss: { quietDeps: true }, sass: { quietDeps: true } } },
		build: {
			outDir: "dist",
			assetsDir: "static/assets",
			sourcemap: false,
			chunkSizeWarningLimit: 2000,
		},
		server: {
			host: "0.0.0.0",
			port: 8080,
			// Forward backend calls to the Monero backend so the browser only needs this origin.
			proxy: {
				"^/(static/(live|blocks)|api/v2|healthcheck)": { target: backend },
				"/socket.io": { target: backend, ws: true },
			},
		},
	};
});
