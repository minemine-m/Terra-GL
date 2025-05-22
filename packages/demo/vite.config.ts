import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
	base: "./",
	build: {
		rollupOptions: {
			input: {
				main: "./index.html",
			},
		},
	},
	resolve: {
		alias: {
			"terra-gl": resolve(__dirname, "../core/src"),
		},
	},
	server: {
		port: 8001,
		host: true,
	},
});
